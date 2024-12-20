

import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import {exec} from 'child_process'


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Function to execute the 'net use' command
function connectToNetworkShare(callback) {
  const command = 'net use \\\\SDC-2\\Tata\\main\\Folders /user:SDC-2 sdc2';
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error connecting to network share: ${error}`);
      return callback(error);
    }
    console.log('Successfully connected to network share');
    callback(null);
  });
}

app.post('/get-files', (req, res) => {
  const { part_numbers } = req.body;
  
  // Call your existing API to get file information
  fetch('http://172.18.100.88:7001/get-files/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ part_numbers }),
  })
    .then(response => response.json())
    .then(data => {
      res.json(data);
    })
    .catch(error => {
      res.status(500).json({ error: 'Error fetching file information' });
    });
});

app.get('/file/:fileName', (req, res) => {
  const { fileName } = req.params;
  const { filePath } = req.query;
  
  if (!filePath) {
    return res.status(400).send('File path is required');
  }

  const fullPath = path.join('\\\\SDC-2\\Tata\\main\\Folders', filePath.replace(/^\\SDC-2\\Tata\\main\\Folders/, ''));

  fs.access(fullPath, fs.constants.R_OK, (err) => {
    if (err) {
      console.error(`Error accessing file: ${err}`);
      return res.status(404).send('File not found or not accessible');
    }

    res.sendFile(fullPath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err}`);
        res.status(500).send('Error sending file');
      }
    });
  });
});

// Connect to the network share before starting the server
connectToNetworkShare((error) => {
  if (error) {
    console.error('Failed to connect to network share. Exiting.');
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
});