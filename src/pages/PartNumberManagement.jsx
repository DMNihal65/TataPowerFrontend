import React, { useState } from 'react';
import { Input, Table, Button, Switch, Card, Typography, Row, Col, Modal, Form, Input as AntInput, DatePicker, Checkbox, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // Import Ant Design styles
import axios from 'axios'; // Import Axios for HTTP requests

const { Title } = Typography;

const PartNumberManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partNumbers, setPartNumbers] = useState([
    { id: 1, number: 'PN001', status: 'Active', documentsComplete: true },
    { id: 2, number: 'PN002', status: 'Inactive', documentsComplete: false },
    // Add more mock data as needed
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPartNumbers = partNumbers.filter(part =>
    part.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStatus = (id) => {
    setPartNumbers(partNumbers.map(part =>
      part.id === id ? { ...part, status: part.status === 'Active' ? 'Inactive' : 'Active' } : part
    ));
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
        axios.post('http://172.18.100.54:7000/createpartnumbers/', partNumberData)
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
      dataIndex: 'number',
      key: 'number',
      sorter: (a, b) => a.number.localeCompare(b.number),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
      ],
      onFilter: (value, record) => record.status === value,
      render: status => (
        <span style={{ color: status === 'Active' ? 'green' : 'red' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Documents Complete',
      dataIndex: 'documentsComplete',
      key: 'documentsComplete',
      render: (text, record) => (record.documentsComplete ? 'Yes' : 'No'),
      align: 'center',
      responsive: ['md'], // Only show this column on medium screens and above
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Switch
          checked={record.status === 'Active'}
          onChange={() => toggleStatus(record.id)}
        />
      ),
      align: 'center',
    },
  ];

  return (
    <Card style={{ margin: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Title
        level={3}
        style={{
          marginBottom: '24px',
          textAlign: 'center',
          whiteSpace: 'nowrap', // Prevent text from wrapping
          overflow: 'hidden', // Ensure no overflow on small screens
          textOverflow: 'ellipsis', // Show ellipsis if text is too long
          fontSize: '24px', // Adjust font size for better readability
        }}
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
        <Col xs={24} sm={8} md={6} style={{ textAlign: 'right' }}>
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
        style={{ marginTop: '16px' }}
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