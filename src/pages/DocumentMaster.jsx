import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Card, Modal, List, Checkbox, message, Spin } from 'antd';
import { Search, Download, Eye, X, Plus, SortAsc, SortDesc, FileText, Folder } from 'lucide-react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const API_URL = 'http://localhost:3001'; // Update with your server URL

const DocumentRetrieval = () => {
  const [partNumbers, setPartNumbers] = useState([]);
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
      const response = await axios.post(`${API_URL}/get-files`, {
        part_numbers: partNumbers,
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

  const handleAddPartNumber = (value) => {
    if (value && !partNumbers.includes(value)) {
      setPartNumbers([...partNumbers, value]);
    }
  };

  const handleRemovePartNumber = (value) => {
    setPartNumbers(partNumbers.filter(pn => pn !== value));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Retrieval</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Part Numbers</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {partNumbers.map(pn => (
            <span key={pn} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
              {pn}
              <button onClick={() => handleRemovePartNumber(pn)} className="ml-2 text-blue-600 hover:text-blue-800">
                <X size={16} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <Input
            placeholder="Enter a part number"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPartNumber(e.target.value);
                e.target.value = '';
              }
            }}
            className="mr-2"
          />
          <Button onClick={fetchDocuments} className="bg-blue-500 text-white hover:bg-blue-600">
            <Search className="mr-2" size={18} />
            Retrieve Documents
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center">
        <Input
          placeholder="Search documents"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
          icon={<Search size={18} />}
        />
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="file_name">File Name</option>
          <option value="folder_name">Folder Name</option>
        </select>
        <Button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="bg-gray-200 hover:bg-gray-300"
        >
          {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAndSortedDocuments.map((doc) => (
              <Card key={doc.file_name} className="flex flex-col">
                <div className="h-40 flex items-center justify-center bg-gray-100 mb-4">
                  {doc.file_name.toLowerCase().endsWith('.pdf') ? (
                    <FileText size={64} className="text-gray-400" />
                  ) : (
                    <img
                      alt={doc.file_name}
                      src={`${API_URL}/file/${encodeURIComponent(doc.file_name)}?filePath=${encodeURIComponent(doc.file_path)}`}
                      className="max-h-full max-w-full object-contain"
                    />
                  )}
                </div>
                <h3 className="font-semibold mb-1 truncate">{doc.file_name}</h3>
                <p className="text-sm text-gray-500 mb-2 flex items-center">
                  <Folder size={16} className="mr-1" />
                  {doc.folder_name}
                </p>
                <div className="mt-auto flex justify-between">
                  <Button onClick={() => handleDocumentView(doc)} className="bg-green-500 text-white hover:bg-green-600">
                    <Eye size={18} className="mr-1" /> View
                  </Button>
                  <Checkbox
                    checked={selectedDocuments.includes(doc)}
                    onChange={() => handleDocumentSelect(doc)}
                  />
                </div>
              </Card>
            ))}
          </div>

          {selectedDocuments.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleDownloadSelected}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                <Download size={18} className="mr-2" />
                Download Selected ({selectedDocuments.length})
              </Button>
            </div>
          )}

          <Modal
            visible={viewerVisible}
            onCancel={() => setViewerVisible(false)}
            footer={null}
            width={800}
          >
            {currentDocument && (
              <div>
                <h2 className="text-2xl font-bold mb-4">{currentDocument.file_name}</h2>
                {currentDocument.file_name.toLowerCase().endsWith('.pdf') ? (
                  <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                    <div style={{ height: '700px' }}>
                      <Viewer fileUrl={`${API_URL}/file/${encodeURIComponent(currentDocument.file_name)}?filePath=${encodeURIComponent(currentDocument.file_path)}`} />
                    </div>
                  </Worker>
                ) : (
                  <img
                    alt={currentDocument.file_name}
                 
                      src={`${API_URL}/file/${encodeURIComponent(currentDocument.file_name)}?filePath=${encodeURIComponent(currentDocument.file_path)}`}
                      className="max-w-full max-h-[70vh] object-contain mx-auto"
                    />
                  )}
                </div>
              )}
            </Modal>
          </>
        )}
      </div>
    );
  };
  
  export default DocumentRetrieval;
  