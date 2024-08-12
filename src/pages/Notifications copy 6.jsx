import React, { useState, useEffect } from 'react';
import { Layout, Typography, Select, Input, List, Button, Card, Space, Drawer, Badge, Tooltip, message } from 'antd';
import { 
  Bell, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Filter, 
  Trash 
} from 'lucide-react';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'document_pending', message: 'Document upload pending for PN001', date: '2024-08-01', read: false },
    { id: 2, type: 'certificate_expiring', message: 'Certificate for PN002 expiring in 30 days', date: '2024-08-05', read: true },
    { id: 3, type: 'document_approved', message: 'Document for PN003 has been approved', date: '2024-08-07', read: false },
    { id: 4, type: 'document_pending', message: 'Document review required for PN004', date: '2024-08-09', read: false },
    { id: 5, type: 'certificate_expiring', message: 'Certificate for PN005 expiring in 15 days', date: '2024-08-10', read: false },
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }, [filter, sortBy, searchTerm]);

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

  const filteredAndSortedNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.read;
      return notification.type === filter;
    })
    .filter(notification =>
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
      return a.message.localeCompare(b.message);
    });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'document_pending':
        return <Clock size={25} color="black" style={{ marginRight: 8 }} />;
      case 'certificate_expiring':
        return <AlertCircle size={25} color="black" style={{ marginRight: 8 }} />;
      case 'document_approved':
        return <CheckCircle size={25} color="black" style={{ marginRight: 8 }} />;
      default:
        return null;
    }
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
        <Option value="all">All Notifications</Option>
        <Option value="unread">Unread</Option>
        <Option value="document_pending">Document Pending</Option>
        <Option value="certificate_expiring">Certificate Expiring</Option>
        <Option value="document_approved">Document Approved</Option>
      </Select>
      <Select
        className="w-full"
        value={sortBy}
        onChange={setSortBy}
        size="large"
        dropdownStyle={{ borderRadius: '8px' }}
      >
        <Option value="date">Sort by Date</Option>
        <Option value="message">Sort by Message</Option>
      </Select>
      <Input.Search
        placeholder="Search notifications..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        size="large"
        style={{ borderRadius: '8px' }}
      />
    </Space>
  );

  return (
    <Layout className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Header className="bg-white shadow-md fixed w-full z-10" style={{ padding: '0 20px' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
          <Space>
            <Bell className="text-3xl" style={{ color: 'black' }} />
            <Title level={3} style={{ margin: 0, color: 'black' }}>
              Notifications
            </Title>
            <Badge count={filteredAndSortedNotifications.filter(n => !n.read).length} overflowCount={99} />
          </Space>
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
      <Content className="p-4 sm:p-6 lg:p-8 mt-16 flex flex-col-reverse sm:flex-row">
        {/* Filter Box */}
        <Card 
          className="sm:w-1/3 sm:mr-6 sm:mb-0 mb-6 sm:block hidden" 
          style={{ borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        >
          <FilterControls />
        </Card>

        {/* Notification List */}
        <Card 
          className="flex-grow bg-white shadow-lg rounded-xl overflow-hidden" 
          style={{ borderRadius: '15px' }}
        >
          <List
            itemLayout="horizontal"
            dataSource={filteredAndSortedNotifications}
            loading={loading}
            renderItem={(notification) => (
              <List.Item
                className="px-6 py-4 hover:bg-blue-50 transition-all duration-300 transform hover:scale-102"
                actions={[
                  <Tooltip title={notification.read ? "Already read" : "Mark as read"}>
                    <Button
                      type="text"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={notification.read}
                      icon={<CheckCircle size={20} color="black" style={{ marginRight: 8 }} />}
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
                  avatar={getNotificationIcon(notification.type)}
                  title={notification.message}
                  description={notification.date}
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