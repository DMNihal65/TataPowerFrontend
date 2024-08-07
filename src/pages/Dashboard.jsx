import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const data = [
  { name: 'Jan', documents: 400, certificates: 240 },
  { name: 'Feb', documents: 300, certificates: 139 },
  { name: 'Mar', documents: 200, certificates: 980 },
  { name: 'Apr', documents: 278, certificates: 390 },
  { name: 'May', documents: 189, certificates: 480 },
  { name: 'Jun', documents: 239, certificates: 380 },
];

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 flex items-center ${color}`}>
    <div className="mr-4">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Documents" value="1,234" icon={<FileText size={32} />} color="text-blue-600" />
        <StatCard title="Pending Approvals" value="56" icon={<Clock size={32} />} color="text-yellow-600" />
        <StatCard title="Expiring Certificates" value="12" icon={<AlertTriangle size={32} />} color="text-red-600" />
        <StatCard title="Approved This Month" value="89" icon={<CheckCircle size={32} />} color="text-green-600" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Document Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="documents" fill="#3B82F6" />
              <Bar dataKey="certificates" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Approval Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="documents" stroke="#3B82F6" />
              <Line type="monotone" dataKey="certificates" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Add sample data here */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">Document Upload</td>
              <td className="px-6 py-4 whitespace-nowrap">New certificate for PN001</td>
              <td className="px-6 py-4 whitespace-nowrap">2024-08-07</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Completed
                </span>
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;