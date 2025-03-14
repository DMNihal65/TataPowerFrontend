import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


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
  const [dashboardData, setDashboardData] = useState({
    total_documents: 0,
    pending_approval: 0,
    approved_this_month: 0,
    expiring_certificates: 0
  });
  const [documentActivity, setDocumentActivity] = useState([]);
  const [approvalTrend, setApprovalTrend] = useState([]);
  const { plant } = useParams(); // Get plant from URL params


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const dashboardResponse = await axios.get('http://127.0.0.1:7001/get_dashboard', {
          params: {
            plant: plant
          }
        });        
        const { total_documents, pending_approval, approved_this_month } = dashboardResponse.data;

        console.log(total_documents)

        // Fetch expiring documents
        const expiringResponse = await axios.get('http://127.0.0.1:7001/expiring-documents',{
          params: {
            plant : plant
          }
        });
        console.log('Expiring documents response:', expiringResponse.data);
        
        const currentDate = new Date();
        
        const expiringCount = expiringResponse.data.filter(doc => {
            if (doc.inactive_date) {
                const inactiveDate = new Date(doc.inactive_date);
                const daysUntilExpiry = Math.ceil((inactiveDate - currentDate) / (1000 * 60 * 60 * 24));
                
                // Count only documents that will expire within next 15 days
                // i.e., daysUntilExpiry should be between 0 and 15
                return daysUntilExpiry >= 0 && daysUntilExpiry <= 15;
            }
            return false;
        }).length;

        console.log("Certificates expiring within next 15 days count:", expiringCount);

        // Fetch all documents for activity chart
        const documentsResponse = await axios.get('http://127.0.0.1:7001/documents', {
          params:{
            plant: plant
          }
        });
        const documents = documentsResponse.data;

        // Process data for document activity chart (last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            documents: 0
          };
        }).reverse();

        documents.forEach(doc => {
          const createdDate = new Date(doc.created_at);
          const monthYear = `${createdDate.toLocaleString('default', { month: 'short' })} ${createdDate.getFullYear()}`;
          const monthData = last6Months.find(m => `${m.month} ${m.year}` === monthYear);
          if (monthData) {
            monthData.documents++;
          }
        });

        // Process data for approval trend (last 6 months)
        const approvalData = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return {
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            approvals: 0
          };
        }).reverse();

        documents.forEach(doc => {
          if (doc.status === 'approved') {
            const updatedDate = new Date(doc.updated_at);
            const monthYear = `${updatedDate.toLocaleString('default', { month: 'short' })} ${updatedDate.getFullYear()}`;
            const monthData = approvalData.find(m => `${m.month} ${m.year}` === monthYear);
            if (monthData) {
              monthData.approvals++;
            }
          }
        });

        // Update state
        setDashboardData({
          total_documents,
          pending_approval,
          approved_this_month,
          expiring_certificates: expiringCount
        });
        setDocumentActivity(last6Months.map(m => ({
          name: m.month,
          documents: m.documents
        })));
        setApprovalTrend(approvalData.map(m => ({
          name: m.month,
          approvals: m.approvals
        })));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* <h1 className="text-3xl font-bold mb-8">Dashboard</h1> */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Documents" 
          value={dashboardData.total_documents} 
          icon={<FileText size={32} />} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Pending Approvals" 
          value={dashboardData.pending_approval} 
          icon={<Clock size={32} />} 
          color="text-yellow-600" 
        />
        <StatCard 
          title="Expiring Certificates" 
          value={dashboardData.expiring_certificates} 
          icon={<AlertTriangle size={32} />} 
          color="text-red-600" 
        />
        <StatCard 
          title="Approved This Month" 
          value={dashboardData.approved_this_month} 
          icon={<CheckCircle size={32} />} 
          color="text-green-600" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Document Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={documentActivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="documents" fill="#3B82F6" name="Documents Created" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        
        
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Approval Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={approvalTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="approvals" 
                name="Documents Approved"
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;