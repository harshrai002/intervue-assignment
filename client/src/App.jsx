import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import StudentSetup from './pages/StudentSetup';
import TeacherSetup from './pages/TeacherSetup';
import StudentPoll from './pages/StudentPoll';
import StudentWaiting from './pages/StudentWaiting';
import TeacherDashboard from './pages/TeacherDashboard';
import PollHistory from './pages/PollHistory';
import KickedOut from './pages/KickedOut';

function App() {
  return (
    <Router>
      <Routes>
        {/* Welcome / Role Selection */}
        <Route path="/" element={<Welcome />} />
        
        {/* Student Routes */}
        <Route path="/student/setup" element={<StudentSetup />} />
        <Route path="/student/waiting" element={<StudentWaiting />} />
        <Route path="/student/poll" element={<StudentPoll />} />
        <Route path="/student/kicked" element={<KickedOut />} />
        
        {/* Teacher Routes */}
        <Route path="/teacher/setup" element={<TeacherSetup />} />
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/history" element={<PollHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
