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
import { Select, Input, List, Tag, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, BellOutlined } from '@ant-design/icons';

const { Option } = Select;

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
        return <ClockCircleOutlined className="text-yellow-500 text-2xl" />;
      case 'certificate_expiring':
        return <WarningOutlined className="text-red-500 text-2xl" />;
      case 'document_approved':
        return <CheckCircleOutlined className="text-green-500 text-2xl" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center mb-10">
          <BellOutlined className="text-4xl mr-4 text-blue-500" />
          <h1 className="text-4xl font-bold text-gray-800">Notifications</h1>
        </header>
        
        <div className="mb-8 flex flex-wrap gap-6">
          <Select 
            className="w-64 text-lg"
            value={filter} 
            onChange={setFilter}
            size="large"
          >
            <Option value="all">All Notifications</Option>
            <Option value="unread">Unread</Option>
            <Option value="document_pending">Document Pending</Option>
            <Option value="certificate_expiring">Certificate Expiring</Option>
            <Option value="document_approved">Document Approved</Option>
          </Select>
          <Select 
            className="w-56 text-lg"
            value={sortBy} 
            onChange={setSortBy}
            size="large"
          >
            <Option value="date">Sort by Date</Option>
            <Option value="message">Sort by Message</Option>
          </Select>
          <Input.Search 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-80 text-lg"
            size="large"
          />
        </div>
        
        <List
          className="bg-white shadow-md rounded-xl overflow-hidden"
          dataSource={filteredAndSortedNotifications}
          renderItem={(notification) => (
            <List.Item className="px-8 py-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-start w-full">
                <div className="flex-shrink-0 mr-6 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <p className="text-xl text-gray-800 mb-2">{notification.message}</p>
                  <p className="text-base text-gray-500">{notification.date}</p>
                </div>
                <div className="flex items-center ml-6">
                  {!notification.read && (
                    <Tag color="blue" className="mr-3 text-base px-3 py-1">New</Tag>
                  )}
                  <Button 
                    type="text"
                    size="large"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={notification.read}
                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 text-lg"
                  >
                    Mark as read
                  </Button>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default NotificationsPage;


