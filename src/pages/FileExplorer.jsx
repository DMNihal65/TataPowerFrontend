import React, { useState, useEffect } from 'react';
import { Tree, Upload, Button, Modal, Form, message, Input, Switch , Select , Card , Table} from 'antd'; // Added Switch
import {
  FolderOutlined,
  FileOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const FileExplorer = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolder, setIsFolder] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [form] = Form.useForm();
  const [partNumbers, setPartNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadSummary, setUploadSummary] = useState([]);

  useEffect(() => {
    // Fetch data from the API
    axios
      .get('http://192.168.137.161:7001/getallpartnumbers/', {
        headers: { Accept: 'application/json' },
      })
      .then((response) => {
        // Update the state with the received data
        setPartNumbers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching part numbers:', error);
        setLoading(false);
      });
  }, []);



  const buildTreeData = (items) => {
    const itemMap = {};
    const rootItems = [];

    items.forEach(item => {
      itemMap[item.id] = {
        key: item.id.toString(),
        title: item.name,
        isFolder: true,
        children: [],
        ...item,
      };
    });

    items.forEach(item => {
      const node = itemMap[item.id];
      
      if (item.file_name && item.file_name.length > 0) {
        item.file_name.forEach((file, index) => {
          node.children.push({
            key: `${item.id}-file-${index}`,
            title: file.file_name,
            isFolder: false,
          });
        });
      }

      if (item.parent_id === null) {
        rootItems.push(node);
      } else {
        const parent = itemMap[item.parent_id];
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootItems;
  };

  const fetchFolderData = async () => {
    try {
      const response = await fetch('http://192.168.137.161:7001/getallfolderswithfiles/');
      const data = await response.json();
      const transformedData = buildTreeData(data);
      setTreeData(transformedData);
    } catch (error) {
      message.error('Failed to fetch folder data');
      console.error('Error fetching folder data:', error);
    }
  };

  useEffect(() => {
    fetchFolderData();
  }, []);

  const onSelect = (keys, event) => {
    setSelectedNode(event.node);
  };


  const addNode = async (values) => {
    if (isFolder) {
      try {
        const folderData = {
          name: values.name,
          description: values.description || "new",
          requires_validity: values.requires_validity || false,
          is_mandatory: values.is_mandatory || false,
          parent_id: selectedNode ? parseInt(selectedNode.key) : 0 // Changed null to 0 for root folders
        };

        console.log('Sending folder data:', folderData); // Debug log

        const response = await fetch('http://192.168.137.161:7001/folders/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
          },
          body: JSON.stringify(folderData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create folder');
        }

        await fetchFolderData();
        setIsModalOpen(false);
        form.resetFields();
        message.success('Folder created successfully');
      } catch (error) {
        message.error(error.message || 'Failed to create folder');
        console.error('Error creating folder:', error);
      }
    } else {
      if (!uploadedFile) {
        message.error('Please select a file to upload');
        return;
      }

      if (!selectedNode?.key) {
        message.error('Please select a folder to upload the file');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const response = await fetch(
          `http://192.168.137.161:7001/upload-file/?folder_id=${selectedNode.key}&part_numbers=${values.part_numbers || ''}`,
          {
            method: 'POST',
            headers: {
              'accept': 'application/json',
            },
            body: formData
          }
        );

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const result = await response.json();
        console.log('Upload result:', result);

        const uploadedFileInfo = result[0];
        const newUploadEntry = {
          key: uploadedFileInfo.document_id,
          fileName: uploadedFile.name,
          folder: selectedNode.title,
          partNumbers: values.part_numbers,
        };

        // Update the upload summary with the new entry
        setUploadSummary(currentSummary => [...currentSummary, newUploadEntry]);
        console.log('summary:' , uploadSummary);

        await fetchFolderData();
        setIsModalOpen(false);
        form.resetFields();
        setUploadedFile(null);
        message.success('File uploaded successfully');
      } catch (error) {
        message.error('Failed to upload file');
        console.error('Error uploading file:', error);
      }
    }
  };

  const openModal = (folder) => {
    if (!folder && !selectedNode) {
      message.warning('Please select a folder first');
      return;
    }
    setIsFolder(folder);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleUpload = ({ file }) => {
    setUploadedFile(file);
  };

  const renderTreeNodes = (data) =>
    data.map((item) => ({
      title: (
        <span>
          {item.isFolder ? <FolderOutlined style={{ marginRight: 8 }} /> : <FileOutlined style={{ marginRight: 8 }} />}
          {item.title}
        </span>
      ),
      key: item.key,
      isFolder: item.isFolder,
      children: item.children && item.children.length > 0 ? renderTreeNodes(item.children) : null,
    }));


    const summaryColumns = [
      { 
        title: 'File Name', 
        dataIndex: 'fileName', 
        key: 'fileName',
        render: text => text || 'N/A'
      },
      { 
        title: 'Folder', 
        dataIndex: 'folder', 
        key: 'folder',
        render: text => text || 'N/A'
      },
      { 
        title: 'Part Numbers', 
        dataIndex: 'partNumbers', 
        key: 'partNumbers',
        render: partNumbers => {
          if (!partNumbers || partNumbers.length === 0) return 'None';
          return Array.isArray(partNumbers) ? partNumbers.join(', ') : partNumbers;
        }
      },
      
    ];

    return (
      <>
      <div style={{ padding: '20px' }}>
        <h1 style={{fontSize:'25px', marginBottom:'10px'}}>Folder Explorer</h1>
        <div style={{ marginBottom: 16 }}>
          <Button
            onClick={() => openModal(true)}
            type="primary"
            style={{ marginRight: 8 }}
            icon={<PlusOutlined />}
          >
            Add Folder
          </Button>
          <Button
            onClick={() => openModal(false)}
            type="default"
            icon={<UploadOutlined />}
          >
            Add File
          </Button>
        </div>
        <Tree
          treeData={renderTreeNodes(treeData)}
          onSelect={onSelect}
          defaultExpandAll
          style={{ border: '1px solid #d9d9d9', padding: '10px' }}
        />
  
        <Modal
          title={`Add ${isFolder ? 'Folder' : 'File'}`}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setUploadedFile(null);
          }}
          footer={null}
        >
          <Form 
            form={form} 
            onFinish={addNode} 
            layout="vertical"
            initialValues={{
              requires_validity: false,
              is_mandatory: false
            }}
          >
            {isFolder ? (
              <>
                <Form.Item
                  name="name"
                  label="Folder Name"
                  rules={[{ required: true, message: 'Please enter a folder name!' }]}
                >
                  <Input placeholder="Enter folder name" />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea placeholder="Enter folder description" />
                </Form.Item>
                <Form.Item
                  name="requires_validity"
                  label="Requires Validity"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
                <Form.Item
                  name="is_mandatory"
                  label="Is Mandatory"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </>
            ) : (
              <>
                <Form.Item label="Select Existing Part Numbers" name="part_numbers">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Select existing part numbers"
                      loading={loading}
                    >
                      {partNumbers.map((part) => (
                        <Option key={part.id} value={part.part_number}>
                          {part.part_number}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                <Form.Item label="Custom Part Numbers">
                     <Input 
                       placeholder="Enter custom part numbers" 
                      />
                </Form.Item>
                                      
                <Form.Item 
                  label="Upload File" 
                  required
                  >
                  <Upload beforeUpload={() => false} onChange={handleUpload} showUploadList={false}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                  {uploadedFile && <p style={{ marginTop: 10 }}>Selected: {uploadedFile.name}</p>}
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {isFolder ? 'Create Folder' : 'Upload File'}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
      
      <div style={{marginTop:'10px'}}>
      <Card>
            <h2 className="text-xl font-semibold mb-4">Upload Summary</h2>
            <Table 
            columns={summaryColumns}
            dataSource={uploadSummary}
            pagination={false}
            rowKey="fileName"
            />
          </Card>
      </div>
      </>
    );
  };
  
  export default FileExplorer;