import { useState, useEffect, useRef } from 'react';
import { HiHome, HiPresentationChartLine, HiShoppingCart, HiDotsHorizontal, HiOutlineUserCircle, HiOutlineBell, HiOutlineTrash, HiX, HiPlus, HiOutlineTag, HiChevronLeft, HiOutlineShoppingBag, HiOutlineUser, HiOutlineAcademicCap, HiOutlineCurrencyDollar, HiOutlineBackspace, HiOutlineCamera, HiOutlineQrcode } from 'react-icons/hi';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { usePurchase } from '../context/PurchaseContext';
import { useAuth } from '../context/AuthContext';
import { useKeyboardStatus } from '../hooks/useKeyboardStatus';
import { db } from '../config/firebase';
import { doc, getDoc, collection, writeBatch, serverTimestamp, increment } from 'firebase/firestore';
import QRScanner from './QRScanner';
import API_BASE from '../config/api';
import shuleCardWhite from '../assets/shule_card_white.png';
import shuleCard from '../assets/shule_card.png';

const MainLayout = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isKeyboardVisible = useKeyboardStatus();
    // Contexts
    const sales = useCart();
    const purchases = usePurchase();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        });
    }, [location.pathname]);

    // Context switching logic
    const isPurchaseMode = location.pathname === '/purchases/new';
    const isHomePage = location.pathname === '/';

    const activeItems = isPurchaseMode ? purchases.purchaseItems : sales.cartItems;
    const totalQuantity = isPurchaseMode ? purchases.totalQuantity : sales.totalQuantity;
    const totalAmount = isPurchaseMode ? purchases.totalAmount : sales.totalAmount;
    const clearItems = isPurchaseMode ? purchases.clearPurchase : sales.clearCart;
    const removeItem = isPurchaseMode ? purchases.removeFromPurchase : sales.removeFromCart;

    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [isScanModalOpen, setIsScanModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showFloatingCart, setShowFloatingCart] = useState(false);
    
    // Student profile states
    const [scannedStudent, setScannedStudent] = useState(null);
    const [manualAmount, setManualAmount] = useState('');
    const [showAmountEntry, setShowAmountEntry] = useState(false);
    const [isLoadingStudent, setIsLoadingStudent] = useState(false);

    // Reset scan modal state when opened
    useEffect(() => {
        if (isScanModalOpen) {
            setScannedStudent(null);
            setManualAmount('');
            setShowAmountEntry(false);
            setIsScanning(false);
        }
    }, [isScanModalOpen]);

    // Allow any child page to open the scan modal via a custom event
    useEffect(() => {
        const handleOpenScanModal = () => setIsScanModalOpen(true);
        window.addEventListener('open-scan-modal', handleOpenScanModal);
        return () => window.removeEventListener('open-scan-modal', handleOpenScanModal);
    }, []);


    // Detect scroll on homepage to show floating cart
    useEffect(() => {
        if (!isHomePage) return;
        
        const handleScroll = () => {
            const cartButton = document.querySelector('.homepage-cart-button');
            if (cartButton) {
                const rect = cartButton.getBoundingClientRect();
                setShowFloatingCart(rect.bottom < 0);
            }
        };
        
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isHomePage]);

    const handleScanResult = async (result) => {
        if (isProcessing || isLoadingStudent) return;
        console.log("Scanned:", result);

        setIsLoadingStudent(true);

        try {
            let scannedValue = result;
            
          if (scannedValue.includes('babyeyi.rw')) {
                try {
                    const url = new URL(scannedValue);

                    if (url.searchParams.has('student')) {
                        scannedValue = url.searchParams.get('student');
                    } else {
                        const pathParts = url.pathname
                            .split('/')
                            .filter(Boolean);

                        scannedValue = pathParts[pathParts.length - 1];
                    }

                } catch (err) {
                    console.error('Invalid QR URL');
                }
            }
            
            const schoolCode = user.schoolCode;
            if (!schoolCode) throw new Error("Operator school code missing.");

            const manifestRef = doc(db, 'schools', schoolCode, 'data', 'students_manifest');
            const manifestSnap = await getDoc(manifestRef);

            if (!manifestSnap.exists()) {
                throw new Error("Student manifest not found for this school.");
            }

            const { students } = manifestSnap.data();
            
            const student = students.find(s => 
                s.code === scannedValue ||
                s.id?.toString() === scannedValue ||
                s.id === parseInt(scannedValue) ||
                s.rfidUid === scannedValue
            );

            if (!student) {
                alert(`❌ Student not found for: ${scannedValue}`);
                setIsLoadingStudent(false);
                return;
            }

            setScannedStudent(student);
            setShowAmountEntry(true);
            setIsScanning(false);

        } catch (error) {
            console.error("Scan Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsLoadingStudent(false);
        }
    };

    const completeSale = async () => {
        const amount = activeItems.length > 0 ? totalAmount : parseFloat(manualAmount);
        
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }

        if (!scannedStudent) {
            alert('No student selected');
            return;
        }

        if (scannedStudent.balance < amount) {
            alert(`❌ Insufficient Balance.\nStudent: ${scannedStudent.name}\nBalance: RWF ${scannedStudent.balance.toLocaleString()}\nRequired: RWF ${amount.toLocaleString()}`);
            return;
        }

        setIsProcessing(true);

        try {
            const schoolCode = user.schoolCode;
            
            const batch = writeBatch(db);
            const saleId = `SL-${Date.now()}`;
            const saleRef = doc(collection(db, 'schools', schoolCode, 'sales'));
            
            const saleItems = activeItems.length > 0 
                ? activeItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    category: item.category || 'General'
                  }))
                : [{ name: 'Direct Sale', quantity: 1, price: amount, category: 'General' }];
            
            batch.set(saleRef, {
                id: saleId,
                schoolCode: schoolCode,
                studentId: scannedStudent.id,
                studentName: scannedStudent.name,
                studentCode: scannedStudent.code,
                studentClass: scannedStudent.class,
                items: saleItems,
                totalAmount: amount,
                operatorId: user.id || user.uid,
                operatorName: user.fullName || user.name,
                saleType: activeItems.length > 0 ? 'cart' : 'direct',
                createdAt: serverTimestamp()
            });

            for (const item of activeItems) {
                const invRef = doc(db, 'schools', schoolCode, 'inventory', item.id);
                batch.update(invRef, {
                    stock: increment(-item.quantity),
                    updatedAt: serverTimestamp()
                });
            }

            const manifestRef = doc(db, 'schools', schoolCode, 'data', 'students_manifest');
            const manifestSnap = await getDoc(manifestRef);
            
            if (manifestSnap.exists()) {
                const manifestData = manifestSnap.data();
                const students = manifestData.students || [];
                
                const updatedStudents = students.map(student => 
                    student.id === scannedStudent.id 
                        ? { ...student, balance: student.balance - amount }
                        : student
                );
                
                batch.update(manifestRef, {
                    students: updatedStudents,
                    lastUpdated: serverTimestamp()
                });
            }

            await batch.commit();

            const response = await fetch(`${API_BASE}/sales/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: scannedStudent.id,
                    studentName: scannedStudent.name,
                    studentCode: scannedStudent.code,
                    studentClass: scannedStudent.class,
                    amount: amount,
                    schoolCode: schoolCode,
                    items: saleItems,
                    saleId: saleId,
                    operatorName: user.fullName || user.name
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                console.error("Backend processing failed:", result.message);
                alert(`⚠️ Sale recorded locally but balance sync pending. Please contact support.\n${result.message}`);
            }

            const newBalance = scannedStudent.balance - amount;
            setScannedStudent(prev => ({
                ...prev,
                balance: newBalance
            }));

            const userChoice = window.confirm(
                `✅ Sale Successful!\n\n${scannedStudent.name} - RWF ${amount.toLocaleString()}\nBalance remaining: RWF ${newBalance.toLocaleString()}\n\nOK - Make another sale\nCancel - View sales history`
            );

            sales.clearCart();
            setManualAmount('');
            
            if (userChoice) {
                setScannedStudent(null);
                setShowAmountEntry(false);
                setIsScanning(false);
            } else {
                setScannedStudent(null);
                setShowAmountEntry(false);
                setIsScanModalOpen(false);
                navigate('/sales');
            }

        } catch (error) {
            console.error("Sale Error:", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleNumpadPress = (key) => {
        if (key === '⌫') {
            setManualAmount(prev => prev.slice(0, -1));
        } else if (key !== '') {
            setManualAmount(prev => {
                const next = prev + key;
                return next.length > 7 ? prev : next;
            });
        }
    };

    const isCartActive = totalQuantity > 0;

    const getTitle = () => {
        switch (true) {
            case location.pathname === '/': return 'Dashboard';
            case location.pathname === '/listing': return 'Full Menu';
            case location.pathname === '/menu/add-item': return 'Add Menu Item';
            case location.pathname === '/sales': return 'Sales';
            case location.pathname === '/purchases': return 'Purchases';
            case location.pathname === '/purchases/new': return 'New Purchase';
            case location.pathname.startsWith('/purchase/discover/'): return 'Product Details';
            case location.pathname === '/purchases/checkout': return 'Confirm Procurement';
            case location.pathname === '/purchases/confirm': return 'Review Order';
            case location.pathname === '/purchases/receipt': return 'Procurement Receipt';
            case location.pathname === '/purchases/track': return 'Track Order';
            case location.pathname === '/inventory': return 'Inventory';
            case location.pathname === '/suppliers': return 'Suppliers';
            case location.pathname === '/reports': return 'Reports';
            case location.pathname === '/account': return 'Account Profile';
            case location.pathname === '/account/cashout': return 'Request Disbursement';
            case location.pathname === '/notifications': return 'Notifications';
            case location.pathname === '/shule-card': return 'Shule Card';
            default: return 'Cantine';
        }
    };

    const navItems = [
        { label: 'Home', icon: HiHome, path: '/' },
        { label: 'Sales', icon: HiPresentationChartLine, path: '/sales' },
        { label: 'Scan Card', icon: null, path: '/shule-card', isSpecial: true },
        { label: 'Purchases', icon: HiShoppingCart, path: '/purchases' },
        { label: 'More', icon: HiDotsHorizontal, path: null, isAction: true },
    ];

    const handleNavClick = (item) => {
        if (item.isAction && item.label === 'More') {
            setIsMoreMenuOpen(!isMoreMenuOpen);
            return;
        }
        if (item.label === 'Scan Card') {
            setIsScanModalOpen(!isScanModalOpen);
            setIsMoreMenuOpen(false);
            return;
        }
        setIsMoreMenuOpen(false);
        setIsScanModalOpen(false);
        navigate(item.path);
    };

    const moreMenuItems = [
        { label: 'Inventory', icon: HiOutlineTag, path: '/inventory' },
        { label: 'Suppliers', icon: HiDotsHorizontal, path: '/suppliers' },
        { label: 'Reports', icon: HiPresentationChartLine, path: '/reports' },
        { label: 'Logout', icon: HiX, path: '/login', isDestructive: true },
    ];

    const shouldShowBottomNav = () => {
        const hiddenPaths = ['/purchase/discover/', '/purchases/checkout', '/purchases/confirm', '/purchases/receipt', '/account', '/notifications', '/account/cashout', '/menu/add-item', '/menu/edit', '/menu/item'];
        return !hiddenPaths.some(path => location.pathname.startsWith(path));
    };

    const displayAmount = activeItems.length > 0 ? totalAmount : (manualAmount ? parseFloat(manualAmount) : 0);
    const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            {/* More Menu Overlay */}
            {isMoreMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] animate-in fade-in duration-300"
                    onClick={() => setIsMoreMenuOpen(false)}
                >
                    <div
                        className="absolute bottom-20 right-4 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-2 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col py-1">
                            {moreMenuItems.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        setIsMoreMenuOpen(false);
                                        navigate(item.path);
                                    }}
                                    className={`w-full flex items-center space-x-3 px-4 py-3.5 transition-all active:bg-slate-100 ${item.isDestructive
                                        ? 'text-red-500 border-t border-slate-50'
                                        : 'text-navblue'
                                        }`}
                                >
                                    <item.icon className={`text-lg ${item.isDestructive ? 'opacity-80' : 'opacity-40'}`} />
                                    <span className={`text-sm ${item.isDestructive ? 'font-black' : 'font-bold'}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Cart Button - Only on homepage when scrolled past cart */}
            {isHomePage && showFloatingCart && isCartActive && (
                <div 
                    onClick={() => {
                        const cartButton = document.querySelector('.homepage-cart-button');
                        if (cartButton) cartButton.click();
                    }}
                    className="fixed bottom-24 right-4 z-50 bg-shuleamber text-navblue rounded-full p-3 shadow-lg cursor-pointer hover:scale-110 transition-all active:scale-95 animate-in fade-in slide-in-from-right-5"
                >
                    <div className="relative">
                        <HiOutlineShoppingBag className="text-2xl" />
                        {totalQuantity > 0 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-navblue text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {totalQuantity}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Scan Popover Modal */}
            {isScanModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex flex-col items-center justify-end pb-36 px-4 bg-navblue/20 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsScanModalOpen(false)}
                >
                    <div className="relative w-full max-w-md bg-shuleamber rounded-[32px] p-5 shadow-2xl flex flex-col max-h-[85vh] min-h-0">
                        <div
                            className="flex-1 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col">
                                    <span className="text-navblue/40 text-[10px] font-black uppercase tracking-widest leading-none">
                                        {activeItems.length > 0 ? 'Current Cart' : (scannedStudent ? 'Direct Sale' : 'Scan Card')}
                                    </span>
                                    <div className="flex items-center space-x-2 mt-1">
                                        {activeItems.length > 0 ? (
                                            <>
                                                <span className="text-navblue text-2xl font-black">{totalQuantity} Items</span>
                                            </>
                                        ) : scannedStudent ? (
                                            <HiOutlineCurrencyDollar className="text-navblue text-xl" />
                                        ) : (
                                            <HiOutlineQrcode className="text-navblue text-xl" />
                                        )}
                                    </div>
                                </div>
                                {displayAmount > 0 && (
                                    <div className="text-right">
                                        <p className="text-navblue/40 text-[8px] font-black uppercase tracking-widest">Amount to Deduct</p>
                                        <p className="text-navblue font-black text-2xl leading-none">RWF {displayAmount.toLocaleString()}</p>
                                    </div>
                                )}
                                <button
                                    onClick={() => setIsScanModalOpen(false)}
                                    className="w-8 h-8 rounded-full bg-white/10 p-2 rounded-full text-navblue hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <HiX className="text-lg" />
                                </button>
                            </div>

                            {/* Items List inside Popover (only if cart has items) */}
                            {activeItems.length > 0 && (
                                <div className="bg-white/20 backdrop-blur-md rounded-[24px] overflow-hidden mb-4 overflow-y-auto border border-white/20 flex-shrink min-h-0 max-h-40">
                                    {activeItems.map((item, index) => (
                                        <div key={item.id}>
                                            <div className="flex items-center justify-between p-4 px-5">
                                                <div className="flex items-center space-x-4">
                                                    <div className="relative w-9 h-9 bg-white/40 rounded-xl flex items-center justify-center text-navblue">
                                                        <HiOutlineTag className="text-lg opacity-40" />
                                                        <div className="absolute -top-1 -right-1 w-4.5 h-4.5 text-[9px] font-black rounded-full flex items-center justify-center bg-navblue text-white border-2 border-shuleamber">
                                                            {item.quantity}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-navblue leading-tight">{item.name}</span>
                                                        <span className="text-[10px] font-black text-navblue/40 uppercase">
                                                            {item.price} RWF * {item.quantity} = RWF {(item.price * item.quantity).toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-navblue/40 hover:text-red-500 transition-colors"
                                                >
                                                    <HiX className="text-xs" />
                                                </button>
                                            </div>
                                            {index < activeItems.length - 1 && (
                                                <div className="mx-5 border-b border-navblue/5"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            {!scannedStudent && !isScanning ? (
                                <div className="flex flex-col items-center justify-center py-8 space-y-6">
                                    <img src={shuleCardWhite} className="w-20" alt="Shule Card" />
                                    <div className="text-center space-y-2">
                                        <h3 className="text-white font-black text-lg">Scan Student Card</h3>
                                        <p className="text-white/80 text-sm max-w-[250px]">
                                            Position the QR code within the frame to identify the student
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsScanning(true)}
                                        className="bg-white text-navblue px-8 py-3 rounded-xl font-bold text-sm hover:bg-opacity-90 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <HiOutlineCamera className="text-lg" />
                                        Start Scanning
                                    </button>
                                </div>
                            ) : !scannedStudent && isScanning ? (
                                <div className="aspect-square bg-navblue rounded-[28px] relative overflow-hidden flex items-center justify-center group flex-shrink-0">
                                    {isLoadingStudent ? (
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-10 h-10 border-4 border-white/20 border-t-shuleamber rounded-full animate-spin"></div>
                                            <p className="text-white mt-3 text-xs">Loading...</p>
                                        </div>
                                    ) : (
                                        <QRScanner onScan={handleScanResult} />
                                    )}
                                    <div className="absolute top-8 left-8 w-12 h-12 border-l-4 border-t-4 border-shuleamber rounded-tl-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] z-10"></div>
                                    <div className="absolute top-8 right-8 w-12 h-12 border-r-4 border-t-4 border-shuleamber rounded-tr-xl z-10"></div>
                                    <div className="absolute bottom-8 left-8 w-12 h-12 border-l-4 border-b-4 border-shuleamber rounded-bl-xl z-10"></div>
                                    <div className="absolute bottom-8 right-8 w-12 h-12 border-r-4 border-b-4 border-shuleamber rounded-br-xl z-10"></div>
                                    <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-shuleamber/40 shadow-[0_0_20px_#F59E0B] animate-pulse z-10"></div>
                                    <button
                                        onClick={() => setIsScanning(false)}
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-1.5 rounded-full text-xs font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : activeItems.length > 0 ? (
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 space-y-4 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="w-14 h-14 rounded-full bg-navblue/10 flex items-center justify-center">
                                            <HiOutlineUser className="text-2xl text-navblue" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-navblue font-bold text-base">{scannedStudent.name}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                                    <HiOutlineAcademicCap className="text-xs" />
                                                    {scannedStudent.class}
                                                </span>
                                                <span className="text-lg font-bold text-white flex items-center gap-1">
                                                    Balance: RWF {scannedStudent.balance.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setScannedStudent(null);
                                                setManualAmount('');
                                                setShowAmountEntry(false);
                                                setIsScanning(false);
                                            }}
                                            className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-medium text-sm hover:bg-slate-200 transition-all"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={completeSale}
                                            disabled={isProcessing}
                                            className="flex-1 bg-shuleamber text-navblue py-3 rounded-xl font-bold text-sm hover:scale-105 transition-all disabled:opacity-50"
                                        >
                                            {isProcessing ? (
                                                <div className="w-5 h-5 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin mx-auto"></div>
                                            ) : (
                                                `Confirm RWF ${totalAmount.toLocaleString()}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 space-y-4 shadow-sm">
                                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                                        <div className="w-12 h-12 rounded-full bg-navblue/10 flex items-center justify-center">
                                            <HiOutlineUser className="text-xl text-navblue" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-navblue font-bold text-sm">{scannedStudent.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-slate-500">{scannedStudent.class}</span>
                                                <span className="text-[10px] font-bold text-green-600">Balance: RWF {scannedStudent.balance.toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setScannedStudent(null);
                                                setManualAmount('');
                                                setShowAmountEntry(false);
                                                setIsScanning(false);
                                            }}
                                            className="text-xs text-red-500 font-medium"
                                        >
                                            Change
                                        </button>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                                        <p className="text-slate-400 text-xs mb-1">Amount to Deduct</p>
                                        <span className="text-3xl font-black text-navblue">
                                            {manualAmount ? `RWF ${parseInt(manualAmount).toLocaleString()}` : 'RWF 0'}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="grid grid-cols-3 gap-2">
                                            {numpadKeys.map((key, i) => (
                                                <button
                                                    key={i}
                                                    disabled={key === ''}
                                                    onClick={() => handleNumpadPress(key)}
                                                    className={`
                                                        h-12 rounded-xl font-black text-xl transition-all active:scale-95 select-none
                                                        ${key === ''
                                                            ? 'invisible'
                                                            : key === '⌫'
                                                                ? 'bg-slate-100 text-slate-500 text-lg'
                                                                : 'bg-slate-100 text-navblue hover:bg-slate-200'
                                                        }
                                                    `}
                                                >
                                                    {key}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={completeSale}
                                            disabled={isProcessing || !manualAmount || parseFloat(manualAmount) <= 0}
                                            className="w-full bg-navblue text-white py-3.5 rounded-xl font-black text-sm tracking-wide hover:bg-navblue/90 transition-all disabled:opacity-40 active:scale-95"
                                        >
                                            {isProcessing ? (
                                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
                                            ) : (
                                                'Confirm & Pay'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-shuleamber rotate-45 rounded-sm"></div>
                    </div>
                </div>
            )}

            {/* Top Header */}
            <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow-lg ${
                isCartActive && !isHomePage
                    ? (isPurchaseMode ? 'bg-navblue text-white border-b border-white/10' : 'bg-shuleamber text-navblue')
                    : 'bg-navblue text-white'
                }`}>
                <header
                    className="px-6 py-3 flex items-center justify-between cursor-pointer min-h-[64px]"
                    onClick={() => isCartActive && !isHomePage && setIsCartExpanded(!isCartExpanded)}
                >
                    {isCartActive && !isHomePage ? (
                        <>
                            <div className="flex flex-col">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isPurchaseMode ? 'text-white/40' : 'opacity-60'}`}>
                                    {isPurchaseMode ? 'Procurement List' : 'Current Cart'}
                                </span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xl font-black leading-none">{totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}</span>
                                    <div className={`transition-transform duration-300 ${isCartExpanded ? 'rotate-180' : ''}`}>
                                        <HiPlus className={`text-sm ${isPurchaseMode ? 'text-white/40' : 'opacity-50'}`} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black">RWF {totalAmount.toLocaleString()}</span>
                                    <span className={`text-[9px] font-bold uppercase ${isPurchaseMode ? 'text-white/40' : 'opacity-60'}`}>
                                        Tap to {isCartExpanded ? 'close' : 'view'}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearItems();
                                        setIsCartExpanded(false);
                                    }}
                                    className={`${isPurchaseMode ? 'bg-white/10' : 'bg-navblue/10'} p-2 rounded-full hover:bg-red-500 hover:text-white transition-all`}
                                >
                                    <HiOutlineTrash className="text-lg" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {isHomePage ? (
                                <>
                                    <button
                                        onClick={() => navigate('/account')}
                                        className="flex flex-col items-center hover:text-shuleamber transition-colors"
                                    >
                                        <HiOutlineUserCircle className="text-2xl" />
                                        <span className="font-bold ">Account</span>
                                    </button>

                                    <div className="flex items-center justify-center">
                                        <img src="/logo_white.png" alt="Shule Logo" className="h-8 w-auto" />
                                    </div>

                                    <button
                                        onClick={() => navigate('/notifications')}
                                        className="flex flex-col items-center hover:text-shuleamber transition-colors"
                                    >
                                        <HiOutlineBell className="text-2xl" />
                                        <span className="font-bold">Notifications</span>
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center space-x-4 w-full">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(-1);
                                        }}
                                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                                    >
                                        <HiChevronLeft className="text-2xl" />
                                    </button>
                                    <h1 className="text-xl font-black">{getTitle()}</h1>
                                </div>
                            )}
                        </>
                    )}
                </header>

                {/* Expandable Cart Details - Only on non-homepage */}
                {!isHomePage && (
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCartExpanded && isCartActive ? 'max-h-screen border-t border-black/5' : 'max-h-0'
                        }`}>
                        <div className={`p-4 space-y-4 backdrop-blur-md h-[calc(100vh-64px)] overflow-y-auto outline-none ${isPurchaseMode ? 'bg-navblue/95 border-t border-white/10' : 'bg-white/20'
                            }`}>
                            <div className={`rounded-[24px] overflow-hidden space-y-2 ${isPurchaseMode ? 'bg-white/5 border border-white/10' : 'bg-white/40 backdrop-blur-sm'
                                }`}>
                                {activeItems.map((item, index) => (
                                    <div key={item.id}>
                                        <div className="flex items-center justify-between p-4 transition-colors group">
                                            <div className="flex items-center space-x-4">
                                                <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${isPurchaseMode ? 'bg-white/10 text-shuleamber' : 'bg-navblue/10 text-navblue'
                                                    }`}>
                                                    <HiOutlineTag className="text-xl opacity-40" />
                                                    <div className={`absolute -top-1 -right-1 w-5 h-5 text-[10px] font-black rounded-full flex items-center justify-center border-2 ${isPurchaseMode ? 'bg-shuleamber text-navblue border-navblue' : 'bg-navblue text-white border-shuleamber'
                                                        }`}>
                                                        {item.quantity}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold text-base leading-tight ${isPurchaseMode ? 'text-white' : 'text-navblue'}`}>{item.name}</span>
                                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isPurchaseMode ? 'text-white/40' : 'text-navblue/40'}`}>
                                                        {item.price} RWF * {item.quantity} = RWF {(item.price * item.quantity).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${isPurchaseMode ? 'bg-white/5 text-white/40 hover:bg-red-500 hover:text-white' : 'bg-navblue/5 text-navblue/40 hover:bg-red-500 hover:text-white'
                                                    }`}
                                            >
                                                <HiX className="text-lg" />
                                            </button>
                                        </div>
                                        {index < activeItems.length - 1 && (
                                            <div className={`mx-4 border-b ${isPurchaseMode ? 'border-white/5' : 'border-navblue/10'}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 sticky bottom-0 pb-2">
                                <button
                                    onClick={() => {
                                        if (isPurchaseMode) {
                                            setIsCartExpanded(false);
                                            navigate('/purchases/checkout');
                                        } else {
                                            setIsCartExpanded(false);
                                            setIsScanModalOpen(true);
                                        }
                                    }}
                                    className={`w-full font-black py-4 rounded-3xl shadow-xl active:scale-95 transition-transform flex items-center justify-center space-x-2 ${isPurchaseMode ? 'bg-shuleamber text-navblue' : 'bg-navblue text-white'
                                        }`}
                                >
                                    <span>{isPurchaseMode ? 'Submit Inventory Purchase' : 'Complete Sale'}</span>
                                    <span className={`opacity-40 ml-2`}>•</span>
                                    <span>RWF {totalAmount.toLocaleString()}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 pt-20 pb-20">
                <Outlet />
            </main>

            {/* Bottom Mobile Navigation */}
            {shouldShowBottomNav() && (
                <nav className={`fixed bottom-0 left-0 right-0 transition-all duration-500 ease-in-out ${isKeyboardVisible ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                    } ${isScanModalOpen ? 'z-[70]' : 'z-50'}`}>
                    <div className="relative bg-white shadow-[0_-8px_30px_rgb(0,0,0,0.04)] px-4 flex items-center justify-between rounded-t-[24px] border-t border-slate-100">
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.label === 'More' && isMoreMenuOpen);

                            if (item.isSpecial) {
                                return (
                                    <div key={index} className={`relative -top-7 flex flex-col items-center ${isScanModalOpen ? 'z-[70]' : 'z-10'}`}>
                                        <button
                                            onClick={() => handleNavClick(item)}
                                            className={`w-14 h-14 rounded-full shadow-[0_8px_20px_rgba(245,158,11,0.3)] flex items-center justify-center border-4 active:scale-95 transition-all overflow-hidden ${isScanModalOpen ? 'bg-shuleamber border-shuleamber' : 'bg-white border-white'}`}
                                        >
                                            <img src={isScanModalOpen ? shuleCardWhite : shuleCard} alt="Shule Card" className="w-11 h-11 object-contain" />
                                        </button>
                                        <span className={`mt-1 text-sm font-bold ${isScanModalOpen ? 'text-shuleamber' : 'text-slate-400'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                );
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleNavClick(item)}
                                    className={`flex flex-col items-center justify-center space-y-0.5 w-14 transition-all ${isActive ? 'text-navblue font-bold' : 'text-slate-400 font-medium'
                                        }`}
                                >
                                    {Icon && <Icon className={`text-xl ${isActive ? 'scale-110' : 'opacity-60'}`} />}
                                    <span className={`text-sm text-center ${isActive ? '' : 'opacity-80'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
};

export default MainLayout;
