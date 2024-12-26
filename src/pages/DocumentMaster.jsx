import React, { useState } from 'react';
import axios from 'axios';
import { Input, Button, Table, message, Spin, Modal } from 'antd';
import { Search } from 'lucide-react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const API_URL = 'http://192.168.137.161:7001';

const DocumentRetrieval = () => {
  const [partNumbers, setPartNumbers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/get-files`, {
        part_numbers: partNumbers,
      });
      const transformedData = Object.entries(response.data).flatMap(
        ([partNumber, files]) =>
          files.map((file) => ({
            partNumber,
            fileName: file.file_name,
            filePath: file.file_path,
          }))
      );
      setDocuments(transformedData);
      message.success('Documents retrieved successfully');
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to fetch documents');
    }
    setLoading(false);
  };

  const handleAddPartNumber = () => {
    if (inputValue && !partNumbers.includes(inputValue.trim())) {
      setPartNumbers([...partNumbers, inputValue.trim()]);
    }
    setInputValue('');
  };

  const handleRemovePartNumber = (value) => {
    setPartNumbers(partNumbers.filter((pn) => pn !== value));
  };

  const handlePreview = (record) => {
    setSelectedDocument(record);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber',
    },
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handlePreview(record)}>View File</Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Document Retrieval</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Part Numbers</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {partNumbers.map((pn) => (
            <span
              key={pn}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"
            >
              {pn}
              <button
                onClick={() => handleRemovePartNumber(pn)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                X
              </button>
            </span>
          ))}
        </div>
        <div className="flex">
          <Input
            placeholder="Enter a part number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleAddPartNumber}
            className="mr-2"
          />
          <Button
            onClick={fetchDocuments}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Search className="mr-2" size={18} />
            Retrieve Documents
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Table
          dataSource={documents}
          columns={columns}
          rowKey={(record) => `${record.partNumber}-${record.fileName}`}
        />
      )}

      <Modal
        title="Document Preview"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '1200px' }}
        bodyStyle={{ padding: '0' }}
        centered
      >
        {selectedDocument && (
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/4 p-4 lg:border-r lg:border-gray-200">
              <h2 className="text-xl font-semibold mb-4">{selectedDocument.fileName}</h2>
              <p><strong>Part Number:</strong> {selectedDocument.partNumber}</p>
            </div>
            <div className="lg:w-3/4 p-4 flex flex-col">
              <div className="flex-grow">
                <iframe
                  src={selectedDocument.filePath}
                  className="w-full h-[60vh] border rounded"
                  title="Document Preview"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentRetrieval;