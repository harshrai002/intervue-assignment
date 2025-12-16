import { useNavigate } from 'react-router-dom';

const KickedOut = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-gray-100">
        
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#7765DA] text-white text-xs font-medium px-3 py-1.5 rounded-full">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
            Intervue Poll
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          You've been Kicked out !
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Looks like the teacher has removed you from the poll system. Please try again sometime.
        </p>

        <div>
          <button
            onClick={() => navigate('/')}
            className="w-48 py-3 bg-[#7765DA] text-white rounded-full font-medium hover:bg-[#6654C9] transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickedOut;
