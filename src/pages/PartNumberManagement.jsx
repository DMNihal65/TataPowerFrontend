
import React, { useEffect, useState } from 'react';
import { Input, Table, Button, Switch, Card, Typography, Row, Col } from 'antd';
import {  Modal, Form, Input as AntInput, DatePicker, Checkbox, message } from 'antd';

import { PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles
import axios from 'axios';

const { Title } = Typography;

const PartNumberManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partNumbers, setPartNumbers] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPartNumbers = async () => {
      try {
        const response = await axios.get('http://192.168.137.161:7001/getallpartnumbers/');
        setPartNumbers(response.data);
      } catch (error) {
        console.error('Failed to fetch part numbers:', error);
      }
    };

    fetchPartNumbers();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPartNumbers = partNumbers.filter(part =>
    part.part_number && part.part_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id) => {
    setPartNumbers(partNumbers.map(part =>
      part.id === id ? { ...part, is_active: !part.is_active } : part
    ));
  };

  const formatDate = (dateString) => {
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
        };

        setLoading(true);
        axios.post('http://192.168.137.161:7001/createpartnumbers/', partNumberData)
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
    }
  ];

  return (
    <Card style={{ margin: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' , padding:'0' }}>
      <Title
        level={3}
        className="mb-6 text-center text-2xl sm:text-3xl lg:text-4xl font-semibold"
      >
        Part Number Management
      </Title>
      <Row gutter={[16, 16]} justify="space-between">
        <Col xs={24} sm={16} md={12}>
          <Input
            placeholder="Search part numbers..."
            value={searchTerm}
            onChange={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={8} md={6} className="text-right">
        <Button type="primary" icon={<PlusOutlined />} block onClick={showModal}>
            Add New Part Number
          </Button>
        </Col>
      </Row>
      <Table
        dataSource={filteredPartNumbers}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 5 }}
        scroll={{ x: '100%' }} // Make the table horizontally scrollable on small screens
        className="mt-4 p-0"
      />
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
    </Card>
  );
};

export default PartNumberManagement;
