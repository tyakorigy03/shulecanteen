import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MainLayout from './components/MainLayout';
import RegisterSupplierPage from './pages/RegisterSupplierPage';
import RegisterCanteenPage from './pages/RegisterCanteenPage';
import TrackApplicationPage from './pages/TrackApplicationPage';
import CanteenProfilePage from './pages/CanteenProfilePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/track-application" element={<TrackApplicationPage />} />
                    <Route path="/profile/canteen/:id" element={<CanteenProfilePage />} />
                </Route>
                <Route path="/register-supplier" element={<RegisterSupplierPage />} />
                <Route path="/register-canteen" element={<RegisterCanteenPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
