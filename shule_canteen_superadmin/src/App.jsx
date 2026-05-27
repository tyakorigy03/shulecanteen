import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import FleetPage from './pages/FleetPage';
import SuppliersPage from './pages/SuppliersPage';
import AccountPage from './pages/AccountPage';
import CanteensPage from './pages/CanteensPage';
import CanteenDetailsPage from './pages/CanteenDetailsPage';
import RegisterCanteenPage from './pages/RegisterCanteenPage';
import RegisterSupplierPage from './pages/RegisterSupplierPage';
import MainLayout from './components/MainLayout';
import RegisterDriverPage from './pages/RegisterDriverPage';
import DriverProfilePage from './pages/DriverProfilePage';
import SupplierDetailsPage from './pages/SupplierDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <AuthProvider>
            <Router basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes */}
                    <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/suppliers" element={<SuppliersPage />} />
                        <Route path="/suppliers/:id" element={<SupplierDetailsPage />} />
                        <Route path="/suppliers/register" element={<RegisterSupplierPage />} />
                        <Route path="/applications" element={<ApplicationsPage />} />
                        <Route path="/canteens" element={<CanteensPage />} />
                        <Route path="/canteens/:id" element={<CanteenDetailsPage />} />
                        <Route path="/canteens/register" element={<RegisterCanteenPage />} />
                        <Route path="/orders" element={<OrdersPage />} />
                        <Route path="/orders/:id" element={<OrderDetailsPage />} />
                        <Route path="/fleet" element={<FleetPage />} />
                        <Route path="/fleet/register" element={<RegisterDriverPage />} />
                        <Route path="/fleet/driver/:id" element={<DriverProfilePage />} />
                        <Route path="/account" element={<AccountPage />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
