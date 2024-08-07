import React, { useState } from 'react';
import { Box, VStack, IconButton, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Home, Package, FileUp, CheckSquare, Bell, Menu } from 'lucide-react';
import { Flex, Spacer } from '@chakra-ui/react'

const NavItem = ({ icon, children, to }) => (
  <Link to={to}>
    <Flex
      align="center"
      p="4"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      _hover={{
        bg: 'cyan.400',
        color: 'white',
      }}
    >
      {icon}
      <Text ml="4">{children}</Text>
    </Flex>
  </Link>
);

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      as="nav"
      pos="fixed"
      top="0"
      left="0"
      zIndex="sticky"
      h="full"
      pb="10"
      overflowX="hidden"
      overflowY="auto"
      bg="white"
      borderRight="1px"
      borderRightColor="gray.200"
      w={isCollapsed ? "60px" : "240px"}
      transition="width 0.2s"
    >
      <Flex px="4" py="5" align="center" justify="space-between">
        {!isCollapsed && <Text fontSize="2xl" fontWeight="bold">Tata Power</Text>}
        <IconButton
          aria-label="Menu Collapse"
          icon={<Menu />}
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="outline"
        />
      </Flex>
      <VStack spacing={4} align="stretch" mt={8}>
        <NavItem icon={<Home />} to="/dashboard">
          {!isCollapsed && "Dashboard"}
        </NavItem>
        <NavItem icon={<Package />} to="/part-numbers">
          {!isCollapsed && "Part Numbers"}
        </NavItem>
        <NavItem icon={<FileUp />} to="/document-upload">
          {!isCollapsed && "Document Upload"}
        </NavItem>
        <NavItem icon={<CheckSquare />} to="/document-approval">
          {!isCollapsed && "Document Approval"}
        </NavItem>
        <NavItem icon={<Bell />} to="/notifications">
          {!isCollapsed && "Notifications"}
        </NavItem>
      </VStack>
    </Box>
  );
};

export default Sidebar;