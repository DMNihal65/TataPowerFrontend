import React from 'react';
import { Layout, Input, Avatar, Menu, Dropdown, Button, Typography } from 'antd';
import { UserOutlined, MenuOutlined } from '@ant-design/icons';
import logo from '../assets/tata-power-solar.png';
import { useNavigate, useLocation } from 'react-router-dom';
import '@fontsource/archivo-black'; // Import Archivo Black font

const { Header } = Layout;
const { Search } = Input;
const { Title } = Typography;

const HeaderComponent = ({ onMenuClick, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/tatapowerdoc');
  };

  const UserMenu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  const isTPREL = location.pathname.includes('/tprel/');

  return (
    <Header style={{ background: '#fff', padding: 0, boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={onMenuClick}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          {!isSidebarOpen && (
            <div className="logo-container" style={{ height: '64px', marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
              {isTPREL ? (
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    fontFamily: "'Archivo Black', sans-serif",
                    color: '#0056A2', 
                  }}
                >
                  TATA POWER RENEWABLE ENERGY LIMITED
                </Title>
              ) : (
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    height: '100%',
                    width: 'auto',
                    maxWidth: '200px',
                    objectFit: 'contain',
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown overlay={UserMenu} placement="bottomRight" arrow>
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#00b96b' }} />
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;
