// import React, { useState } from 'react';
// import { Layout, Typography, Space, Select, Input, List, Badge, Button } from 'antd';
// import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';

// const { Content } = Layout;
// const { Title } = Typography;
// const { Option } = Select;

// const NotificationsPage = () => {
//   const [notifications, setNotifications] = useState([
//     { id: 1, type: 'document_pending', message: 'Document upload pending for PN001', date: '2024-08-01', read: false },
//     { id: 2, type: 'certificate_expiring', message: 'Certificate for PN002 expiring in 30 days', date: '2024-08-05', read: true },
//     { id: 3, type: 'document_approved', message: 'Document for PN003 has been approved', date: '2024-08-07', read: false },
//   ]);

//   const [filter, setFilter] = useState('all');
//   const [sortBy, setSortBy] = useState('date');
//   const [searchTerm, setSearchTerm] = useState('');

//   const handleMarkAsRead = (id) => {
//     setNotifications(notifications.map(notification => 
//       notification.id === id ? { ...notification, read: true } : notification
//     ));
//   };

//   const filteredAndSortedNotifications = notifications
//     .filter(notification => {
//       if (filter === 'all') return true;
//       if (filter === 'unread') return !notification.read;
//       return notification.type === filter;
//     })
//     .filter(notification =>
//       notification.message.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
//       return a.message.localeCompare(b.message);
//     });

//   const getNotificationIcon = (type) => {
//     switch (type) {
//       case 'document_pending':
//         return <ClockCircleOutlined style={{ color: 'orange' }} />;
//       case 'certificate_expiring':
//         return <WarningOutlined style={{ color: 'red' }} />;
//       case 'document_approved':
//         return <CheckCircleOutlined style={{ color: 'green' }} />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <Layout>
//       <Content style={{ padding: '24px' }}>
//         <Space direction="vertical" size="large" style={{ width: '100%' }}>
//           <Title level={2}>Notifications</Title>
          
//           <Space>
//             <Select 
//               style={{ width: 200 }} 
//               value={filter} 
//               onChange={setFilter}
//             >
//               <Option value="all">All Notifications</Option>
//               <Option value="unread">Unread</Option>
//               <Option value="document_pending">Document Pending</Option>
//               <Option value="certificate_expiring">Certificate Expiring</Option>
//               <Option value="document_approved">Document Approved</Option>
//             </Select>
            
//             <Select 
//               style={{ width: 200 }} 
//               value={sortBy} 
//               onChange={setSortBy}
//             >
//               <Option value="date">Sort by Date</Option>
//               <Option value="message">Sort by Message</Option>
//             </Select>
            
//             <Input.Search 
//               placeholder="Search notifications..." 
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               style={{ width: 300 }}
//             />
//           </Space>
          
//           <List
//             itemLayout="horizontal"
//             dataSource={filteredAndSortedNotifications}
//             renderItem={(notification) => (
//               <List.Item
//                 actions={[
//                   <Button 
//                     type="text" 
//                     icon={<CheckCircleOutlined />} 
//                     onClick={() => handleMarkAsRead(notification.id)}
//                     disabled={notification.read}
//                   >
//                     Mark as read
//                   </Button>
//                 ]}
//               >
//                 <List.Item.Meta
//                   avatar={getNotificationIcon(notification.type)}
//                   title={
//                     <Space>
//                       {notification.message}
//                       {!notification.read && <Badge status="error" text="New" />}
//                     </Space>
//                   }
//                   description={notification.date}
//                 />
//               </List.Item>
//             )}
//           />
//         </Space>
//       </Content>
//     </Layout>
//   );
// };

// export default NotificationsPage;
///////////////////////////////////////////

import React, { useState } from 'react';
import { Layout, Typography, Space, Select, Input, List, Badge, Button, Card, Row, Col, Divider } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';
import { css } from '@emotion/react';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const customStyles = {
  pageWrapper: css`
    background-color: #f0f2f5;
    min-height: 100vh;
    padding: 24px;
  `,
  contentCard: css`
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  `,
  header: css`
    background-color: #1890ff;
    color: white;
    padding: 16px 24px;
    border-radius: 8px 8px 0 0;
  `,
  controls: css`
    background-color: white;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
  `,
  notificationList: css`
    .ant-list-item {
      transition: all 0.3s;
      &:hover {
        background-color: #e6f7ff;
      }
    }
  `,
  notificationItem: css`
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
  `,
  iconWrapper: css`
    font-size: 24px;
    margin-right: 16px;
  `,
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'document_pending', message: 'Document upload pending for PN001', date: '2024-08-01', read: false },
    { id: 2, type: 'certificate_expiring', message: 'Certificate for PN002 expiring in 30 days', date: '2024-08-05', read: true },
    { id: 3, type: 'document_approved', message: 'Document for PN003 has been approved', date: '2024-08-07', read: false },
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
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
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'certificate_expiring':
        return <WarningOutlined style={{ color: '#f5222d' }} />;
      case 'document_approved':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      default:
        return null;
    }
  };

  return (
    <Layout css={customStyles.pageWrapper}>
      <Content>
        <Card css={customStyles.contentCard}>
          <div css={customStyles.header}>
            <Row align="middle">
              <Col flex="none">
                <BellOutlined style={{ fontSize: 24, marginRight: 16 }} />
              </Col>
              <Col flex="auto">
                <Title level={2} style={{ color: 'white', margin: 0 }}>Notifications</Title>
              </Col>
            </Row>
          </div>
          
          <div css={customStyles.controls}>
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8}>
                <Select 
                  style={{ width: '100%' }} 
                  value={filter} 
                  onChange={setFilter}
                >
                  <Option value="all">All Notifications</Option>
                  <Option value="unread">Unread</Option>
                  <Option value="document_pending">Document Pending</Option>
                  <Option value="certificate_expiring">Certificate Expiring</Option>
                  <Option value="document_approved">Document Approved</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Select 
                  style={{ width: '100%' }} 
                  value={sortBy} 
                  onChange={setSortBy}
                >
                  <Option value="date">Sort by Date</Option>
                  <Option value="message">Sort by Message</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8}>
                <Input.Search 
                  placeholder="Search notifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%' }}
                />
              </Col>
            </Row>
          </div>
          
          <List
            css={customStyles.notificationList}
            dataSource={filteredAndSortedNotifications}
            renderItem={(notification) => (
              <List.Item css={customStyles.notificationItem}>
                <Row align="middle" style={{ width: '100%' }}>
                  <Col flex="none" css={customStyles.iconWrapper}>
                    {getNotificationIcon(notification.type)}
                  </Col>
                  <Col flex="auto">
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Space>
                        <span style={{ fontWeight: 'bold' }}>{notification.message}</span>
                        {!notification.read && <Badge status="error" text="New" />}
                      </Space>
                      <span style={{ color: '#8c8c8c' }}>{notification.date}</span>
                    </Space>
                  </Col>
                  <Col flex="none">
                    <Button 
                      type="primary"
                      ghost
                      size="small"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={notification.read}
                    >
                      Mark as read
                    </Button>
                  </Col>
                </Row>
              </List.Item>
            )}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default NotificationsPage;




