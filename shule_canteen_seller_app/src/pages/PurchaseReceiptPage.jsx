import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    HiOutlineCheckCircle, 
    HiOutlinePrinter, 
    HiOutlineTruck, 
    HiOutlineArrowRight, 
    HiOutlineTag, 
    HiOutlineHome, 
    HiOutlineDeviceMobile, 
    HiOutlineCash, 
    HiOutlineCalendar, 
    HiOutlineClock, 
    HiOutlineUserGroup,
    HiOutlineClipboardList,
    HiOutlineOfficeBuilding,
    HiOutlineCheck,
    HiOutlineCube
} from 'react-icons/hi';
import QRCode from 'qrcode';

const PurchaseReceiptPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get data from state with safe defaults
    const orders = location.state?.orders || [];
    const originalOrders = location.state?.originalOrders || [];
    const totalAmount = location.state?.totalAmount || 0;
    const supplierCount = location.state?.supplierCount || 0;
    const school = location.state?.school || {};
    const orderedBy = location.state?.orderedBy || {};
    const paymentMethod = location.state?.paymentMethod || 'Cash';
    const momoNumber = location.state?.momoNumber || '';
    const deliveryLocation = location.state?.deliveryLocation || 'School Premises';
    const date = location.state?.date || new Date().toLocaleDateString();
    const receiptId = location.state?.receiptId || `PR-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    const orderStatus = location.state?.status || 'pending';

    const displayOrders = originalOrders.length > 0 ? originalOrders : orders;

    // Order progress steps
    const orderSteps = [
        { 
            key: 'pending', 
            label: 'Order Placed', 
            icon: HiOutlineClipboardList,
            description: 'Your order has been received',
            statusMessage: 'Waiting for supplier to confirm your order'
        },
        { 
            key: 'approved', 
            label: 'Approved', 
            icon: HiOutlineCheck,
            description: 'Supplier has confirmed your order',
            statusMessage: 'Supplier is preparing your items'
        },
        { 
            key: 'ready', 
            label: 'Processing', 
            icon: HiOutlineCube,
            description: 'Supplier is preparing your items',
            statusMessage: 'Your order is ready for delivery/collection'
        },
        { 
            key: 'delivered', 
            label: 'Delivered', 
            icon: HiOutlineTruck,
            description: 'Order has been delivered',
            statusMessage: 'Order delivered successfully!'
        }
    ];

    // Get current step index based on status
    const getCurrentStepIndex = () => {
        const statusMap = {
            'pending': 0,
            'approved': 1,
            'ready': 2,
            'delivered': 3
        };
        return statusMap[orderStatus] || 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    const handleProfessionalPrint = async () => {
        const qrDataUrl = await QRCode.toDataURL(`shule-voucher-${receiptId}`, {
            width: 120,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff'
            }
        });

        let ordersHtml = '';
        displayOrders.forEach((order, idx) => {
            const orderItems = order.items || [];
            ordersHtml += `
                <div style="margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                    <div style="background: #f8fafc; padding: 6px 10px; margin-bottom: 8px;">
                        <strong style="color: #f59e0b; font-size: 10px;">ORDER #${idx + 1}</strong>
                        <span style="margin-left: 10px; color: #0f172a; font-size: 10px; font-weight: 600;">Supplier: ${order.supplierName || 'Supplier'}</span>
                    </div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #0f172a; color: white;">
                                <th style="padding: 5px 8px; text-align: left; font-size: 9px;">Item</th>
                                <th style="padding: 5px 8px; text-align: center; width: 50px; font-size: 9px;">Qty</th>
                                <th style="padding: 5px 8px; text-align: right; width: 80px; font-size: 9px;">Price</th>
                                <th style="padding: 5px 8px; text-align: right; width: 80px; font-size: 9px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orderItems.map(item => `
                                <tr>
                                    <td style="padding: 4px 8px; border-bottom: 1px solid #f1f5f9; font-size: 9px;">${item.name}</td>
                                    <td style="padding: 4px 8px; text-align: center; border-bottom: 1px solid #f1f5f9; font-size: 9px;">${item.quantity}</td>
                                    <td style="padding: 4px 8px; text-align: right; border-bottom: 1px solid #f1f5f9; font-size: 9px;">${item.price?.toLocaleString() || 0}</td>
                                    <td style="padding: 4px 8px; text-align: right; border-bottom: 1px solid #f1f5f9; font-size: 9px; font-weight: 600;">${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td colspan="3" style="padding: 6px 8px; text-align: right; font-size: 9px; font-weight: 700;">Supplier Total:</td>
                                <td style="padding: 6px 8px; text-align: right; font-size: 10px; font-weight: 800;">RWF ${order.total?.toLocaleString() || 0}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            `;
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Procurement Receipt - ${receiptId}</title>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    @page { size: A4; margin: 8mm; }
                    body { font-family: 'Inter', sans-serif; color: #1a1a1a; background: #fff; font-size: 9px; padding: 0; margin: 0; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 1px solid #0f172a; padding-bottom: 8px; }
                    .brand { display: flex; align-items: center; gap: 8px; }
                    .brand-logo { width: 32px; height: 32px; object-fit: contain; }
                    .brand-text h1 { font-size: 12px; font-weight: 800; color: #0f172a; }
                    .brand-text p { font-size: 7px; color: #64748b; }
                    .doc-meta { text-align: right; }
                    .doc-type { font-size: 12px; font-weight: 800; color: #0f172a; }
                    .meta-row { display: flex; justify-content: flex-end; gap: 8px; font-size: 8px; margin-top: 2px; }
                    .label { color: #64748b; }
                    .value { font-weight: 700; }
                    .addresses { display: grid; grid-template-columns: 1fr 1fr auto; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
                    .block h3 { font-size: 7px; font-weight: 800; color: #94a3b8; margin-bottom: 3px; }
                    .block p { font-size: 9px; font-weight: 700; color: #1e293b; }
                    .block span { font-size: 7px; color: #64748b; }
                    .qr-container { text-align: right; }
                    .qr-container img { margin-bottom: 2px; }
                    .qr-container p { font-size: 6px; }
                    .footer-grid { display: grid; grid-template-columns: 1fr auto; gap: 20px; margin-top: 12px; padding-top: 8px; border-top: 1px solid #e2e8f0; }
                    .note-section h4 { font-size: 7px; font-weight: 800; margin-bottom: 4px; }
                    .note-section p { font-size: 7px; color: #64748b; }
                    .totals-section { text-align: right; }
                    .sub-row { display: flex; justify-content: flex-end; gap: 20px; font-size: 8px; margin-bottom: 3px; }
                    .grand { margin-top: 5px; padding-top: 3px; border-top: 1px solid #0f172a; font-size: 10px; font-weight: 800; }
                    .signatures { margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
                    .sig-block { border-top: 1px solid #cbd5e1; padding-top: 5px; }
                    .sig-block p { font-size: 6px; font-weight: 800; color: #64748b; }
                    .sig-block b { font-size: 8px; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="brand">
                        <img src="/logo.png" class="brand-logo" alt="Shule Canteen Logo" />
                        <div class="brand-text">
                            <h1>Shule Canteen</h1>
                            <p>PROCUREMENT RECEIPT</p>
                        </div>
                    </div>
                    <div class="doc-meta">
                        <div class="doc-type">RECEIPT</div>
                        <div class="meta-row"><span class="label">Date:</span><span class="value">${date}</span></div>
                        <div class="meta-row"><span class="label">Voucher:</span><span class="value">#${receiptId}</span></div>
                    </div>
                </div>

                <div class="addresses">
                    <div class="block">
                        <h3>TO</h3>
                        <p>${school.schoolName || school.name || 'School'}</p>
                        <span>${school.location || school.address || 'Canteen'}</span>
                    </div>
                    <div class="block">
                        <h3>PAYMENT</h3>
                        <p>${paymentMethod}</p>
                        <span>${paymentMethod === 'MoMo' ? momoNumber : 'Cash'}</span>
                    </div>
                    <div class="qr-container">
                        <img src="${qrDataUrl}" width="40" height="40" />
                        <p>VERIFIED</p>
                    </div>
                </div>

                ${ordersHtml}

                <div class="footer-grid">
                    <div class="note-section">
                        <h4>NOTE</h4>
                        <p>Consolidated receipt for procurement orders. Keep for records.</p>
                    </div>
                    <div class="totals-section">
                        <div class="sub-row"><span>TOTAL</span><span>RWF ${totalAmount.toLocaleString()}</span></div>
                    </div>
                </div>

                <div class="signatures">
                    <div class="sig-block"><p>PREPARED BY</p><b>Shule System</b></div>
                    <div class="sig-block"><p>RECEIVED BY</p><b>Store Manager</b></div>
                </div>
            </body>
            </html>
        `;

        // For iOS/mobile, open a new window and print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            
            // Wait for content to load then print
            printWindow.onload = () => {
                printWindow.print();
                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            };
        } else {
            // Fallback for browsers that block popups
            alert('Please allow popups to print the receipt, or use the browser\'s print function (Ctrl+P / Cmd+P)');
        }
    };

    // Alternative print method using browser's native print
    const handleBrowserPrint = () => {
        window.print();
    };

    if (displayOrders.length === 0 && orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Loading receipt data...</p>
                    <button onClick={() => navigate('/purchases')} className="mt-4 text-shuleamber text-sm">Back to Purchases</button>
                </div>
            </div>
        );
    }

    const currentStep = orderSteps[currentStepIndex];

    return (
        <div className="bg-slate-50 min-h-screen pb-32 pt-24 font-sans">
            <div className="max-w-lg mx-auto px-4 space-y-6">
                {/* Order Progress Tracker */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-navblue font-black text-sm mb-6 flex items-center gap-2">
                        <HiOutlineClock className="text-shuleamber" />
                        Order Progress
                    </h3>
                    <div className="relative">
                        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-slate-200"></div>
                        
                        <div className="space-y-6 relative">
                            {orderSteps.map((step, idx) => {
                                const Icon = step.icon;
                                const isCompleted = idx <= currentStepIndex;
                                const isCurrent = idx === currentStepIndex;
                                
                                return (
                                    <div key={step.key} className="flex items-start gap-4">
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                                            isCompleted 
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                                : 'bg-slate-100 text-slate-400'
                                        }`}>
                                            {isCompleted && idx < currentStepIndex ? (
                                                <HiOutlineCheck className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between flex-wrap gap-2">
                                                <h4 className={`font-bold text-sm ${isCompleted ? 'text-navblue' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </h4>
                                                {isCurrent && (
                                                    <span className="text-[8px] bg-shuleamber/10 text-shuleamber px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-[10px] mt-1 ${isCompleted ? 'text-slate-500' : 'text-slate-300'}`}>
                                                {step.description}
                                            </p>
                                            {isCurrent && (
                                                <p className="text-[10px] text-shuleamber mt-2 font-medium">
                                                    {step.statusMessage}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-xl shadow-navblue/5 flex flex-col items-center text-center space-y-3">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg text-white transition-all duration-500 ${
                        orderStatus === 'delivered' ? 'bg-green-500 shadow-green-500/20' : 'bg-shuleamber shadow-shuleamber/20'
                    }`}>
                        {orderStatus === 'delivered' ? (
                            <HiOutlineCheckCircle className="text-4xl animate-in zoom-in duration-500" />
                        ) : (
                            <HiOutlineClock className="text-4xl animate-pulse" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-navblue font-black text-2xl">
                            {orderStatus === 'delivered' ? 'Order Delivered!' : 'Order Confirmed'}
                        </h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {supplierCount} {supplierCount === 1 ? 'Order' : 'Orders'} • {totalAmount.toLocaleString()} RWF
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1">
                            Order ID: {receiptId}
                        </p>
                    </div>
                </div>

                {/* Ordered By Info */}
                {orderedBy && orderedBy.name && (
                    <div className="bg-shuleamber/5 p-4 rounded-2xl border border-shuleamber/10">
                        <p className="text-[8px] font-black uppercase tracking-widest text-shuleamber/70 mb-1">Ordered By</p>
                        <p className="text-navblue font-bold text-sm">{orderedBy.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                            {orderedBy.phone && (
                                <p className="text-[10px] text-navblue/60">📞 {orderedBy.phone}</p>
                            )}
                            {orderedBy.email && (
                                <p className="text-[10px] text-navblue/60">✉️ {orderedBy.email}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* School Info */}
                {school && (school.schoolName || school.name) && (
                    <div className="bg-navblue/5 p-4 rounded-2xl border border-navblue/10">
                        <p className="text-[8px] font-black uppercase tracking-widest text-navblue/40 mb-1">Ordering Institution</p>
                        <p className="text-navblue font-bold text-sm">{school.schoolName || school.name}</p>
                        <p className="text-[10px] text-navblue/60">{school.location || school.address || 'School Canteen'}</p>
                    </div>
                )}

                {/* Orders Summary */}
                {displayOrders.map((order, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-xl shadow-navblue/5 overflow-hidden border border-slate-100">
                        <div className="bg-navblue p-4">
                            <div className="flex items-center justify-between text-white">
                                <div className="flex items-center gap-2">
                                    <HiOutlineUserGroup className="text-shuleamber" />
                                    <span className="text-xs font-bold">Order #{idx + 1}</span>
                                </div>
                                <span className="text-sm font-black">{order.supplierName || 'Supplier'}</span>
                            </div>
                            {order.orderId && (
                                <p className="text-[8px] text-white/50 mt-1 font-mono">ID: {order.orderId}</p>
                            )}
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                {(order.items || []).map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex justify-between items-center">
                                        <div>
                                            <p className="text-navblue font-bold text-sm">{item.name}</p>
                                            <p className="text-[10px] text-slate-400">x{item.quantity} {item.unit || 'units'}</p>
                                        </div>
                                        <p className="text-navblue font-bold">RWF {((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-3 border-t border-slate-100 flex justify-between">
                                <span className="text-xs font-bold text-navblue">Supplier Total</span>
                                <span className="text-lg font-black text-navblue">RWF {order.total?.toLocaleString() || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Payment Info */}
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-navblue">Payment Method</span>
                        <span className="text-xs font-black text-shuleamber">{paymentMethod}</span>
                    </div>
                    {paymentMethod === 'MoMo' && momoNumber && (
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-navblue">Mobile Number</span>
                            <span className="text-xs font-black text-navblue">{momoNumber}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-200">
                        <span className="text-xs font-bold text-navblue">Delivery Location</span>
                        <span className="text-xs font-black text-navblue">{deliveryLocation}</span>
                    </div>
                </div>

                {/* Grand Total */}
                <div className="bg-shuleamber/10 p-5 rounded-2xl border border-shuleamber/20">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-black text-navblue uppercase tracking-widest">Grand Total</span>
                        <span className="text-2xl font-black text-navblue">RWF {totalAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Next Steps Based on Status */}
                {orderStatus !== 'delivered' && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Next Steps</h4>
                        <div className="space-y-2">
                            {orderStatus === 'pending' && (
                                <>
                                    <p className="text-[9px] text-blue-700">1. Supplier will confirm your order within 24 hours</p>
                                    <p className="text-[9px] text-blue-700">2. You'll receive a notification when order is confirmed</p>
                                    <p className="text-[9px] text-blue-700">3. Track order status from your purchases page</p>
                                </>
                            )}
                            {orderStatus === 'approved' && (
                                <>
                                    <p className="text-[9px] text-blue-700">1. Supplier is preparing your items for delivery</p>
                                    <p className="text-[9px] text-blue-700">2. You'll be notified when order is ready</p>
                                    <p className="text-[9px] text-blue-700">3. Estimated processing time: 2-3 business days</p>
                                </>
                            )}
                            {orderStatus === 'ready' && (
                                <>
                                    <p className="text-[9px] text-blue-700">1. Your order is ready for delivery/collection</p>
                                    <p className="text-[9px] text-blue-700">2. Contact supplier to arrange delivery/pickup</p>
                                    <p className="text-[9px] text-blue-700">3. Confirm receipt when items are delivered</p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pb-8">
                    <button onClick={handleProfessionalPrint} className="flex items-center justify-center space-x-2 bg-white border border-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-navblue hover:bg-slate-50 active:scale-95 transition-all">
                        <HiOutlinePrinter className="text-lg text-shuleamber" />
                        <span>Print Receipt</span>
                    </button>
                    <button
                        onClick={() => navigate('/purchases')}
                        className="flex items-center justify-center space-x-2 bg-white border border-slate-200 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-navblue hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        <HiOutlineTruck className="text-lg text-shuleamber" />
                        <span>Track Orders</span>
                    </button>
                </div>

                <button onClick={() => navigate('/purchases')} className="w-full py-4.5 bg-navblue text-white rounded-2xl flex items-center justify-center space-x-3 shadow-xl shadow-navblue/20 group uppercase font-black text-[11px] tracking-widest active:scale-95 transition-all">
                    <span>Procurement Dashboard</span>
                    <HiOutlineArrowRight className="text-shuleamber group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default PurchaseReceiptPage;