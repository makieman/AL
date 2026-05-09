import { BrowserRouter, Routes, Route } from 'react-router-dom';
import WalletProviderWrapper from './components/WalletProvider';
import { ToastProvider } from './components/Toast';
import NavBar from './components/NavBar';
import Landing from './pages/Landing';
import Doctor from './pages/Doctor';
import Patient from './pages/Patient';
import Verify from './pages/Verify';
import Hospital from './pages/Hospital';

export default function App() {
  return (
    <BrowserRouter>
      <WalletProviderWrapper>
        <ToastProvider>
          <div className="min-h-dvh bg-[#f0fdf4] pb-16">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/doctor" element={<Doctor />} />
              <Route path="/patient" element={<Patient />} />
              <Route path="/hospital" element={<Hospital />} />
              <Route path="/verify" element={<Verify />} />
            </Routes>
            <NavBar />
          </div>
        </ToastProvider>
      </WalletProviderWrapper>
    </BrowserRouter>
  );
}
