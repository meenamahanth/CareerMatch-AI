import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, LogOut, Shield } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center">
          <SettingsIcon className="mr-2 text-blue-600" /> Account Settings
        </h2>
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center"><Shield size={18} className="mr-2 text-gray-500" /> Authentication</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Address</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button disabled className="text-sm text-gray-400 font-medium cursor-not-allowed">Change Password (Disabled in Demo)</button>
            </div>
          </div>

          <div>
             <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center"><LogOut size={18} className="mr-2 text-gray-500" /> Session</h3>
             <p className="text-sm text-gray-600 mb-4">Sign out of your active session on this device.</p>
             <button onClick={logout} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-md transition-colors text-sm font-medium">
               Sign Out Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
