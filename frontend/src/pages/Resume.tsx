import { useState, useEffect } from 'react';
import client from '../api/client';
import { Upload, File, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function Resume() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Try to fetch latest resume on load
    client.get('/resumes')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setResumeData(res.data[0]);
        }
      }).catch(console.error);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are currently supported.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await client.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeData(res.data.resume);
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload and parse resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Resume Parser</h2>
        <p className="text-gray-600 mb-6">Upload your PDF resume. Our AI will automatically extract your skills, experience, and education to match you with the best internships.</p>
        
        {error && (
          <div className="p-4 rounded-md mb-6 bg-red-50 text-red-800 flex items-center">
            <AlertCircle size={20} className="mr-2" /> {error}
          </div>
        )}

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF File</label>
            <input 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button 
            type="submit" 
            disabled={!file || loading}
            className="flex items-center justify-center w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Parsing...</>
            ) : (
              <><Upload size={18} className="mr-2" /> Upload & Parse</>
            )}
          </button>
        </form>
      </div>

      {resumeData && resumeData.parsed_json && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <CheckCircle className="text-green-500 mr-2" /> Structured Resume Data
            </h3>
            <span className="text-sm text-gray-500">File: {resumeData.filename}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {resumeData.parsed_json.skills?.map((skill: any, idx: number) => (
                  <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {skill.name}
                  </span>
                ))}
                {(!resumeData.parsed_json.skills || resumeData.parsed_json.skills.length === 0) && <p className="text-gray-500 text-sm">No skills found.</p>}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-4 text-gray-800 border-b pb-2">Experience</h4>
              <div className="space-y-4">
                {resumeData.parsed_json.experiences?.map((exp: any, idx: number) => (
                  <div key={idx} className="border-l-2 border-gray-200 pl-4">
                    <p className="font-bold text-gray-900">{exp.title}</p>
                    <p className="text-sm text-gray-600">{exp.company} • {exp.start_date} - {exp.end_date || 'Present'}</p>
                    {exp.description && <p className="text-sm mt-1 text-gray-700 line-clamp-2">{exp.description}</p>}
                  </div>
                ))}
                {(!resumeData.parsed_json.experiences || resumeData.parsed_json.experiences.length === 0) && <p className="text-gray-500 text-sm">No experience found.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
