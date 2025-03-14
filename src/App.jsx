import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { ConfigProvider } from 'antd';
import { App as AntApp } from 'antd';

// Page components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PartNumberManagement from './pages/PartNumberManagement';
import DocumentUpload from './pages/DocumentUpload';
import DocumentApproval from './pages/DocumentApproval';
import Notifications from './pages/Notifications';
import DocumentMaster from './pages/DocumentMaster';
import AdminPage from './pages/AdminPage';

// Layout components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import UserPage from './pages/UserPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutUs from './pages/AboutUs';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Layout style={{ marginLeft: sidebarOpen ? 200 : 0, transition: 'all 0.2s' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 4, background: '#fff', minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <AntApp>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#00b96b',
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/tatapowerdoc/aboutus" element={<AboutUs />} />
            <Route path="/tatapowerdoc" element={<Login />} />
            <Route path="/tatapowerdoc/signup" element={<Signup />} />
            <Route path="/tatapowerdoc/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />
            <Route path="/tatapowerdoc/user" element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserPage />
              </ProtectedRoute>
            } />
            <Route
              path="/tatapowerdoc/:plant/*"
              element={
                <ProtectedRoute allowedRoles={['admin', 'supervisor', 'Data Management Associate']}>
                  <MainLayout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/document-master" element={<DocumentMaster />} />
                      <Route path="/part-numbers" element={<PartNumberManagement />} />
                      <Route path="/document-upload" element={<DocumentUpload />} />
                      <Route path="/document-approval" element={
                        <ProtectedRoute allowedRoles={['admin', 'supervisor']}>
                          <DocumentApproval />
                        </ProtectedRoute>
                      } />                      
                     <Route path="/notifications" element={<Notifications />} />
                    </Routes>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ConfigProvider>
    </AntApp>
  );
};

export default App;