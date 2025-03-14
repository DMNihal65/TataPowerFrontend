import React, { useEffect, useState } from 'react';
import { Input, Table, Button, Switch, Card, Typography, Row, Col, Space, Select, Upload } from 'antd';
import {  Modal, Form, Input as AntInput, DatePicker, Checkbox, message } from 'antd';
import { EditOutlined, DeleteOutlined, FilterOutlined, SortAscendingOutlined, UploadOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import moment from 'moment';
import * as XLSX from 'xlsx';
import { useParams } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const PartNumberManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partNumbers, setPartNumbers] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('part_number');
  const [filteredPartNumbers, setFilteredPartNumbers] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPartNumber, setEditingPartNumber] = useState(null);

  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [selectedPlant, setSelectedPlant] = useState('');

  const {plant} = useParams();

  useEffect(() => {
    const fetchPartNumbers = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:7001/getallpartnumbers/',{
          params:{
            plant:plant
          }
        });
        setPartNumbers(response.data);
      } catch (error) {
        console.error('Failed to fetch part numbers:', error);
      }
    };

    fetchPartNumbers();
  }, []);

  useEffect(() => {
    // Apply filtering and sorting whenever the dependencies change
    const filtered = getFilteredAndSortedPartNumbers(partNumbers, filterType, sortType, searchTerm);
    setFilteredPartNumbers(filtered);
  }, [partNumbers, filterType, sortType, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const getFilteredAndSortedPartNumbers = (parts, filter, sort, search) => {
    let filtered = [...parts];
    const currentDate = new Date();

    // Apply search filter
    if (search) {
      filtered = filtered.filter(part =>
        part.part_number.toLowerCase().includes(search.toLowerCase()) ||
        (part.description && part.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Apply status filter
    switch (filter) {
      case 'active':
        filtered = filtered.filter(part => part.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(part => !part.is_active);
        break;
      case 'expiring_soon':
        filtered = filtered.filter(part => {
          if (!part.inactive_date) return false;
          const inactiveDate = new Date(part.inactive_date);
          const daysUntilExpiry = Math.ceil((inactiveDate - currentDate) / (1000 * 60 * 60 * 24));
          return daysUntilExpiry >= 0 && daysUntilExpiry <= 15;
        });
        break;
      case 'expired':
        filtered = filtered.filter(part => {
          if (!part.inactive_date) return false;
          const inactiveDate = new Date(part.inactive_date);
          return inactiveDate < currentDate;
        });
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sort) {
      case 'part_number':
        filtered.sort((a, b) => a.part_number.localeCompare(b.part_number));
        break;
      case 'description':
        filtered.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
        break;
      case 'created_date':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'inactive_date':
        filtered.sort((a, b) => {
          if (!a.inactive_date) return 1;
          if (!b.inactive_date) return -1;
          return new Date(a.inactive_date) - new Date(b.inactive_date);
        });
        break;
      default:
        break;
    }

    return filtered;
  };

  const toggleStatus = (id) => {
    setPartNumbers(partNumbers.map(part =>
      part.id === id ? { ...part, is_active: !part.is_active } : part
    ));
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "null" || new Date(dateString).getTime() === 0) {
      return '-';
    }
    return new Date(dateString).toLocaleDateString();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        form.resetFields();
        const partNumberData = {
          part_number: values.part_number,
          description: values.description,
          is_active: values.is_active,
          inactive_date: values.inactive_date ? Math.floor(new Date(values.inactive_date).getTime() / 1000) : null,
          plant: plant
        };

        setLoading(true);
        axios.post('http://127.0.0.1:7001/createpartnumbers/', partNumberData)
          .then(response => {
            message.success('Part number created successfully!');
            setIsModalVisible(false);
            // Optionally, you can update the partNumbers state with the new part number
          })
          .catch(error => {
            message.error('Failed to create part number.');
            console.error('Error creating part number:', error);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleEdit = (record) => {
    setEditingPartNumber(record);
    form.setFieldsValue({
      part_number: record.part_number,
      description: record.description,
      is_active: record.is_active,
      inactive_date: record.inactive_date ? moment(record.inactive_date) : null
    });
    setIsEditModalVisible(true);
  };

  const handleDelete = async (partNumber) => {
    try {
      await axios.delete(`http://127.0.0.1:7001/deletepartnumbers/part_number?part_number=${partNumber}?plant=${plant}`);
      message.success('Part number deleted successfully');
      // Refresh the table
      const response = await axios.get('http://127.0.0.1:7001/getallpartnumbers/',{
        params:{
          plant:plant
        }
      });
      setPartNumbers(response.data);
    } catch (error) {
      console.error('Failed to delete part number:', error);
      message.error('Failed to delete part number');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const partNumberData = {
        part_number: values.part_number,
        description: values.description,
        is_active: values.is_active,
        inactive_date: values.inactive_date ? Math.floor(new Date(values.inactive_date).getTime() / 1000) : null,
        plant:plant
      };

      await axios.put(
        `http://127.0.0.1:7001/updatepartnumbers/part_number?part_number=${editingPartNumber.part_number}&plant=${plant}`,
        partNumberData
      );

      message.success('Part number updated successfully');
      setIsEditModalVisible(false);
      
      // Refresh the table
      const response = await axios.get('http://127.0.0.1:7001/getallpartnumbers/',{
        params:{
          plant:plant
        }
      });
      setPartNumbers(response.data);
    } catch (error) {
      console.error('Failed to update part number:', error);
      message.error('Failed to update part number');
    }
  };

  const columns = [
    {
      title: 'Part Number',
      dataIndex: 'part_number',
      key: 'part_number',
      sorter: (a, b) => a.part_number.localeCompare(b.part_number),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'center',
      responsive: ['md'], // Only show this column on medium screens and above
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: isActive => (
        <span style={{ color: isActive ? 'green' : 'red' }}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      title: 'Inactive Date',
      dataIndex: 'inactive_date',
      key: 'inactive_date',
      align: 'center',
      render: (date) => formatDate(date)
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      render: (date) => formatDate(date)
    },
    {
      title: 'Updated At',
      dataIndex: 'updated_at',
      key: 'updated_at',
      align: 'center',
      render: (date) => formatDate(date)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this part number?"
            onConfirm={() => handleDelete(record.part_number)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    }
  ];

  // Add Excel upload handler
  const handleExcelUpload = (file) => {
    if (!file) {
        message.error('Please select a file');
        return false;
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.type !== 'application/vnd.ms-excel') {
        message.error('Please upload an Excel file');
        return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Get the range of cells in the worksheet
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            const transformedData = [];

            // Find column indexes based on headers
            let headers = {};
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
                const cell = worksheet[cellAddress];
                if (cell && cell.v) {
                    headers[cell.v.trim()] = col;
                }
            }

            if (!headers["Part code"] || !headers["Long descriptions"]) {
                message.error('Excel file must contain "Part code" and "Long descriptions" columns');
                return;
            }

            // Iterate through rows to extract data
            for (let row = 1; row <= range.e.r; row++) {
                const partCodeCell = XLSX.utils.encode_cell({ r: row, c: headers["Part code"] });
                const descriptionCell = XLSX.utils.encode_cell({ r: row, c: headers["Long descriptions"] });

                const partCode = worksheet[partCodeCell]?.v?.toString().trim() || "";
                const description = worksheet[descriptionCell]?.v?.toString().trim() || "";

                if (partCode && description) {
                    transformedData.push({
                        part_number: partCode,
                        description: description,
                        is_active: true
                    });
                }
            }

            if (transformedData.length === 0) {
                message.error('No valid part numbers and descriptions found in the Excel file');
                return;
            }

            setExcelData(transformedData);
            message.success(`Successfully read ${transformedData.length} records from Excel`);

        } catch (error) {
            console.error('Error reading Excel file:', error);
            message.error('Error reading Excel file. Please make sure it\'s a valid Excel file');
        }
    };

    reader.onerror = () => {
        message.error('Error reading file');
    };

    reader.readAsBinaryString(file);
    return false;
};


  // Add function to handle bulk upload
  const handleBulkUpload = async () => {
    
    if (excelData.length === 0) {
      message.error('No data to upload');
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:7001/bulk-create-partnumbers/', {
        part_numbers: excelData,
        plant: plant
      });

      if (response.status === 200 || response.status === 201) {
        message.success('Part numbers uploaded successfully');
        setIsExcelModalVisible(false);
        setExcelData([]);
        // Refresh the table
        const getResponse = await axios.get(`http://127.0.0.1:7001/getallpartnumbers/?plant=${plant}`);
        setPartNumbers(getResponse.data);
      }
    } catch (error) {
      console.error('Failed to upload part numbers:', error);
      if (error.response?.data?.detail?.errors) {
        // Show specific error messages from the backend
        error.response.data.detail.errors.forEach(err => {
          message.error(err);
        });
      } else {
        message.error('Failed to upload part numbers');
      }
    }
  };

  // Add Excel preview columns
  const excelPreviewColumns = [
    {
      title: 'Part Number',
      dataIndex: 'part_number',
      key: 'part_number',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    }
  ];

  return (
    <Card className="m-4 sm:m-6 shadow-lg rounded-lg p-0 overflow-hidden">
      <div className="mb-6">
        <Title level={3} className="text-center sm:text-left text-xl sm:text-2xl lg:text-3xl font-semibold">
          Part Number Management
        </Title>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
        <div className="w-full lg:col-span-3">
          <Input
            placeholder="Search part numbers..."
            value={searchTerm}
            onChange={handleSearch}
            allowClear
            className="w-full"
          />
        </div>

        <div className="w-full lg:col-span-3">
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by Status"
            value={filterType}
            onChange={setFilterType}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">All Status</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="expiring_soon">Expiring Soon (15 days)</Option>
            <Option value="expired">Expired</Option>
          </Select>
        </div>

        <div className="w-full lg:col-span-3">
          <Select
            style={{ width: '100%' }}
            placeholder="Sort by"
            value={sortType}
            onChange={setSortType}
            suffixIcon={<SortAscendingOutlined />}
          >
            <Option value="part_number">Part Number</Option>
            <Option value="description">Description</Option>
            <Option value="created_date">Created Date</Option>
            <Option value="inactive_date">Inactive Date</Option>
          </Select>
        </div>

        <div className="w-full lg:col-span-3 flex flex-wrap sm:flex-nowrap gap-2 justify-center sm:justify-end">
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showModal}
            className="flex-1 sm:flex-initial min-w-[120px]"
          >
            Add New
          </Button>
          <Button 
            icon={<UploadOutlined />} 
            onClick={() => setIsExcelModalVisible(true)}
            className="flex-1 sm:flex-initial min-w-[120px]"
          >
            Upload Excel
          </Button>
        </div>
      </div>

      {/* Part Numbers Table */}
      <div className="overflow-x-auto">
        <Table
          dataSource={filteredPartNumbers}
          columns={columns.map(column => ({
            ...column,
            ellipsis: true,
            className: 'whitespace-nowrap',
          }))}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            responsive: true,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`
          }}
          scroll={{ x: 'max-content' }}
          className="min-w-full"
        />
      </div>

      <Modal
        title="Add New Part Number"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading} // Show loading indicator on the submit button
      >
        <Form form={form} layout="vertical" name="part_number_form">
          <Form.Item
            name="part_number"
            label="Part Number"
            rules={[{ required: true, message: 'Please input the part number!' }]}
          >
            <AntInput placeholder="Enter part number" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <AntInput placeholder="Enter description" />
          </Form.Item>
          <Form.Item name="is_active" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item
            name="inactive_date"
            label="Inactive Date"
            rules={[{ required: false, message: 'Please select an inactive date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Part Number"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingPartNumber(null);
          form.resetFields();
        }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" name="edit_part_number_form">
          <Form.Item
            name="part_number"
            label="Part Number"
            rules={[{ required: true, message: 'Please input the part number!' }]}
          >
            <AntInput placeholder="Enter part number" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input the description!' }]}
          >
            <AntInput placeholder="Enter description" />
          </Form.Item>
          <Form.Item name="is_active" valuePropName="checked">
            <Checkbox>Active</Checkbox>
          </Form.Item>
          <Form.Item
            name="inactive_date"
            label="Inactive Date"
            rules={[{ required: false }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Upload Part Numbers from Excel"
        visible={isExcelModalVisible}
        onCancel={() => {
          setIsExcelModalVisible(false);
          setExcelData([]);
          setSelectedPlant('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsExcelModalVisible(false);
            setExcelData([]);
            setSelectedPlant('');
          }}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleBulkUpload}
          >
            Upload Part Numbers
          </Button>
        ]}
        width={800}
      >
        <div className="space-y-4">

          <div className="border-dashed border-2 border-gray-300 p-4 rounded-lg">
            <Upload
              accept=".xlsx,.xls"
              beforeUpload={handleExcelUpload}
              maxCount={1}
              showUploadList={true}
              onRemove={() => {
                setExcelData([]);
                return true;
              }}
            >
              <Button icon={<UploadOutlined />}>Select Excel File</Button>
              <div className="mt-2 text-sm text-gray-500">
                Support for .xlsx or .xls files. File should contain "Part Number" and "Description" columns.
              </div>
            </Upload>
          </div>

          {excelData.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview ({excelData.length} part numbers)</h3>
              <Table
                columns={excelPreviewColumns}
                dataSource={excelData}
                size="small"
                pagination={{ pageSize: 5 }}
                rowKey={(record, index) => index}
                scroll={{ y: 240 }}
              />
            </div>
          )}
        </div>
      </Modal>

      <style jsx global>{`
        .responsive-modal {
          max-width: 95vw !important;
        }
        
        @media (max-width: 640px) {
          .ant-table-cell {
            padding: 8px 4px !important;
          }
          
          .ant-table-thead > tr > th,
          .ant-table-tbody > tr > td {
            white-space: nowrap;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        @media (max-width: 1200px) {
          .ant-btn {
            padding-left: 8px;
            padding-right: 8px;
            font-size: 14px;
          }
        }
      `}</style>
    </Card>
  );
};

export default PartNumberManagement;
