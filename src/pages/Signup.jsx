import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { LockKeyholeIcon, Mail, User2 } from 'lucide-react';
import { Alert } from 'antd';
import LoginSignupHeader from '../components/LoginSignupHeader';

const SignupPage = () => {
  const [alert, setAlert] = useState({ visible: false, type: '', message: '' });

  const navigate = useNavigate();

  const email = useRef();
  const username = useRef();
  const role = useRef();
  const password = useRef();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: email.current.value,
      username: username.current.value,
      role: role.current.value,
      password: password.current.value,
    };
    console.log(payload); // Debugging

    try {
      const response = await axios.post('http://172.18.100.54:7000/register', payload);
      console.log(response.data);

      setAlert({
        visible: true,
        type: 'success',
        message: 'Registration successful',
      });

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Error:', error);

      setAlert({
        visible: true,
        type: 'error',
        message: error.response?.data?.detail || 'An error occurred',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <LoginSignupHeader />
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md mx-auto mt-12">
        {alert.visible && <Alert message={alert.message} type={alert.type} showIcon />}
        <h2 className="text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="flex">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Email address"
                  ref={email}
                />
              </div>
            </div>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <div className="flex mt-4">
                <User2 className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Username"
                  ref={username}
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <div className="flex mt-4">
                <User2 className="h-5 w-5 text-gray-500 mr-2" />
                <select
                  id="role"
                  name="role"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  ref={role}
                >
                  <option value="">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="flex mt-4">
                <LockKeyholeIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Password"
                  ref={password}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
