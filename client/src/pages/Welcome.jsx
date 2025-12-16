import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole === 'student') {
      navigate('/student/setup');
    } else if (selectedRole === 'teacher') {
      navigate('/teacher/setup');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-xl w-full text-center">
        
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#7765DA] text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Intervue Poll
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-normal text-gray-800 mb-2">
          Welcome to the <span className="font-bold">Live Polling System</span>
        </h1>
        
        <p className="text-sm text-gray-500 mb-8">
          Please select the role that best describes you to begin using the live polling system
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Student Card */}
          <div
            onClick={() => setSelectedRole('student')}
            className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
              selectedRole === 'student'
                ? 'border-[#7765DA] bg-[#F8F7FF]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-800 mb-1">I'm a Student</h3>
            <p className="text-xs text-gray-500">
            Join polls, answer questions, and see results
            </p>
          </div>

          {/* Teacher Card */}
          <div
            onClick={() => setSelectedRole('teacher')}
            className={`flex-1 p-4 border-2 rounded-lg cursor-pointer transition-all text-left ${
              selectedRole === 'teacher'
                ? 'border-[#7765DA] bg-[#F8F7FF]'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <h3 className="font-semibold text-gray-800 mb-1">I'm a Teacher</h3>
            <p className="text-xs text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedRole}
          className={`w-48 py-3 rounded-full font-medium transition-all ${
            selectedRole
              ? 'bg-[#7765DA] text-white hover:bg-[#6654C9]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Welcome;
