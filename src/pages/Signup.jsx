import { LockKeyholeIcon, Mail, User2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useState , useRef } from 'react';
import { Alert } from 'antd';


// import { LockKeyholeIcon, Mail, User2Icon } from 'lucide-react';

const SignupPage = () => {

  const [message,setmessage]= useState("");

  const email= useRef();
  const username= useRef();
  const role= useRef();
  const password= useRef();


  const handleSubmit= async(event)=>{
      event.preventDefault();
  
      
      const payload = {
        email: email.current.value,
        username: username.current.value,
        role: role.current.value,
        password: password.current.value
      };
      console.log(payload); // Add this line to debug
      

      try {
         const response= await axios.post('http://172.18.100.54:7000/register',{
          email: email.current.value,
          username: username.current.value,
          role: role.current.value,
          password: password.current.value
         });
         console.log(response.data);

         
         if(response.data ){
          <Alert message="Success Tips" type="success" showIcon />
         }
        // //  else if(response.data === "Email already registered"){
        // //   <Alert message="Email already exists" type="error" showIcon />
        // //  }
        // //  else if(response.data === "Username already exists"){
        // //   <Alert message="Username already exists" type="error" showIcon />
        //  }


         setmessage(response.data.message || 'Registration successful');
         
      } catch (error) {
        console.error('Error:', error);

        setmessage(error.response.data);
      }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Email address</label>
              <div className="flex">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <input id="email" name="email" type="email" autoComplete="email" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Email address" ref={email} />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Username</label>
              <div className="flex mt-4">
              <User2 className="h-5 w-5 text-gray-500 mr-2" />
                <input id="username" name="email" type="text" autoComplete="username" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Username" ref={username} />
              </div>
            </div>
            <div>
                 <label htmlFor="role" className="sr-only">Role</label>
                 <div className="flex mt-4">
                 <User2 className="h-5 w-5 text-gray-500 mr-2" />
                 <select id="role" name="role" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  ref={role}>
                  <option value="role">Select role</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                 </select>
            </div>
           </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Password</label>
              <div className="flex mt-4">
                <LockKeyholeIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input id="password" name="password" type="password" autoComplete="password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Password" ref={password} />
              </div>
            </div>
          </div>

          <div>
            <button type="submit" 
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Sign Up
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account? <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-500">Log In</Link>
        </p>
        {message && <p>{typeof message === 'string' ? message : JSON.stringify(message)}</p>}
      </div>
    </div>
  );
};

export default SignupPage;
