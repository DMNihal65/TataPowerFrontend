import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Modal, Card, message } from 'antd';
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const DocumentApproval = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const showMessage = (type, content) => {
    messageApi.open({
      type,
      content,
      duration: 3,
    });
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://192.168.137.161:7001/documents');
      const data = await response.json();
      const formattedData = data.map(doc => ({
        key: doc.id.toString(),
        documentName: doc.file_name,
        partNumber: doc.part_number_id,
        uploadDate: new Date(doc.created_at).toLocaleDateString(),
        status: doc.status,
        filePath: doc.file_path,
        version: doc.version,
        id: doc.id
      }));
      setDocuments(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching documents:', error);
      showMessage('error', 'Failed to fetch documents');
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (documentId, newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch('http://192.168.137.161:7001/documents', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          document_id: documentId,
          status: newStatus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update document status');
      }

      setDocuments(docs => docs.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: newStatus, updated_at: data.document.updated_at }
          : doc
      ));

      return true;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

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
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber',
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
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
          status === 'uploaded' ? 'bg-yellow-100 text-yellow-800' :
          status === 'approved' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
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

  const handleApprove = async () => {
    try {
      await updateDocumentStatus(selectedDocument.id, 'approved');
      setIsModalVisible(false);
      showMessage('success', 'Document approved successfully');
    } catch (error) {
      showMessage('error', 'Failed to approve document');
    }
  };

  const handleReject = async () => {
    try {
      await updateDocumentStatus(selectedDocument.id, 'rejected');
      setIsModalVisible(false);
      showMessage('error', 'Document rejected');
    } catch (error) {
      showMessage('error', 'Failed to reject document');
    }
  };

  return (
    <div className="p-6">
      {contextHolder}
      <h2 className="text-3xl font-bold mb-8 text-center lg:text-left lg:ml-[300px]">Document Approval</h2>

      <Card className="max-w-6xl mx-auto">
        <Table
          columns={columns}
          dataSource={documents}
          loading={loading}
          scroll={{ x: 600 }}
          pagination={{ pageSize: 5 }}
        />
      </Card>

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
              <h2 className="text-xl font-semibold mb-4">{selectedDocument.documentName}</h2>
              <p><strong>Part Number:</strong> {selectedDocument.partNumber}</p>
              <p><strong>Version:</strong> {selectedDocument.version}</p>
              <p><strong>Upload Date:</strong> {selectedDocument.uploadDate}</p>
            </div>
            <div className="lg:w-3/4 p-4 flex flex-col">
              <div className="flex-grow">
                <iframe
                  src={selectedDocument.filePath}
                  className="w-full h-[60vh] border rounded"
                  title="Document Preview"
                />
              </div>
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleApprove}
                  style={{ backgroundColor: '#4CAF50' }}
                  loading={updating}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={handleReject}
                  loading={updating}
                >
                  Reject
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentApproval;