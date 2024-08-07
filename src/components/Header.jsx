import React from 'react';
import { Box, Flex, Input, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react';
import { SearchIcon, BellIcon } from 'lucide-react';

const Header = () => {
  return (
    <Box as="header" bg="white" px={4} py={2} shadow="md">
      <Flex alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" flex={1} mx={8} justifyContent="center">
          <Input 
            placeholder="Search..." 
            size="md" 
            maxW="400px"
            mr={2}
          />
          <IconButton
            aria-label="Search"
            icon={<SearchIcon />}
            size="md"
          />
        </Flex>
        
        <Flex alignItems="center">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            mr={2}
          />
          <Menu>
            <MenuButton as={Avatar} size="sm" cursor="pointer" />
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
