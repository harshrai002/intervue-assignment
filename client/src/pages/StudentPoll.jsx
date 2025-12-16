import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { socket } from '../socket';

const StudentPoll = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPoll, setCurrentPoll] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const poll = location.state?.poll;
    const initialTime = location.state?.timeLeft;
    
    if (poll) {
      setCurrentPoll(poll);
      setTimeLeft(initialTime || poll.timeLimit || 60);
    }

    socket.on('timerUpdate', (time) => {
      setTimeLeft(time);
    });

    socket.on('timeUp', () => {
      setHasSubmitted(true);
    });

    socket.on('pollUpdate', (updatedPoll) => {
      setCurrentPoll(updatedPoll);
    });

    socket.on('newPoll', (data) => {
      setCurrentPoll(data.poll);
      setTimeLeft(data.timeLeft);
      setSelectedOption(null);
      setHasSubmitted(false);
    });

    socket.on('kicked', () => {
      navigate('/student/kicked');
    });

    return () => {
      socket.off('timerUpdate');
      socket.off('timeUp');
      socket.off('pollUpdate');
      socket.off('newPoll');
      socket.off('kicked');
    };
  }, [location.state, navigate]);

  const handleSubmit = () => {
    if (selectedOption !== null && currentPoll) {
      socket.emit('submitAnswer', {
        pollId: currentPoll._id,
        optionIndex: selectedOption,
      });
      setHasSubmitted(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePercentage = (option) => {
    if (!currentPoll) return 0;
    const totalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
  };

  if (!currentPoll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">No active poll</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-lg w-full border border-gray-100">
        
        <div className="flex items-center justify-between mb-6">
          <span className="text-lg font-semibold text-gray-800">
            Question 1
          </span>
          <div className={`flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500' : 'text-[#F97316]'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span className="font-medium">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="bg-[#373737] text-white p-4 rounded-lg mb-4">
          <p className="text-sm">{currentPoll.question}</p>
        </div>

        <div className="space-y-3 mb-6">
          {currentPoll.options.map((option, index) => {
            const percentage = calculatePercentage(option);
            const isCorrect = option.isCorrect;
            const isSelected = selectedOption === index;
            
            return (
              <div
                key={index}
                onClick={() => !hasSubmitted && setSelectedOption(index)}
                className={`relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all ${
                  hasSubmitted
                    ? isCorrect 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200'
                    : isSelected
                    ? 'border-[#7765DA] bg-[#F8F7FF]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {hasSubmitted && (
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${isCorrect ? 'bg-green-400' : 'bg-[#7765DA]'}`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      hasSubmitted 
                        ? isCorrect 
                          ? 'bg-green-500 text-white' 
                          : 'bg-[#5767D0] text-white'
                        : 'bg-[#7765DA] text-white'
                    }`}>
                      {hasSubmitted && isCorrect ? '✓' : String.fromCharCode(65 + index)}
                    </span>
                    <span className={`font-medium ${hasSubmitted && isCorrect ? 'text-green-700' : 'text-gray-800'}`}>
                      {option.text}
                    </span>
                  </div>
                  {hasSubmitted && (
                    <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!hasSubmitted ? (
          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className={`px-12 py-3 rounded-full font-medium transition-all ${
                selectedOption !== null
                  ? 'bg-[#7765DA] text-white hover:bg-[#6654C9]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Submit
            </button>
          </div>
        ) : (
          <p className="text-center text-gray-600 font-medium">
            Wait for the teacher to ask a new question..
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentPoll;
