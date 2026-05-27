import { useNavigate, useParams } from 'react-router-dom';
import {
    HiOutlineArrowLeft,
    HiOutlinePrinter,
    HiOutlineTruck,
    HiOutlineLibrary,
    HiOutlineClipboardCheck,
    HiOutlineCheckCircle
} from 'react-icons/hi';

const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    // Mock data for the demonstration
    const order = {
        id: id || 'ORD-2931',
        status: 'In Processing',
        date: '21 May 2026',
        school: {
            name: 'GS Kigali Canteen',
            contact: 'Margaret Umulisa',
            phone: '+250 788 123 456',
            address: 'KG 123 St, Nyarugenge, Kigali'
        },
        items: [
            { id: 1, name: 'Premium Long Grain Rice', qty: 50, unit: 'kg', price: '1,200', total: '60,000' },
            { id: 2, name: 'Dry Red Beans', qty: 25, unit: 'kg', price: '900', total: '22,500' },
            { id: 3, name: 'Fresh White Maize Flour', qty: 40, unit: 'kg', price: '850', total: '34,000' },
            { id: 4, name: 'Fresh Tomatoes', qty: 12, unit: 'kg', price: '625', total: '7,500' },
        ],
        shipping: {
            driver: 'Jean Pierre',
            vehicle: 'Toyota Hilux (RAE 123A)',
            expected: 'Today, 2:00 PM'
        },
        subtotal: '124,000',
        tax: '0',
        grandTotal: '124,000'
    };

    const steps = [
        { title: 'Order Placed', time: '21 May, 08:30 AM', active: true },
        { title: 'Confirmed by Supplier', time: '21 May, 09:15 AM', active: true },
        { title: 'Items Packaged', time: '21 May, 11:00 AM', active: true },
        { title: 'Out for Delivery', time: 'Estimated 01:30 PM', active: false },
        { title: 'Delivered', time: 'Pending', active: false },
    ];

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/orders')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black italic">Order <span className="text-shuleamber">{order.id}</span></h2>
                            <span className="px-2 sm:px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                                {order.status}
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-sm opacity-60 tracking-tight sm:tracking-normal">Placed on {order.date}</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none justify-center bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white/20 transition-all border border-white/10">
                        <HiOutlinePrinter className="w-4 h-4" />
                        <span>Print</span>
                    </button>
                    <button className="flex-1 sm:flex-none justify-center bg-shuleamber text-navblue px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-white transition-all shadow-lg shadow-shuleamber/20">
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Ready</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Items Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-50 bg-white">
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Ordered Goods</span>
                        </div>
                        <table className="w-full text-left text-navblue text-xs">
                            <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">Item</th>
                                    <th className="px-4 sm:px-6 py-4">Qty</th>
                                    <th className="hidden sm:table-cell px-6 py-4">Price</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {order.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-4 sm:px-6 py-4 font-bold text-[11px] sm:text-xs">{item.name}</td>
                                        <td className="px-4 sm:px-6 py-4">{item.qty} {item.unit}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 opacity-60">{item.price}</td>
                                        <td className="px-4 sm:px-6 py-4 font-black text-right">{item.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-navblue/[0.02] border-t border-gray-100 font-bold">
                                <tr>
                                    <td colSpan="2" className="sm:hidden px-4 py-2 text-right opacity-40 text-[10px]">Subtotal</td>
                                    <td colSpan="3" className="hidden sm:table-cell px-6 py-4 text-right opacity-40">Subtotal</td>
                                    <td className="px-4 sm:px-6 py-4 text-right">{order.subtotal}</td>
                                </tr>
                                <tr className="text-navblue sm:text-lg">
                                    <td colSpan="2" className="sm:hidden px-4 py-6 text-right font-black">Total</td>
                                    <td colSpan="3" className="hidden sm:table-cell px-6 py-6 text-right font-black">Grand Total</td>
                                    <td className="px-4 sm:px-6 py-6 text-right font-black text-navblue underline decoration-shuleamber decoration-2 sm:decoration-4 underline-offset-4">{order.grandTotal} RWF</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <HiOutlineClipboardCheck className="text-navblue/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Order Processing History</span>
                        </div>
                        <div className="flex flex-col gap-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-gray-100">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 items-start relative z-10">
                                    <div className={`w-6 h-6 rounded-full border-4 border-white shadow-md flex items-center justify-center shrink-0 ${step.active ? 'bg-green-500' : 'bg-gray-200'
                                        }`}>
                                        {step.active && <HiOutlineCheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className={`text-sm font-bold ${step.active ? 'text-navblue' : 'text-navblue/30'}`}>{step.title}</span>
                                        <span className="text-[10px] text-navblue/40 font-bold">{step.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="flex flex-col gap-6">
                    {/* School Info */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <HiOutlineLibrary className="text-navblue/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-navblue/30 uppercase tracking-widest">Ordering Institution</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-lg font-black text-navblue">{order.school.name}</span>
                            <span className="text-sm font-bold text-navblue/60 underline underline-offset-4">{order.school.contact}</span>
                        </div>
                        <div className="pt-4 border-t border-gray-50 flex flex-col gap-2">
                            <p className="text-xs text-navblue/50 leading-relaxed italic">{order.school.address}</p>
                            <p className="text-xs font-bold text-navblue">{order.school.phone}</p>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-navblue rounded-2xl shadow-sm p-6 flex flex-col gap-4 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="flex items-center gap-2 z-10">
                            <HiOutlineTruck className="text-white/20 w-5 h-5" />
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Logistics Assignment</span>
                        </div>
                        <div className="flex flex-col gap-1 z-10">
                            <span className="text-sm opacity-60">Assigned Driver</span>
                            <span className="text-lg font-bold">{order.shipping.driver}</span>
                        </div>
                        <div className="flex flex-col gap-1 z-10">
                            <span className="text-sm opacity-60">Vehicle</span>
                            <span className="text-xs font-medium">{order.shipping.vehicle}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex flex-col gap-1 z-10">
                            <span className="text-[10px] uppercase font-bold text-shuleamber tracking-widest">Estimated Arrival</span>
                            <span className="text-xl font-black">{order.shipping.expected}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
