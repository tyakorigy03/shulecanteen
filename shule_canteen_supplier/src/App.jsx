import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AddItemPage from './pages/AddItemPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import DeliveriesPage from './pages/DeliveriesPage';
import DeliveryDetailsPage from './pages/DeliveryDetailsPage';
import FleetPage from './pages/FleetPage';
import ClientsPage from './pages/ClientsPage';
import RegisterSupplierPage from './pages/RegisterSupplierPage';
import AccountPage from './pages/AccountPage';
import MainLayout from './components/MainLayout';
import DispatchNewPage from './pages/DispatchNewPage';
import RegisterDriverPage from './pages/RegisterDriverPage';
import DriverProfilePage from './pages/DriverProfilePage';
import PrivateRoute from './components/PrivateRoute';

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/menu" element={<MenuPage />} />
                    <Route path="/menu/add" element={<AddItemPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />
                    <Route path="/deliveries" element={<DeliveriesPage />} />
                    <Route path="/deliveries/:id" element={<DeliveryDetailsPage />} />
                    <Route path="/deliveries/add" element={<DispatchNewPage />} />
                    <Route path="/deliveries/new" element={<DispatchNewPage />} />
                    <Route path="/fleet" element={<FleetPage />} />
                    <Route path="/fleet/register" element={<RegisterDriverPage />} />
                    <Route path="/fleet/driver/:id" element={<DriverProfilePage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/register-supplier" element={<RegisterSupplierPage />} />
                    <Route path="/account" element={<AccountPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;
