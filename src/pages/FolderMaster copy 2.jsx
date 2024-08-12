import React, { useState } from 'react';
import { Tree, Input, Button, Modal, message } from 'antd';
import { Folder, File, Plus, Edit2, Trash2, Move } from 'lucide-react';

const { DirectoryTree } = Tree;
const { Search } = Input;

const initialData = [
  {
    title: 'Documents',
    key: '0-0',
    children: [
      {
        title: 'Work',
        key: '0-0-0',
        children: [
          { title: 'Project A.docx', key: '0-0-0-0', isLeaf: true },
          { title: 'Project B.xlsx', key: '0-0-0-1', isLeaf: true },
        ],
      },
      {
        title: 'Personal',
        key: '0-0-1',
        children: [
          { title: 'Resume.pdf', key: '0-0-1-0', isLeaf: true },
          { title: 'Budget.xlsx', key: '0-0-1-1', isLeaf: true },
        ],
      },
    ],
  },
];

const FolderMaster = () => {
  const [treeData, setTreeData] = useState(initialData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [inputValue, setInputValue] = useState('');

  const onSelect = (selectedKeys, info) => {
    setSelectedNode(info.node);
  };

  const showModal = (action) => {
    setModalAction(action);
    setIsModalVisible(true);
    setInputValue(action === 'rename' ? selectedNode.title : '');
  };

  const handleOk = () => {
    if (!inputValue.trim()) {
      message.error('Name cannot be empty');
      return;
    }

    let newTreeData = [...treeData];
    switch (modalAction) {
      case 'create':
        if (selectedNode) {
          const newNode = { title: inputValue, key: `${selectedNode.key}-${Date.now()}`, children: [] };
          updateTreeData(newTreeData, selectedNode.key, (node) => {
            node.children = node.children || [];
            return { ...node, children: [...node.children, newNode] };
          });
        } else {
          newTreeData.push({ title: inputValue, key: Date.now().toString(), children: [] });
        }
        break;
      case 'rename':
        updateTreeData(newTreeData, selectedNode.key, (node) => ({ ...node, title: inputValue }));
        break;
      default:
        break;
    }
    setTreeData(newTreeData);
    setIsModalVisible(false);
    setInputValue('');
  };

  const handleDelete = () => {
    if (selectedNode) {
      let newTreeData = [...treeData];
      deleteNode(newTreeData, selectedNode.key);
      setTreeData(newTreeData);
      setSelectedNode(null);
    }
  };

  const updateTreeData = (list, key, callback) => {
    return list.map((node) => {
      if (node.key === key) {
        return callback(node);
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, callback) };
      }
      return node;
    });
  };

  const deleteNode = (list, key) => {
    for (let i = 0; i < list.length; i++) {
      if (list[i].key === key) {
        list.splice(i, 1);
        return;
      }
      if (list[i].children) {
        deleteNode(list[i].children, key);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Folder Master</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Folder Structure</h2>
          <Search placeholder="Search files and folders" className="mb-4" />
          <DirectoryTree
            className="mb-4"
            treeData={treeData}
            onSelect={onSelect}
            showIcon
            icon={({ isLeaf }) => (isLeaf ? <File className="w-4 h-4 rounded-lg" /> : <Folder className="w-4 h-4" />)}
          />
          <div className="flex space-x-2">
            <Button 
              onClick={() => showModal('create')} 
              icon={<Plus className="w-4 h-4" />}
              className="flex items-center"
            >
              New
            </Button>
            <Button 
              onClick={() => showModal('rename')} 
              disabled={!selectedNode} 
              icon={<Edit2 className="w-4 h-4" />}
              className="flex items-center"
            >
              Rename
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
        
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Folder Contents</h2>
          {selectedNode ? (
            <div>
              <p className="mb-2">Selected: {selectedNode.title}</p>
              {selectedNode.children && selectedNode.children.length > 0 ? (
                <ul className="list-disc pl-5">
                  {selectedNode.children.map((child) => (
                    <li key={child.key} className="mb-1">
                      {child.isLeaf ? <File className="w-4 h-4 inline mr-2" /> : <Folder className="w-4 h-4 inline mr-2" />}
                      {child.title}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>This folder is empty.</p>
              )}
            </div>
          ) : (
            <p>Select a folder to view its contents.</p>
          )}
        </div>
      </div>

      <Modal
        title={modalAction === 'create' ? 'Create New Folder' : 'Rename Folder'}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={modalAction === 'create' ? 'Enter folder name' : 'Enter new name'}
        />
      </Modal>
    </div>
  );
};

export default FolderMaster;