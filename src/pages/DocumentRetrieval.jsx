import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, Card, message, Spin, Modal, Empty, Pagination, Select, Space, Form, Checkbox, AutoComplete, List, Avatar } from 'antd';
import { Download, FileText, Image as ImageIcon, File, Search, X, Eye, ArrowUpDown, FileDown, LayoutGrid, List as ListIcon, Folder } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import ab1 from '../assets/ab1.png'
import tpsLogo from '../assets/tata-power-solar.png'

const API_URL = 'http://127.0.0.1:7001';
const { Meta } = Card;

const DocumentRetrieval = () => {
  const [partNumbers, setPartNumbers] = useState([]);
  const [existingPartNumbers, setExistingPartNumbers] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('fileName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [form] = Form.useForm();
  const [manualPartNumber, setManualPartNumber] = useState('');
  const [autoCompleteOptions, setAutoCompleteOptions] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // New state variables for without part number section
  const [selectedPlant, setSelectedPlant] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderFiles, setFolderFiles] = useState([]);
  const [folderLoading, setFolderLoading] = useState(false);

  const {plant} = useParams();

  const pageSize = 12;

  const sortOptions = [
    { value: 'fileName', label: 'File Name' },
    { value: 'partNumber', label: 'Part Number' },
    { value: 'fileType', label: 'File Type' },
    { value: 'date', label: 'Date' }
  ];

  // Fetch existing part numbers on component mount
  useEffect(() => {
    const fetchExistingPartNumbers = async () => {
      try {
        const response = await axios.get(`${API_URL}/getallpartnumberswithoutplant/`);
        setExistingPartNumbers(response.data);
      } catch (error) {
        console.error('Error fetching part numbers:', error);
        message.error('Failed to fetch existing part numbers');
      }
    };
    fetchExistingPartNumbers();
  }, []);

  const fetchDocuments = async () => {
    if (partNumbers.length === 0) {
      message.warning('Please select at least one part number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/get-fileswithoutplant`, {
        part_numbers: partNumbers,
      }
    );
      const transformedData = Object.entries(response.data).flatMap(
        ([partNumber, files]) =>
          files.map((file) => ({
            partNumber,
            fileName: file.file_name,
            filePath: file.file_path,
            fileType: getFileType(file.file_name),
            selected: false,
          }))
      );
      setDocuments(transformedData);
      message.success('Documents retrieved successfully');
    } catch (error) {
      console.error('Error fetching documents:', error);
      message.error('Failed to fetch documents');
    }
    setLoading(false);
  };

  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'pdf':
        return <FileText size={48} className="text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon size={48} className="text-blue-500" />;
      default:
        return <File size={48} className="text-gray-400" />;
    }
  };

  const handlePartNumberSelect = (values) => {
    setPartNumbers(values.filter(value => 
      existingPartNumbers.some(pn => pn.part_number === value)
    ));
  };

  const handleRangeGenerate = (values) => {
    const { range_start, range_end } = values;
    if (range_start && range_end) {
      const startNum = parseInt(range_start.replace(/\D/g, ''));
      const endNum = parseInt(range_end.replace(/\D/g, ''));
      const prefix = range_start.replace(/[0-9]/g, '');
      const padding = range_start.replace(/\D/g, '').length;
      
      const rangeNumbers = [];
      for (let i = startNum; i <= endNum; i++) {
        rangeNumbers.push(`${prefix}${i.toString().padStart(padding, '0')}`);
      }
      
      // Add range numbers to part numbers without affecting existing part numbers select
      setPartNumbers(prev => [...new Set([...prev, ...rangeNumbers])]);
      
      // Clear the range inputs
      form.setFieldsValue({
        range_start: '',
        range_end: ''
      });
    }
  };

  const filteredDocuments = documents
    .filter(doc => 
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.partNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const compareValue = sortOrder === 'asc' ? 1 : -1;
      return a[sortBy] > b[sortBy] ? compareValue : -compareValue;
    });

  const paginatedDocuments = filteredDocuments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const downloadSelectedFiles = async (selectedFiles) => {
    try {
      const zip = new JSZip();
      
      // Add each file to the zip
      for (const file of selectedFiles) {
        const response = await fetch(file.filePath);
        const blob = await response.blob();
        zip.file(file.fileName, blob);
      }
      
      // Generate and download zip
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "selected_documents.zip");
      
      message.success('Files downloaded successfully');
    } catch (error) {
      console.error('Error downloading files:', error);
      message.error('Failed to download files');
    }
  };

  const handlePartNumberSearch = (searchText) => {
    if (!searchText) {
      setAutoCompleteOptions([]);
      return;
    }

    const filteredOptions = existingPartNumbers
      .map(pn => pn.part_number)
      .filter(pn => 
        pn.toLowerCase().includes(searchText.toLowerCase())
      )
      .map(pn => ({ value: pn, label: pn }));

    setAutoCompleteOptions(filteredOptions);
  };

  const handlePartNumberEnter = (value) => {
    if (value) {
      setPartNumbers(prev => {
        // Check if part number already exists
        if (!prev.includes(value)) {
          return [...prev, value];
        }
        return prev;
      });
      setManualPartNumber(''); // Clear the input
      form.setFieldsValue({ 'manual_part_number': '' }); // Clear the form field
    }
  };

  // New functions for without part number section
  const fetchFolders = async (plantValue) => {
    try {
      const response = await axios.get(`http://localhost:7001/getallfolders/?plant=${plantValue}`);
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
      message.error('Failed to fetch folders');
    }
  };

  const handlePlantChange = (value) => {
    setSelectedPlant(value);
    setSelectedFolder(null);
    setFolderFiles([]);
    fetchFolders(value);
  };

  const handleFolderSelect = (value) => {
    setSelectedFolder(value);
  };

  const fetchFolderFiles = async () => {
    if (!selectedFolder) {
      message.error('Please select a folder first');
      return;
    }

    setFolderLoading(true);
    try {
      const response = await axios.get(`http://localhost:7001/getallfolderswithfilesapproved/?plant=${selectedPlant}`);
      const folderData = response.data;
      
      console.log('API Response:', folderData);
      
      // Find the selected folder's files
      const selectedFolderData = folderData.find(folder => folder.id === selectedFolder);
      console.log('Selected Folder Data:', selectedFolderData);
      
      if (!selectedFolderData || !selectedFolderData.file_name) {
        console.log('No files found in folder:', selectedFolder);
        message.info('No files found in the selected folder');
        return;
      }

      // Transform folder files to match document format
      const transformedFiles = selectedFolderData.file_name.map(file => {
        console.log('Processing file:', file);
        return {
          fileName: file.file_name,
          filePath: file.file_path,
          fileType: getFileType(file.file_name),
          validity_date: file.validity_date || '',
          partNumber: file.part_numbers || '-',
          fromFolder: true,
          selected: false
        };
      });

      console.log('Transformed Files:', transformedFiles);

      // Update the documents array with the new files
      setDocuments(prevDocs => {
        // Remove any previous folder files
        const docsWithoutFolderFiles = prevDocs.filter(doc => !doc.fromFolder);
        // Add the new folder files
        return [...docsWithoutFolderFiles, ...transformedFiles];
      });

      if (transformedFiles.length > 0) {
        message.success(`Retrieved ${transformedFiles.length} files from the selected folder`);
      } else {
        message.info('No files found in the selected folder');
      }
    } catch (error) {
      console.error('Error fetching folder files:', error);
      console.error('Error details:', error.response?.data);
      message.error('Failed to fetch files from the selected folder');
    } finally {
      setFolderLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Banner */}
      <div 
        className="relative bg-cover bg-center h-64 mb-8"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${ab1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-green-800/90" />
        <div className="relative h-full flex flex-col justify-center items-center text-white px-4">
          <img src={tpsLogo} alt="Tata Power Solar" className="h-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4 text-center">Document Management System</h1>
          <p className="text-xl text-center max-w-2xl text-gray-200">
            Access and manage your documents efficiently with our advanced retrieval system
          </p>
        </div>
      </div>

      <div className="p-2 sm:p-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* With Part Number Section */}
          <Card 
            className="flex-1 mb-4 sm:mb-6 shadow-xl rounded-xl border-0 hover:shadow-2xl transition-all duration-300"
            style={{ 
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              borderTop: '4px solid #1E88E5'
            }}
          >
            <Form form={form} layout="vertical">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-blue-200 pb-3 flex items-center gap-2">
                <Search size={24} className="text-blue-600" />
                Search by Part Number
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item label="Select Existing Part Numbers">
                  <Select
                    mode="multiple"
                    placeholder="Select part numbers"
                    value={partNumbers}
                    onChange={handlePartNumberSelect}
                    style={{ width: '100%' }}
                    optionFilterProp="children"
                  >
                    {existingPartNumbers.map(pn => (
                      <Select.Option key={pn.id} value={pn.part_number}>
                        {pn.part_number}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Enter Part Number">
                  <AutoComplete
                    value={manualPartNumber}
                    options={autoCompleteOptions}
                    onSearch={handlePartNumberSearch}
                    onChange={(value) => setManualPartNumber(value)}
                    onSelect={handlePartNumberEnter}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePartNumberEnter(manualPartNumber);
                      }
                    }}
                    placeholder="Type part number and press Enter"
                    style={{ width: '100%' }}
                  />
                </Form.Item>

                <Form.Item label="Generate Range" className="md:col-span-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Space.Compact className="flex-grow">
                      <Form.Item name="range_start" noStyle>
                        <Input placeholder="Start (e.g., PN001)" className="w-full sm:w-40" />
                      </Form.Item>
                      <Input
                        className="w-20 text-center"
                        style={{ borderLeft: 0, borderRight: 0, pointerEvents: 'none' }}
                        placeholder="to"
                        disabled
                      />
                      <Form.Item name="range_end" noStyle>
                        <Input placeholder="End (e.g., PN010)" className="w-full sm:w-40" />
                      </Form.Item>
                    </Space.Compact>
                    <Button 
                      type="primary" 
                      onClick={() => form.validateFields().then(handleRangeGenerate)}
                      className="w-full sm:w-auto"
                    >
                      Add Range
                    </Button>
                  </div>
                </Form.Item>
              </div>

              {/* Preview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                {/* Selected Part Numbers and Files Cards */}
                {partNumbers.length > 0 && (
                  <Card className="h-full" style={{ boxShadow: 'none' }} bordered>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Selected Part Numbers ({partNumbers.length})</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                      {partNumbers.map(pn => (
                        <span 
                          key={pn} 
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                        >
                          {pn}
                          <X 
                            size={14} 
                            className="cursor-pointer hover:text-blue-600"
                            onClick={() => setPartNumbers(prev => prev.filter(p => p !== pn))}
                          />
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {selectedFiles.length > 0 && (
                  <Card className="h-full" style={{ boxShadow: 'none' }} bordered>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                      <h3 className="font-medium text-lg">Selected Files ({selectedFiles.length})</h3>
                      <Button
                        type="primary"
                        icon={<Download size={18} />}
                        onClick={() => downloadSelectedFiles(selectedFiles)}
                        className="w-full sm:w-auto"
                      >
                        Download ZIP
                      </Button>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      <div className="grid grid-cols-1 gap-2">
                        {selectedFiles.map((file, index) => (
                          <div 
                            key={index} 
                            className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <FileDown size={16} className="text-blue-500 flex-shrink-0" />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0">
                                <span className="truncate text-sm font-medium">{file.fileName}</span>
                                <span className="text-xs text-gray-500">({file.partNumber})</span>
                              </div>
                            </div>
                            <Button
                              type="text"
                              icon={<X size={16} />}
                              onClick={() => setSelectedFiles(files => files.filter(f => f.filePath !== file.filePath))}
                              className="flex-shrink-0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              <div className="mt-4 flex justify-center sm:justify-start">
                <Space>
                  <Button 
                    type="primary"
                    onClick={fetchDocuments}
                    icon={<Search size={18} />}
                    loading={loading}
                    className="w-full sm:w-auto"
                  >
                    Retrieve Documents
                  </Button>
                  <Button
                    icon={viewMode === 'grid' ? <ListIcon size={18} /> : <LayoutGrid size={18} />}
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="w-full sm:w-auto"
                  >
                    {viewMode === 'grid' ? 'List View' : 'Grid View'}
                  </Button>
                </Space>
              </div>
            </Form>
          </Card>

          {/* Without Part Number Section */}
          <Card 
            className="flex-1 mb-4 sm:mb-6 shadow-xl rounded-xl border-0 hover:shadow-2xl transition-all duration-300"
            style={{ 
              background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
              borderTop: '4px solid #1E88E5'
            }}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-green-200 pb-3 flex items-center gap-2">
              <Folder size={24} className="text-green-600" />
              Browse by Folder
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Plant</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select plant"
                  value={selectedPlant}
                  onChange={handlePlantChange}
                >
                  <Option value="tps">Tata Power Solar</Option>
                  <Option value="tprel">Tata Power Renewable Energy Limited</Option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Select Folder</label>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select folder"
                  value={selectedFolder}
                  onChange={handleFolderSelect}
                  disabled={!selectedPlant}
                >
                  {folders.map(folder => (
                    <Option key={folder.id} value={folder.id}>
                      {folder.name}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  type="primary"
                  onClick={fetchFolderFiles}
                  loading={folderLoading}
                  disabled={!selectedFolder}
                  icon={<Search size={18} />}
                  className="w-full"
                >
                  Retrieve Documents
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <Card 
          className="shadow-xl rounded-xl border-0 mt-6 hover:shadow-2xl transition-all duration-300"
          style={{ 
            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
            borderTop: '4px solid #1E88E5'
          }}
        >
          <div className="mb-6 border-b border-purple-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FileText size={24} className="text-600" />
              Retrieved Documents
            </h2>
          </div>
          
          {/* Search and Sort Controls */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white/50 p-4 rounded-lg">
            <div className="w-full sm:w-auto">
              <Input
                placeholder="Search files..."
                prefix={<Search size={18} className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border-gray-200 hover:border-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <Select
                className="w-full sm:w-32 rounded-lg"
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sort by"
              >
                {sortOptions.map(option => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
              <Button
                icon={<ArrowUpDown size={18} />}
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {sortOrder.toUpperCase()}
              </Button>
            </div>
          </div>

          {/* Grid/List View Content */}
          <div className="bg-white/50 rounded-lg p-4">
            {(loading || folderLoading) ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : documents.length === 0 ? (
              <Empty description="No documents found" />
            ) : viewMode === 'grid' ? (
              // Grid View
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedDocuments.map((doc, index) => (
                    <Card
                      key={`${doc.partNumber}-${doc.fileName}-${index}`}
                      hoverable
                      className={`relative border ${
                        selectedFiles.some(f => f.filePath === doc.filePath) ? 'border-blue-500 border-2' : 'border-gray-200'
                      } shadow-md hover:shadow-lg transition-all`}
                      bodyStyle={{ padding: '12px', cursor: 'default' }}
                      cover={
                        <div className="h-32 sm:h-40 flex items-center justify-center bg-gray-50 overflow-hidden">
                          {doc.fileType === 'pdf' ? (
                            <div className="relative w-full h-full">
                              <iframe
                                src={`${doc.filePath}#view=Fit`}
                                className="w-full h-full preview-iframe"
                                style={{ border: 'none' }}
                                title={doc.fileName}
                              />
                              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white pointer-events-none" />
                            </div>
                          ) : ['jpg', 'jpeg', 'png'].includes(doc.fileType) ? (
                            <img
                              src={doc.filePath}
                              alt={doc.fileName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'path/to/fallback/image.png';
                              }}
                            />
                          ) : (
                            <File size={48} className="text-gray-400" />
                          )}
                        </div>
                      }
                      actions={[
                        <div className="flex justify-center">
                          <Checkbox
                            checked={selectedFiles.some(f => f.filePath === doc.filePath)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedFiles([...selectedFiles, doc]);
                              } else {
                                setSelectedFiles(selectedFiles.filter(f => f.filePath !== doc.filePath));
                              }
                            }}
                          >
                            Select
                          </Checkbox>
                        </div>,
                        <Button
                          type="primary"
                          className="bg-green-500 hover:bg-green-600 border-none w-full sm:w-auto flex items-center justify-center gap-2"
                          icon={<Eye size={18} />}
                          onClick={() => {
                            setSelectedDocument(doc);
                            setIsModalVisible(true);
                          }}
                        >
                          View
                        </Button>
                      ]}
                    >
                      <Meta
                        title={<div className="truncate text-sm sm:text-base font-medium">{doc.fileName}</div>}
                        description={
                          <div className="text-xs sm:text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">PN:</span> {doc.partNumber}
                            </div>
                            {doc.validity_date && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Validity:</span>{' '}
                                {new Date(doc.validity_date).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Type:</span> {doc.fileType.toUpperCase()}
                            </div>
                            {doc.fromFolder && (
                              <div className="mt-1">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  From Folder
                                </span>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Pagination
                    current={currentPage}
                    total={filteredDocuments.length}
                    pageSize={pageSize}
                    onChange={setCurrentPage}
                    showSizeChanger={false}
                    size="small"
                    className="text-sm"
                    responsive
                  />
                </div>
              </>
            ) : (
              // List View
              <List
                dataSource={paginatedDocuments}
                renderItem={(doc) => (
                  <List.Item
                    className={`border rounded-lg mb-2 hover:bg-gray-50 transition-colors ${
                      selectedFiles.some(f => f.filePath === doc.filePath) ? 'border-blue-500 border-2' : 'border-gray-200'
                    }`}
                    actions={[
                      <Checkbox
                        checked={selectedFiles.some(f => f.filePath === doc.filePath)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles([...selectedFiles, doc]);
                          } else {
                            setSelectedFiles(selectedFiles.filter(f => f.filePath !== doc.filePath));
                          }
                        }}
                      >
                        Select
                      </Checkbox>,
                      <Button
                        type="primary"
                        icon={<Eye size={18} />}
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsModalVisible(true);
                        }}
                      >
                        View
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={getFileIcon(doc.fileType)} style={{ backgroundColor: 'transparent' }} />
                      }
                      title={<div className="font-medium">{doc.fileName}</div>}
                      description={
                        <div className="text-sm text-gray-500">
                          <div>Part Number: {doc.partNumber}</div>
                          <div>Type: {doc.fileType.toUpperCase()}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                pagination={{
                  current: currentPage,
                  total: filteredDocuments.length,
                  pageSize: pageSize,
                  onChange: setCurrentPage,
                  showSizeChanger: false,
                  size: "small",
                  className: "mt-4"
                }}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        className="rounded-xl overflow-hidden"
        style={{ maxWidth: '1200px' }}
        bodyStyle={{ padding: '0' }}
        centered
      >
        {selectedDocument && (
          <div className="flex flex-col lg:flex-row h-[90vh]">
            <div className="lg:w-1/4 p-6 bg-gray-50 lg:border-r lg:border-gray-200 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{selectedDocument.fileName}</h2>
              <p><strong>Part Number:</strong> {selectedDocument.partNumber}</p>
              <p><strong>Version:</strong> {selectedDocument.version}</p>
              <p><strong>Upload Date:</strong> {selectedDocument.uploadDate}</p>
              {selectedDocument.validity_date && (
                <p><strong>Validity Date:</strong> {new Date(selectedDocument.validity_date).toLocaleDateString()}</p>
              )}
              <div className="mt-4 space-y-2">
                <Button
                  type="primary"
                  icon={<Download size={18} />}
                  onClick={() => {
                    window.open(selectedDocument.filePath, '_blank');
                  }}
                  block
                >
                  Download
                </Button>
                <Button
                  onClick={() => {
                    const isSelected = selectedFiles.some(f => f.filePath === selectedDocument.filePath);
                    if (isSelected) {
                      setSelectedFiles(files => files.filter(f => f.filePath !== selectedDocument.filePath));
                    } else {
                      setSelectedFiles([...selectedFiles, selectedDocument]);
                    }
                  }}
                  block
                >
                  {selectedFiles.some(f => f.filePath === selectedDocument.filePath) 
                    ? 'Remove from Selection' 
                    : 'Add to Selection'
                  }
                </Button>
              </div>
            </div>
            <div className="lg:w-3/4 h-full bg-gray-100">
              <div className="h-full relative">
                {selectedDocument.fileType === 'pdf' ? (
                  <iframe
                    src={selectedDocument.filePath}
                    className="w-full h-full absolute inset-0 modal-iframe"
                    style={{ border: 'none' }}
                    title="Document Preview"
                  />
                ) : ['jpg', 'jpeg', 'png'].includes(selectedDocument.fileType) ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <img
                      src={selectedDocument.filePath}
                      alt={selectedDocument.fileName}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <File size={64} className="text-gray-400 mb-2" />
                      <p>Preview not available for this file type</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .preview-iframe {
          pointer-events: none;
        }
        .modal-iframe {
          pointer-events: auto;
        }
        .ant-select-selection-item {
          background-color: #e5e7eb !important;
          border-radius: 0.375rem !important;
        }
        .ant-select-selection-item-remove {
          color: #4b5563 !important;
        }
        .ant-pagination-item-active {
          border-color: #2563eb !important;
          background: #2563eb !important;
        }
        .ant-pagination-item-active a {
          color: white !important;
        }
        .ant-card {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
        }
        .ant-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default DocumentRetrieval;