import { useState, useEffect } from 'react';
import { HiOutlineEye, HiOutlineArrowCircleUp, HiOutlineSwitchHorizontal, HiOutlinePlus, HiOutlineTag } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, limit, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const navigate = useNavigate();
    const { user, school } = useAuth();
    const { addToCart, cartItems } = useCart();
    const [quickItems, setQuickItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBalance, setShowBalance] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [balanceLoading, setBalanceLoading] = useState(true);

    // Fetch wallet balance from sales and cashouts
    useEffect(() => {
        if (!user?.schoolCode) return;

        // Listen to sales for total revenue
        const salesQuery = query(
            collection(db, 'schools', user.schoolCode, 'sales')
        );

        const unsubSales = onSnapshot(salesQuery, (snapshot) => {
            const totalSales = snapshot.docs.reduce((sum, doc) => sum + (doc.data().totalAmount || 0), 0);
            
            // Listen to completed cashouts
            const cashoutsQuery = query(
                collection(db, 'schools', user.schoolCode, 'cashouts'),
                where('status', '==', 'completed')
            );
            
            const unsubCashouts = onSnapshot(cashoutsQuery, (cashoutSnap) => {
                const totalCashouts = cashoutSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
                setWalletBalance(totalSales - totalCashouts);
                setBalanceLoading(false);
            });
            
            return () => unsubCashouts();
        });

        return () => unsubSales();
    }, [user?.schoolCode]);

    // Fetch quick menu items
    useEffect(() => {
        if (!user?.schoolCode) return;

        const q = query(
            collection(db, 'schools', user.schoolCode, 'inventory'),
            limit(4)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setQuickItems(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching homepage items:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.schoolCode]);

    const IMAGE_BASE = import.meta.env.VITE_API_URL || '';

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_BASE}${imagePath}`;
    };

    // Get quantity of an item in cart
    const getItemQuantity = (itemId) => {
        const cartItem = cartItems.find(item => item.id === itemId);
        return cartItem?.quantity || 0;
    };

    return (
        <div className="px-4 pt-2 pb-20 space-y-6">
            {/* Hero Wallet Card */}
            <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-xl">
                <div className="bg-navblue p-4 flex flex-col items-center relative">
                    <p className="text-white/80 text-xl font-medium tracking-wide mb-2">
                        {school?.schoolName || user?.schoolName || 'School Canteen'}
                    </p>

                    <div className="flex items-center space-x-4">
                        <h2 className="text-white text-3xl font-black">
                            RWF {showBalance ? (
                                <span className="text-xl">{walletBalance.toLocaleString()}</span>
                            ) : (
                                <span className="text-xl align-middle -mt-1 ml-1">********</span>
                            )}
                        </h2>
                        <button 
                            onClick={() => setShowBalance(!showBalance)}
                            className="text-shuleamber hover:scale-110 transition-transform active:scale-95"
                        >
                            <HiOutlineEye className="text-2xl" />
                        </button>
                    </div>
                </div>
                <div className="bg-[#002f5e] flex items-center divide-x divide-white/60">
                    <button
                        onClick={() => navigate('/account/cashout')}
                        className="flex-1 py-2 flex flex-col items-center space-y-2 hover:bg-white/5 transition-colors group"
                    >
                        <HiOutlineArrowCircleUp className="text-2xl text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white text-sm">Cash out</span>
                    </button>

                    <button
                        onClick={() => navigate('/sales')}
                        className="flex-1 py-2 flex flex-col items-center space-y-2 hover:bg-white/5 transition-colors group"
                    >
                        <HiOutlineSwitchHorizontal className="text-2xl text-white group-hover:scale-110 transition-transform" />
                        <span className="text-white text-sm">History</span>
                    </button>
                </div>
            </div>

            <div className="px-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-navblue font-black text-lg">Quick Menu</h2>
                    <button
                        onClick={() => navigate('/listing')}
                        className="text-md text-shuleamber hover:underline transition-all"
                    >
                        view all
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400 italic">Finding items...</div>
                    ) : quickItems.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img
                                src="https://shulecantine.babyeyi.rw/cantine/empty_menu.png"
                                alt="No menu"
                                className="w-40 opacity-90 mb-5"
                            />
                            <p className="text-slate-400 italic mb-6">
                                No items found in your menu.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/purchases/new')}
                                    className="text-navblue hover:text-shuleamber text-sm whitespace-nowrap"
                                >
                                    + Purchase from suppliers
                                </button>
                            </div>
                        </div>
                    ) : (
                        quickItems.map((item, index) => {
                            const quantityInCart = getItemQuantity(item.id);
                            return (
                                <div key={item.id}>
                                    <div
                                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                                        onClick={() => addToCart(item)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-shuleamber/10 group-hover:text-shuleamber transition-colors overflow-hidden">
                                                {item.image ? (
                                                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <HiOutlineTag className="text-xl" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-navblue font-bold text-base leading-tight">{item.name}</span>
                                                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">RWF {item.price?.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="relative w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-shuleamber hover:text-white transition-all active:scale-90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}
                                        >
                                            {quantityInCart > 0 && (
                                                <span className="absolute -top-2 -right-2 w-4 h-4 bg-shuleamber text-navblue text-[9px] font-black rounded-full flex items-center justify-center">
                                                    {quantityInCart}
                                                </span>
                                            )}
                                            <HiOutlinePlus className="text-lg" />
                                        </button>
                                    </div>
                                    {index < quickItems.length - 1 && (
                                        <div className="mx-4 border-b border-slate-100"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;