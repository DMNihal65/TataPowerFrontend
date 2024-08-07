import { LockIcon, LockKeyholeIcon, Mail, User2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

// import { LockKeyholeIcon, Mail, User2Icon } from 'lucide-react';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-md shadow-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create a new account</h2>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Name</label>
              <div className="flex">
                <User2 className="h-5 w-5 text-gray-500 mr-2" />
                <input id="name" name="name" type="text" autoComplete="name" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Name" />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="flex mt-4">
                <Mail className="h-5 w-5 text-gray-500 mr-2" />
                <input id="email-address" name="email" type="email" autoComplete="email" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Email address" />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="flex mt-4">
                <LockIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input id="password" name="password" type="password" autoComplete="new-password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Password" />
              </div>
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <div className="flex mt-4">
                <LockKeyholeIcon className="h-5 w-5 text-gray-500 mr-2" />
                <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required 
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" 
                  placeholder="Confirm Password" />
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
      </div>
    </div>
  );
};

export default SignupPage;
