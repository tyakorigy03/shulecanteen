import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    HiOutlineArrowLeft,
    HiOutlineTruck,
    HiOutlineUser,
    HiOutlineLocationMarker,
    HiOutlinePhone,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineSave,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
    HiOutlineCube,
    HiOutlineCheck
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const DispatchNewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, supplier } = useAuth();
    const [activeStep, setActiveStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Form State
    const [dispatch, setDispatch] = useState({
        dispatchDate: new Date().toISOString().split('T')[0],
        priority: 'normal',
        notes: '',
        driverId: '',
        driverName: '',
        driverPhone: '',
        assignedOrders: []
    });

    const supplierId = user?.supplierId || supplier?.id;

    // Get preselected order from navigation state
    const preselectedOrder = location.state?.preselectedOrder;

    // Fetch available drivers - simplified to avoid index issues
    useEffect(() => {
        const fetchDrivers = async () => {
            if (!supplierId) {
                setLoadingDrivers(false);
                return;
            }
            
            try {
                // Simpler query without multiple where clauses
                const driversQuery = query(
                    collection(db, 'drivers'),
                    where('supplierId', '==', supplierId)
                );
                const driversSnapshot = await getDocs(driversQuery);
                const drivers = driversSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Filter in JavaScript instead of Firestore
                const availableDriversList = drivers.filter(d => 
                    d.status === 'active' && d.isAvailable === true
                );
                setAvailableDrivers(availableDriversList);
            } catch (error) {
                console.error('Error fetching drivers:', error);
            } finally {
                setLoadingDrivers(false);
            }
        };
        
        fetchDrivers();
    }, [supplierId]);

    // Fetch orders ready for dispatch - simplified to avoid index issues
    useEffect(() => {
        const fetchOrders = async () => {
            if (!supplierId) {
                setLoadingOrders(false);
                return;
            }
            
            try {
                // Fetch all orders for this supplier first
                const ordersQuery = query(
                    collection(db, 'purchase_orders'),
                    where('supplierId', '==', supplierId)
                );
                const ordersSnapshot = await getDocs(ordersQuery);
                // Filter for 'ready' status in JavaScript
                const readyOrders = ordersSnapshot.docs
                    .filter(doc => doc.data().status === 'ready')
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        school: doc.data().canteenName || doc.data().schoolName || 'Unknown School',
                        contactPerson: doc.data().orderedBy?.name || 'N/A',
                        phone: doc.data().orderedBy?.phone || '',
                        location: doc.data().schoolLocation || doc.data().deliveryLocation || '',
                        items: doc.data().items || [],
                        date: doc.data().createdAt?.toDate().toLocaleDateString() || 'N/A'
                    }));
                setPendingOrders(readyOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoadingOrders(false);
            }
        };
        
        fetchOrders();
    }, [supplierId]);

    // Handle preselected order
    useEffect(() => {
        if (preselectedOrder && pendingOrders.length > 0) {
            const orderExists = pendingOrders.find(o => o.id === preselectedOrder.id);
            if (orderExists && !dispatch.assignedOrders.some(o => o.id === preselectedOrder.id)) {
                setDispatch(prev => ({
                    ...prev,
                    assignedOrders: [...prev.assignedOrders, {
                        id: preselectedOrder.id,
                        school: preselectedOrder.schoolName || orderExists.school,
                        contactPerson: preselectedOrder.contactPerson || orderExists.contactPerson,
                        location: preselectedOrder.schoolLocation || orderExists.location,
                        phone: preselectedOrder.contactPhone || orderExists.phone,
                        items: preselectedOrder.items || orderExists.items || []
                    }]
                }));
            }
        }
    }, [preselectedOrder, pendingOrders]);

    const handleDriverSelect = (driver) => {
        setDispatch(prev => ({
            ...prev,
            driverId: driver.id,
            driverName: driver.fullName || driver.name,
            driverPhone: driver.phone
        }));
    };

    const toggleOrderSelection = (order) => {
        setDispatch(prev => {
            const isSelected = prev.assignedOrders.some(o => o.id === order.id);
            if (isSelected) {
                return {
                    ...prev,
                    assignedOrders: prev.assignedOrders.filter(o => o.id !== order.id)
                };
            } else {
                return {
                    ...prev,
                    assignedOrders: [...prev.assignedOrders, {
                        id: order.id,
                        school: order.school,
                        contactPerson: order.contactPerson,
                        location: order.location,
                        phone: order.phone,
                        items: order.items || []
                    }]
                };
            }
        });
    };

    const removeAssignedOrder = (orderId) => {
        setDispatch(prev => ({
            ...prev,
            assignedOrders: prev.assignedOrders.filter(order => order.id !== orderId)
        }));
    };

    const isFormValid = () => {
        return dispatch.driverId && dispatch.assignedOrders.length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid() || submitting) return;
        
        setSubmitting(true);
        
        try {
            const batch = writeBatch(db);
            
            // Create delivery document with clean data (no undefined values)
            const deliveryRef = doc(collection(db, 'deliveries'));
            const deliveryData = {
                deliveryCode: `DLV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                driverId: dispatch.driverId || '',
                driverName: dispatch.driverName || '',
                driverPhone: dispatch.driverPhone || '',
                orderIds: dispatch.assignedOrders.map(order => order.id) || [],
                orders: dispatch.assignedOrders.map(order => ({
                    id: order.id,
                    school: order.school || '',
                    contactPerson: order.contactPerson || '',
                    location: order.location || '',
                    phone: order.phone || '',
                    items: order.items || []
                })) || [],
                status: 'assigned',
                priority: dispatch.priority || 'normal',
                notes: dispatch.notes || '',
                dispatchDate: dispatch.dispatchDate ? new Date(dispatch.dispatchDate) : new Date(),
                supplierId: supplierId || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            
            console.log('Creating delivery:', deliveryData);
            batch.set(deliveryRef, deliveryData);
            
            // Update driver availability if driver exists
            if (dispatch.driverId) {
                const driverRef = doc(db, 'drivers', dispatch.driverId);
                batch.update(driverRef, {
                    isAvailable: false,
                    currentDeliveryId: deliveryRef.id,
                    updatedAt: serverTimestamp()
                });
            }
            
            // Update each order
            for (const order of dispatch.assignedOrders) {
                if (order.id) {
                    const orderRef = doc(db, 'purchase_orders', order.id);
                    batch.update(orderRef, {
                        deliveryId: deliveryRef.id,
                        deliveryStatus: 'assigned',
                        status: 'shipped',
                        updatedAt: serverTimestamp()
                    });
                }
            }
            
            await batch.commit();
            
            alert(`✅ Dispatch created! ${dispatch.assignedOrders.length} orders assigned to ${dispatch.driverName}.`);
            navigate('/deliveries');
            
        } catch (error) {
            console.error('Error creating dispatch:', error);
            alert('Failed to create dispatch: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const totalItemsCount = dispatch.assignedOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0);

    // Loading state
    if (loadingDrivers || loadingOrders) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/deliveries')}
                        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shrink-0"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Create New <span className="text-shuleamber">Dispatch</span></h2>
                        <p className="text-xs sm:text-sm opacity-50 font-medium">Assign driver and select orders for delivery</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex justify-center">
                    <div className="flex items-center justify-center lg:ml-24 w-full my-8 lg:my-12">
                        {[
                            { step: 1, label: 'Dispatch Info' },
                            { step: 2, label: 'Assign Driver' },
                            { step: 3, label: 'Select Orders' }
                        ].map((item, idx, arr) => (
                            <div key={item.step} className="flex flex-1 items-center relative h-10">
                                <div className="flex flex-col items-center z-10 w-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${activeStep > item.step ? 'bg-green-500 border-green-500' : activeStep === item.step ? 'bg-shuleamber border-shuleamber' : 'bg-white border-gray-200'}`}>
                                        {activeStep > item.step ? (
                                            <HiOutlineCheck className="w-5 h-5 text-white" />
                                        ) : (
                                            <span className={`text-[13px] font-bold ${activeStep === item.step ? 'text-navblue' : 'text-gray-300'}`}>
                                                {item.step}
                                            </span>
                                        )}
                                    </div>
                                    <div className="absolute top-12 w-32 text-center">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${activeStep >= item.step ? 'text-white' : 'text-white/30'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                </div>
                                {idx !== arr.length - 1 && (
                                    <div className="flex-1 h-[2px] bg-gray-200/20 mx-[-2px] relative z-0">
                                        <div className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500" style={{ width: activeStep > item.step ? '100%' : '0%' }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form Section */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Step 1: Dispatch Info */}
                        {activeStep === 1 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-shuleamber/10 flex items-center justify-center">
                                        <HiOutlineClipboardList className="w-6 h-6 text-shuleamber" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg uppercase">Dispatch Information</h3>
                                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Schedule and priority settings</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Dispatch Date</label>
                                        <input
                                            type="date"
                                            value={dispatch.dispatchDate}
                                            onChange={(e) => setDispatch(prev => ({ ...prev, dispatchDate: e.target.value }))}
                                            className="bg-navblue/5 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Priority Level</label>
                                        <select
                                            value={dispatch.priority}
                                            onChange={(e) => setDispatch(prev => ({ ...prev, priority: e.target.value }))}
                                            className="bg-navblue/5 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                        >
                                            <option value="normal">Normal</option>
                                            <option value="urgent">Urgent</option>
                                            <option value="express">Express</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Additional Notes</label>
                                        <textarea
                                            rows="3"
                                            value={dispatch.notes}
                                            onChange={(e) => setDispatch(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Special instructions for driver..."
                                            className="w-full bg-navblue/5 border-none rounded-xl px-5 py-3.5 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-6 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(2)}
                                        className="bg-navblue text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[10px] hover:bg-shuleamber hover:text-navblue transition-all flex items-center gap-3"
                                    >
                                        <span>Next: Assign Driver</span>
                                        <HiOutlinePlus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Assign Driver */}
                        {activeStep === 2 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                        <HiOutlineUser className="w-6 h-6 text-shuleamber" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg uppercase">Assign Driver</h3>
                                        <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Select a driver for this dispatch</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-8 max-h-[400px] overflow-y-auto">
                                    {availableDrivers.length === 0 ? (
                                        <div className="text-center py-8 text-navblue/40">
                                            <p>No available drivers found.</p>
                                            <button
                                                type="button"
                                                onClick={() => navigate('/fleet/register')}
                                                className="mt-2 text-shuleamber text-xs underline"
                                            >
                                                Register a new driver
                                            </button>
                                        </div>
                                    ) : (
                                        availableDrivers.map(driver => (
                                            <button
                                                key={driver.id}
                                                type="button"
                                                onClick={() => handleDriverSelect(driver)}
                                                className={`w-full flex justify-between items-center p-4 rounded-xl border transition-all ${dispatch.driverId === driver.id ? 'border-shuleamber bg-shuleamber/5' : 'border-gray-100'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${dispatch.driverId === driver.id ? 'border-shuleamber' : 'border-gray-300'}`}>
                                                        {dispatch.driverId === driver.id && <div className="w-2 h-2 rounded-full bg-shuleamber" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-navblue">{driver.fullName || driver.name}</div>
                                                        <div className="text-xs text-gray-500">{driver.phone}</div>
                                                        <div className="text-[10px] text-gray-400">{driver.vehicleType} • {driver.plateNumber}</div>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-green-500">Available</span>
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="flex justify-between pt-6 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(1)}
                                        className="text-navblue/40 px-6 py-4 rounded-xl font-bold uppercase text-[10px] hover:text-navblue transition-all flex items-center gap-2"
                                    >
                                        <HiOutlineArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(3)}
                                        disabled={!dispatch.driverId}
                                        className={`bg-navblue text-white px-8 py-3.5 rounded-xl font-bold uppercase text-[10px] transition-all flex items-center gap-3 ${!dispatch.driverId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-shuleamber hover:text-navblue'}`}
                                    >
                                        <span>Next: Select Orders</span>
                                        <HiOutlinePlus className="w-4 h-4 rotate-45" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Select Orders */}
                        {activeStep === 3 && (
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-8 border-b border-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                                <HiOutlineCube className="w-6 h-6 text-shuleamber" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg uppercase">Available Orders</h3>
                                                <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Select orders for this dispatch</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-bold text-shuleamber">{dispatch.assignedOrders.length}</span>
                                            <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Selected</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-h-[500px] overflow-y-auto">
                                    {pendingOrders.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            <p>No orders ready for dispatch.</p>
                                            <p className="text-xs mt-2">Orders need to be marked as 'ready' first.</p>
                                        </div>
                                    ) : (
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-white z-20">
                                                <tr className="border-b border-gray-50 text-xs font-bold text-navblue/40">
                                                    <th className="px-6 py-4 w-16">Select</th>
                                                    <th className="px-4 py-4">Order ID</th>
                                                    <th className="px-4 py-4">School</th>
                                                    <th className="px-4 py-4">Items</th>
                                                    <th className="px-6 py-4 text-right">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {pendingOrders.map(order => {
                                                    const isSelected = dispatch.assignedOrders.some(o => o.id === order.id);
                                                    return (
                                                        <tr
                                                            key={order.id}
                                                            className={`hover:bg-gray-50/50 transition-all cursor-pointer ${isSelected ? 'bg-shuleamber/[0.02]' : ''}`}
                                                            onClick={() => toggleOrderSelection(order)}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-shuleamber border-shuleamber' : 'border-gray-200'}`}>
                                                                    {isSelected && <HiOutlineCheck className="w-3.5 h-3.5 text-navblue" />}
                                                                </div>
                                                              </td>
                                                            <td className="px-4 py-4">
                                                                <div className="font-bold text-xs text-navblue">{order.id}</div>
                                                              </td>
                                                            <td className="px-4 py-4">
                                                                <div className="font-bold text-xs text-navblue">{order.school}</div>
                                                                <div className="text-[9px] text-gray-400">{order.contactPerson}</div>
                                                              </td>
                                                            <td className="px-4 py-4">
                                                                <div className="flex flex-wrap gap-1">
                                                                    {order.items?.slice(0, 2).map((item, idx) => (
                                                                        <span key={idx} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                                                                            {item.name} (x{item.quantity})
                                                                        </span>
                                                                    ))}
                                                                    {order.items?.length > 2 && (
                                                                        <span className="text-[8px] text-gray-400">+{order.items.length - 2}</span>
                                                                    )}
                                                                </div>
                                                              </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <span className="text-[9px] text-gray-400">{order.date}</span>
                                                              </td>
                                                          </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="p-8 bg-gray-50/30 flex justify-between items-center">
                                    <button
                                        type="button"
                                        onClick={() => setActiveStep(2)}
                                        className="text-navblue/40 px-6 py-4 rounded-xl font-bold uppercase text-[10px] hover:text-navblue transition-all flex items-center gap-2"
                                    >
                                        <HiOutlineArrowLeft className="w-4 h-4" />
                                        <span>Back</span>
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={!isFormValid() || submitting}
                                        className={`bg-shuleamber text-navblue px-10 py-3.5 rounded-xl font-bold uppercase text-xs transition-all flex items-center gap-3 ${(!isFormValid() || submitting) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-navblue hover:text-white'}`}
                                    >
                                        {submitting ? (
                                            <div className="w-4 h-4 border-2 border-navblue/20 border-t-navblue rounded-full animate-spin"></div>
                                        ) : (
                                            <HiOutlineSave className="w-4 h-4" />
                                        )}
                                        <span>Create Dispatch Bundle</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary Sidebar */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-navblue rounded-2xl p-6 shadow-xl border border-white/5 sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <HiOutlineTruck className="text-shuleamber w-5 h-5" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Dispatch Summary</span>
                            </div>

                            <div className="mb-6 pb-6 border-b border-white/10">
                                <div className="text-[9px] font-bold text-white/40 uppercase mb-2">Assigned Driver</div>
                                {dispatch.driverName ? (
                                    <div>
                                        <div className="font-bold text-white text-sm">{dispatch.driverName}</div>
                                        <div className="text-[10px] opacity-50">{dispatch.driverPhone}</div>
                                    </div>
                                ) : (
                                    <div className="text-xs opacity-40 italic">No driver assigned yet</div>
                                )}
                            </div>

                            <div className="mb-6 pb-6 border-b border-white/10">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="text-[9px] font-bold text-white/40 uppercase">Selected Orders</div>
                                    <div className="text-shuleamber font-bold text-sm">{dispatch.assignedOrders.length}</div>
                                </div>

                                {dispatch.assignedOrders.length > 0 ? (
                                    <div className="divide-y divide-white/5 max-h-[300px] overflow-y-auto">
                                        {dispatch.assignedOrders.map(order => (
                                            <div key={order.id} className="py-3 relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => removeAssignedOrder(order.id)}
                                                    className="absolute top-3 right-0 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <HiOutlineTrash className="w-3.5 h-3.5 text-red-400 hover:text-red-300" />
                                                </button>
                                                <div className="pr-6">
                                                    <div className="font-bold text-xs text-white">{order.id}</div>
                                                    <div className="text-[10px] opacity-60 mt-0.5 truncate">{order.school}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs opacity-40 italic">No orders selected</div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="opacity-30">Total Orders:</span>
                                    <span className="text-white">{dispatch.assignedOrders.length}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                                    <span className="opacity-30">Total Items:</span>
                                    <span className="text-white">{totalItemsCount}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest pt-3 border-t border-white/10">
                                    <span className="opacity-30">Priority:</span>
                                    <span className={`italic ${dispatch.priority === 'express' ? 'text-red-400' : dispatch.priority === 'urgent' ? 'text-orange-400' : 'text-shuleamber'}`}>
                                        {dispatch.priority}
                                    </span>
                                </div>
                            </div>

                            {!isFormValid() && (
                                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 mt-6">
                                    <p className="text-[9px] font-black text-red-400 text-center uppercase tracking-widest">
                                        {!dispatch.driverId && '• Select a driver\n'}
                                        {dispatch.assignedOrders.length === 0 && '• Select at least one order'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default DispatchNewPage;