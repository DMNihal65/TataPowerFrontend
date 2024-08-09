import React from 'react';
import { Layout, Input, Avatar, Menu, Dropdown, Button } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Search } = Input;

const UserMenu = (
  <Menu>
    <Menu.Item key="profile">Profile</Menu.Item>
    <Menu.Item key="settings">Settings</Menu.Item>
    <Menu.Item key="logout">Logout</Menu.Item>
  </Menu>
);

const HeaderComponent = ({ onMenuClick }) => {
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
          <Search
            placeholder="Search..."
            onSearch={value => console.log(value)}
            style={{ width: 200, marginLeft: 24 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button type="text" icon={<BellOutlined />} style={{ marginRight: 24 }} />
          <Dropdown overlay={UserMenu} placement="bottomRight" arrow>
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default HeaderComponent;