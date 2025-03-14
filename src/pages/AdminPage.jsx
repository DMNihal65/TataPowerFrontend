import React from 'react';
import { Card, Layout, Typography, Avatar, Dropdown, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import logo from '../assets/tata-power-solar.png';
import tpsImage from '../assets/tps.png';
import tprelImage from '../assets/tprel.avif';

const { Header, Content } = Layout;
const { Title } = Typography;

const AdminPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
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
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        height: '80px'  // Increased header height
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Logo" style={{
                                        height: '100%',
                                        width: 'auto',
                                        maxWidth: '200px',
                                        objectFit: 'contain',
                                    }} />
        </div>
        <Dropdown overlay={UserMenu} placement="bottomRight" arrow>
          <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#00b96b' }} />
        </Dropdown>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '40px' }}>
            Select Plant
          </Title>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '40px',
            flexWrap: 'wrap' 
          }}>
            <Card
              hoverable
              style={{ 
                width: 400,
                height: 300,
                cursor: 'pointer',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                background: `url(${tpsImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
              onClick={() => navigate('/tatapowerdoc/tps/dashboard')}
              className="plant-card"
            >
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '30px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                transition: 'all 0.3s ease',
              }}>
                <Title level={3} style={{ color: 'white', margin: 0, textAlign: 'center' }}>
                  Tata Power Solar
                </Title>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px', textAlign: 'center', fontSize: '16px' }}>
                  Click to access TPS dashboard
                </p>
              </div>
            </Card>

            <Card
              hoverable
              style={{ 
                width: 400,
                height: 300,
                cursor: 'pointer',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                background: `url(${tprelImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
              onClick={() => navigate('/tatapowerdoc/tprel/dashboard')}
              className="plant-card"
            >
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '30px 20px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                transition: 'all 0.3s ease',
              }}>
                <Title level={3} style={{ color: 'white', margin: 0, textAlign: 'center' }}>
                  Tata Power Renewable Energy Limited
                </Title>
                <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '8px', textAlign: 'center', fontSize: '16px' }}>
                  Click to access TPREL dashboard
                </p>
              </div>
            </Card>
          </div>

          <style jsx>{`
            .plant-card {
              transform: translateY(0);
            }
            .plant-card:hover {
              transform: translateY(-10px);
              box-shadow: 0 10px 25px rgba(0,0,0,0.2) !important;
            }
            .plant-card:hover div {
              padding-bottom: 40px;
            }
          `}</style>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminPage; 