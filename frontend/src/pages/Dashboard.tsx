import { useState, useEffect } from 'react';
import client from '../api/client';
import { Target, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/profile')
      .then(res => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!</h1>
        <p className="text-gray-600 text-lg">Your AI-powered career assistant is ready.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Resume Status</h3>
          <p className="text-gray-500 mb-4 flex-1">Keep your resume updated to get the most accurate internship matches.</p>
          <Link to="/resume" className="text-blue-600 font-medium hover:text-blue-700">Update Resume &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <Target size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Find Opportunities</h3>
          <p className="text-gray-500 mb-4 flex-1">Discover internships matched to your unique skills using our AI engine.</p>
          <Link to="/matches" className="text-green-600 font-medium hover:text-green-700">View Matches &rarr;</Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Interview Ready</h3>
          <p className="text-gray-500 mb-4 flex-1">Practice with our AI mock interviewer to boost your confidence.</p>
          <Link to="/interview" className="text-purple-600 font-medium hover:text-purple-700">Start Practice &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
