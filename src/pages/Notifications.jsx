import React, { useState, useEffect } from 'react';
import { Layout, Typography, Select, Input, List, Button, Card, Space, Drawer, Badge, Tooltip, message, Checkbox } from 'antd';
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  Trash,
  Download,
  FileDown
} from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const {plant} = useParams();

  const fetchExpiringDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://127.0.0.1:7001/expiring-documents?plant=${plant}`);
      const documents = response.data;
      
      const currentDate = new Date();
      const notificationsList = [];

      documents.forEach(doc => {
        if (doc.inactive_date) {
          const inactiveDate = new Date(doc.inactive_date);
          const daysUntilExpiry = Math.ceil((inactiveDate - currentDate) / (1000 * 60 * 60 * 24));
          
          // Create notifications for all documents with inactive dates
          notificationsList.push({
            id: doc.id,
            type: 'certificate_expiring',
            message: daysUntilExpiry > 0 
              ? `Document ${doc.file_name} (${doc.part_number}) will expire in ${daysUntilExpiry} days`
              : `Document ${doc.file_name} (${doc.part_number}) has expired ${Math.abs(daysUntilExpiry)} days ago`,
            date: doc.updated_at,
            read: false,
            daysRemaining: daysUntilExpiry,
            fileName: doc.file_name,
            partNumber: doc.part_number,
            inactiveDate: doc.inactive_date
          });
        }
      });

      // Sort notifications by days remaining
      const sortedNotifications = notificationsList.sort((a, b) => a.daysRemaining - b.daysRemaining);
      setNotifications(sortedNotifications);
      
      // Show a message if there are expiring documents
      const expiringCount = sortedNotifications.filter(n => n.daysRemaining <= 15 && n.daysRemaining > 0).length;
      if (expiringCount > 0) {
        message.warning(`You have ${expiringCount} document(s) expiring soon!`);
      }

    } catch (error) {
      console.error('Error fetching expiring documents:', error);
      message.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringDocuments();
    // Refresh notifications every hour
    const interval = setInterval(fetchExpiringDocuments, 3600000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    ));
    message.success({
      content: 'Notification marked as read',
      icon: <CheckCircle size={20} color="black" style={{ marginRight: 8 }} />,
    });
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
    message.success({
      content: 'Notification deleted',
      icon: <Trash size={20} color="black" style={{ marginRight: 8 }} />,
    });
  };

  const handleSelectFile = (notification) => {
    const isSelected = selectedFiles.some(file => file.id === notification.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(file => file.id !== notification.id));
    } else {
      setSelectedFiles([...selectedFiles, {
        id: notification.id,
        fileName: notification.fileName,
        filePath: notification.filePath,
        partNumber: notification.partNumber
      }]);
    }
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      const allFiles = filteredAndSortedNotifications.map(notification => ({
        id: notification.id,
        fileName: notification.fileName,
        filePath: notification.filePath,
        partNumber: notification.partNumber
      }));
      setSelectedFiles(allFiles);
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDownloadZip = async () => {
    if (selectedFiles.length === 0) {
      message.warning('Please select files to download');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:7001/documents/download-zip', {
        files: selectedFiles.map(file => ({
          file_path: file.filePath,
          file_name: file.fileName
        }))
      }, {
        responseType: 'blob'
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'documents.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success('Files downloaded successfully');
    } catch (error) {
      console.error('Error downloading files:', error);
      message.error('Failed to download files');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.read;
      if (filter === 'expired') return notification.daysRemaining <= 0;
      if (filter === 'not_expired') return notification.daysRemaining > 0;
      return notification.type === filter;
    })
    .filter(notification =>
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'days') return a.daysRemaining - b.daysRemaining;
      if (sortBy === 'expiry_status') {
        // First sort by expired/not-expired
        if (a.daysRemaining <= 0 && b.daysRemaining > 0) return -1;
        if (a.daysRemaining > 0 && b.daysRemaining <= 0) return 1;
        // Then sort by days remaining within each group
        return a.daysRemaining - b.daysRemaining;
      }
      return a.message.localeCompare(b.message);
    });

  const getNotificationIcon = (type, daysRemaining) => {
    if (type === 'certificate_expiring') {
      if (daysRemaining <= 0) {
        return <AlertCircle size={25} color="red" style={{ marginRight: 8 }} />;
      } else if (daysRemaining <= 5) {
        return <AlertCircle size={25} color="orange" style={{ marginRight: 8 }} />;
      } else if (daysRemaining <= 15) {
        return <AlertCircle size={25} color="yellow" style={{ marginRight: 8 }} />;
      }
      return <Clock size={25} color="gray" style={{ marginRight: 8 }} />;
    }
    return <Clock size={25} color="black" style={{ marginRight: 8 }} />;
  };

  const FilterControls = () => (
    <Space direction="vertical" size="middle" className="w-full">
      <Select
        className="w-full"
        value={filter}
        onChange={setFilter}
        size="large"
        dropdownStyle={{ borderRadius: '8px' }}
      >
        <Option value="all">All Documents</Option>
        <Option value="expired">Expired Documents</Option>
        <Option value="not_expired">Active Documents</Option>
        <Option value="unread">Unread Notifications</Option>
      </Select>
      <Select
        className="w-full"
        value={sortBy}
        onChange={setSortBy}
        size="large"
        dropdownStyle={{ borderRadius: '8px' }}
      >
        <Option value="expiry_status">Sort by Expired/Not Expired</Option>
        <Option value="days">Sort by Days Remaining</Option>
        <Option value="date">Sort by Date</Option>
        <Option value="message">Sort by Message</Option>
      </Select>
      <Input.Search
        placeholder="Search by part number, file name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="large"
        style={{ borderRadius: '8px' }}
      />
    </Space>
  );

  return (
    <Layout className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Header className="bg-white shadow-md  w-full z-10" style={{ padding: '0 20px', height: '64px' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center">
  <Space className="flex items-center">
    <Bell className="text-3xl" style={{ color: 'black' }} />
    <Title 
      level={3} 
      className="m-0 text-black whitespace-nowrap overflow-hidden text-ellipsis"
    >
      Notifications
    </Title>
    <Badge count={filteredAndSortedNotifications.filter(n => !n.read).length} overflowCount={99} />
  </Space>
</div>
          <Button 
            icon={<Filter size={20} color="white" />} 
            onClick={() => setDrawerVisible(true)} 
            className="sm:hidden"
            style={{ borderRadius: '20px', background: '#1890ff', color: 'white' }}
          >
            Filters
          </Button>
        </div>
      </Header>
      <Content 
        className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row"
        style={{ marginTop: '4px', overflow: 'hidden' }}
      >
        {/* Left side: Filter Box */}
        <div className="sm:w-1/3 flex flex-col gap-4">
          <Card 
            className="sm:mr-6 sm:mb-0 mb-6" 
            style={{
              borderRadius: '15px', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <FilterControls />
          </Card>

          {/* Selected Files Preview */}
          
        </div>

        {/* Right side: Notification List */}
        <Card 
          className="flex-grow bg-white shadow-lg rounded-xl overflow-hidden" 
          style={{ 
            borderRadius: '15px',
            height: '600px',
            overflow: 'auto'
          }}
        >
          <List
            itemLayout="horizontal"
            dataSource={filteredAndSortedNotifications}
            loading={loading}
            renderItem={(notification) => (
              <List.Item
                className={`px-6 py-4 transition-all duration-300 transform hover:scale-102 ${
                  notification.daysRemaining <= 0 ? 'bg-red-50' : 
                  notification.daysRemaining <= 5 ? 'bg-orange-50' : 
                  notification.daysRemaining <= 15 ? 'bg-yellow-50' :
                  'bg-green-50'
                }`}
                actions={[
                  
                  <Tooltip title={notification.read ? "Already read" : "Mark as read"}>
                    <Button
                      type="text"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={notification.read}
                      icon={<CheckCircle size={20} color={notification.read ? "gray" : "green"} style={{ marginRight: 8 }} />}
                    />
                  </Tooltip>,
                  <Tooltip title="Delete">
                    <Button
                      type="text"
                      onClick={() => handleDelete(notification.id)}
                      icon={<Trash size={20} color="black" style={{ marginRight: 8 }} />}
                    />
                  </Tooltip>
                ]}
              >
                <List.Item.Meta
                  avatar={getNotificationIcon(notification.type, notification.daysRemaining)}
                  title={
                    <div className="flex justify-between items-center">
                      <span className={notification.daysRemaining <= 0 ? 'text-red-600 font-medium' : ''}>
                        {notification.message}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(notification.date).toLocaleDateString()}
                      </span>
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-sm text-gray-600">File: {notification.fileName}</p>
                      <p className="text-sm text-gray-600">
                        Inactive Date: {new Date(notification.inactiveDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm mt-1">
                        {notification.daysRemaining <= 0 ? (
                          <span className="text-red-600">Expired</span>
                        ) : notification.daysRemaining <= 5 ? (
                          <span className="text-orange-600">Expiring Soon</span>
                        ) : notification.daysRemaining <= 15 ? (
                          <span className="text-yellow-600">Expiring in {notification.daysRemaining} days</span>
                        ) : (
                          <span className="text-green-600">Active</span>
                        )}
                      </p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Content>
      <Drawer
        title="Filters"
        placement="right"
        closable
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        width={300}
      >
        <FilterControls />
      </Drawer>
    </Layout>
  );
};

export default NotificationsPage;