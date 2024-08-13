import React, { useState, useEffect } from 'react';
import { Tree, Input, Button, Upload, Select, Table, Modal, message, Switch, Form, Layout, Card, Tabs, Tag } from 'antd';
import { DownOutlined, FolderOutlined, FileOutlined, PlusOutlined, EditOutlined, UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TreeNode } = Tree;
const { Dragger } = Upload;
const { Option } = Select;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const EnhancedDocumentUpload = () => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [partNumbers, setPartNumbers] = useState([]);
  const [customPartNumbers, setCustomPartNumbers] = useState([]);
  const [partNumberRange, setPartNumberRange] = useState({ start: '', end: '' });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isNewFolderModalVisible, setIsNewFolderModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [uploadSummary, setUploadSummary] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [searchPartNumber, setSearchPartNumber] = useState('');



  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('http://172.18.100.54:7000/getallfolders/');
      const organizedFolders = organizefolders(response.data);
      setFolders(organizedFolders);
    } catch (error) {
      console.error('Error fetching folders:', error);
      message.error('Failed to fetch folders');
    }
  };

  const organizefolders = (flatFolders) => {
    const folderMap = {};
    const rootFolders = [];

    flatFolders.forEach(folder => {
      folderMap[folder.id] = { ...folder, children: [] };
    });

    flatFolders.forEach(folder => {
      if (folder.parent_id === null) {
        rootFolders.push(folderMap[folder.id]);
      } else {
        folderMap[folder.parent_id].children.push(folderMap[folder.id]);
      }
    });

    return rootFolders;
  };

  const renderTreeNodes = (data) => 
    data.map((item) => (
      <TreeNode 
        key={item.id} 
        title={
          <span className="flex items-center justify-between">
            <span className="truncate mr-2">{item.name}</span>
            <span className="flex items-center">
              {item.requires_validity && <span className="mr-1 text-blue-500 text-xs">RV</span>}
              {item.is_mandatory && <span className="mr-1 text-red-500 text-xs">M</span>}
              <Button 
                type="link" 
                icon={<EditOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingFolder(item);
                  setIsEditModalVisible(true);
                }}
              />
            </span>
          </span>
        } 
        icon={<FolderOutlined />}
      >
        {item.children && renderTreeNodes(item.children)}
      </TreeNode>
    ));

  const handleFolderSelect = (selectedKeys, info) => {
    setSelectedFolder(info.node);
  };

  const handleFileUpload = (info) => {
    setFileList(info.fileList);
  };



  const handleCustomPartNumberChange = (e) => {
    setCustomPartNumbers(e.target.value);
  };



  const handleEditFolder = async (values) => {
    try {
      await axios.put(`http://172.18.100.54:7000/foldersupdate/folder_name?folder_name=${editingFolder.name}`, {
        name: values.name,
        description: values.description,
        requires_validity: values.requires_validity,
        is_mandatory: values.is_mandatory,
        parent_id: editingFolder.parent_id
      });
      message.success('Folder updated successfully');
      setIsEditModalVisible(false);
      fetchFolders();
    } catch (error) {
      console.error('Error updating folder:', error);
      message.error('Failed to update folder');
    }
  };

  const handleAddFolder = async (values) => {
    try {
      await axios.post('http://172.18.100.54:7000/folders/', {
        name: values.name,
        description: values.description,
        requires_validity: values.requires_validity,
        is_mandatory: values.is_mandatory,
        parent_id: selectedFolder ? selectedFolder.id : null
      });
      message.success('New folder added successfully');
      setIsNewFolderModalVisible(false);
      fetchFolders();
    } catch (error) {
      console.error('Error adding new folder:', error);
      message.error('Failed to add new folder');
    }
  };



  const generatePartNumberRange = (start, end) => {
    if (!start || !end) return [];
    const startNum = parseInt(start.replace(/\D/g, ''));
    const endNum = parseInt(end.replace(/\D/g, ''));
    const prefix = start.replace(/\d/g, '');
    return Array.from({ length: endNum - startNum + 1 }, (_, i) => `${prefix}${startNum + i}`);
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };



  const handlePartNumberSelect = (value) => {
    setPartNumbers(value);
  };

  const handleCustomPartNumberAdd = (value) => {
    if (value && !customPartNumbers.includes(value)) {
      setCustomPartNumbers([...customPartNumbers, value]);
    }
  };

  const handleCustomPartNumberRemove = (removedTag) => {
    const newTags = customPartNumbers.filter(tag => tag !== removedTag);
    setCustomPartNumbers(newTags);
  };

  const handlePartNumberRangeChange = (type, value) => {
    setPartNumberRange(prev => ({ ...prev, [type]: value }));
  };

  const handleSubmit = () => {
    if (!selectedFolder || fileList.length === 0 || (partNumbers.length === 0 && customPartNumbers.length === 0 && !partNumberRange.start)) {
      message.error('Please select a folder, upload files, and specify at least one part number');
      return;
    }

    const summary = fileList.map(file => ({
      fileName: file.name,
      folder: selectedFolder.name,
      partNumbers: [
        ...partNumbers,
        ...customPartNumbers,
        ...generatePartNumberRange(partNumberRange.start, partNumberRange.end)
      ]
    }));

    setUploadSummary(summary);
    console.log('Upload summary:', summary);
  };

  

  return (
    <Layout className="min-h-screen bg-white" theme="light">
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        className="bg-white"
        width={300}
        theme="light"
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Folder Explorer</h2>
          <Tree
            showIcon
            defaultExpandAll
            onSelect={handleFolderSelect}
            
            switcherIcon={<DownOutlined />}
          >
            {renderTreeNodes(folders)}
          </Tree>
          <Button 
            icon={<PlusOutlined />} 
            onClick={() => setIsNewFolderModalVisible(true)}
            className="mt-4 w-full"
          >
            {collapsed ? '' : 'Add New Folder'}
          </Button>
        </div>
      </Sider>
      <Layout className="site-layout">
        <Content className="p-6">
          <Card className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Document Upload</h1>
            <Tabs defaultActiveKey="1">
              <TabPane tab="Upload Files" key="1">
                <Dragger 
                  multiple
                  onChange={handleFileUpload}
                  fileList={fileList}
                  onPreview={handlePreview}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                </Dragger>
              </TabPane>
              <TabPane tab="Part Numbers" key="2">
                <Form layout="vertical">
                  <Form.Item label="Search and Select Existing Part Numbers">
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Search and select existing part numbers"
                      onChange={handlePartNumberSelect}
                      value={partNumbers}
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      showSearch
                    >
                      <Option value="PN001">PN001</Option>
                      <Option value="PN002">PN002</Option>
                      <Option value="PN003">PN003</Option>
                     </Select>
                     </Form.Item>
                  <Form.Item label="Custom Part Numbers">
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Enter custom part numbers"
                      onChange={setCustomPartNumbers}
                      value={customPartNumbers}
                    />
                  </Form.Item>
                  <Form.Item label="Part Number Range">
                    <Input.Group compact>
                      <Input 
                        style={{ width: 'calc(50% - 15px)', marginRight: '15px' }}
                        placeholder="Start of range" 
                        value={partNumberRange.start}
                        onChange={(e) => handlePartNumberRangeChange('start', e.target.value)}
                      />
                      <Input 
                        style={{ width: 'calc(50% - 15px)' }}
                        placeholder="End of range" 
                        value={partNumberRange.end}
                        onChange={(e) => handlePartNumberRangeChange('end', e.target.value)}
                      />
                    </Input.Group>
                  </Form.Item>
                </Form>
              </TabPane>
            </Tabs>
            <Button type="primary" onClick={handleSubmit} className="mt-4">
              Submit Upload
            </Button>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-4">Upload Summary</h2>
            <Table 
              dataSource={uploadSummary}
              columns={[
                { title: 'File Name', dataIndex: 'fileName', key: 'fileName' },
                { title: 'Folder', dataIndex: 'folder', key: 'folder' },
                { 
                  title: 'Part Numbers', 
                  dataIndex: 'partNumbers', 
                  key: 'partNumbers', 
                  render: partNumbers => (
                    <>
                      {partNumbers.map(pn => (
                        <Tag key={pn} className="mb-1">
                          {pn}
                        </Tag>
                      ))}
                    </>
                  )
                },
              ]}
              scroll={{ x: true }}
            />
          </Card>
        </Content>
      </Layout>

      <Modal
        visible={isEditModalVisible}
        title="Edit Folder"
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form 
          initialValues={editingFolder} 
          onFinish={handleEditFolder}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="requires_validity" label="Requires Validity" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_mandatory" label="Is Mandatory" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Folder
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={isNewFolderModalVisible}
        title="Add New Folder"
        onCancel={() => setIsNewFolderModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleAddFolder}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="requires_validity" label="Requires Validity" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_mandatory" label="Is Mandatory" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Folder
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Layout>
  );
};

export default EnhancedDocumentUpload;