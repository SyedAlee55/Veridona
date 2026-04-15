import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './Pages/LandingPage';
import LoginSignup from './Pages/LoginSignup';

// Donor Pages
import DonorDashboard from './Pages/Donor/DonorDashboard';
import DonationPage from './Pages/Donor/DonationPage';
import ClaimNFTPage from './Pages/Donor/ClaimNFTPage';
import CampaignsPage from './Pages/Donor/CampaignsPage';
import FAQPage from './Pages/Donor/FAQPage';
import ContactPage from './Pages/Donor/ContactPage';
import TrackDonationPage from './Pages/Donor/TrackDonationPage';

// Receiver Pages
import ReceiverDashboard from './Pages/ReceiverDashboard';
import ReceiverVerifyPage from './Pages/Receiver/ReceiverVerifyPage';
import MyCampaignsPage from './Pages/Receiver/MyCampaignsPage';
import ReceiverFAQPage from './Pages/Receiver/FAQPage';
import ReceiverContactPage from './Pages/Receiver/ContactPage';

// Admin Pages
import AdminDashboard from './Pages/AdminDashboard';

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

          {/* Donor Routes */}
          <Route element={<ProtectedRoute allowedRoles={['donor']} />}>
            <Route path="/donor" element={<DonorDashboard />} />
            <Route path="/donor/donation" element={<DonationPage />} />
            <Route path="/donor/claim-nft" element={<ClaimNFTPage />} />
            <Route path="/donor/campaigns" element={<CampaignsPage />} />
            <Route path="/donor/faq" element={<FAQPage />} />
            <Route path="/donor/contact" element={<ContactPage />} />
            <Route path="/donor/track-donation" element={<TrackDonationPage />} />
          </Route>

          {/* Receiver Routes */}
          <Route element={<ProtectedRoute allowedRoles={['receiver']} />}>
            <Route path="/receiver" element={<ReceiverDashboard />} />
            <Route path="/receiver/verify" element={<ReceiverVerifyPage />} />
            <Route path="/receiver/campaigns" element={<MyCampaignsPage />} />
            <Route path="/receiver/faq" element={<ReceiverFAQPage />} />
            <Route path="/receiver/contact" element={<ReceiverContactPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
