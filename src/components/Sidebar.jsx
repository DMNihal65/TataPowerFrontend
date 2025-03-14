import React from 'react';
import { Layout, Menu, Typography } from 'antd';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Home, Package, FileUp, CheckSquare, Bell, X, Folder, File } from 'lucide-react';
import logo from '../assets/tata-power-solar.png';
import '@fontsource/archivo-black'; // Import Archivo Black font


const { Sider } = Layout;
const { Title } = Typography;

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { plant } = useParams();
  const userRole = localStorage.getItem('role');

  const isTPREL = location.pathname.includes('/tprel/');

  const getMenuItems = () => {
    const baseMenuItems = [
      { key: `/tatapowerdoc/${plant}/dashboard`, icon: <Home size={18} />, label: 'Home' },
      { key: `/tatapowerdoc/${plant}/document-master`, icon: <File size={18} />, label: 'Document Master' },
      { key: `/tatapowerdoc/${plant}/part-numbers`, icon: <Package size={18} />, label: 'Part Numbers' },
      { key: `/tatapowerdoc/${plant}/document-upload`, icon: <FileUp size={18} />, label: 'Document Upload' },
      { key: `/tatapowerdoc/${plant}/notifications`, icon: <Bell size={18} />, label: 'Notifications' },
    ];

    // Add Document Approval for roles other than Data Management Associate
    if (userRole !== 'Data Management Associate') {
      baseMenuItems.splice(4, 0, {
        key: `/tatapowerdoc/${plant}/document-approval`,
        icon: <CheckSquare size={18} />,
        label: 'Document Approval'
      });
    }

    return baseMenuItems;
  };

  return (
    <Sider
      // width={280}
      className="rounded-lg shadow-lg"
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        if (!broken) onClose();
      }}
      trigger={null}
      collapsible
      collapsed={!isOpen}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        backgroundColor: '#ffffff',
      }}
    >
      <div
        className="logo-container"
        style={{
          height: '100px',
          marginTop: '10px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
        }}
      >
        {isTPREL ? (
          <Title level={4} style={{ 
            margin: 0, 
            color: '#0056A2', 
            fontFamily: "'Archivo Black', sans-serif",
            fontWeight: 600, 
            letterSpacing: '0.5px',
            textAlign: 'center',
            fontSize: '18px',
            lineHeight: '1.4'
          }}>
            TPREL
          </Title>
        ) : (
          <img
            src={logo}
            alt="Logo"
            style={{
              maxHeight: '100%',
              maxWidth: '80%',
              objectFit: 'contain',
            }}
          />
        )}
      </div>
      {isOpen && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '16px', 
            zIndex: 1,
            backgroundColor: '#f0f0f0',
            borderRadius: '50%',
            padding: '4px',
          }}
        >
          <X 
            size={18} 
            color="#666" 
            onClick={onClose} 
            style={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
      )}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={getMenuItems().map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        onClick={() => {
          if (window.innerWidth < 992) {
            onClose();
          }
        }}
        style={{
          borderRight: 'none',
          fontSize: '13px',
        }}
      />
    </Sider>
  );
};

export default Sidebar;