import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const data = [
  { name: 'Jan', documents: 400},
  { name: 'Feb', documents: 300},
  { name: 'Mar', documents: 200},
  { name: 'Apr', documents: 278},
  { name: 'May', documents: 189},
  { name: 'Jun', documents: 239},
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

  const [data2, setData] = useState({
    total_documents: 0,
    pending_approval: 0,
    approved_this_month: 0,
  });


  useEffect(() => {
    // Fetch data from API asynchronously
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.137.161:7001/get_dashboard');
        // Assuming the response data has the following structure:
        const { total_documents, pending_approval, approved_this_month } = response.data;

        // Set the state for statistical cards
        setData({
          total_documents,
          pending_approval,
          approved_this_month,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Documents" value={data2.total_documents} icon={<FileText size={32} />} color="text-blue-600" />
        <StatCard title="Pending Approvals" value={data2.pending_approval} icon={<Clock size={32} />} color="text-yellow-600" />
        <StatCard title="Expiring Certificates" value="12" icon={<AlertTriangle size={32} />} color="text-red-600" />
        <StatCard title="Approved This Month" value={data2.approved_this_month} icon={<CheckCircle size={32} />} color="text-green-600" />
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
              <Bar dataKey="documents" fill="#3B82F6" barSize={40} />
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;