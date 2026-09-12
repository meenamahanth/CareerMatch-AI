import { useState } from 'react';
import client from '../api/client';
import { MessageSquare, Play, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function Interview() {
  const [session, setSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const startSession = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await client.post('/interview/sessions', {
        target_role: role,
        difficulty: difficulty
      });
      setSession(res.data.session);
      setMessages(res.data.messages);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start interview. Ensure you have an uploaded resume.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !session) return;

    setSubmitting(true);
    const currentAnswer = answer;
    setAnswer('');
    
    // Optimistically add user message
    setMessages(prev => [...prev, { role: 'user', content: currentAnswer }]);

    try {
      const res = await client.post(`/interview/sessions/${session.id}/message`, {
        content: currentAnswer
      });
      setMessages(res.data.messages);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <MessageSquare className="mr-2 text-blue-600" /> AI Mock Interview
        </h2>
        
        {!session ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={startSession} disabled={loading} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50">
                {loading ? 'Starting...' : <><Play size={18} className="mr-2" /> Start</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div>
              <span className="font-semibold text-blue-900">{role}</span>
              <span className="text-blue-700 text-sm ml-2">({difficulty})</span>
            </div>
            <button onClick={() => setSession(null)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">End Session</button>
          </div>
        )}
        
        {error && <div className="mt-4 p-3 rounded-md bg-red-50 text-red-800 text-sm flex items-center"><AlertCircle size={16} className="mr-2" /> {error}</div>}
      </div>

      {session && (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
            {messages.map((msg: any, idx: number) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.role === 'user' && msg.score !== undefined && msg.score !== null && (
                    <div className="mt-3 pt-3 border-t border-blue-400/50 bg-blue-700/50 rounded-lg p-3">
                      <div className="flex items-center mb-1">
                        <CheckCircle size={14} className="text-green-300 mr-1" />
                        <span className="text-xs font-bold text-green-100">AI Evaluation: {msg.score}/10</span>
                      </div>
                      <p className="text-xs text-blue-100">{msg.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {submitting && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-500 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-white border-t border-gray-200">
            <form onSubmit={submitAnswer} className="flex space-x-4">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-14"
                disabled={submitting}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(e); } }}
              />
              <button 
                type="submit" 
                disabled={submitting || !answer.trim()}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center w-14"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
