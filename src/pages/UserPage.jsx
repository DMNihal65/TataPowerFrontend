import React from 'react';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/tata-power-solar.png';
import DocumentRetrieval from './DocumentRetrieval';

const { Content, Header } = Layout;

export default function UserPage() {
    const navigate = useNavigate();

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

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Layout>
                <Header style={{ 
                    background: '#fff', 
                    padding: 0, 
                    boxShadow: '0 1px 4px rgba(0,21,41,.08)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%'
                }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        height: '100%', 
                        padding: '0 24px' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div className="logo-container" style={{ height: '64px' }}>
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
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Dropdown overlay={UserMenu} placement="bottomRight" arrow>
                                <Avatar 
                                    icon={<UserOutlined />} 
                                    style={{ 
                                        cursor: 'pointer',
                                        backgroundColor: '#00b96b'
                                    }} 
                                />
                            </Dropdown>
                        </div>
                    </div>
                </Header>        
                <Content style={{ 
                    margin: '24px 16px', 
                    overflow: 'initial',
                    backgroundColor: '#f0f2f5',
                    borderRadius: '8px'
                }}>
                    <div style={{ 
                        padding: '24px', 
                        background: '#fff', 
                        minHeight: 360,
                        borderRadius: '8px',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)'
                    }}>
                        <DocumentRetrieval />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}