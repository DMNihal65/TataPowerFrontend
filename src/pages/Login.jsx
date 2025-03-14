import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LockIcon, User2, ArrowRight } from 'lucide-react';
import { message, Form, Input, Button, Select } from 'antd';
import logo from '../assets/tata_power.png';
import qs from 'qs';

const { Option } = Select;

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [form] = Form.useForm();

  // Role options
  const roleOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'Data Management Associate', label: 'Data Management Associate' },
    { value: 'user', label: 'User' }
  ];

  // Plant options
  const plantOptions = [
    { value: 'tps', label: 'Tata Power Solar' },
    { value: 'tprel', label: 'Tata Power Renewable Energy Limited' }
  ];

  // Function to check if role requires plant selection
  const doesRoleRequirePlant = (role) => {
    return role === 'supervisor' || role === 'Data Management Associate';
  };

  // Handle role change
  const handleRoleChange = (value) => {
    setSelectedRole(value);
    if (!doesRoleRequirePlant(value)) {
      form.setFieldsValue({ plant: undefined }); // Clear plant selection
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Create URL search params object
      const params = new URLSearchParams();
      params.append('username', values.username);
      params.append('password', values.password);
      params.append('role', values.role);
      if (values.plant) {
        params.append('plant', values.plant);
      }

      const response = await axios.post('http://127.0.0.1:7001/auth', 
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('role', response.data.role);
        if (response.data.plant) {
          localStorage.setItem('plant', response.data.plant);
        }
        message.success('Login successful!');

        // Redirect based on role
        switch (values.role) {
          case 'admin':
            navigate('/tatapowerdoc/admin');
            break;
          case 'user':
            navigate('/tatapowerdoc/user');
            break;
          case 'supervisor':
          case 'Data Management Associate':
            if (values.plant) {
              navigate(`/tatapowerdoc/${values.plant}/dashboard`);
            } else {
              message.error('Plant selection is required for this role');
            }
            break;
          default:
            navigate('/tatapowerdoc');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <img
          src={logo}
          alt="Tata Power Solar Logo"
          className="w-64 h-auto mb-4"
        />
        
      </div>
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg mb-14">
        <h2 className="text-center text-2xl font-bold text-gray-900 font-sans mb-8">Sign In</h2>
        
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
          >
            <Input
              prefix={<User2 className="text-gray-400" />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockIcon className="text-gray-400" />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select
              placeholder="Select Role"
              onChange={handleRoleChange}
              size="large"
            >
              {roleOptions.map(option => (
                <Option key={option.value} value={option.value}>{option.label}</Option>
              ))}
            </Select>
          </Form.Item>

          {doesRoleRequirePlant(selectedRole) && (
            <Form.Item
              name="plant"
              rules={[{ required: true, message: 'Please select your plant!' }]}
            >
              <Select
                placeholder="Select Plant"
                size="large"
              >
                {plantOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              size="large"
              loading={loading}
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/tatapowerdoc/signup" className="font-medium text-green-600 hover:text-green-500">
              Sign Up
            </Link>
          </p>
        </div>
        <Link 
          to="/tatapowerdoc/aboutus" 
          className="text-green-600 hover:text-green-500 mt-3 ml-28 flex items-center gap-2"
        >
          Learn more about us <ArrowRight size={16} />
        </Link>
      </div>
      
    </div>
  );
};

export default LoginPage;
