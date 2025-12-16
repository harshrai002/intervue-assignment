import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const StudentWaiting = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // listen for new poll
    socket.on('newPoll', (data) => {
      console.log('Received poll:', data);
      if (data.poll) {
        navigate('/student/poll', { state: { poll: data.poll, timeLeft: data.timeLeft } });
      }
    });

    socket.on('kicked', () => {
      navigate('/student/kicked');
    });

    // ask server for current poll when page loads
    socket.emit('getCurrentPoll');

    return () => {
      socket.off('newPoll');
      socket.off('kicked');
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
        
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#7765DA] text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Intervue Poll
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 border-4 border-[#7765DA] border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800">
          Wait for the teacher to ask questions..
        </h2>
      </div>
    </div>
  );
};

export default StudentWaiting;
