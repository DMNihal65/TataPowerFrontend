import React, { useState } from 'react';
import { Table, Button, Input, Select, message, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { FileText, Upload as UploadIcon } from 'lucide-react';

const { Dragger } = Upload;
const { Option } = Select;

const DocumentUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [documentType, setDocumentType] = useState('');
  const [partNumbers, setPartNumbers] = useState([]);

  const existingDocuments = [
    {
      key: '1',
      documentName: 'Certificate PN001',
      type: 'Certificate',
      partNumber: 'PN001',
      uploadDate: '2024-08-01',
      version: '1.0',
    },
    // Add more sample data here
  ];

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
      sorter: (a, b) => a.documentName.localeCompare(b.documentName),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Certificate', value: 'Certificate' },
        { text: 'Test Report', value: 'Test Report' },
        { text: 'Installation Manual', value: 'Installation Manual' },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      sorter: (a, b) => new Date(a.uploadDate) - new Date(b.uploadDate),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
    },
  ];

  const handleUpload = () => {
    if (fileList.length === 0 || !documentType || partNumbers.length === 0) {
      message.error('Please fill in all required fields');
      return;
    }

    // Handle upload logic here
    message.success('Document uploaded successfully');
    setFileList([]);
    setDocumentType('');
    setPartNumbers([]);
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Document Upload</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Document</h2>
          <form>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select document type"
                onChange={(value) => setDocumentType(value)}
                value={documentType}
              >
                <Option value="certificate">Certificate</Option>
                <Option value="testReport">Test Report</Option>
                <Option value="installationManual">Installation Manual</Option>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Part Numbers</label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select part numbers"
                onChange={(values) => setPartNumbers(values)}
                value={partNumbers}
              >
                <Option value="PN001">PN001</Option>
                <Option value="PN002">PN002</Option>
                <Option value="PN003">PN003</Option>
              </Select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                  sensitive files.
                </p>
              </Dragger>
            </div>
            <div className="flex justify-end">
              <Button 
                type="primary" 
                onClick={handleUpload} 
                icon={<UploadIcon className="mr-2" size={16} />}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Upload Document
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Existing Documents</h2>
          <Table columns={columns} dataSource={existingDocuments} />
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;