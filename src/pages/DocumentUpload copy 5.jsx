import React, { useState, useEffect } from 'react';
import { Tree, Input, Button, Upload, Select, Table, Modal, message, Switch, Form, Layout, Card, Tabs, Breadcrumb, Tooltip, Dropdown, Menu, Space, DatePicker, List, Typography } from 'antd';
import { DownOutlined, FolderOutlined, FileOutlined, PlusOutlined, UploadOutlined, SearchOutlined, SortAscendingOutlined, SortDescendingOutlined, InfoCircleOutlined, HomeOutlined, DownloadOutlined, FolderFilled, FilePdfFilled, FileImageFilled, UnorderedListOutlined, AppstoreOutlined, CloseOutlined, InboxOutlined } from '@ant-design/icons';
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
  const [form] = Form.useForm();
  const [partNumbers, setPartNumbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortField, setSortField] = useState('title');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [currentPath, setCurrentPath] = useState([]);
  const [fileDetails, setFileDetails] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [isFileDetailsVisible, setIsFileDetailsVisible] = useState(false);
  const [selectedFolderFiles, setSelectedFolderFiles] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const {plant} = useParams();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadWithoutPartModalOpen, setIsUploadWithoutPartModalOpen] = useState(false);
  const [uploadedFileList, setUploadedFileList] = useState([]);
  const [currentFileDetails, setCurrentFileDetails] = useState(null);
  const [fileDetailsModalVisible, setFileDetailsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [customPartNumbers, setCustomPartNumbers] = useState('');
  const [excelPartNumbers, setExcelPartNumbers] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [fileDetailsForm] = Form.useForm();
  const [existingFiles, setExistingFiles] = useState([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

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
  }, [plant]);

  useEffect(() => {
    const fetchExistingFiles = async () => {
      try {
        const response = await axios.get(`${API_URL}/documents?plant=${plant}`);
        setUploadedFiles(response.data);
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

  const openModal = (isNewFolder) => {
    if (!isNewFolder && !currentFolderId) {
      message.warning('Please navigate to a folder first');
      return;
    }
    setIsFolder(isNewFolder);
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
          onClick={(e) => {
            e.stopPropagation();
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
    const selectedFiles = uploadedFiles
      .filter(file => selectedFileIds.includes(file.uid))
      .map(file => ({
        uid: file.uid,
        name: file.name,
        status: 'done',
        filePath: file.filePath,
        type: getFileType(file.name),
        partNumber: file.partNumber,
        isExisting: true
      }));
    setUploadedFiles(prev => {
      const existingPaths = prev.map(f => f.filePath);
      const newFiles = selectedFiles.filter(f => !existingPaths.includes(f.filePath));
      return [...prev, ...newFiles];
    });
  };

  const handleSubmit = async (values) => {
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
  };

  const handleConfirmUpload = async () => {
    try {
      // Separate existing files and new files
      const existingFiles = previewData.filter(item => item.file.isExisting);
      const newFiles = previewData.filter(item => !item.file.isExisting);

      // Handle existing files
      if (existingFiles.length > 0) {
        const existingFilesData = {
          folder_id: currentFolderId,
          plant: plant,
          part_numbers: customPartNumbers,
          validity_date: existingFiles[0].validityDate,
          files: existingFiles.map(item => ({
            file_name: item.fileName,
            file_path: item.file.url
          }))
        };

        await axios.post(`${API_URL}/associate-existing-files/`, existingFilesData);
      }

      // Handle new files
      if (newFiles.length > 0) {
        const formData = new FormData();
        
        // Add new files to FormData
        newFiles.forEach((item) => {
          formData.append('files', item.file.originFileObj);
        });

        // Add other data as query parameters
        const queryParams = new URLSearchParams({
          folder_id: currentFolderId,
          plant: plant,
          validity_date: newFiles.map(item => item.validityDate).join(','),
          file_name: newFiles.map(item => item.fileName).join(','),
          part_numbers: customPartNumbers,
        });

        await axios.post(
          `${API_URL}/upload-file/?${queryParams.toString()}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        }

      message.success('Files uploaded successfully');
      setPreviewData([]);
      setUploadedFileList([]);
      setCustomPartNumbers('');
      // Refresh the folder contents
        await fetchFolderData();
      
      } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload files: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleExcelUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      // Extract part numbers from 'Part code' column
      const partNumbers = jsonData
        .map(row => row['Part code'])
        .filter(code => code) // Remove empty/undefined values
        .join(',');
      
      setCustomPartNumbers(partNumbers);
      setExcelPartNumbers(jsonData.map(row => row['Part code']).filter(code => code));
      setShowExcelPreview(true);
    };
    reader.readAsArrayBuffer(file);
    return false; // Prevent default upload behavior
  };

  // Add new function to handle upload without part number modal
  const handleUploadWithoutPart = ({ fileList }) => {
    setUploadedFileList(fileList);
    if (fileList.length > 0) {
      setCurrentFileIndex(0);
      setFileDetails(prev => ({
        ...prev,
        [fileList[0].uid]: {
          fileName: fileList[0].name,
          validityDate: null
        }
      }));
    }
  };

  const handleFileNameChange = (uid, value) => {
    setFileDetails(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        fileName: value
      }
    }));
  };

  const handleValidityDateChange = (uid, date) => {
    setFileDetails(prev => ({
      ...prev,
      [uid]: {
        ...prev[uid],
        validityDate: date
      }
    }));
  };

  const handleConfirmUploadWithoutPart = async () => {
    try {
      // Validate required data
      if (!currentFolderId) {
        message.error('No folder selected');
        return;
      }

      // Validate that all files have required details
      const isValid = uploadedFileList.every(file => 
        fileDetails[file.uid]?.fileName && fileDetails[file.uid]?.validityDate
      );

      if (!isValid) {
        message.error('Please provide file name and validity date for all files');
      return;
    }

      // Separate existing files and new files
      const existingFiles = uploadedFileList.filter(file => file.isExisting);
      const newFiles = uploadedFileList.filter(file => !file.isExisting);

      // Handle existing files
      if (existingFiles.length > 0) {
        const existingFilesData = {
          folder_id: currentFolderId,
          plant: plant,
          part_numbers: '',
          validity_date: fileDetails[existingFiles[0].uid].validityDate.format('YYYY-MM-DD'),
          files: existingFiles.map(file => ({
            file_name: fileDetails[file.uid].fileName,
            file_path: file.url
          }))
        };

        await axios.post(`${API_URL}/associate-existing-files/`, existingFilesData);
      }

      // Handle new files
      if (newFiles.length > 0) {
        const formData = new FormData();
        
        // Add new files to FormData
        newFiles.forEach(file => {
          formData.append('files', file.originFileObj);
        });

        // Add other data as query parameters
        const queryParams = new URLSearchParams({
          folder_id: currentFolderId,
          plant: plant,
          validity_date: newFiles.map(file => 
            fileDetails[file.uid].validityDate.format('YYYY-MM-DD')
          ).join(','),
          file_name: newFiles.map(file => 
            fileDetails[file.uid].fileName
          ).join(','),
          part_numbers: ''
        });

        await axios.post(
          `${API_URL}/upload-file/?${queryParams.toString()}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      }

      message.success('Files uploaded successfully');
      setUploadedFileList([]);
      setFileDetails({});
      setCurrentFileIndex(0);
      setIsUploadWithoutPartModalOpen(false);
      setIsPreviewModalOpen(false);
      // Refresh the folder contents
      await fetchFolderData();
    } catch (error) {
      console.error('Upload error:', error);
      message.error('Failed to upload files: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleFileClick = (item) => {
    const fileDetails = {
      title: item.title,
      fileUrl: item.fileUrl,
      fileType: item.fileUrl?.split('.').pop().toLowerCase(),
      part_numbers: item.part_numbers,
      validity_date: item.validity_date
    };
    
    // Update the selected file details in the card
    setSelectedFolderFiles([fileDetails]);
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex gap-6">
          <Card className="w-1/2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-4">File Explorer</h1>
              
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
                    icon={<AppstoreOutlined />}
                    type={viewMode === 'grid' ? 'primary' : 'default'}
                    onClick={() => setViewMode('grid')}
                  />
                </Space>
              </div>

              <div className="flex flex-col gap-4 mb-4">
  {/* Search, Sort, and Filter Row */}
  <div className="flex flex-wrap items-center gap-4">
    <Input
      placeholder="Search files and folders..."
      prefix={<SearchOutlined />}
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      className="w-44"
      allowClear
    />
    <Select
      placeholder="Sort by"
      value={sortField}
      onChange={setSortField}
      className="w-32"
    >
      <Option value="title">Name</Option>
      <Option value="type">Type</Option>
      <Option value="modified">Modified</Option>
    </Select>
    <Button
      icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
      onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
    />
    <Select
      placeholder="Filter by type"
      className="w-32"
      allowClear
      onChange={(value) => setFileTypeFilter(value)}
    >
      <Option value="all">All Types</Option>
      <Option value="folder">Folders</Option>
      <Option value="pdf">PDF</Option>
      <Option value="image">Images</Option>
    </Select>
  </div>

  {/* Buttons Row */}
  <div className="flex flex-wrap gap-2">
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() => openModal(true)}
    >
      New Folder
    </Button>
    <Button
      type="primary"
      onClick={() => setIsUploadModalOpen(true)}
      disabled={!currentPath.length}
      icon={<UploadOutlined />}
    >
      Upload Files
    </Button>
    <Button
      type="default"
      onClick={() => setIsUploadWithoutPartModalOpen(true)}
      disabled={!currentPath.length}
      icon={<UploadOutlined />}
    >
      Upload Without Part
    </Button>
  </div>
</div>


              {/* Folder content view */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentItems
                    .filter(item => {
                      // Apply search filter
                      const matchesSearch = item.title.toString().toLowerCase().includes(searchText.toLowerCase());
                      
                      // Apply type filter
                      if (fileTypeFilter === 'all' || !fileTypeFilter) return matchesSearch;
                      if (fileTypeFilter === 'folder') return item.isFolder && matchesSearch;
                      if (fileTypeFilter === 'pdf') return !item.isFolder && item.fileUrl?.toLowerCase().endsWith('.pdf') && matchesSearch;
                      if (fileTypeFilter === 'image') {
                        const ext = item.fileUrl?.toLowerCase().split('.').pop();
                        return !item.isFolder && ['jpg', 'jpeg', 'png', 'gif'].includes(ext) && matchesSearch;
                      }
                      return matchesSearch;
                    })
                    .sort((a, b) => {
                      // Always show folders first
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
                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex flex-col items-center text-center"
                        onClick={() => item.isFolder ? handleFolderClick(item) : handleFileClick(item)}
                      >
                        {item.isFolder ? (
                          <FolderFilled style={{ fontSize: '24px', color: '#ffd700' }} />
                        ) : getFileIcon(item.fileUrl)}
                        <span className="mt-2 text-sm truncate w-full">{item.title}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <Table
                  columns={fileListColumns}
                  dataSource={currentItems
                    .filter(item => {
                      // Apply search filter
                      const matchesSearch = item.title.toString().toLowerCase().includes(searchText.toLowerCase());
                      
                      // Apply type filter
                      if (fileTypeFilter === 'all' || !fileTypeFilter) return matchesSearch;
                      if (fileTypeFilter === 'folder') return item.isFolder && matchesSearch;
                      if (fileTypeFilter === 'pdf') return !item.isFolder && item.fileUrl?.toLowerCase().endsWith('.pdf') && matchesSearch;
                      if (fileTypeFilter === 'image') {
                        const ext = item.fileUrl?.toLowerCase().split('.').pop();
                        return !item.isFolder && ['jpg', 'jpeg', 'png', 'gif'].includes(ext) && matchesSearch;
                      }
                      return matchesSearch;
                    })
                  }
                  onChange={(pagination, filters, sorter) => {
                    setSortField(sorter.field || 'title');
                    setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
                  }}
                  pagination={false}
                  onRow={(record) => ({
                    onClick: () => !record.isFolder && handleFileClick(record),
                  })}
                />
              )}
            </div>
          </Card>

          <Card className="w-1/2">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">File Details</h2>
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

        {/* Folder creation modal */}
          <Modal
          title="Create New Folder"
          visible={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
            footer={null}
          >
            <Form 
              form={form} 
              layout="vertical"
            name="folder_form"
            onFinish={handleSubmit}
          >
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
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Create Folder
              </Button>
                  </Form.Item>
          </Form>
        </Modal>

        {/* Preview table */}
        {previewData.length > 0 && (
          <Card className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Upload Preview</h2>
              <Button
                type="primary"
                onClick={handleConfirmUpload}
                icon={<UploadOutlined />}
              >
                Confirm Upload
              </Button>
            </div>
            <Table
              columns={[
                {
                  title: 'File Name',
                  dataIndex: 'fileName',
                  key: 'fileName',
                },
                {
                  title: 'Part Numbers',
                  dataIndex: 'partNumbers',
                  key: 'partNumbers',
                  render: (partNumbers) => partNumbers ? partNumbers.join(', ') : '-'
                },
                {
                  title: 'Validity Date',
                  dataIndex: 'validityDate',
                  key: 'validityDate',
                  render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-'
                },
              ]}
              dataSource={previewData}
              pagination={false}
            />
          </Card>
        )}

        {/* Upload Modal */}
        <Modal
          title="Upload Files"
          visible={isUploadModalOpen}
          onCancel={() => {
            setIsUploadModalOpen(false);
            setUploadedFileList([]);
            setCustomPartNumbers('');
          }}
          footer={null}
          width={800}
        >
          <Form layout="vertical">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Part Numbers (comma-separated)
              </label>
              <Input.TextArea
                value={customPartNumbers}
                onChange={(e) => setCustomPartNumbers(e.target.value)}
                placeholder="Enter part numbers separated by commas"
                className="mb-2"
              />
              <Upload
                accept=".xlsx,.xls"
                beforeUpload={handleExcelUpload}
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />} className="w-full">
                  Upload Excel File
                </Button>
              </Upload>
            </div>

            {showExcelPreview && excelPartNumbers.length > 0 && (
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Extracted Part Numbers</h4>
                    <Button 
                      type="text" 
                      icon={<CloseOutlined />} 
                      onClick={() => {
                        setShowExcelPreview(false);
                        setExcelPartNumbers([]);
                      }}
                    />
                  </div>
                  <List
                    size="small"
                    bordered
                    dataSource={excelPartNumbers}
                    renderItem={item => (
                      <List.Item>
                        <Typography.Text>{item}</Typography.Text>
                      </List.Item>
                    )}
                    style={{ maxHeight: '200px', overflow: 'auto' }}
                  />
                </div>
              </div>
            )}

            <Form.Item label="Upload Files">
              <div className="space-y-4">
                <Upload.Dragger
                  multiple
                  fileList={uploadedFileList}
                  beforeUpload={() => false}
                  onChange={({ fileList }) => setUploadedFileList(fileList)}
                  accept=".pdf,.jpg,.jpeg,.png"
                  showUploadList={false}
                >
                  <p className="ant-upload-drag-icon">
                    <UploadOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag files to upload</p>
                  <p className="ant-upload-hint">
                    Support for multiple files. Only PDF, JPEG, and PNG files.
                  </p>
                </Upload.Dragger>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Select Existing Files
                  </label>
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                    placeholder="Select existing files"
                    onChange={(values) => {
                      const selectedFiles = existingFiles
                        .filter(file => values.includes(file.id))
                        .map(file => ({
                          uid: `existing-${file.id}`,
                          name: file.file_name,
                          status: 'done',
                          url: file.file_path,
                          isExisting: true,
                          originFileObj: null
                        }));
                      setUploadedFileList(prev => {
                        const nonExistingFiles = prev.filter(f => !f.isExisting);
                        return [...nonExistingFiles, ...selectedFiles];
                      });
                    }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {existingFiles.map(file => (
                      <Option key={file.id} value={file.id}>
                        {file.file_name}
                        </Option>
                      ))}
                    </Select>
                </div>
              </div>
                  </Form.Item>
  
            {/* File Details List */}
            {uploadedFileList.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-4">File Details</h3>
                <div className="space-y-4">
                  {uploadedFileList.map((file, index) => (
                    <Card key={file.uid} className="bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <FileOutlined className="text-blue-500 mr-2" />
                          <span className="font-medium">{file.name}</span>
                        </div>
                        <Button
                          type="text"
                          icon={<CloseOutlined />}
                          onClick={() => {
                            const newFileList = uploadedFileList.filter((_, i) => i !== index);
                            setUploadedFileList(newFileList);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <Form.Item
                          label="File Name"
                          required
                          validateStatus={file.fileName ? 'success' : 'error'}
                          help={!file.fileName && 'Please enter file name'}
                      >
                        <Input 
                            placeholder="Enter file name"
                            value={file.fileName}
                            onChange={(e) => {
                              const newFileList = [...uploadedFileList];
                              newFileList[index] = {
                                ...file,
                                fileName: e.target.value
                              };
                              setUploadedFileList(newFileList);
                            }}
                        />
                      </Form.Item>
                  <Form.Item 
                          label="Validity Date"
                    required
                          validateStatus={file.validityDate ? 'success' : 'error'}
                          help={!file.validityDate && 'Please select validity date'}
                        >
                          <DatePicker
                            style={{ width: '100%' }}
                            value={file.validityDate ? moment(file.validityDate) : null}
                            onChange={(date) => {
                              const newFileList = [...uploadedFileList];
                              newFileList[index] = {
                                ...file,
                                validityDate: date ? date.format('YYYY-MM-DD') : null
                              };
                              setUploadedFileList(newFileList);
                            }}
                            disabledDate={(current) => current && current < moment().startOf('day')}
                          />
                  </Form.Item>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Form.Item className="mt-4">
              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    // Validate all files have name and validity date
                    const isValid = uploadedFileList.every(file => 
                      file.fileName && file.validityDate
                    );

                    if (!isValid) {
                      message.error('Please fill in all required fields for each file');
                      return;
                    }

                    if (uploadedFileList.length === 0) {
                      message.error('Please select files to upload');
                      return;
                    }

                    // Create preview data directly from the file list
                    const partNumbersList = customPartNumbers
                      .split(',')
                      .map(pn => pn.trim())
                      .filter(Boolean);

                    setPreviewData(
                      uploadedFileList.map((file) => ({
                        key: file.uid,
                        fileName: file.fileName,
                        partNumbers: partNumbersList,
                        validityDate: file.validityDate,
                        file: file,
                      }))
                    );
                    setIsUploadModalOpen(false);
                  }}
                >
                  Preview
                </Button>
                <Button
                  onClick={() => {
                    setUploadedFileList([]);
                    setCustomPartNumbers('');
                  }}
                >
                  Clear All
                </Button>
              </Space>
              </Form.Item>
            </Form>
          </Modal>

        {/* Upload Without Part Number Modal */}
        <Modal
          title="Upload Files Without Part Number"
          open={isUploadWithoutPartModalOpen}
          onCancel={() => setIsUploadWithoutPartModalOpen(false)}
          footer={null}
          width={800}
        >
          <div className="space-y-4">
            <Upload.Dragger
              multiple
              fileList={uploadedFileList}
              onChange={handleUploadWithoutPart}
              beforeUpload={() => false}
              accept=".pdf,.jpg,.jpeg,.png"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to upload</p>
              <p className="ant-upload-hint">Support for PDF, JPG, JPEG, PNG</p>
            </Upload.Dragger>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Select Existing Files
              </label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select existing files"
                onChange={(values) => {
                  const selectedFiles = existingFiles
                    .filter(file => values.includes(file.id))
                    .map(file => ({
                      uid: `existing-${file.id}`,
                      name: file.file_name,
                      status: 'done',
                      url: file.file_path,
                      isExisting: true,
                      originFileObj: null
                    }));
                  setUploadedFileList(prev => {
                    const nonExistingFiles = prev.filter(f => !f.isExisting);
                    return [...nonExistingFiles, ...selectedFiles];
                  });
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {existingFiles.map(file => (
                  <Option key={file.id} value={file.id}>
                    {file.file_name}
                  </Option>
                ))}
              </Select>
        </div>
  
            {uploadedFileList.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span>Current File: {uploadedFileList[currentFileIndex]?.name}</span>
                  <div className="space-x-2">
              <Button 
                      onClick={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentFileIndex === 0}
              >
                      Previous
              </Button>
                    <Button
                      onClick={() => setCurrentFileIndex(prev => Math.min(uploadedFileList.length - 1, prev + 1))}
                      disabled={currentFileIndex === uploadedFileList.length - 1}
                    >
                      Next
                    </Button>
          </div>
                </div>

                <Form layout="vertical">
                  <Form.Item label="File Name" required>
                    <Input
                      value={fileDetails[uploadedFileList[currentFileIndex]?.uid]?.fileName || ''}
                      onChange={(e) => handleFileNameChange(uploadedFileList[currentFileIndex]?.uid, e.target.value)}
                    />
                  </Form.Item>
                  <Form.Item label="Validity Date" required>
                    <DatePicker
                      value={fileDetails[uploadedFileList[currentFileIndex]?.uid]?.validityDate}
                      onChange={(date) => handleValidityDateChange(uploadedFileList[currentFileIndex]?.uid, date)}
                      disabledDate={(current) => current && current < moment().endOf('day')}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Form>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button onClick={() => {
                    setUploadedFileList([]);
                    setFileDetails({});
                    setCurrentFileIndex(0);
                  }}>
                    Clear All
                  </Button>
                  <Button type="primary" onClick={() => {
                    // Validate all files have required details
                    const isValid = uploadedFileList.every(file => 
                      fileDetails[file.uid]?.fileName && fileDetails[file.uid]?.validityDate
                    );

                    if (!isValid) {
                      message.error('Please provide file name and validity date for all files');
                      return;
                    }

                    handleConfirmUploadWithoutPart();
                  }}>
                    Upload
                  </Button>
      </div>
    </div>
            )}
          </div>
        </Modal>

        {/* File Details Modal */}
        <Modal
          title={`Enter File Details (${currentFileDetails?.fileIndex + 1}/${currentFileDetails?.files.length})`}
          visible={fileDetailsModalVisible}
          onCancel={() => {
            setFileDetailsModalVisible(false);
            setCurrentFileDetails(null);
            fileDetailsForm.resetFields();
          }}
          footer={null}
        >
          {currentFileDetails && (
            <Form
              form={fileDetailsForm}
              layout="vertical"
              onFinish={(values) => {
                const newDetails = [...currentFileDetails.details];
                newDetails[currentFileDetails.fileIndex] = {
                  fileName: values.fileName,
                  validityDate: values.validityDate.format('YYYY-MM-DD'),
                  originalFile: currentFileDetails.files[currentFileDetails.fileIndex],
                };

                if (currentFileDetails.fileIndex === currentFileDetails.files.length - 1) {
                  // All files processed, show preview
                  const partNumbersList = customPartNumbers
                    .split(',')
                    .map(pn => pn.trim())
                    .filter(Boolean);

                  setPreviewData(
                    newDetails.map((detail) => ({
                      key: detail.originalFile.uid,
                      fileName: detail.fileName,
                      partNumbers: partNumbersList,
                      validityDate: detail.validityDate,
                      file: detail.originalFile,
                    }))
                  );
                  setFileDetailsModalVisible(false);
                  setCurrentFileDetails(null);
                  fileDetailsForm.resetFields();
                } else {
                  // Move to next file
                  setCurrentFileDetails({
                    ...currentFileDetails,
                    fileIndex: currentFileDetails.fileIndex + 1,
                    details: newDetails,
                  });
                  fileDetailsForm.resetFields();
                }
              }}
            >
              <div className="mb-4">
                <p className="text-gray-600">Current File: {currentFileDetails.files[currentFileDetails.fileIndex].name}</p>
              </div>
              <Form.Item
                name="fileName"
                label="File Name"
                rules={[{ required: true, message: 'Please enter file name' }]}
              >
                <Input placeholder="Enter file name" />
              </Form.Item>
              <Form.Item 
                name="validityDate"
                label="Validity Date"
                rules={[{ required: true, message: 'Please select validity date' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {currentFileDetails.fileIndex === currentFileDetails.files.length - 1 ? 'Preview' : 'Next File'}
                  </Button>
                  {currentFileDetails.fileIndex > 0 && (
                    <Button
                      onClick={() => {
                        setCurrentFileDetails({
                          ...currentFileDetails,
                          fileIndex: currentFileDetails.fileIndex - 1,
                        });
                        fileDetailsForm.resetFields();
                      }}
                    >
                      Previous File
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          )}
        </Modal>

        <FileDetails
          file={fileDetails}
          visible={isFileDetailsVisible}
          onClose={() => setIsFileDetailsVisible(false)}
        />
      </div>
    </>
    );
  };
  
  export default EnhancedDocumentUpload;