import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import {
    HiOutlineOfficeBuilding,
    HiOutlineCheckCircle,
    HiOutlineArrowLeft,
    HiOutlineInformationCircle,
    HiOutlineEye
} from 'react-icons/hi';

const CashoutRequestPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('Digital');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showBalance, setShowBalance] = useState(false);
    const [availableBalance, setAvailableBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(true);

    // Generate a readable cashout ID
    const generateCashoutId = () => {
        const prefix = 'CO';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(100 + Math.random() * 900);
        return `${prefix}-${timestamp}${random}`;
    };

    // Calculate available balance from Firestore (sales - completed cashouts)
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
                setAvailableBalance(totalSales - totalCashouts);
                setLoadingBalance(false);
            });
            
            return () => unsubCashouts();
        });

        return () => unsubSales();
    }, [user?.schoolCode]);

    const methods = [
        {
            id: 'Digital',
            label: 'Mobile Money (MTN)',
            sub: 'Automatic Disbursement',
            icon: <img src="/mtn_logo.png" alt="MTN" className="w-14 h-14 object-contain" />,
            instruction: "Funds will be disbursed to your registered mobile number or bank account within 24 hours."
        },
        {
            id: 'Office',
            label: 'Account Office (Cash)',
            sub: 'Physical Pickup',
            icon: <HiOutlineOfficeBuilding className="text-2xl" />,
            instruction: "Please visit the School Accounts Office with your ID after approval to collect your physical cash."
        }
    ];

    const selectedMethod = methods.find(m => m.id === method);

    const handleSubmit = async () => {
        const cashoutAmount = parseFloat(amount);
        
        if (!cashoutAmount || cashoutAmount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        if (cashoutAmount > availableBalance) {
            alert(`Insufficient balance. Available: RWF ${availableBalance.toLocaleString()}`);
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Generate custom cashout ID
            const cashoutId = generateCashoutId();
            
            // Create cashout request with custom ID
            const cashoutRef = doc(db, 'schools', user.schoolCode, 'cashouts', cashoutId);
            
            await setDoc(cashoutRef, {
                id: cashoutId,
                amount: cashoutAmount,
                method: method,
                canteenId: user.id || user.uid,
                canteenName: user.fullName || user.name,
                schoolCode: user.schoolCode,
                phone: user.phone,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            alert(`✅ Cashout request submitted successfully!\nRequest ID: ${cashoutId}`);
            navigate('/account');
            
        } catch (error) {
            console.error("Cashout Request Failed:", error);
            alert("Failed to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isInvalid = !amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableBalance;

    if (loadingBalance) {
        return (
            <div className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24 font-sans">
            <div className="max-w-lg mx-auto px-4 space-y-8">

                {/* Hero Wallet Card */}
                <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl shadow-navblue/10">
                    <div className="bg-navblue p-8 flex flex-col items-center relative">
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
                            Available Balance
                        </p>

                        <div className="flex items-center space-x-6">
                            <h2 className="text-white text-4xl font-bold">
                                RWF {showBalance ? (
                                    <span className="animate-in fade-in duration-300">{availableBalance.toLocaleString()}</span>
                                ) : (
                                    <span className="text-2xl align-middle -mt-1 ml-1 opacity-20 tracking-widest">********</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setShowBalance(!showBalance)}
                                className="text-shuleamber hover:scale-110 transition-transform active:scale-95"
                            >
                                <HiOutlineEye className="text-3xl" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Amount Input Section */}
                <div className="space-y-3">
                    <label className="text-navblue font-semibold ml-4">Cashout Amount</label>
                    <div className="relative mt-2">
                        <span className="absolute left-7 top-1/2 -translate-y-1/2 text-navblue font-bold text-base">RWF</span>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-white border border-slate-100 rounded-2xl py-6 pl-20 pr-8 text-navblue text-xl font-bold focus:outline-none focus:border-shuleamber transition-all shadow-sm"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        {parseFloat(amount) > availableBalance && (
                            <p className="text-red-500 text-xs mt-1 ml-4">
                                Exceeds available balance of RWF {availableBalance.toLocaleString()}
                            </p>
                        )}
                    </div>
                </div>

                {/* Selection Pattern */}
                <div className="space-y-4">
                    <label className="text-navblue font-semibold ml-4">Preferred Method</label>
                    <div className="space-y-4 mt-2">
                        {methods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMethod(m.id)}
                                className={`w-full flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 ${method === m.id
                                    ? 'bg-navblue border-navblue shadow-lg shadow-navblue/10 scale-[1.01]'
                                    : 'bg-white border-slate-100 hover:border-slate-200'
                                    }`}
                            >
                                <div className="flex items-center space-x-5">
                                    <div className={`w-14 h-14 rounded-2xl flex overflow-hidden items-center justify-center transition-colors ${method === m.id ? 'bg-white/10 text-shuleamber' : 'bg-slate-50 text-slate-300'
                                        }`}>
                                        {m.icon}
                                    </div>
                                    <div className="flex flex-col items-start space-y-0.5">
                                        <span className={`text-base font-semibold ${method === m.id ? 'text-white' : 'text-navblue'}`}>
                                            {m.label}
                                        </span>
                                        <span className={`text-md font-semibold ${method === m.id ? 'text-white/40' : 'text-slate-400'}`}>
                                            {m.sub}
                                        </span>
                                    </div>
                                </div>

                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${method === m.id
                                    ? 'bg-shuleamber border-white/20 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                                    : 'bg-white border-slate-100'
                                    }`}>
                                    {method === m.id && (
                                        <div className="w-2 h-2 bg-navblue rounded-full"></div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>


                <div className="pt-8 space-y-5">
                    <button
                        onClick={handleSubmit}
                        disabled={isInvalid || isSubmitting}
                        className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 transition-all active:scale-95 shadow-lg ${!isInvalid && !isSubmitting
                            ? 'bg-shuleamber text-navblue shadow-shuleamber/20'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-6 h-6 border-2 border-navblue border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <HiOutlineCheckCircle className="text-xl" />
                                <span className="font-bold text-sm uppercase tracking-[0.2em]">Confirm Request</span>
                            </>
                        )}
                    </button>

                    <button
                        onClick={() => navigate('/account')}
                        className="w-full py-5 bg-white text-navblue border border-slate-100 rounded-2xl flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm font-bold uppercase tracking-[0.2em]"
                    >
                        <HiOutlineArrowLeft className="text-shuleamber text-lg" />
                        <span>Cancel Request</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashoutRequestPage;