// components/LoginSignupHeader.jsx
import React from 'react';
import { Box, Image, Flex } from '@chakra-ui/react';
import tataPowerLogo from '../assets/tata-power.png';
import cmtiLogo from '../assets/CMTILogo.png';

const LoginSignupHeader = () => {
  return (
    <Box bg="white" p={4} >
      <Flex justify="space-between" align="center">
        <Image src={tataPowerLogo} alt="Tata Power" height="120px" bg="transparent" marginLeft={50} />
        <Image src={cmtiLogo} alt="CMTI" height="80px" bg="transparent" marginRight={50} />
      </Flex>
    </Box>
  );
};

export default LoginSignupHeader;