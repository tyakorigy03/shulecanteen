import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ListingPage from './pages/ListingPage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import CreatePurchasePage from './pages/CreatePurchasePage';
import PurchaseCheckoutPage from './pages/PurchaseCheckoutPage';
import PurchaseConfirmationPage from './pages/PurchaseConfirmationPage';
import InventoryPage from './pages/InventoryPage';
import SuppliersPage from './pages/SuppliersPage';
import ReportsPage from './pages/ReportsPage';
import PurchaseReceiptPage from './pages/PurchaseReceiptPage';
import TrackOrderPage from './pages/TrackOrderPage';
import AccountPage from './pages/AccountPage';
import CashoutRequestPage from './pages/CashoutRequestPage';
import NotificationsPage from './pages/NotificationsPage';
import StockAdjustmentPage from './pages/StockAdjustmentPage';
import MainLayout from './components/MainLayout';
import { CartProvider } from './context/CartContext';
import { PurchaseProvider } from './context/PurchaseContext';
import PrivateRoute from './components/PrivateRoute';
import DiscoverPage from './pages/DiscoverPage';
import AddMenuItem from './pages/AddMenuItem';

function App() {
    return (
        <Router basename={import.meta.env.BASE_URL}>
            <CartProvider>
                <PurchaseProvider>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/listing" element={<ListingPage />} />
                            <Route path="/menu/add-item" element={<AddMenuItem />} />
                            <Route path="/sales" element={<SalesPage />} />
                            <Route path="/purchases" element={<PurchasesPage />} />
                            <Route path="/purchases/new" element={<CreatePurchasePage />} />
                            <Route path="/purchase/discover/:id" element={<DiscoverPage />} />
                            <Route path="/purchases/checkout" element={<PurchaseCheckoutPage />} />
                            <Route path="/purchases/confirm" element={<PurchaseConfirmationPage />} />
                            <Route path="/purchases/receipt" element={<PurchaseReceiptPage />} />
                            <Route path="/purchases/track" element={<TrackOrderPage />} />
                            <Route path="/inventory" element={<InventoryPage />} />
                            <Route path="/inventory/adjust" element={<StockAdjustmentPage />} />
                            <Route path="/suppliers" element={<SuppliersPage />} />
                            <Route path="/reports" element={<ReportsPage />} />
                            <Route path="/account" element={<AccountPage />} />
                            <Route path="/account/cashout" element={<CashoutRequestPage />} />
                            <Route path="/notifications" element={<NotificationsPage />} />
                        </Route>
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </PurchaseProvider>
            </CartProvider>
        </Router>
    );
}

export default App;
