import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const StudentSetup = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    setLoading(true);
    setError('');
    
    socket.once('nameError', (message) => {
      setError(message);
      setLoading(false);
    });
    
    socket.once('joinSuccess', (data) => {
      localStorage.setItem('studentName', name.trim());
      setLoading(false);
      
      // if there's an active poll, go directly to poll page
      if (data.poll && data.timeLeft > 0) {
        navigate('/student/poll', { state: { poll: data.poll, timeLeft: data.timeLeft } });
      } else {
        navigate('/student/waiting');
      }
    });
    
    socket.emit('studentJoin', name.trim());
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
        
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#7765DA] text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Intervue Poll
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-normal text-gray-800 mb-2">
          Let's <span className="font-bold">Get Started</span>
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          If you're a student, you'll be able to <span className="font-semibold">submit your answers</span>, participate in live polls, and see how your responses compare with your classmates
        </p>

        <div className="text-left mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Rahul Bajaj"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:border-[#7765DA] transition-colors ${
              error ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>

        <button
          onClick={handleContinue}
          disabled={!name.trim() || loading}
          className={`w-48 py-3 rounded-full font-medium transition-all ${
            name.trim() && !loading
              ? 'bg-[#7765DA] text-white hover:bg-[#6654C9]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? 'Joining...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default StudentSetup;
