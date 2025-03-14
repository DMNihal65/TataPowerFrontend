import React, { useState, useEffect } from 'react';
import { Tree, Input, Button, Upload, Select, Table, Modal, message, Switch, Form, Layout, Card, Tabs, Breadcrumb, Tooltip, Dropdown, Menu, Space, DatePicker, List, Typography } from 'antd';
import { DownOutlined, FolderOutlined, FileOutlined, PlusOutlined, UploadOutlined, SearchOutlined, SortAscendingOutlined, SortDescendingOutlined, InfoCircleOutlined, HomeOutlined, DownloadOutlined, FolderFilled, FilePdfFilled, FileImageFilled, UnorderedListOutlined, AppstoreOutlined, CloseOutlined  } from '@ant-design/icons';
import axios from 'axios';
import { Eye } from 'lucide-react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import * as XLSX from 'xlsx';

const { TreeNode } = Tree;
const { Dragger } = Upload;
const { Option } = Select;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const API_URL = 'http://127.0.0.1:7001';

const logError = async (response) => {
  try {
    const errorData = await response.json();
    console.error('Server error details:', errorData);
    return errorData;
  } catch (e) {
    console.error('Error parsing error response:', e);
    return { detail: 'Unknown error occurred' };
  }
};

const EnhancedDocumentUpload = () => {
  const [treeData, setTreeData] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFolder, setIsFolder] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [form] = Form.useForm();
  const [partNumbers, setPartNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [filePreviewModal, setFilePreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('title');
  const [currentPath, setCurrentPath] = useState([]);
  const [fileDetails, setFileDetails] = useState(null);
  const [isFileDetailsVisible, setIsFileDetailsVisible] = useState(false);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [selectedExistingFiles, setSelectedExistingFiles] = useState([]);
  const [isUploadWithoutPartNumber, setIsUploadWithoutPartNumber] = useState(false);
  const [validityDate, setValidityDate] = useState(null);
  const {plant} = useParams();

 

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:7001/getallpartnumbers/?plant=${plant}`, {
        headers: { Accept: 'application/json' },
      })
      .then((response) => {
        setPartNumbers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching part numbers:', error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      try {
        const response = await axios.get(`${API_URL}/documents?plant=${plant}`);
        setExistingFiles(response.data);
      } catch (error) {
        console.error('Error fetching existing files:', error);
        message.error('Failed to fetch existing files');
      }
    };
    fetchExistingFiles();
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
            fileUrl: file.file_path,
            part_numbers: file.part_numbers ? file.part_numbers.split(', ') : [],
            validity_date: file.validity_date
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
      const response = await fetch(`${API_URL}/getallfolderswithfiles/?plant=${plant}`);
      const data = await response.json();
      const transformedData = buildTreeData(data);
      setTreeData(transformedData);
      setCurrentItems(transformedData);
      setCurrentFolderId(null);
      return transformedData;
    } catch (error) {
      message.error('Failed to fetch folder data');
      console.error('Error fetching folder data:', error);
      return [];
    }
  };

  console.log("treeData:", treeData);

  useEffect(() => {
    const initializeFolderExplorer = async () => {
      try {
        const data = await fetchFolderData();
        setCurrentItems(data);
        setCurrentPath([]);
        setCurrentFolderId(null);
      } catch (error) {
        console.error('Error initializing folder explorer:', error);
      }
    };
    
    initializeFolderExplorer();
  }, []);

  const updatePath = (node) => {
    if (!node) {
      setCurrentPath([]);
      return;
    }

    const path = [];
    let current = node;
    while (current) {
      path.unshift({
        title: current.title,
        key: current.key,
      });
      current = findParentNode(current.key, treeData);
    }
    setCurrentPath(path);
  };

  const findParentNode = (key, nodes) => {
    for (const node of nodes) {
      if (node.children) {
        if (node.children.some(child => child.key === key)) {
          return node;
        }
        const parent = findParentNode(key, node.children);
        if (parent) return parent;
      }
    }
    return null;
  };

  const onSelect = async (keys, event) => {
    const node = event.node;
    setSelectedNode(node);
    updatePath(node);
    
    if (!node.isFolder) {
      const plainTitle = typeof node.title === 'string' 
        ? node.title 
        : node.displayTitle;

      setSelectedFolderFiles([{
        title: plainTitle,
        fileUrl: node.fileUrl,
        fileType: node.fileUrl?.split('.').pop().toLowerCase(),
        part_numbers: node.part_numbers,
        validity_date: node.validity_date ? moment(node.validity_date).format('YYYY-MM-DD') : '-'
      }]);
      
      const fileDetails = {
        title: plainTitle,
        fileUrl: node.fileUrl,
        fileType: node.fileUrl?.split('.').pop().toLowerCase(),
        path: currentPath.map(p => typeof p.title === 'string' ? p.title : p.title.props?.children[0]?.props?.children[1]).join(' / '),
        part_numbers: node.part_numbers,
        validity_date: node.validity_date ? moment(node.validity_date).format('YYYY-MM-DD') : '-'
      };
      setFileDetails(fileDetails);
      setIsFileDetailsVisible(false);
    } else {
      setSelectedFolderFiles([]);
    }
  };

  const sortTreeData = (data) => {
    return [...data].sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      
      switch (sortField) {
        case 'title':
          return sortOrder === 'asc' 
            ? a.title.toString().localeCompare(b.title.toString()) 
            : b.title.toString().localeCompare(a.title.toString());
        
        case 'type':
          const aType = a.isFolder ? 'Folder' : (a.fileUrl?.split('.').pop() || '');
          const bType = b.isFolder ? 'Folder' : (b.fileUrl?.split('.').pop() || '');
          return sortOrder === 'asc' 
            ? aType.localeCompare(bType) 
            : bType.localeCompare(aType);
        
        case 'modified':
          const aDate = a.updated_at ? new Date(a.updated_at) : new Date(0);
          const bDate = b.updated_at ? new Date(b.updated_at) : new Date(0);
          return sortOrder === 'asc' 
            ? aDate - bDate 
            : bDate - aDate;
        
        default:
          return 0;
      }
    });
  };

  const searchNodes = (nodes, searchText) => {
    return nodes.filter(node => {
      const matchesSearch = node.title.toLowerCase().includes(searchText.toLowerCase());
      if (node.children) {
        node.children = searchNodes(node.children, searchText);
        return matchesSearch || node.children.length > 0;
      }
      return matchesSearch;
    });
  };

  const renderTreeNodes = (data) =>
    data.map((item) => ({
      title: (
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center">
            {item.isFolder ? 
              <FolderOutlined className="mr-2 text-blue-500" /> : 
              <FileOutlined className="mr-2 text-gray-500" />
            }
            {item.title}
          </span>
          {!item.isFolder && (
            <Tooltip title="View Details">
              <InfoCircleOutlined 
                className="ml-2 text-gray-400 hover:text-blue-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const fileDetails = {
                    title: item.title,
                    fileUrl: item.fileUrl,
                    fileType: item.fileUrl?.split('.').pop().toLowerCase(),
                    path: currentPath.map(p => p.title).join(' / '),
                    part_numbers: item.part_numbers
                  };
                  setFileDetails(fileDetails);
                  setIsFileDetailsVisible(true);
                }}
              />
            </Tooltip>
          )}
        </div>
      ),
      key: item.key,
      isFolder: item.isFolder,
      fileUrl: item.fileUrl,
      part_numbers: item.part_numbers,
      displayTitle: item.title,
      children: item.children && item.children.length > 0 ? renderTreeNodes(item.children) : null,
    }));

  const FileDetails = ({ file, visible, onClose }) => (
    <Modal
      title="File Details"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width="80%"
      style={{ maxWidth: '1200px' }}
      bodyStyle={{ padding: '0' }}
    >
      {file && (
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/4 p-4 lg:border-r lg:border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <FileOutlined className="text-2xl text-blue-500" />
              <h3 className="text-lg font-semibold">
                {file.title}
              </h3>
            </div>
            
            <div className="space-y-3">
              {file.part_numbers && file.part_numbers.length > 0 && (
                <div>
                  <p className="font-semibold mb-1">Associated Part Numbers:</p>
                  <div className="flex flex-wrap gap-2">
                    {file.part_numbers.map((pn, index) => (
                      <span 
                        key={`${pn}-${index}`} 
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                      >
                        {pn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {file.validity_date && (
                <div>
                  <p className="font-semibold mb-1">Validity Date:</p>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {moment(file.validity_date).format('YYYY-MM-DD')}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    window.open(file.fileUrl, '_blank');
                  }}
                >
                  Download File
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="h-[70vh] bg-gray-50">
              {file.fileType === 'pdf' ? (
                <iframe
                  src={file.fileUrl}
                  className="w-full h-full border-0"
                  title="Document Preview"
                />
              ) : file.fileType?.match(/^(jpg|jpeg|png|gif)$/i) ? (
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={file.fileUrl}
                    alt={file.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <FileOutlined style={{ fontSize: '48px' }} className="text-gray-400" />
                    <p className="mt-2 text-gray-600">Preview not available for this file type</p>
                    <Button
                      type="primary"
                      className="mt-4"
                      onClick={() => window.open(file.fileUrl, '_blank')}
                    >
                      Open File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  const addNode = async () => {
    if (!previewData) {
      message.error('No files to upload');
      return;
    }

    if (!currentFolderId) {
      message.error('Please select a folder to upload the file');
      return;
    }

    setLoading(true);
    try {
      // Handle new file uploads
      const newUploads = previewData.files.filter(file => !file.isExisting);
      const existingFiles = previewData.files.filter(file => file.isExisting);

      // Create part numbers string
      const partNumbersString = [
        ...(previewData.partNumbers || []),
        ...(previewData.customPartNumbers ? previewData.customPartNumbers.split(',').map(pn => pn.trim()) : [])
      ].filter(Boolean).join(',');

      // Upload new files
      if (newUploads.length > 0) {
        const formData = new FormData();
        newUploads.forEach(file => {
          formData.append('files', file.originFileObj);
        });

        // Build URL with query parameters
        const queryParams = new URLSearchParams({
          folder_id: currentFolderId.toString(),
          part_numbers: partNumbersString,
          plant: plant,
          validity_date: previewData.validity_date ? previewData.validity_date.format('YYYY-MM-DD') : '',
          file_name: previewData.file_name
        });

        const uploadUrl = `${API_URL}/upload-file/?${queryParams.toString()}`;

        const response = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
            'Accept': 'application/json',
            },
            body: formData
        });

        if (!response.ok) {
          const errorData = await logError(response);
          throw new Error(errorData.detail || 'Failed to upload new files');
        }
      }

      // Handle existing files
      if (existingFiles.length > 0) {
        await axios.post(`${API_URL}/associate-existing-files/`, {
          folder_id: currentFolderId,
          part_numbers: partNumbersString,
          files: existingFiles.map(file => ({
            file_name: file.name,
            file_path: file.filePath
          })),
          validity_date: previewData.validity_date ? previewData.validity_date.format('YYYY-MM-DD') : '',
          plant: plant
        });
      }

      // Refresh folder data
        await fetchFolderData();

      message.success('Files uploaded successfully');
        setPreviewData(null);
      setUploadedFiles([]);
        form.resetFields();
      } catch (error) {
      console.error('Error uploading files:', error);
      message.error(typeof error === 'string' ? error : error.message || 'Failed to upload files');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (values) => {
    if (uploadedFiles.length === 0) {
      message.error('Please select files to upload');
      return;
    }

    if (!currentFolderId) {
      message.error('Please select a folder to upload the file');
      return;
    }

    let allPartNumbers = [];
    
    if (values.existing_part_numbers) {
      allPartNumbers = [...values.existing_part_numbers];
    }

    if (values.custom_part_numbers) {
      const customParts = values.custom_part_numbers
        .split(',')
        .map(part => part.trim())
        .filter(Boolean);
      if (customParts.length > 0) {
      allPartNumbers = [...allPartNumbers, ...customParts];
      }
    }

    if (values.range_start && values.range_end) {
      const generateRange = (start, end) => {
        const startNum = parseInt(start.replace(/\D/g, ''));
        const endNum = parseInt(end.replace(/\D/g, ''));
        const prefix = start.replace(/[0-9]/g, '');
        const padding = start.replace(/\D/g, '').length;
        
        const range = [];
        for (let i = startNum; i <= endNum; i++) {
          range.push(`${prefix}${i.toString().padStart(padding, '0')}`);
        }
        return range;
      };

      const rangeNumbers = generateRange(values.range_start, values.range_end);
      allPartNumbers = [...allPartNumbers, ...rangeNumbers];
    }

    const uniquePartNumbers = [...new Set(allPartNumbers)].filter(Boolean);

    if (uniquePartNumbers.length === 0 && !isUploadWithoutPartNumber) {
      message.error('Please add at least one part number');
      return;
    }

    setPreviewData({
      files: uploadedFiles,
      folder: currentPath.map(p => p.title).join('/'),
      partNumbers: uniquePartNumbers,
      folder_id: currentFolderId,
      validity_date: values.validity_date,
      file_name: values.file_name
    });
  };

  const openModal = (isNewFolder, withoutPartNumber = false) => {
    if (!isNewFolder && !currentFolderId) {
      message.warning('Please navigate to a folder first');
      return;
    }
    setIsFolder(isNewFolder);
    setIsUploadWithoutPartNumber(withoutPartNumber);
    setIsModalOpen(true);
    
    if (isNewFolder) {
      form.setFieldsValue({ parent_id: currentFolderId || null });
    }
  };

  const handleUpload = ({ fileList }) => {
    const invalidFiles = fileList.filter(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        message.error(`${file.name} is too large. File size limit is 10MB`);
        return true;
      }

      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        message.error(`${file.name}: Only PDF, JPEG, and PNG files are allowed`);
        return true;
      }

      return false;
    });

    // Filter out invalid files
    const validFiles = fileList.filter(file => !invalidFiles.some(invalid => invalid.uid === file.uid));
    setUploadedFiles(validFiles);
  };

    const previewColumns = [
      { 
      title: 'Files',
        dataIndex: 'fileName', 
        key: 'fileName',
    },
    {
      title: 'File Count',
      dataIndex: 'fileCount',
      key: 'fileCount',
      },
      { 
        title: 'Part Numbers', 
        dataIndex: 'partNumbers', 
        key: 'partNumbers',
      render: (partNumbers) => partNumbers?.join(', ') || 'None'
    },
    {
      title: 'Custom Part Numbers',
      dataIndex: 'customPartNumbers',
      key: 'customPartNumbers',
      render: (value) => value || 'None'
    },
    {
      title: 'Validity Date',
      dataIndex: 'validity_date',
      key: 'validity_date',
      render: (date) => date ? date.format('YYYY-MM-DD') : '-'
    }
  ];

  const fileListColumns = [
    { 
      title: 'File Name', 
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => {
        return typeof text === 'string' ? text : text.props?.children[0]?.props?.children[1];
      }
    },
    { 
      title: 'Part Numbers', 
      dataIndex: 'part_numbers',
      key: 'part_numbers',
      render: (part_numbers) => {
        if (!part_numbers || part_numbers.length === 0) return '-';
        return part_numbers.join(', ');
      }
    },
    {
      title: 'Validity Date',
      dataIndex: 'validity_date',
      key: 'validity_date',
      render: (date) => date || '-'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye size={16} />}
          onClick={() => {
            setFileDetails({
              title: record.title,
              fileUrl: record.fileUrl,
              fileType: record.fileUrl?.split('.').pop().toLowerCase(),
              part_numbers: record.part_numbers,
              validity_date: record.validity_date
            });
            setIsFileDetailsVisible(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  const getAllFiles = (nodes) => {
    let files = [];
    nodes.forEach(node => {
      if (node.children) {
        files = [...files, ...getAllFiles(node.children)];
      }
      if (!node.isFolder) {
        files.push(node);
      }
    });
    return files;
  };

  const getFileIcon = (fileUrl) => {
    const extension = fileUrl?.split('.').pop().toLowerCase();
    switch(extension) {
      case 'pdf':
        return <FilePdfFilled className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImageFilled className="text-blue-500" />;
      default:
        return <FileOutlined className="text-gray-500" />;
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    if (!folder) {
      setCurrentItems(treeData);
      setCurrentPath([]);
      setCurrentFolderId(null);
    } else {
      setCurrentItems(folder.children || []);
      setCurrentFolderId(folder.key);
      
      const newPath = [...currentPath];
      if (!newPath.find(p => p.key === folder.key)) {
        newPath.push({
          key: folder.key,
          title: folder.title
        });
      }
      setCurrentPath(newPath);
    }
  };

  const handleBreadcrumbClick = (item, index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);

    if (!item) {
      setCurrentFolder(null);
      setCurrentItems(treeData);
      setCurrentFolderId(null);
    } else {
      let currentNode = treeData;
      let targetFolder = null;
      
      for (let i = 0; i < newPath.length; i++) {
        const pathItem = newPath[i];
        targetFolder = currentNode.find(node => node.key === pathItem.key);
        if (targetFolder && targetFolder.children) {
          currentNode = targetFolder.children;
        }
      }

      if (targetFolder) {
        setCurrentItems(targetFolder.children || []);
        setCurrentFolder(targetFolder);
        setCurrentFolderId(targetFolder.key);
      }
    }
  };

  const getFileType = (fileName) => {
    if (!fileName) return '';
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  const handleExistingFileSelect = (selectedFileIds) => {
    const selectedFiles = existingFiles
      .filter(file => selectedFileIds.includes(file.id))
      .map(file => ({
        uid: file.id,
        name: file.file_name,
        status: 'done',
        filePath: file.file_path,
        type: getFileType(file.file_name),
        partNumber: file.part_number,
        isExisting: true
      }));
    setUploadedFiles(prev => {
      const existingPaths = prev.map(f => f.filePath);
      const newFiles = selectedFiles.filter(f => !existingPaths.includes(f.filePath));
      return [...prev, ...newFiles];
    });
  };

  const handleSubmit = async (values) => {
    if (!isFolder) {
      if (uploadedFiles.length === 0) {
        message.error('Please select files to upload');
        return;
      }

      // Set preview data based on whether it's an upload without part numbers
      const previewData = {
        fileName: values.file_name,
        fileCount: uploadedFiles.length,
        partNumbers: isUploadWithoutPartNumber ? [] : values.existing_part_numbers || [],
        customPartNumbers: isUploadWithoutPartNumber ? '' : values.custom_part_numbers,
        files: uploadedFiles,
        validity_date: values.validity_date,
        folder_id: currentFolderId,
        file_name: values.file_name
      };
      
      setPreviewData(previewData);
      setIsModalOpen(false);
    } else {
      // New folder creation logic
      try {
        // Get the parent folder ID from the current path
        const parentId = currentPath.length > 0 
          ? currentPath[currentPath.length - 1].key 
          : null;

        const response = await axios.post(`${API_URL}/folders/`, {
          name: values.name,
          description: values.description,
          
          parent_id: parentId ,// Use the parent ID from current path
          plant:plant
        });

        if (response.status === 200 || response.status === 201) {
          message.success('Folder created successfully');
          await fetchFolderData();
          setIsModalOpen(false);
          form.resetFields();
        } else {
          message.error('Failed to create folder');
        }
      } catch (error) {
        console.error('Error creating folder:', error);
        if (error.response && error.response.data) {
          message.error(error.response.data.detail || 'Error creating folder');
        } else {
          message.error('An unexpected error occurred while creating the folder');
        }
      }
    }
  };
  
    return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-6">
        <Card className="w-1/2">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-4">Folder Explorer</h1>
            
            <div className="flex justify-between items-center mb-4">
              <Breadcrumb>
                <Breadcrumb.Item 
                  onClick={() => handleBreadcrumbClick(null, -1)} 
                  className="cursor-pointer hover:text-blue-500"
                >
                  <HomeOutlined />
                </Breadcrumb.Item>
                {currentPath.map((item, index) => (
                  <Breadcrumb.Item 
                    key={item.key}
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => handleBreadcrumbClick(item, index)}
                  >
                    {item.title}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>

              <Space>
            <Button
                  icon={<UnorderedListOutlined />}
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                />
                <Button
                  icon={<AppstoreOutlined />}
                  type={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                />
              </Space>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button
              type="primary"
              icon={<PlusOutlined />}
                onClick={() => openModal(true)}
            >
                New Folder
            </Button>
            <Button
                icon={<UploadOutlined />}
              onClick={() => openModal(false)}
              >
                Upload File
              </Button>
              <Button
              icon={<UploadOutlined />}
                onClick={() => openModal(false, true)}
            >
                Upload File Without Partnumber
            </Button>
              <Select
                style={{ width: 120 }}
                value={sortField}
                onChange={setSortField}
              >
                <Select.Option value="title">Name</Select.Option>
                <Select.Option value="modified">Date Modified</Select.Option>
                <Select.Option value="type">Type</Select.Option>
              </Select>
              <Button
                icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              />
          </div>

            <Input
              prefix={<SearchOutlined />}
              placeholder="Search files and folders..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="mb-4"
              allowClear
            />

            <div className="border rounded-lg p-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-3 gap-4">
                  {currentItems
                    .filter(item => 
                      item.title.toLowerCase().includes(searchText.toLowerCase())
                    )
                    .sort((a, b) => {
                      // First sort by folder/file
                      if (a.isFolder && !b.isFolder) return -1;
                      if (!a.isFolder && b.isFolder) return 1;

                      // Then sort by the selected field
                      switch (sortField) {
                        case 'title':
                          const aTitle = (typeof a.title === 'string' ? a.title : '').toString();
                          const bTitle = (typeof b.title === 'string' ? b.title : '').toString();
                          return sortOrder === 'asc' 
                            ? aTitle.localeCompare(bTitle)
                            : bTitle.localeCompare(aTitle);

                        case 'type':
                          const aType = a.isFolder ? 'Folder' : (a.fileUrl?.split('.').pop() || '');
                          const bType = b.isFolder ? 'Folder' : (b.fileUrl?.split('.').pop() || '');
                          return sortOrder === 'asc'
                            ? aType.localeCompare(bType)
                            : bType.localeCompare(aType);

                        case 'modified':
                          const aDate = a.updated_at ? new Date(a.updated_at) : new Date(0);
                          const bDate = b.updated_at ? new Date(b.updated_at) : new Date(0);
                          return sortOrder === 'asc'
                            ? aDate - bDate
                            : bDate - aDate;

                        default:
                          return 0;
                      }
                    })
                    .map(item => (
                      <div
                        key={item.key}
                        className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex flex-col items-center"
                        onClick={() => item.isFolder ? handleFolderClick(item) : onSelect(null, { node: item })}
                      >
                        <div className="text-3xl mb-2">
                          {item.isFolder ? 
                            <FolderFilled className="text-yellow-500" /> : 
                            getFileIcon(item.fileUrl)
                          }
                        </div>
                        <div className="text-center truncate w-full">
                          {typeof item.title === 'string' 
                            ? item.title 
                            : item.title?.props?.children[0]?.props?.children[1] || 'Untitled'
                          }
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Table
                  columns={[
                    {
                      title: 'Name',
                      dataIndex: 'title',
                      sorter: true,
                      sortOrder: sortField === 'title' ? sortOrder : null,
                      render: (text, record) => (
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => record.isFolder ? handleFolderClick(record) : onSelect(null, { node: record })}
                        >
                          <span className="mr-2">
                            {record.isFolder ? 
                              <FolderFilled className="text-yellow-500" /> : 
                              getFileIcon(record.fileUrl)
                            }
                          </span>
                          {typeof text === 'string' ? text : text.props?.children[0]?.props?.children[1]}
                        </div>
                      )
                    },
                    {
                      title: 'Type',
                      dataIndex: 'fileUrl',
                      sorter: true,
                      sortOrder: sortField === 'type' ? sortOrder : null,
                      render: (fileUrl, record) => 
                        record.isFolder ? 'Folder' : 
                        fileUrl?.split('.').pop().toUpperCase() || '-'
                    },
                    {
                      title: 'Modified',
                      dataIndex: 'updated_at',
                      sorter: true,
                      sortOrder: sortField === 'modified' ? sortOrder : null,
                      render: (date) => date ? new Date(date).toLocaleDateString() : '-'
                    },
                    {
                      title: 'Part Numbers',
                      dataIndex: 'part_numbers',
                      width: '30%',
                      render: (part_numbers, record) => 
                        !record.isFolder && part_numbers ? part_numbers.join(', ') : '-'
                    }
                  ]}
                  dataSource={currentItems
                    .filter(item => 
                      item.title.toLowerCase().includes(searchText.toLowerCase())
                    )
                  }
                  onChange={(pagination, filters, sorter) => {
                    setSortField(sorter.field || 'title');
                    setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
                  }}
                  pagination={false}
                  rowKey="key"
                />
              )}
            </div>
          </div>
        </Card>

        <div className="flex-1 flex flex-col gap-6">
          <Card>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Upload Preview</h2>
              {previewData && (
                <Button 
                  type="primary" 
                  onClick={addNode}
                  icon={<UploadOutlined />}
                >
                  Confirm Upload
                </Button>
              )}
            </div>
            <Table 
              columns={previewColumns}
              dataSource={previewData ? [previewData] : []}
              pagination={false}
              rowKey="fileName"
              locale={{ emptyText: 'No files selected for upload' }}
            />
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                File Details
              </h2>
            </div>
            <Table 
              columns={fileListColumns}
              dataSource={selectedFolderFiles}
              pagination={false}
              rowKey={(record) => record.key || record.fileUrl}
              locale={{ emptyText: 'Click on a file to view details' }}
            />
          </Card>
        </div>
      </div>

      <FileDetails
        file={fileDetails}
        visible={isFileDetailsVisible}
        onClose={() => setIsFileDetailsVisible(false)}
      />
    
          <Modal
        title={isFolder ? 'Create New Folder' : `Upload File to ${currentPath.length > 0 ? currentPath[currentPath.length - 1].title : 'Root'}`}
            open={isModalOpen}
            onCancel={() => {
              setIsModalOpen(false);
              form.resetFields();
              setUploadedFile(null);
              setPreviewData(null);
          setIsUploadWithoutPartNumber(false);
            }}
            footer={null}
        width={800}
        style={{ top: 20 }}
          >
            <Form 
              form={form} 
              layout="vertical"
          name="folder_form"
          onFinish={handleSubmit}
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
                  
                </>
              ) : (
                <>
              {!isUploadWithoutPartNumber && (
                <>
                  
                  <Form.Item label="Custom Part Numbers" name="custom_part_numbers">
                    <Input placeholder="Enter custom part numbers" />
                  </Form.Item>
                  <Form.Item label="Upload Excel Sheet">
                    <Upload
                      accept=".xlsx,.xls"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          const data = new Uint8Array(e.target.result);
                          const workbook = XLSX.read(data, { type: 'array' });
                          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                          
                          // Extract part numbers from Part code column
                          const extractedPartNumbers = jsonData
                            .map(row => row['Part code'])
                            .filter(code => code); // Filter out undefined or empty values

                          if (extractedPartNumbers.length > 0) {
                            // Show preview modal with extracted part numbers
                            Modal.info({
                              title: 'Extracted Part Numbers',
                              content: (
                                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                                  <List
                                    size="small"
                                    bordered
                                    dataSource={extractedPartNumbers}
                                    renderItem={item => (
                                      <List.Item>
                                        {item}
                                      </List.Item>
                                    )}
                                  />
                                </div>
                              ),
                              onOk() {
                                // Set the extracted part numbers in the form
                                form.setFieldsValue({
                                  custom_part_numbers: extractedPartNumbers.join(', ')
                                });
                              },
                            });
                          } else {
                            message.error('No part numbers found in the Excel sheet. Please ensure there is a "Part code" column.');
                          }
                        };
                        reader.readAsArrayBuffer(file);
                        return false; // Prevent default upload behavior
                      }}
                    >
                      <Button icon={<UploadOutlined />}>Upload Excel Sheet</Button>
                    </Upload>
                    <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                      Excel sheet should contain a "Part code" column
                    </Typography.Text>
                      </Form.Item>
                </>
              )}
                      <Form.Item
                    name="validity_date"
                    label="Validity Date"
                    rules={[{ required: true, message: 'Please select validity date!' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      format="YYYY-MM-DD"
                      disabledDate={(current) => {
                        // Can't select days before today
                        return current && current < moment().startOf('day');
                      }}
                        />
                      </Form.Item>
              <Form.Item name="file_name" label="File name" rules={[{ required: true, message: 'Please enter file name' }]}>
                  <Input placeholder="Enter file name" />
                  </Form.Item>
              <Form.Item label="Upload Files" required>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Upload
                        multiple
                        listType="picture"
                        beforeUpload={() => false}
                        onChange={handleUpload}
                        fileList={uploadedFiles}
                        maxCount={5}
                        accept=".pdf,.jpg,.jpeg,.png"
                      >
                        <Button icon={<UploadOutlined />} className="w-full">
                          Click or drag files to upload
                        </Button>
                    </Upload>
                    </div>
                    <div className="flex-1">
                      <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Or select existing files"
                        onChange={handleExistingFileSelect}
                        optionFilterProp="label"
                        filterOption={(input, option) => {
                          const label = option?.label?.toLowerCase() || '';
                          return label.includes(input.toLowerCase());
                        }}
                      >
                        {existingFiles.map(file => (
                          <Select.Option 
                            key={file.id} 
                            value={file.id}
                            label={`${file.file_name} ${!isUploadWithoutPartNumber ? `(${file.part_number})` : ''}`}
                            disabled={uploadedFiles.some(f => f.filePath === file.file_path)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{file.file_name}</span>
                              {!isUploadWithoutPartNumber && (
                                <span className="text-gray-400 text-sm">
                                  ({file.part_number})
                                </span>
                              )}
                            </div>
                          </Select.Option>
                        ))} 
                      </Select>
                    </div>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="font-medium mb-2">Selected Files:</div>
                      {uploadedFiles.map(file => (
                        <div key={file.uid} className="flex items-center justify-between py-1">
                          <div className="flex items-center space-x-2">
                            <FileOutlined className="text-gray-500" />
                            <span>{file.name}</span>
                            {!isUploadWithoutPartNumber && (
                              <span className="text-xs text-gray-500">
                                {file.partNumber ? `(${file.partNumber})` : `(${(file.size / 1024 / 1024).toFixed(2)} MB)`}
                              </span>
                            )}
                          </div>
                          <Button
                            type="text"
                            icon={<CloseOutlined />}
                            onClick={() => {
                              setUploadedFiles(prev => prev.filter(f => f.uid !== file.uid));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                  </Form.Item>
                </>
              )}
         
              <Form.Item>
                <Button onClick={()=>setIsModalOpen(false)} type="primary" htmlType="submit">
                  {isFolder ? 'Create Folder' : 'Preview'}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
    </div>
    );
  };
  
  export default EnhancedDocumentUpload;