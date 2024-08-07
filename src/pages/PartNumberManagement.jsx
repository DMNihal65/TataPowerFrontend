import React, { useState } from 'react';
import { Box, Input, Table, Thead, Tbody, Tr, Th, Td, Button, Switch, HStack, VStack } from '@chakra-ui/react';

const PartNumberManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [partNumbers, setPartNumbers] = useState([
    { id: 1, number: 'PN001', status: 'Active', documentsComplete: true },
    { id: 2, number: 'PN002', status: 'Inactive', documentsComplete: false },
    // Add more mock data as needed
  ]);

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

  return (
    <Box p={5}>
      <VStack spacing={5} align="stretch">
        <HStack justify="space-between">
          <Input
            placeholder="Search part numbers..."
            value={searchTerm}
            onChange={handleSearch}
            width="300px"
          />
          <Button colorScheme="blue">Add New Part Number</Button>
        </HStack>
        
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Part Number</Th>
              <Th>Status</Th>
              <Th>Documents Complete</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPartNumbers.map(part => (
              <Tr key={part.id}>
                <Td>{part.number}</Td>
                <Td>{part.status}</Td>
                <Td>{part.documentsComplete ? 'Yes' : 'No'}</Td>
                <Td>
                  <Switch
                    isChecked={part.status === 'Active'}
                    onChange={() => toggleStatus(part.id)}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default PartNumberManagement;