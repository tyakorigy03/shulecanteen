import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import NotificationsPage from './pages/NotificationsPage';
import MainLayout from './components/MainLayout';
import { DeliveryProvider } from './context/DeliveryContext';
import PrivateRoute from './components/PrivateRoute';

// Repurposing as "Delivery Details"
import DeliveryDetailsPage from './pages/CreatePurchasePage';

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <DeliveryProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/delivery/:id" element={<DeliveryDetailsPage />} />
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </DeliveryProvider>
        </Router>
    );
}

export default App;
