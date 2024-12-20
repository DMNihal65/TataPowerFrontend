import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Card, Modal, List, Checkbox, message, Spin } from 'antd';
import { SearchOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Document, Page } from 'react-pdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


const API_URL = 'http://localhost:3001'; // Update with your server URL

const DocumentRetrieval = () => {
  const [partNumbers, setPartNumbers] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('file_name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const partNumbersArray = partNumbers.split(',').map(pn => pn.trim());
      const response = await axios.post(`${API_URL}/get-files`, {
        part_numbers: partNumbersArray,
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to fetch documents');
    }
    setLoading(false);
  };

  const handleDocumentView = (document) => {
    setCurrentDocument(document);
    setViewerVisible(true);
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocuments(prev =>
      prev.includes(document)
        ? prev.filter(d => d !== document)
        : [...prev, document]
    );
  };

  const handleDownloadSelected = async () => {
    const zip = new JSZip();
    const promises = selectedDocuments.map(doc =>
      fetch(`${API_URL}/file/${encodeURIComponent(doc.file_name)}?filePath=${encodeURIComponent(doc.file_path)}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('SDC-2:sdc2')
        }
      })
        .then(response => response.blob())
        .then(blob => {
          zip.file(doc.file_name, blob);
        })
    );

    try {
      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'selected_documents.zip');
    } catch (error) {
      console.error('Error downloading documents:', error);
      message.error('Failed to download documents');
    }
  };

  const filteredAndSortedDocuments = documents
    .filter(doc =>
      doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.folder_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="p-6">
      <div className="mb-4">
        <Input
          placeholder="Enter part numbers (comma-separated)"
          value={partNumbers}
          onChange={(e) => setPartNumbers(e.target.value)}
          className="mr-2"
        />
        <Button onClick={fetchDocuments} type="primary">
          Retrieve Documents
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search documents"
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="mr-2"
        >
          <option value="file_name">File Name</option>
          <option value="folder_name">Folder Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={filteredAndSortedDocuments}
            renderItem={(doc) => (
              <List.Item>
                <Card
                  hoverable
                  cover={
                    <div className="h-40 flex items-center justify-center bg-gray-200">
                      {doc.file_name.toLowerCase().endsWith('.pdf') ? (
                        <Document file={`${API_URL}/file/${encodeURIComponent(doc.file_name)}?filePath=${encodeURIComponent(doc.file_path)}`}>
                          <Page pageNumber={1} width={150} />
                        </Document>
                      ) : (
                        <img
                          alt={doc.file_name}
                          src={`${API_URL}/file/${encodeURIComponent(doc.file_name)}?filePath=${encodeURIComponent(doc.file_path)}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                  }
                  actions={[
                    <EyeOutlined key="view" onClick={() => handleDocumentView(doc)} />,
                    <Checkbox
                      checked={selectedDocuments.includes(doc)}
                      onChange={() => handleDocumentSelect(doc)}
                    />
                  ]}
                >
                  <Card.Meta
                    title={doc.file_name}
                    description={`Folder: ${doc.folder_name}`}
                  />
                </Card>
              </List.Item>
            )}
          />

          {selectedDocuments.length > 0 && (
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadSelected}
              className="mt-4"
            >
              Download Selected ({selectedDocuments.length})
            </Button>
          )}

          <Modal
            visible={viewerVisible}
            onCancel={() => setViewerVisible(false)}
            width="80%"
            footer={null}
          >
            {currentDocument && (
              currentDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                <Document file={`${API_URL}/file/${encodeURIComponent(currentDocument.file_name)}?filePath=${encodeURIComponent(currentDocument.file_path)}`}>
                  <Page pageNumber={1} width={800} />
                </Document>
              ) : (
                <img
                  alt={currentDocument.file_name}
                  src={`${API_URL}/file/${encodeURIComponent(currentDocument.file_name)}?filePath=${encodeURIComponent(currentDocument.file_path)}`}
                  className="max-w-full"
                />
              )
            )}
          </Modal>
        </>
      )}
    </div>
  );
};

export default DocumentRetrieval;
