import { useState, useEffect, useMemo } from 'react';
import { HiOutlineTruck, HiOutlineLocationMarker, HiOutlineCheckCircle, HiOutlineClock, HiOutlineChevronLeft } from 'react-icons/hi';
import { useDelivery } from '../context/DeliveryContext';
import { useParams, useNavigate } from 'react-router-dom';

const DeliveryDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeOrders, confirmOrder } = useDelivery();
    const [isSticky, setIsSticky] = useState(false);

    // Track scroll to toggle sticky styles
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Mock order details for the given ID (in a real app, this would come from an API)
    const orderDetails = useMemo(() => ({
        id: id,
        school: 'GS Rugunga',
        destination: 'Loading Dock A',
        time: '08:30 AM',
        status: 'Confirmed',
        items: [
            { id: 1, name: 'Samosa Extra', quantity: 50, category: 'Snacks' },
            { id: 2, name: 'Fresh Juice', quantity: 24, category: 'Drinks' },
            { id: 3, name: 'Milk carton', quantity: 10, category: 'Drinks' },
            { id: 4, name: 'Mandazi', quantity: 100, category: 'Snacks' },
        ]
    }), [id]);

    const isConfirmed = activeOrders.some(o => o.id === id);

    const handleConfirm = () => {
        confirmOrder({
            id: orderDetails.id,
            school: orderDetails.school,
            items: orderDetails.items.length,
            destination: orderDetails.destination
        });
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className={`px-6 py-8 transition-colors duration-300 ${isConfirmed ? 'bg-green-600' : 'bg-navblue'} text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-white/60 mb-6 hover:text-white transition-colors"
                >
                    <HiOutlineChevronLeft />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Back to Assignments</span>
                </button>

                <div className="flex flex-col gap-2 relative z-10">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">Manifest ID: {id}</span>
                    <h1 className="text-3xl font-black">{orderDetails.school}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <HiOutlineClock className="text-white/40" />
                            <span className="text-xs font-bold">{orderDetails.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <HiOutlineLocationMarker className="text-white/40" />
                            <span className="text-xs font-bold">{orderDetails.destination}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Section */}
            <div className="px-4 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-green-500' : 'bg-shuleamber animation-pulse'}`}></div>
                            <span className="text-navblue font-black">{isConfirmed ? 'In Active Manifest' : 'Pending Loading'}</span>
                        </div>
                    </div>
                    {!isConfirmed && (
                        <button
                            onClick={handleConfirm}
                            className="bg-shuleamber text-navblue px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-shuleamber/20 active:scale-95 transition-all"
                        >
                            Manifest Now
                        </button>
                    )}
                </div>
            </div>

            {/* Packing List */}
            <div className="px-6 mt-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-navblue font-black text-lg">Packing List</h2>
                    <span className="text-navblue/40 text-[10px] font-bold uppercase">{orderDetails.items.length} Distinct Products</span>
                </div>

                <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 overflow-hidden">
                    {orderDetails.items.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-center justify-between p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-navblue/40">
                                        <HiOutlineTruck className="text-2xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-navblue text-base">{item.name}</span>
                                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.category}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xl font-black text-navblue">{item.quantity}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Units</span>
                                </div>
                            </div>
                            {index < orderDetails.items.length - 1 && (
                                <div className="mx-6 border-b border-slate-50"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Summary */}
            <div className="px-6 mt-8">
                <div className="bg-navblue/5 border border-navblue/10 rounded-2xl p-6 flex flex-col gap-3">
                    <p className="text-navblue/60 text-[11px] font-medium leading-relaxed">
                        By manifesting this order, you confirm that all items listed above are present and accounted for in your vehicle for the {orderDetails.school} delivery.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDetailsPage;
