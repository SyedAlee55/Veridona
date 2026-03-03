import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import LoginSignup from './Pages/LoginSignup';
import DonorDashboard from './Pages/Donor/DonorDashboard';
import ReceiverDashboard from './Pages/ReceiverDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginSignup />} />

          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route path="/donor" element={<DonorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['receiver']} />}>
            <Route path="/receiver" element={<ReceiverDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
