import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Select, Input, List, ListItem, IconButton, Badge } from '@chakra-ui/react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

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
        return <Clock size={20} color="orange" />;
      case 'certificate_expiring':
        return <AlertCircle size={20} color="red" />;
      case 'document_approved':
        return <CheckCircle size={20} color="green" />;
      default:
        return null;
    }
  };

  return (
    <Box p={5}>
      <VStack align="stretch" spacing={5}>
        <HStack justify="space-between">
          <Select 
            width="200px" 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="document_pending">Document Pending</option>
            <option value="certificate_expiring">Certificate Expiring</option>
            <option value="document_approved">Document Approved</option>
          </Select>
          <Select 
            width="200px" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Sort by Date</option>
            <option value="message">Sort by Message</option>
          </Select>
          <Input 
            placeholder="Search notifications..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
        </HStack>
        
        <List spacing={3}>
          {filteredAndSortedNotifications.map((notification) => (
            <ListItem 
              key={notification.id} 
              p={3} 
              bg={notification.read ? "gray.100" : "blue.100"} 
              borderRadius="md"
            >
              <HStack justify="space-between">
                <HStack>
                  {getNotificationIcon(notification.type)}
                  <VStack align="start" spacing={0}>
                    <Text>{notification.message}</Text>
                    <Text fontSize="sm" color="gray.500">{notification.date}</Text>
                  </VStack>
                </HStack>
                <HStack>
                  {!notification.read && (
                    <Badge colorScheme="red">New</Badge>
                  )}
                  <IconButton
                    aria-label="Mark as read"
                    icon={<CheckCircle />}
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    isDisabled={notification.read}
                  />
                </HStack>
              </HStack>
            </ListItem>
          ))}
        </List>
      </VStack>
    </Box>
  );
};

export default NotificationsPage;