import React from 'react';
import { Box, Flex, Input, IconButton, Avatar, Menu, MenuButton, MenuList, MenuItem , Image} from '@chakra-ui/react';
import { SearchIcon, BellIcon } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import logoSrc from '../assets/Tata_Power_Logo.png';

const Header = () => {
  return (
    <Box as="header" bg="white" px={4} py={2} shadow="md">
      <Flex alignItems="center" justifyContent="space-between">
      <Image src={logoSrc} alt="Logo" height="17px" objectFit="contain" marginLeft={50} />
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
              <Link to="/"> {/* Wrap Logout with Link */}
                <MenuItem>Logout</MenuItem>
              </Link>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
