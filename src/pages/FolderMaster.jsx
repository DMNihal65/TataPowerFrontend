import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Tree, Input, Button, Modal, message, Spin, Switch, Tooltip, Upload, Select, Space } from 'antd';
import { FolderIcon, FileIcon, PlusIcon, Edit2Icon, Trash2Icon, AlertTriangleIcon, CheckCircleIcon, UploadIcon } from 'lucide-react';

const { DirectoryTree } = Tree;
const { Search } = Input;
const { Option } = Select;

const API_BASE_URL = 'http://172.18.100.54:7000';

const FolderMaster = () => {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [description, setDescription] = useState('');
  const [requiresValidity, setRequiresValidity] = useState(false);
  const [isMandatory, setIsMandatory] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [partNumbers, setPartNumbers] = useState([]);
  const [partNumberRange, setPartNumberRange] = useState({ start: '', end: '' });

  const fetchFolders = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getallfolders/`);
      const formattedData = formatTreeData(response.data);
      setTreeData(formattedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching folders:', error);
      message.error('Failed to fetch folders');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const formatTreeData = (data) => {
    const idMap = {};
    data.forEach(item => {
      idMap[item.id] = { 
        ...item, 
        key: item.id.toString(),
        title: item.name,
        children: [] 
      };
    });

    const treeData = [];
    data.forEach(item => {
      const treeItem = idMap[item.id];
      if (item.parent_id === null) {
        treeData.push(treeItem);
      } else {
        const parent = idMap[item.parent_id];
        if (parent) {
          parent.children.push(treeItem);
        }
      }
    });

    return treeData;
  };

  const onSelect = (selectedKeys, info) => {
    setSelectedNode(info.node);
  };

  const showModal = (action) => {
    setModalAction(action);
    if (action === 'edit' && selectedNode) {
      setInputValue(selectedNode.name);
      setDescription(selectedNode.description || '');
      setRequiresValidity(selectedNode.requires_validity || false);
      setIsMandatory(selectedNode.is_mandatory || false);
    } else {
      setInputValue('');
      setDescription('');
      setRequiresValidity(false);
      setIsMandatory(false);
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!inputValue.trim()) {
      message.error('Folder name cannot be empty');
      return;
    }

    try {
      if (modalAction === 'create') {
        await createFolder();
      } else if (modalAction === 'edit') {
        await editFolder();
      }
      setIsModalVisible(false);
      fetchFolders();
    } catch (error) {
      console.error('Error:', error);
      message.error('Operation failed');
    }
  };

  const createFolder = async () => {
    const newFolder = {
      name: inputValue,
      description,
      requires_validity: requiresValidity,
      is_mandatory: isMandatory,
      parent_id: selectedNode ? selectedNode.id : null
    };
    await axios.post(`${API_BASE_URL}/folders/`, newFolder);
    message.success('Folder created successfully');
  };

  const editFolder = async () => {
    const updatedFolder = {
      name: inputValue,
      description,
      requires_validity: requiresValidity,
      is_mandatory: isMandatory
    };
    await axios.put(`${API_BASE_URL}/foldersupdate/folder_name?folder_name=${selectedNode.name}`, updatedFolder);
    message.success('Folder updated successfully');
  };

  const handleDelete = async () => {
    if (selectedNode) {
      try {
        await axios.delete(`${API_BASE_URL}/folders/${selectedNode.id}`);
        message.success('Folder deleted successfully');
        fetchFolders();
        setSelectedNode(null);
      } catch (error) {
        console.error('Error deleting folder:', error);
        message.error('Failed to delete folder');
      }
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const filterTreeData = (data, searchValue) => {
    return data.filter(item => {
      const matchedItem = { ...item };
      if (item.title.toLowerCase().includes(searchValue.toLowerCase())) {
        return true;
      }
      if (item.children) {
        matchedItem.children = filterTreeData(item.children, searchValue);
        return matchedItem.children.length > 0;
      }
      return false;
    });
  };

  const renderTreeNodes = (data) => {
    return data.map((item) => (
      <Tree.TreeNode
        key={item.key}
        title={
          <Tooltip title={`Validity: ${item.requires_validity ? 'Required' : 'Not Required'}, Mandatory: ${item.is_mandatory ? 'Yes' : 'No'}`}>
            <Space>
              {item.title}
              {item.requires_validity && <AlertTriangleIcon className="w-4 h-4 text-yellow-500" />}
              {item.is_mandatory && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
            </Space>
          </Tooltip>
        }
        icon={<FolderIcon className="w-4 h-4 text-blue-500" />}
      >
        {item.children && renderTreeNodes(item.children)}
      </Tree.TreeNode>
    ));
  };

  const showUploadModal = () => {
    setIsUploadModalVisible(true);
  };

  const handleUploadOk = async () => {
    if (selectedFiles.length === 0) {
      message.error('Please select at least one file to upload');
      return;
    }
    if (partNumbers.length === 0) {
      message.error('Please assign at least one part number');
      return;
    }
    // Implement the logic to upload documents and assign part numbers
    console.log('Selected files:', selectedFiles);
    console.log('Part numbers:', partNumbers);
    // You would typically make an API call here to upload the files and assign part numbers
    message.success('Documents uploaded and part numbers assigned successfully');
    setIsUploadModalVisible(false);
    setSelectedFiles([]);
    setPartNumbers([]);
    setPartNumberRange({ start: '', end: '' });
  };

  const handleFileChange = (info) => {
    setSelectedFiles(info.fileList);
  };

  const handlePartNumberRangeChange = (field, value) => {
    setPartNumberRange({ ...partNumberRange, [field]: value });
  };

  const handleAddPartNumberRange = () => {
    const { start, end } = partNumberRange;
    if (start && end) {
      const startNum = parseInt(start.replace(/\D/g, ''));
      const endNum = parseInt(end.replace(/\D/g, ''));
      if (startNum < endNum) {
        const prefix = start.replace(/\d/g, '');
        const newPartNumbers = [];
        for (let i = startNum; i <= endNum; i++) {
          newPartNumbers.push(`${prefix}${i.toString().padStart(3, '0')}`);
        }
        setPartNumbers([...partNumbers, ...newPartNumbers]);
        setPartNumberRange({ start: '', end: '' });
      } else {
        message.error('Invalid part number range');
      }
    }
  };

  const filteredTreeData = searchValue ? filterTreeData(treeData, searchValue) : treeData;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">Folder Master</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Folder Structure</h2>
          <Search
            placeholder="Search files and folders"
            className="mb-4"
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
          />
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <DirectoryTree
              className="mb-4 overflow-auto max-h-[calc(100vh-300px)]"
              onSelect={onSelect}
              treeData={filteredTreeData}
            >
              {renderTreeNodes(filteredTreeData)}
            </DirectoryTree>
          )}
          <Space className="mt-4">
            <Button 
              onClick={() => showModal('create')} 
              icon={<PlusIcon className="w-4 h-4" />}
              type="primary"
            >
              New
            </Button>
            <Button 
              onClick={() => showModal('edit')} 
              disabled={!selectedNode} 
              icon={<Edit2Icon className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={!selectedNode} 
              icon={<Trash2Icon className="w-4 h-4" />}
              danger
            >
              Delete
            </Button>
            <Button 
              onClick={showUploadModal} 
              disabled={!selectedNode} 
              icon={<UploadIcon className="w-4 h-4" />}
            >
              Upload
            </Button>
          </Space>
        </div>
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Folder Details</h2>
          {selectedNode ? (
            <div className="space-y-2">
              <p><strong className="text-gray-600">Name:</strong> {selectedNode.name}</p>
              <p><strong className="text-gray-600">Description:</strong> {selectedNode.description || 'N/A'}</p>
              <p><strong className="text-gray-600">Requires Validity:</strong> {selectedNode.requires_validity ? 'Yes' : 'No'}</p>
              <p><strong className="text-gray-600">Is Mandatory:</strong> {selectedNode.is_mandatory ? 'Yes' : 'No'}</p>
              <p><strong className="text-gray-600">Created At:</strong> {new Date(selectedNode.created_at).toLocaleString()}</p>
              <p><strong className="text-gray-600">Updated At:</strong> {new Date(selectedNode.updated_at).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic">Select a folder to view its details.</p>
          )}
        </div>
      </div>

      <Modal
        title={modalAction === 'create' ? 'Create New Folder' : 'Edit Folder'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter folder name"
          className="mb-4"
        />
        <Input.TextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter folder description"
          className="mb-4"
        />
        <div className="mb-4 flex items-center">
          <Switch
            checked={requiresValidity}
            onChange={setRequiresValidity}
            className="mr-2"
          />
          <span>Requires Validity</span>
        </div>
        <div className="mb-4 flex items-center">
          <Switch
            checked={isMandatory}
            onChange={setIsMandatory}
            className="mr-2"
          />
          <span>Is Mandatory</span>
        </div>
      </Modal>

      <Modal
        title="Upload Documents"
        visible={isUploadModalVisible}
        onOk={handleUploadOk}
        onCancel={() => setIsUploadModalVisible(false)}
        width={600}
      >
        <Upload
          multiple
          fileList={selectedFiles}
          onChange={handleFileChange}
          beforeUpload={() => false}
        >
          <Button icon={<UploadIcon className="w-4 h-4" />}>Select Files</Button>
        </Upload>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Assign Part Numbers</h4>
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Select or enter part numbers"
            value={partNumbers}
            onChange={setPartNumbers}
          >
            {/* You can add existing part numbers as options here */}
          </Select>
        </div>
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Add Part Number Range</h4>
          <Space>
            <Input
              placeholder="Start (e.g., p001)"
              value={partNumberRange.start}
              onChange={(e) => handlePartNumberRangeChange('start', e.target.value)}
              style={{ width: 120 }}
            />
            <Input
              placeholder="End (e.g., p010)"
              value={partNumberRange.end}
              onChange={(e) => handlePartNumberRangeChange('end', e.target.value)}
              style={{ width: 120 }}
            />
            <Button onClick={handleAddPartNumberRange}>Add Range</Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default FolderMaster;