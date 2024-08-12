import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tree, Input, Button, Modal, message, Spin, Switch, Tooltip } from 'antd';
import { Folder, File, Plus, Edit2, Trash2, Move, AlertTriangle, CheckCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { DirectoryTree } = Tree;
const { Search } = Input;

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

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
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
  };

  const formatTreeData = (data) => {
    const idMap = {};
    data.forEach(item => {
      idMap[item.id] = { ...item, children: [] };
    });

    const treeData = [];
    data.forEach(item => {
      const treeItem = idMap[item.id];
      treeItem.key = item.id.toString();
      treeItem.title = item.name;
      if (item.parent_id === null) {
        treeData.push(treeItem);
      } else {
        idMap[item.parent_id].children.push(treeItem);
      }
    });

    return treeData;
  };

  const onSelect = (selectedKeys, info) => {
    setSelectedNode(info.node);
  };

  const showModal = (action) => {
    setModalAction(action);
    setIsModalVisible(true);
    if (action === 'edit' && selectedNode) {
      setInputValue(selectedNode.name);
      setDescription(selectedNode.description);
      setRequiresValidity(selectedNode.requires_validity);
      setIsMandatory(selectedNode.is_mandatory);
    } else {
      setInputValue('');
      setDescription('');
      setRequiresValidity(false);
      setIsMandatory(false);
    }
  };

  const handleOk = async () => {
    if (!inputValue.trim()) {
      message.error('Name cannot be empty');
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
      description: description,
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
      description: description,
      requires_validity: requiresValidity,
      is_mandatory: isMandatory,
      parent_id: selectedNode.parent_id
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

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceId = result.draggableId;
    const destinationId = result.destination.droppableId;

    try {
      await axios.put(`${API_BASE_URL}/foldersupdate/folder_name?folder_name=${sourceId}`, {
        parent_id: destinationId === 'root' ? null : parseInt(destinationId)
      });
      message.success('Folder moved successfully');
      fetchFolders();
    } catch (error) {
      console.error('Error moving folder:', error);
      message.error('Failed to move folder');
    }
  };

  const renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <Tree.TreeNode
            key={item.key}
            title={
              <Tooltip title={`Validity: ${item.requires_validity ? 'Required' : 'Not Required'}, Mandatory: ${item.is_mandatory ? 'Yes' : 'No'}`}>
                <span>
                  {item.title}
                  {item.requires_validity && <AlertTriangle className="inline-block w-4 h-4 ml-2 text-yellow-500" />}
                  {item.is_mandatory && <CheckCircle className="inline-block w-4 h-4 ml-2 text-green-500" />}
                </span>
              </Tooltip>
            }
            data={item}
          >
            {renderTreeNodes(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode key={item.key} title={item.title} data={item} />;
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Folder Master</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Droppable droppableId="root">
            {(provided) => (
              <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6" {...provided.droppableProps} ref={provided.innerRef}>
                <h2 className="text-xl font-semibold mb-4">Folder Structure</h2>
                <Search placeholder="Search files and folders" className="mb-4" />
                {loading ? (
                  <Spin />
                ) : (
                  <DirectoryTree
                    className="mb-4"
                    onSelect={onSelect}
                    showIcon
                    icon={({ isLeaf }) => (isLeaf ? <File className="w-4 h-4" /> : <Folder className="w-4 h-4" />)}
                  >
                    {renderTreeNodes(treeData)}
                  </DirectoryTree>
                )}
                {provided.placeholder}
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => showModal('create')} 
                    icon={<Plus className="w-4 h-4" />}
                    className="flex items-center"
                  >
                    New
                  </Button>
                  <Button 
                    onClick={() => showModal('edit')} 
                    disabled={!selectedNode} 
                    icon={<Edit2 className="w-4 h-4" />}
                    className="flex items-center"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={handleDelete} 
                    disabled={!selectedNode} 
                    icon={<Trash2 className="w-4 h-4" />}
                    className="flex items-center text-red-500 hover:text-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </Droppable>
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Folder Details</h2>
            {selectedNode ? (
              <div>
                <p className="mb-2"><strong>Name:</strong> {selectedNode.name}</p>
                <p className="mb-2"><strong>Description:</strong> {selectedNode.description}</p>
                <p className="mb-2"><strong>Requires Validity:</strong> {selectedNode.requires_validity ? 'Yes' : 'No'}</p>
                <p className="mb-2"><strong>Is Mandatory:</strong> {selectedNode.is_mandatory ? 'Yes' : 'No'}</p>
                <p className="mb-2"><strong>Created At:</strong> {new Date(selectedNode.created_at).toLocaleString()}</p>
                <p className="mb-2"><strong>Updated At:</strong> {new Date(selectedNode.updated_at).toLocaleString()}</p>
              </div>
            ) : (
              <p>Select a folder to view its details.</p>
            )}
          </div>
        </div>
      </DragDropContext>

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
        <div className="mb-4">
          <Switch
            checked={requiresValidity}
            onChange={setRequiresValidity}
            className="mr-2"
          />
          <span>Requires Validity</span>
        </div>
        <div className="mb-4">
          <Switch
            checked={isMandatory}
            onChange={setIsMandatory}
            className="mr-2"
          />
          <span>Is Mandatory</span>
        </div>
      </Modal>
    </div>
  );
};

export default FolderMaster;