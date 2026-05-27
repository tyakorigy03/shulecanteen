import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineTag, HiOutlineClock, HiOutlineCube, HiOutlineRefresh, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlinePlus, HiOutlineTruck } from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp, deleteDoc, writeBatch, increment, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const PurchasesPage = () => {
    const navigate = useNavigate();
    const { user, school } = useAuth();
    const [activeTab, setActiveTab] = useState('All');
    const [showBalance, setShowBalance] = useState(false);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);

    useEffect(() => {
        if (!user?.schoolCode) return;

        const q = query(
            collection(db, 'purchase_orders'),
            where('schoolCode', '==', user.schoolCode),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt?.toDate().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) || 'N/A'
            }));
            setPurchases(items);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching purchases:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user?.schoolCode]);

    const tabs = ['All', 'pending', 'approved', 'ready', 'shipped', 'delivered'];

    const summary = {
        totalCost: purchases.reduce((acc, curr) => acc + (curr.total || 0), 0),
        completedCount: purchases.filter(p => p.status === 'delivered').length,
        pendingCount: purchases.filter(p => p.status === 'pending' || p.status === 'approved').length
    };

    const handleConfirmReceipt = async (purchase) => {
        if (!window.confirm(`Confirm that you have PHYSICALLY RECEIVED all items from ${purchase.supplierName}?\n\nThis will add ${purchase.items?.length || 0} items to your inventory.`)) {
            return;
        }

        setActionId(purchase.id);
        
        try {
            const batch = writeBatch(db);
            
            const orderRef = doc(db, 'purchase_orders', purchase.id);
            batch.update(orderRef, {
                status: 'delivered',
                receivedAt: serverTimestamp(),
                receivedBy: user?.fullName || user?.name || 'Canteen Staff',
                updatedAt: serverTimestamp()
            });
            
            for (const item of purchase.items) {
                const inventoryId = item.id || `INV-${Date.now()}-${Math.random()}`;
                const inventoryRef = doc(db, 'schools', user.schoolCode, 'inventory', inventoryId);
                
                const inventoryDoc = await getDoc(inventoryRef);
                
                if (inventoryDoc.exists()) {
                    batch.update(inventoryRef, {
                        stock: increment(item.quantity),
                        updatedAt: serverTimestamp()
                    });
                } else {
                    batch.set(inventoryRef, {
                        id: inventoryId,
                        name: item.name,
                        category: item.category || 'General',
                        stock: item.quantity,
                        stockLabel: item.unit || 'Units',
                        price: item.price,
                        schoolCode: user.schoolCode,
                        image: item.productImage || '',
                        supplierId: purchase.supplierId,
                        supplierName: purchase.supplierName,
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                }
            }
            
            await batch.commit();
            alert(`✅ Receipt confirmed! ${purchase.items?.length || 0} items added to inventory.`);
            
        } catch (error) {
            console.error("Error confirming receipt:", error);
            alert('Failed to confirm receipt. Please try again.');
        } finally {
            setActionId(null);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setActionId(id);
        try {
            await deleteDoc(doc(db, 'purchase_orders', id));
            alert('Order cancelled.');
        } catch (error) {
            console.error("Error cancelling order:", error);
            alert('Failed to cancel order.');
        } finally {
            setActionId(null);
        }
    };

    const handleViewReceipt = (purchase) => {
        const orderForReceipt = {
            orderId: purchase.id,
            supplierName: purchase.supplierName,
            supplierId: purchase.supplierId,
            items: purchase.items || [],
            total: purchase.total,
            paymentMethod: purchase.paymentMethod || 'Cash',
            momoNumber: purchase.momoNumber || '',
            deliveryLocation: purchase.deliveryLocation || 'School Premises',
            date: purchase.date,
            status: purchase.status
        };

        navigate('/purchases/receipt', {
            state: {
                orders: [orderForReceipt],
                originalOrders: [orderForReceipt],
                totalAmount: purchase.total,
                supplierCount: 1,
                school: school,
                paymentMethod: purchase.paymentMethod || 'Cash',
                momoNumber: purchase.momoNumber || '',
                deliveryLocation: purchase.deliveryLocation || 'School Premises',
                date: purchase.date,
                receiptId: purchase.id,
                status: purchase.status
            }
        });
    };

    const filteredPurchases = purchases.filter(p =>
        activeTab === 'All' || p.status === activeTab
    );

    const getStatusColor = (status) => {
        switch(status) {
            case 'delivered': return 'bg-green-50 text-green-600';
            case 'shipped': return 'bg-blue-50 text-blue-600';
            case 'ready': return 'bg-purple-50 text-purple-600';
            case 'approved': return 'bg-amber-50 text-amber-600';
            default: return 'bg-shuleamber/10 text-shuleamber';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'shipped': return <HiOutlineTruck className="text-sm" />;
            case 'delivered': return <HiOutlineCheckCircle className="text-sm" />;
            default: return null;
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-24 space-y-6 pt-4">
            {/* Wallet Card Hero */}
            <div className="px-4">
                <div className="w-full max-w-md mx-auto overflow-hidden rounded-xl shadow-xl">
                    <div className="bg-navblue p-4 flex flex-col items-center relative">
                        <p className="text-white/80 text-[10px] font-black uppercase tracking-widest mb-1">
                            Total Procurement Spending
                        </p>
                        <div className="flex items-center space-x-4">
                            <h2 className="text-white text-3xl font-black">
                                RWF {showBalance ? (
                                    <span className="animate-in fade-in duration-300">{summary.totalCost.toLocaleString()}</span>
                                ) : (
                                    <span className="text-xl align-middle -mt-1 ml-1 opacity-40">********</span>
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
                    <div className="bg-[#002f5e] flex items-center divide-x divide-white/10">
                        <div className="flex-1 py-4 flex flex-col items-center space-y-0.5">
                            <span className="text-white text-lg font-black">{summary.completedCount}</span>
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">Received</span>
                        </div>
                        <div className="flex-1 py-4 flex flex-col items-center space-y-0.5">
                            <span className="text-shuleamber text-lg font-black">{summary.pendingCount}</span>
                            <span className="text-white/40 text-[9px] font-black uppercase tracking-widest">In Progress</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Tabs */}
            <div className="px-4">
                <div className="bg-white p-2 rounded-2xl shadow-sm flex items-center justify-between border border-slate-100 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm rounded-xl transition-all whitespace-nowrap px-3 ${activeTab === tab
                                ? 'bg-shuleamber text-navblue shadow-md'
                                : 'text-slate-400'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Purchases List */}
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-navblue font-black text-lg">Purchase History</h2>
                    <button
                        onClick={() => navigate('/purchases/new')}
                        className="text-md text-shuleamber hover:underline transition-all"
                    >
                        + New Purchase
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading purchases...</div>
                ) : filteredPurchases.length === 0 ? (
                    <div className="p-10 flex flex-col items-center text-center">
                        <img
                            src="/empty_inventory.png"
                            alt="No Purchases"
                            className="w-40 opacity-90 mb-5"
                        />
                        <p className="text-slate-400 italic mb-6">
                            No purchases found.
                        </p>
                        <button
                            onClick={() => navigate('/purchases/new')}
                            className="text-shuleamber hover:text-navblue underline text-sm"
                        >
                            + Create New Purchase
                        </button>
                    </div>
                ) : (
                    filteredPurchases.map((purchase) => (
                        <div
                            key={purchase.id}
                            onClick={() => handleViewReceipt(purchase)}
                            className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden border border-slate-50 transition-all duration-300 hover:border-shuleamber/30 active:scale-[0.98] cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                        >
                            <div className="p-5 pb-3">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-navblue font-black text-xs">
                                        {purchase.date}
                                    </span>
                                   
                                </div>
                            </div>
                            <div>
                                <div className="flex flex-col px-6 py-3">
                                    <div className='text-navblue/60 text-xs font-bold'>Status ------- {purchase.status}</div>
                                    <div className='text-navblue/60 text-xs font-bold'>ID ------- {purchase.id}</div>
                                    {purchase.supplierName && <div className='text-navblue/60 text-xs font-bold'>Supplier ------- {purchase.supplierName}</div>}
                                </div> 
                            </div>

                            <div className="p-6 pt-0 flex flex-col">
                                <div className="flex">
                                    <div className="w-[1.5px] rounded-full mr-5 ml-1 mt-1 mb-1 bg-shuleamber/20"></div>
                                    <div className="flex-1 space-y-3">
                                         <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="text-left text-navblue/40 font-medium py-2">Item</th>
                                                    <th className="text-right text-navblue/40 font-medium py-2">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {purchase.items?.map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-navblue/60 py-1.5">{item.name} x{item.quantity}</td>
                                                        <td className="text-navblue/40 text-right py-1.5">RWF {(item.quantity * item.price).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {purchase.items?.length > 3 && (
                                                    <tr>
                                                        <td colSpan="2" className="text-center text-slate-400 text-[9px] italic py-1">
                                                            +{purchase.items.length - 3} more items
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                            <tfoot className="border-t border-slate-100">
                                                <tr>
                                                    <td className="text-navblue font-semibold py-2">Total</td>
                                                    <td className="text-navblue font-bold text-right py-2">RWF {purchase.total?.toLocaleString() || 0}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-end space-x-3">
                                    {purchase.status === 'shipped' ? (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleCancel(purchase.id); }}
                                                disabled={actionId === purchase.id}
                                                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all text-xs disabled:opacity-50"
                                            >
                                                <HiOutlineXCircle className="text-base" />
                                                <span>Cancel</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleConfirmReceipt(purchase); }}
                                                disabled={actionId === purchase.id}
                                                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-green-500 text-white shadow-md hover:scale-105 active:scale-95 transition-all text-xs disabled:opacity-50"
                                            >
                                                {actionId === purchase.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                                ) : (
                                                    <HiOutlineCheckCircle className="text-base" />
                                                )}
                                                <span>Confirm Receipt & Add to Stock</span>
                                            </button>
                                        </>
                                    ) : purchase.status === 'delivered' ? (
                                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                                            <HiOutlineCheckCircle className="text-sm" />
                                            Added to Inventory
                                        </span>
                                    ) : purchase.status === 'ready' || purchase.status === 'approved' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-shuleamber rounded-full animate-pulse"></div>
                                            <span className="text-xs text-slate-500 italic">Waiting for supplier to ship...</span>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-navblue/5 text-navblue hover:bg-navblue/5 transition-all text-xs"
                                        >
                                            <HiOutlineRefresh className="text-base font-bold" />
                                            <span>Reorder Items</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PurchasesPage;