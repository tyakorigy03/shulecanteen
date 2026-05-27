import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineDatabase,
    HiOutlineArrowCircleUp,
    HiOutlineArrowCircleDown,
    HiOutlineRefresh,
    HiOutlineCheckCircle,
    HiChevronDown,
    HiSearch,
    HiOutlineArrowLeft,
    HiOutlinePlus,
    HiOutlineTrash,
    HiArrowRight
} from 'react-icons/hi';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const StockAdjustmentPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mode, setMode] = useState('In');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'inventory'),
            where('canteenId', '==', user.id || user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setInventory(items);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const defaultLine = () => ({ id: Date.now(), product: null, quantity: '' });

    // Stock In / Stock Out: multi-line
    const [lines, setLines] = useState([defaultLine()]);

    // Transform: single fields
    const [tfFrom, setTfFrom] = useState(null);
    const [tfFromQty, setTfFromQty] = useState('');
    const [tfTo, setTfTo] = useState(null);
    const [tfToQty, setTfToQty] = useState('');

    const [activeDropdown, setActiveDropdown] = useState({ id: null });
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    const filteredItems = (exclude) => inventory.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) && p.id !== exclude?.id
    );

    const modes = [
        { id: 'In', label: 'Stock In', icon: <HiOutlineArrowCircleUp /> },
        { id: 'Out', label: 'Stock Out', icon: <HiOutlineArrowCircleDown /> },
        { id: 'Transform', label: 'Transform', icon: <HiOutlineRefresh /> }
    ];

    const switchMode = (newMode) => {
        setMode(newMode);
        setLines([defaultLine()]);
        setTfFrom(null); setTfFromQty(''); setTfTo(null); setTfToQty('');
        setActiveDropdown({ id: null });
    };

    const addLine = () => setLines([...lines, defaultLine()]);
    const removeLine = (idx) => { if (lines.length > 1) setLines(lines.filter((_, i) => i !== idx)); };
    const updateLine = (idx, updates) => setLines(lines.map((l, i) => i === idx ? { ...l, ...updates } : l));

    const isInvalid = mode === 'Transform'
        ? !tfFrom || !tfFromQty || !tfTo || !tfToQty
        : lines.some(l => !l.product || !l.quantity);

    const handleSubmit = async () => {
        if (isInvalid) return;
        setIsSubmitting(true);
        try {
            const batch = [];
            const auditLogs = [];

            if (mode === 'Transform') {
                // Source
                batch.push(updateDoc(doc(db, 'inventory', tfFrom.id), {
                    stock: increment(-parseFloat(tfFromQty)),
                    updatedAt: serverTimestamp()
                }));
                // Target
                batch.push(updateDoc(doc(db, 'inventory', tfTo.id), {
                    stock: increment(parseFloat(tfToQty)),
                    updatedAt: serverTimestamp()
                }));

                auditLogs.push({
                    type: 'transform',
                    from: tfFrom.id,
                    fromName: tfFrom.name,
                    fromQty: parseFloat(tfFromQty),
                    to: tfTo.id,
                    toName: tfTo.name,
                    toQty: parseFloat(tfToQty),
                    reason,
                    canteenId: user.id || user.uid,
                    createdAt: serverTimestamp()
                });
            } else {
                for (const line of lines) {
                    const adjustment = mode === 'In' ? parseFloat(line.quantity) : -parseFloat(line.quantity);
                    batch.push(updateDoc(doc(db, 'inventory', line.product.id), {
                        stock: increment(adjustment),
                        updatedAt: serverTimestamp()
                    }));

                    auditLogs.push({
                        type: mode === 'In' ? 'stock_in' : 'stock_out',
                        productId: line.product.id,
                        productName: line.product.name,
                        quantity: parseFloat(line.quantity),
                        reason,
                        canteenId: user.id || user.uid,
                        createdAt: serverTimestamp()
                    });
                }
            }

            // Execute all updates
            await Promise.all(batch);

            // Log audits
            for (const log of auditLogs) {
                await addDoc(collection(db, 'inventory_audit'), log);
            }

            alert('Stock adjusted successfully!');
            navigate('/inventory');
        } catch (error) {
            console.error("Error adjusting stock:", error);
            alert('Failed to adjust stock. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const close = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setActiveDropdown({ id: null });
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const Dropdown = ({ id, selected, onSelect, placeholder, excludeItem, withSearch }) => {
        const isOpen = activeDropdown.id === id;
        const items = filteredItems(excludeItem);
        const triggerRef = useRef(null);
        const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, showUp: false });

        useEffect(() => {
            const updateCoords = () => {
                if (triggerRef.current) {
                    const rect = triggerRef.current.getBoundingClientRect();
                    const spaceBelow = window.innerHeight - rect.bottom;
                    const menuHeight = 300; // Estimated max height
                    const shouldShowUp = spaceBelow < menuHeight && rect.top > menuHeight;

                    setCoords({
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        width: rect.width,
                        showUp: shouldShowUp
                    });
                }
            };

            if (isOpen) {
                updateCoords();
                window.addEventListener('resize', updateCoords);
                window.addEventListener('scroll', updateCoords, true);
            }

            return () => {
                window.removeEventListener('resize', updateCoords);
                window.removeEventListener('scroll', updateCoords, true);
            };
        }, [isOpen]);

        return (
            <div className="relative w-full">
                <button
                    ref={triggerRef}
                    onClick={(e) => { e.stopPropagation(); setActiveDropdown({ id: isOpen ? null : id }); setSearchQuery(''); }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all bg-white ${isOpen ? 'border-shuleamber ring-2 ring-shuleamber/10' : 'border-slate-200 hover:border-slate-300'}`}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <HiOutlineDatabase className={`shrink-0 ${selected ? 'text-shuleamber' : 'text-slate-300'}`} />
                        <span className={`truncate ${selected ? 'text-navblue font-semibold' : 'text-slate-400'}`}>
                            {selected ? selected.name : placeholder}
                        </span>
                    </div>
                    <HiChevronDown className={`shrink-0 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'fixed',
                            top: coords.showUp ? 'auto' : `${coords.bottom + 4}px`,
                            bottom: coords.showUp ? `${window.innerHeight - coords.top + 4}px` : 'auto',
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                        }}
                        className={`z-[9999] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in ${coords.showUp ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'}`}
                    >
                        {withSearch && (
                            <div className="p-2 border-b border-slate-100">
                                <div className="relative">
                                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                                    <input
                                        autoFocus
                                        className="w-full pl-8 pr-3 py-2 text-sm text-navblue bg-slate-50 rounded-lg focus:outline-none"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-56 overflow-y-auto">
                            {items.length > 0 ? items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { onSelect(item); setActiveDropdown({ id: null }); }}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 text-left"
                                >
                                    <div>
                                        <div className="text-[13px] font-bold text-navblue leading-tight">{item.name}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{item.category}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-navblue">{item.stock}</div>
                                        <div className="text-[10px] font-black uppercase tracking-tighter text-slate-400">in stock</div>
                                    </div>
                                </button>
                            )) : (
                                <div className="px-4 py-8 text-center text-slate-400 text-sm italic">
                                    No items found
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>
        );
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-28 pt-16">
            <div className="max-w-4xl mx-auto px-4 space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-navblue font-black text-xl tracking-tight">Stock Adjustment</h1>
                    </div>
                </div>

                {/* Mode Tabs */}
                <div className="flex items-center p-1 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm">
                    {modes.map((m) => (
                        <button
                            key={m.id}
                            onClick={() => switchMode(m.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === m.id ? 'bg-navblue text-white shadow-lg shadow-navblue/20' : 'text-navblue/30 hover:text-navblue'}`}
                        >
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── STOCK IN / OUT: multi-line table ── */}
                {mode !== 'Transform' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="overflow-x-auto rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/30">
                                        <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-navblue/40">Item to adjust</th>
                                        <th className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-navblue/40 w-44">
                                            {mode === 'In' ? 'Qty to add' : 'Qty to remove'}
                                        </th>
                                        <th className="w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {lines.map((line, idx) => (
                                        <tr key={line.id} className="hover:bg-slate-50/50">
                                            <td className="py-2 px-2">
                                                <Dropdown
                                                    id={`line-${idx}`}
                                                    selected={line.product}
                                                    onSelect={(item) => updateLine(idx, { product: item })}
                                                    placeholder="Select item..."
                                                    withSearch
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-navblue font-semibold text-center focus:outline-none focus:border-shuleamber transition-all"
                                                    value={line.quantity}
                                                    onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                                                />
                                            </td>
                                            <td className="py-4 px-3 text-center">
                                                {lines.length > 1 && (
                                                    <button onClick={() => removeLine(idx)} className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-all">
                                                        <HiOutlineTrash />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button
                            onClick={addLine}
                            className="w-full py-5 border-t border-slate-50 flex items-center justify-center gap-2 bg-slate-50/30 group hover:bg-shuleamber/5 transition-all"
                        >
                            <HiOutlinePlus className="text-slate-400 group-hover:text-shuleamber" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-shuleamber">Add another item</span>
                        </button>
                    </div>
                )}

                {/* ── TRANSFORM: single card form ── */}
                {mode === 'Transform' && (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-navblue/5 overflow-hidden">
                        <div className="p-8 space-y-8">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                                Reduce one item's stock and increase another. Useful for bulk-to-unit conversions, e.g. 1 box of Amandazi → 12 individual pieces.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
                                {/* Source */}
                                <div className="space-y-3">
                                    <label className="text-navblue/50 text-[10px] font-black uppercase tracking-widest ml-2">Source (take stock out)</label>
                                    <Dropdown
                                        id="tf-from"
                                        selected={tfFrom}
                                        onSelect={setTfFrom}
                                        placeholder="Select source item..."
                                        excludeItem={tfTo}
                                        withSearch
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity used"
                                        className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm text-navblue font-black focus:outline-none focus:border-shuleamber focus:bg-white transition-all shadow-sm"
                                        value={tfFromQty}
                                        onChange={(e) => setTfFromQty(e.target.value)}
                                    />
                                </div>

                                {/* Arrow */}
                                <div className="flex justify-center pb-5">
                                    <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center text-shuleamber shadow-inner">
                                        <HiArrowRight className="text-xl" />
                                    </div>
                                </div>

                                {/* Target */}
                                <div className="space-y-3">
                                    <label className="text-navblue/50 text-[10px] font-black uppercase tracking-widest ml-2">Target (add stock in)</label>
                                    <Dropdown
                                        id="tf-to"
                                        selected={tfTo}
                                        onSelect={setTfTo}
                                        placeholder="Select target item..."
                                        excludeItem={tfFrom}
                                        withSearch
                                    />
                                    <input
                                        type="number"
                                        placeholder="Quantity produced"
                                        className="w-full border border-slate-100 bg-slate-50/50 rounded-2xl px-5 py-4 text-sm text-navblue font-black focus:outline-none focus:border-shuleamber focus:bg-white transition-all shadow-sm"
                                        value={tfToQty}
                                        onChange={(e) => setTfToQty(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Summary hint */}
                            {tfFrom && tfFromQty && tfTo && tfToQty && (
                                <div className="bg-navblue p-5 rounded-2xl text-white flex items-center gap-4 shadow-xl shadow-navblue/20 animate-in zoom-in-95 duration-300">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                        <HiOutlineRefresh className="text-shuleamber text-xl" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Conversion Preview</span>
                                        <span className="text-sm font-bold">
                                            {tfFromQty} {tfFrom.name} <span className="text-shuleamber mx-1">→</span> {tfToQty} {tfTo.name}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reason & Submit */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-3">
                        <label className="text-navblue/50 text-[10px] font-black uppercase tracking-widest ml-2">Reason for this adjustment</label>
                        <textarea
                            placeholder="e.g. stock count correction, spoilage, returned items..."
                            className="w-full bg-white border border-slate-100 rounded-3xl py-5 px-6 text-sm font-bold text-navblue placeholder:text-slate-200 focus:outline-none focus:border-shuleamber min-h-[140px] shadow-xl shadow-navblue/5 transition-all resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col justify-end gap-4">
                        <button
                            onClick={handleSubmit}
                            disabled={isInvalid || isSubmitting}
                            className={`w-full py-5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${!isInvalid && !isSubmitting
                                ? 'bg-shuleamber text-navblue shadow-xl shadow-shuleamber/20'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-navblue border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="text-2xl" />
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">Apply Adjustment</span>
                                </>
                            )}
                        </button>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Audit trail will be logged</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StockAdjustmentPage;
