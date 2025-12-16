import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPoll } from '../api';
import { socket } from '../socket';

const TeacherSetup = () => {
  const [question, setQuestion] = useState('');
  const [timeLimit, setTimeLimit] = useState('60');
  const [correctOptionId, setCorrectOptionId] = useState(1);
  const [options, setOptions] = useState([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const addOption = () => {
    const newId = options.length + 1;
    setOptions([...options, { id: newId, text: '' }]);
  };

  const updateOptionText = (id, text) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    // check if all options have text
    const emptyOptions = options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      alert('Please fill all options');
      return;
    }

    setLoading(true);

    try {
      const pollData = {
        question: question,
        options: options.map(opt => ({
          text: opt.text,
          isCorrect: opt.id === correctOptionId,
        })),
        timeLimit: parseInt(timeLimit),
      };

      const savedPoll = await createPoll(pollData);
      console.log('Poll created:', savedPoll);
      
      socket.emit('teacherJoin');
      
      navigate('/teacher/dashboard', { state: { pollId: savedPoll._id } });
    } catch (error) {
      console.log('Error creating poll:', error);
      alert('Failed to create poll');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-2xl w-full border border-gray-100">
        
        <div className="mb-6">
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

        <p className="text-sm text-gray-500 mb-6">
          you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
        </p>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">
              Enter your question
            </label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:border-[#7765DA]"
            >
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
              <option value="90">90 seconds</option>
              <option value="120">120 seconds</option>
            </select>
          </div>
          <div className="relative">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7765DA] transition-colors resize-none"
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-400">
              {question.length}/100
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-8 mb-4">
            <span className="text-sm font-medium text-gray-700 flex-1">Edit Options</span>
            <span className="text-sm font-medium text-gray-700 w-32">Is It Correct?</span>
          </div>

          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-6 h-6 rounded-full bg-[#7765DA] flex items-center justify-center text-xs text-white">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) => updateOptionText(option.id, e.target.value)}
                  placeholder="Option text"
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:bg-gray-200"
                />
              </div>
              <div className="flex items-center gap-4 w-32">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="correctOption"
                    checked={correctOptionId === option.id}
                    onChange={() => setCorrectOptionId(option.id)}
                    className="w-4 h-4 accent-[#7765DA]"
                  />
                  <span className="text-sm text-gray-600">Yes</span>
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    checked={correctOptionId !== option.id}
                    readOnly
                    className="w-4 h-4 accent-[#7765DA]"
                  />
                  <span className="text-sm text-gray-600">No</span>
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={addOption}
            className="mt-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            + Add More option
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleAskQuestion}
            disabled={loading}
            className="px-8 py-3 bg-[#7765DA] text-white rounded-full font-medium hover:bg-[#6654C9] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Ask Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSetup;
