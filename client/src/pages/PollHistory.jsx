import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPolls } from '../api';

const PollHistory = () => {
  const navigate = useNavigate();
  const [pollHistory, setPollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const polls = await getPolls();
      setPollHistory(polls);
    } catch (error) {
      console.log('Error fetching polls:', error);
    }
    setLoading(false);
  };

  const calculatePercentage = (option, poll) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    if (totalVotes === 0) return 0;
    return Math.round((option.votes / totalVotes) * 100);
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
      <div className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-normal text-gray-800">
            View <span className="font-bold">Poll History</span>
          </h1>
        </div>

        {pollHistory.length > 0 ? (
          <div className="space-y-8">
            {pollHistory.map((poll, pollIndex) => (
              <div key={poll._id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Question {pollIndex + 1}
                </h3>

                <div className="bg-[#373737] text-white p-4 rounded-lg mb-4">
                  <p className="text-sm">{poll.question}</p>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = calculatePercentage(option, poll);
                    const isCorrect = option.isCorrect;
                    
                    return (
                      <div
                        key={index}
                        className={`relative overflow-hidden rounded-lg border-2 ${
                          isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}
                      >
                        <div
                          className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                            isCorrect ? 'bg-green-400' : 'bg-[#7765DA]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                        
                        <div className="relative flex items-center justify-between p-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                              isCorrect ? 'bg-green-500' : 'bg-[#5767D0]'
                            }`}>
                              {isCorrect ? '✓' : String.fromCharCode(65 + index)}
                            </span>
                            <span className={`font-medium ${isCorrect ? 'text-green-700' : 'text-gray-800'}`}>
                              {option.text}
                              {isCorrect && <span className="ml-2 text-xs text-green-600">(Correct)</span>}
                            </span>
                          </div>
                          <span className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-gray-700'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <p className="text-gray-500">No poll history yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;
