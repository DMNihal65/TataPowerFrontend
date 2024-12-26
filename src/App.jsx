import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import { ConfigProvider } from 'antd';

// Page components
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PartNumberManagement from './pages/PartNumberManagement';
import DocumentUpload from './pages/DocumentUpload';
import DocumentApproval from './pages/DocumentApproval';
import Notifications from './pages/Notifications';
import DocumentMaster from './pages/DocumentMaster';

// Layout components
import Header from './components/Header';
import Sidebar from './components/Sidebar';

const { Content } = Layout;

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Layout style={{ marginLeft: sidebarOpen ? 200 : 0, transition: 'all 0.2s' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/tatapowerdoc" element={<Login />} />
          <Route path="/tatapowerdoc/signup" element={<Signup />} />
          <Route
            path="/tatapowerdoc/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/document-master" element={<DocumentMaster />} />
                  <Route path="/part-numbers" element={<PartNumberManagement />} />
                  <Route path="/document-upload" element={<DocumentUpload />} />
                  <Route path="/document-approval" element={<DocumentApproval />} />
                  <Route path="/notifications" element={<Notifications />} />
                  {/* <Route path="/folder-master" element={<FileExplorer />} /> */}

                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;