import React from 'react';
import { Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { GlobalWorkerOptions } from 'pdfjs-dist';
import pdf from './CGI.pdf';

// Use the worker script URL for the version you have installed
GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';


const Pdf = () => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <div style={{ 
          height: '50vh',  // Adjust height for mobile responsiveness
          overflow: 'auto', // Allow scrolling if needed
          maxHeight: '500px', // Set a maximum height for larger screens
        }}>
            <Viewer
                fileUrl={pdf}
                plugins={[defaultLayoutPluginInstance]}
            />
        </div>
    );
};

export default Pdf;
