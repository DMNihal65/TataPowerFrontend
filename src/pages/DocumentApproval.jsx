import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FileText, CheckCircle, XCircle } from 'lucide-react';

const DocumentApproval = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const data = [
    {
      key: '1',
      documentName: 'Certificate PN001',
      type: 'Certificate',
      partNumber: 'PN001',
      uploadDate: '2024-08-01',
      status: 'Pending',
    },
    {
        key: '2',
        documentName: 'Certificate PN002',
        type: 'Certificate',
        partNumber: 'PN002',
        uploadDate: '2024-08-01',
        status: 'Pending',
      },
      {
        key: '3',
        documentName: 'Certificate PN002',
        type: 'Certificate',
        partNumber: 'PN002',
        uploadDate: '2024-08-01',
        status: 'Pending',
      },
    // Add more sample data here
  ];

  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'documentName',
      key: 'documentName',
      sorter: (a, b) => a.documentName.localeCompare(b.documentName),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search document name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record.documentName.toLowerCase().includes(value.toLowerCase()),
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
        }`}>
          {status}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button onClick={() => handlePreview(record)}>Preview</Button>
      ),
    },
  ];

  const handlePreview = (record) => {
    setSelectedDocument(record);
    setIsModalVisible(true);
  };

  const handleApprove = () => {
    // Handle approval logic here
    setIsModalVisible(false);
  };

  const handleReject = () => {
    // Handle rejection logic here
    setIsModalVisible(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-8 text-center lg:text-left lg:ml-[300px]">Document Approval</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        <Table columns={columns} dataSource={data}
         scroll={{ x: 600 }}  // Enables horizontal scroll on small screens
          pagination={{ pageSize: 5 }} // Adjust pagination for better mobile view
       />
      </div>

      <Modal
        title="Document Preview"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%" // Set the width to 90% for mobile view
        style={{ maxWidth: '300px' }} // Set a max width for larger screens
        bodyStyle={{ padding: '3px' }} // Adjust padding for a better appearance
        centered // Center the modal on the screen
      >
        {selectedDocument && (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">{selectedDocument.documentName}</h2>
            <p><strong>Type:</strong> {selectedDocument.type}</p>
            <p><strong>Part Number:</strong> {selectedDocument.partNumber}</p>
            <p><strong>Upload Date:</strong> {selectedDocument.uploadDate}</p>
            <div className="mt-8 flex justify-end space-x-4">
              <Button 
                type="primary"  
                icon={<CheckCircle className="mr-2" size={16} />}
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600"
              >
                Approve
              </Button>
              <Button 
                danger 
                icon={<XCircle className="mr-2" size={16} />}
                onClick={handleReject}
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentApproval;
