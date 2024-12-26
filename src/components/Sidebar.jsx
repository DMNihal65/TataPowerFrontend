import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { Home, Package, FileUp, CheckSquare, Bell, X, Folder, File } from 'lucide-react';
import logo from '../assets/tatapower.svg';

const { Sider } = Layout;

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { key: '/tatapowerdoc/dashboard', icon: <Home size={18} />, label: 'Dashboard' },
    { key: '/tatapowerdoc/document-master', icon: <File size={18} />, label: 'Document Master' },
    { key: '/tatapowerdoc/part-numbers', icon: <Package size={18} />, label: 'Part Numbers' },
    { key: '/tatapowerdoc/document-upload', icon: <FileUp size={18} />, label: 'Document Upload' },
    { key: '/tatapowerdoc/document-approval', icon: <CheckSquare size={18} />, label: 'Document Approval' },
    { key: '/tatapowerdoc/notifications', icon: <Bell size={18} />, label: 'Notifications' },
    // { key: '/tatapowerdoc/folder-master', icon: <Folder size={18} />, label: 'Folder Master' },
  ];

  return (
    <Sider
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
        className="logo"
        style={{
          height: isOpen && '100px', // Adjust height when sidebar is collapsed or open
          width: isOpen && '150px',
          textAlign: 'center',
        }}
      >
        <img
          src={logo}
          alt="Logo"
          style={{
            height: '100px',
            width: '150px',
            objectFit: 'contain', // Ensure the logo fits within the container
          }}
        />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '15px', right: '16px', zIndex: 1 }}>
          <X size={24} color="black" onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
      )}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link to={item.key}>{item.label}</Link>,
        }))}
        onClick={() => {
          if (window.innerWidth < 992) {
            onClose();
          }
        }}
      />
    </Sider>
  );
};

export default Sidebar;