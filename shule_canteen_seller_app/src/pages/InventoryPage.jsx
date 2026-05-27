import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineDatabase,
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineArrowCircleUp,
    HiOutlineSwitchHorizontal,
    HiPlus
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const InventoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showValue, setShowValue] = useState(false);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user?.schoolCode) return;

        const q = query(
            collection(db, 'schools', user.schoolCode, 'inventory')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setProducts(items);
                setLoading(false);
            },
            (error) => {
                console.error("Error fetching inventory:", error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.schoolCode]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalInventoryValue = filteredProducts.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);

    return (
        <div className="bg-slate-50 min-h-screen pb-24 space-y-6 pt-4">

            {/* Inventory Hero Card */}
            <div className="px-4">
                <div className="w-full max-w-md mx-auto overflow-hidden rounded-2xl shadow-xl shadow-navblue/10">
                    {/* Top Section */}
                    <div className="bg-navblue p-6 flex flex-col items-center relative">
                        <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] mb-2">
                            Total Inventory Value
                        </p>

                        <div className="flex items-center space-x-4">
                            <h2 className="text-white text-3xl font-bold">
                                RWF {showValue ? (
                                    <span className="animate-in fade-in duration-300">{totalInventoryValue.toLocaleString()}</span>
                                ) : (
                                    <span className="text-2xl align-middle -mt-1 ml-1 opacity-20 tracking-widest">********</span>
                                )}
                            </h2>
                            <button
                                onClick={() => setShowValue(!showValue)}
                                className="text-shuleamber hover:scale-110 transition-transform active:scale-95"
                            >
                                <HiOutlineEye className="text-2xl" />
                            </button>
                        </div>
                    </div>

                    {/* Bottom Actions Section */}
                    <div className="bg-[#002f5e] flex items-center divide-x divide-white/10">
                        <button
                            onClick={() => navigate('/purchases/new')}
                            className="flex-1 py-3 flex flex-col items-center space-y-1.5 hover:bg-white/5 transition-colors group"
                        >
                            <HiOutlineArrowCircleUp className="text-xl text-white group-hover:scale-110 transition-transform" />
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider">New Purchase</span>
                        </button>

                        <button
                            onClick={() => navigate('/inventory/adjust')}
                            className="flex-1 py-3 flex flex-col items-center space-y-1.5 hover:bg-white/5 transition-colors group"
                        >
                            <HiOutlineSwitchHorizontal className="text-xl text-white group-hover:scale-110 transition-transform" />
                            <span className="text-white text-[11px] font-bold uppercase tracking-wider">Adjust</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-navblue font-bold text-lg">Stock Inventory</h2>
                    <button className="text-shuleamber p-1.5 bg-shuleamber/10 rounded-xl hover:scale-110 transition-all active:scale-90">
                        <HiPlus className="text-xl" />
                    </button>
                </div>

                <div className="relative">
                    <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 text-lg" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-sm font-semibold text-navblue focus:outline-none focus:border-shuleamber transition-all shadow-sm"
                    />
                </div>

                {/* WhatsApp-style List */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {loading ? (
                        <div className="p-10 text-center text-slate-400 italic">Loading inventory...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-10 flex flex-col items-center text-center">
                            <img
                                src="https://shulecantine.babyeyi.rw/cantine/empty_inventory.png"
                                alt="No Inventory"
                                className="w-40 opacity-90 mb-5"
                            />
                            <p className="text-slate-400 italic mb-6">
                                No items found in your inventory.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/purchases/new')}
                                    className="text-navblue hover:text-shuleamber hover:text-underline text-sm whitespace-nowrap"
                                >
                                    + Purchase Items
                                </button>
                                /
                                <button
                                    onClick={() => navigate('/inventory/import')}
                                    className="text-shuleamber hover:text-navblue hover:text-underline text-sm whitespace-nowrap"
                                >
                                    + Add Existing Inventory
                                </button>
                            </div>
                        </div>
                    ) : (
                        filteredProducts.map((item, index) => (
                            <div key={item.id}>
                                <div className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex items-center space-x-5">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300 group-hover:bg-shuleamber/10 group-hover:text-shuleamber transition-colors">
                                                    <HiOutlineDatabase className="text-2xl" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-1">
                                            <span className="text-navblue font-bold text-base leading-tight">
                                                {item.name}
                                            </span>
                                            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                                                {item.category} • RWF {item.price}
                                            </span>
                                            {item.references?.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {item.references.slice(0, 3).map((ref, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 rounded-full bg-shuleamber/10 text-[9px] font-bold text-shuleamber uppercase tracking-wider"
                                                        >
                                                            {ref.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className={`text-lg font-bold ${item.stock < 20 ? 'text-red-500' : 'text-navblue'}`}>
                                            {item.stock}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                                            {item.stockLabel || 'Units'}
                                        </span>
                                    </div>
                                </div>
                                {index < filteredProducts.length - 1 && (
                                    <div className="mx-5 border-b border-slate-50"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InventoryPage;