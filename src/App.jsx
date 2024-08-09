import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import './App.css'; // Import the CSS file

// Page components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PartNumberManagement from './pages/PartNumberManagement';
import DocumentUpload from './pages/DocumentUpload';
import DocumentApproval from './pages/DocumentApproval';
import Notifications from './pages/Notifications';

// // Layout components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import LoginSignupHeader from './components/LoginSignupHeader'

const AppLayout = () => {
  const location = useLocation();
  const noHeaderSidebarPaths = ["/", "/signup"];
  const isNoHeaderSidebarPath = noHeaderSidebarPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-100">
      {!isNoHeaderSidebarPath && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isNoHeaderSidebarPath && <Header />}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/part-numbers" element={<PartNumberManagement />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
            <Route path="/document-approval" element={<DocumentApproval />} />
            <Route path="/notifications" element={<Notifications />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ChakraProvider>
      <Router>
        <AppLayout />
      </Router>
    </ChakraProvider>
  );
};

export default App;
