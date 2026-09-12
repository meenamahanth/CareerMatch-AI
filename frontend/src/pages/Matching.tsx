import { useState } from 'react';
import client from '../api/client';
import { Target, AlertCircle, Building2, MapPin, Briefcase, Clock, ChevronDown, ChevronUp } from 'lucide-react';

export default function Matching() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/matching/internships', { top_k: 5 });
      setMatches(res.data.matches);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch internship matches. Make sure you have uploaded a resume first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="mr-2 text-blue-600" /> Internship Matches
          </h2>
          <p className="text-gray-600 mt-1">Discover opportunities tailored to your resume using semantic search.</p>
        </div>
        <button 
          onClick={fetchMatches}
          disabled={loading}
          className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
        >
          {loading ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Finding...</>
          ) : 'Find Matches'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-red-50 text-red-800 flex items-center border border-red-100">
          <AlertCircle size={20} className="mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {!loading && matches.length === 0 && !error && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Target size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No matches generated yet</h3>
          <p className="text-gray-500">Click the button above to run the AI matching engine against your active resume.</p>
        </div>
      )}

      <div className="space-y-4">
        {matches.map((match: any) => (
          <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{match.internship.title}</h3>
                  <div className="flex items-center text-gray-600 mt-2 space-x-4">
                    <span className="flex items-center text-sm"><Building2 size={16} className="mr-1" /> {match.internship.company}</span>
                    <span className="flex items-center text-sm"><MapPin size={16} className="mr-1" /> {match.internship.location}</span>
                    <span className="flex items-center text-sm"><Briefcase size={16} className="mr-1" /> {match.internship.work_mode}</span>
                    <span className="flex items-center text-sm"><Clock size={16} className="mr-1" /> {match.internship.duration}</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-4 border-blue-100 relative">
                    <span className="text-lg font-bold text-blue-700">{Math.round(match.total_score * 100)}%</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 uppercase font-semibold">Match Score</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 text-sm line-clamp-2">{match.internship.description}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded">Category: {match.internship.category}</span>
              </div>

              <button 
                onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                className="text-sm font-medium text-blue-600 flex items-center hover:text-blue-800"
              >
                {expandedId === match.id ? <><ChevronUp size={16} className="mr-1" /> Hide AI Analysis</> : <><ChevronDown size={16} className="mr-1" /> Show AI Analysis</>}
              </button>
            </div>

            {expandedId === match.id && (
              <div className="bg-gray-50 p-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Matched Skills</h4>
                    <p className="text-sm text-gray-700">{match.matched_skills || 'None explicitly identified.'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-2">Potential Skill Gaps</h4>
                    <p className="text-sm text-gray-700">{match.missing_skills || 'None explicitly identified.'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Why this matches your profile</h4>
                  <p className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">{match.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
