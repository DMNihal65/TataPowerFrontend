import React, { useState } from 'react';
import { Table, Button, Input, Select, message, Upload } from 'antd';
import { InboxOutlined, SearchOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Option } = Select;

const DocumentUpload = () => {
  const [fileList, setFileList] = useState([]);
  const [documentType, setDocumentType] = useState('');
  const [partNumbers, setPartNumbers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [partNumberRange, setPartNumberRange] = useState({
    start: '',
    end: ''
  });

  const existingDocuments = [
    { key: '1', documentName: 'Certificate PN001', type: 'Certificate', partNumber: 'PN001', uploadDate: '2024-08-01', version: '1.0' },
    { key: '2', documentName: 'Test Report PN002', type: 'Test Report', partNumber: 'PN002', uploadDate: '2024-08-02', version: '1.1' },
    { key: '3', documentName: 'Installation Manual PN010', type: 'Installation Manual', partNumber: 'PN010', uploadDate: '2024-08-03', version: '1.2' },
  ];

  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = existingDocuments.filter(doc =>
      doc.documentName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDocuments(filtered);
  };

  const handleReset = () => {
    setSearchText('');
    setFilteredDocuments(existingDocuments);
  };

  const handlePartNumberRangeChange = (field, value) => {
    setPartNumberRange(prevRange => ({
      ...prevRange,
      [field]: value
    }));
  };

  const filterByPartNumberRange = (value, record) => {
    const { start, end } = partNumberRange;
    if (!start && !end) return true;
    const partNumber = record.partNumber;
    return (!start || partNumber >= start) && (!end || partNumber <= end);
  };

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
      sorter: (a, b) => a.documentName.localeCompare(b.documentName),
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search document name"
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <Button
            type="primary"
            onClick={() => handleSearch(searchText)}
            style={{ marginRight: 8 }}
          >
            Search
          </Button>
          <Button
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: (value, record) => record.documentName.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber',
      filterDropdown: () => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Start Part Number"
            value={partNumberRange.start}
            onChange={(e) => handlePartNumberRangeChange('start', e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <Input
            placeholder="End Part Number"
            value={partNumberRange.end}
            onChange={(e) => handlePartNumberRangeChange('end', e.target.value)}
            style={{ width: '100%', marginBottom: 8 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setFilteredDocuments(existingDocuments.filter(doc => filterByPartNumberRange(null, doc)));
            }}
            style={{ marginRight: 8 }}
          >
            Filter
          </Button>
          <Button
            onClick={() => {
              setPartNumberRange({ start: '', end: '' });
              setFilteredDocuments(existingDocuments);
            }}
          >
            Reset
          </Button>
        </div>
      ),
      filterIcon: () => <SearchOutlined />,
      onFilter: filterByPartNumberRange,
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
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Document Upload</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full overflow-y-auto max-h-screen">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Upload New Document</h2>
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
                className="w-full md:w-auto"
              >
                Upload
              </Button>
            </div>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 h-full overflow-y-auto max-h-screen">
          <h2 className="text-lg md:text-xl font-semibold mb-4">Existing Documents</h2>
          <Table 
            columns={columns} 
            dataSource={filteredDocuments.length > 0 ? filteredDocuments : existingDocuments} 
            rowKey="key" 
            pagination={{ pageSize: 5 }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;