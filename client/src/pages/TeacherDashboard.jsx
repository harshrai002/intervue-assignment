import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socket } from '../socket';
import { getPollById } from '../api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pollId = location.state?.pollId;
    
    if (pollId) {
      fetchPoll(pollId);
    } else {
      setLoading(false);
    }

    socket.on('usersUpdate', (users) => {
      setParticipants(users);
    });

    socket.on('pollUpdate', (updatedPoll) => {
      setCurrentPoll(updatedPoll);
    });

    socket.on('timerUpdate', (time) => {
      console.log('Timer update:', time);
      setTimeLeft(time);
    });

    socket.on('currentPoll', (data) => {
      console.log('Current poll:', data);
      setCurrentPoll(data.poll);
      setTimeLeft(data.timeLeft);
    });

    socket.on('newPoll', (data) => {
      setCurrentPoll(data.poll);
      setTimeLeft(data.timeLeft);
    });

    socket.emit('teacherJoin');

    return () => {
      socket.off('usersUpdate');
      socket.off('pollUpdate');
      socket.off('timerUpdate');
      socket.off('currentPoll');
      socket.off('newPoll');
    };
  }, [location.state]);

  const fetchPoll = async (pollId) => {
    try {
      const poll = await getPollById(pollId);
      setCurrentPoll(poll);
      setTimeLeft(poll.timeLimit || 60);
    } catch (error) {
      console.log('Error:', error);
    }
    setLoading(false);
  };

  const handleKickOut = (studentId) => {
    socket.emit('kickStudent', studentId);
  };

  const calculatePercentage = (option) => {
    if (!currentPoll) return 0;
    const totalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate('/teacher/history')}
          className="flex items-center gap-2 bg-[#7765DA] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6654C9] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          View Poll history
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Question</h2>
            {currentPoll && (
              <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500' : 'text-[#F97316]'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                <span className="font-medium">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {currentPoll ? (
            <>
              <div className="bg-[#373737] text-white p-4 rounded-lg mb-4">
                <p className="text-sm">{currentPoll.question}</p>
              </div>

              <div className="space-y-3 mb-6">
                {currentPoll.options.map((option, index) => {
                  const percentage = calculatePercentage(option);
                  return (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-lg border border-gray-200"
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-[#7765DA] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                      
                      <div className="relative flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#5767D0] flex items-center justify-center text-xs font-medium text-white">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-gray-800 font-medium">{option.text}</span>
                        </div>
                        <span className="text-gray-700 font-semibold">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active poll. Create a new question!
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => navigate('/teacher/setup')}
              className="flex items-center gap-2 bg-[#7765DA] text-white px-6 py-3 rounded-full font-medium hover:bg-[#6654C9] transition-colors"
            >
              + Ask a new question
            </button>
          </div>
        </div>
      </div>

      {/* Participants Panel */}
      <div className="fixed bottom-6 right-6">
        {showParticipants ? (
          <div className="bg-white rounded-xl shadow-2xl w-72 overflow-hidden relative border border-gray-200">
            <button
              onClick={() => setShowParticipants(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="py-3 px-4 border-b">
              <span className="text-sm font-medium text-[#7765DA]">Participants</span>
            </div>

            <div className="max-h-64 overflow-y-auto">
              {participants.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b">
                      <th className="text-left py-2 px-4 font-medium">Name</th>
                      <th className="text-left py-2 px-4 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id} className="border-b last:border-b-0">
                        <td className="py-2 px-4 text-sm text-gray-700">{p.name}</td>
                        <td className="py-2 px-4">
                          <button
                            onClick={() => handleKickOut(p.id)}
                            className="text-[#5767D0] text-sm font-medium hover:text-[#4F0DCE]"
                          >
                            Kick out
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-400 text-sm">
                  No students joined yet
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowParticipants(true)}
            className="w-14 h-14 bg-[#7765DA] rounded-xl flex items-center justify-center shadow-lg hover:bg-[#6654C9] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
