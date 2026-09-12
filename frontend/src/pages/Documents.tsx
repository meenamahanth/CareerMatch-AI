import { useState } from 'react';
import client from '../api/client';
import { BookOpen, Upload, Send, AlertCircle, FileText } from 'lucide-react';

export default function Documents() {
  const [file, setFile] = useState<File | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [chat, setChat] = useState<{q: string, a: string}[]>([]);

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
      const res = await client.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDocumentId(res.data.document_id);
      setFile(null);
      setChat([]);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !documentId) return;

    setAsking(true);
    const currentQ = question;
    setQuestion('');
    
    // Add temporary optimistic question
    setChat(prev => [...prev, { q: currentQ, a: '...' }]);

    try {
      const res = await client.post(`/documents/${documentId}/ask`, { question: currentQ });
      setChat(prev => prev.map((item, idx) => idx === prev.length - 1 ? { q: currentQ, a: res.data.answer } : item));
    } catch (err: any) {
      setChat(prev => prev.map((item, idx) => idx === prev.length - 1 ? { q: currentQ, a: 'Error: ' + (err.response?.data?.detail || 'Failed to get answer.') } : item));
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 flex items-center">
          <BookOpen className="mr-2 text-blue-600" /> Document Q&A
        </h2>
        <p className="text-gray-600 mb-6">Upload a PDF document to dynamically ask contextual questions using Retrieval-Augmented Generation (RAG).</p>
        
        {error && <div className="p-4 rounded-md mb-6 bg-red-50 text-red-800 flex items-center"><AlertCircle size={20} className="mr-2" /> {error}</div>}

        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-4 items-end border-2 border-dashed border-gray-200 rounded-xl p-4 sm:p-6 bg-gray-50">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select PDF Document</label>
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
            className="flex items-center justify-center w-full sm:w-auto bg-purple-600 text-white px-6 py-2.5 rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Uploading...</> : <><Upload size={18} className="mr-2" /> Upload & Index</>}
          </button>
        </form>

        {documentId && (
          <div className="mt-4 inline-flex items-center text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <FileText size={14} className="mr-1" /> Active Document Indexed
          </div>
        )}
      </div>

      <div className={`flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${!documentId ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {!documentId ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Upload a document above to start chatting.
            </div>
          ) : chat.length === 0 ? (
             <div className="flex items-center justify-center h-full text-gray-500 text-center">
              Document indexed successfully.<br/>Ask a question below based on the document's contents.
            </div>
          ) : (
            chat.map((c, idx) => (
              <div key={idx} className="space-y-4">
                <div className="flex justify-end">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-br-none p-4 max-w-[85%] shadow-sm">
                    {c.q}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none p-4 max-w-[85%] shadow-sm whitespace-pre-wrap">
                    {c.a === '...' ? (
                      <div className="flex space-x-1 items-center h-6">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    ) : c.a}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={askQuestion} className="flex space-x-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the document..."
              className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={asking || !documentId}
            />
            <button 
              type="submit" 
              disabled={asking || !question.trim() || !documentId}
              className="bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center justify-center w-14"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
