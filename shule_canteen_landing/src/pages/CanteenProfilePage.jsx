import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
    HiOutlineLibrary,
    HiOutlineLocationMarker,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineShieldCheck,
    HiOutlineArrowLeft
} from 'react-icons/hi';
import { QRCodeSVG } from 'qrcode.react';

const CanteenProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [canteen, setCanteen] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCanteen = async () => {
            try {
                const docRef = doc(db, 'onboarding_requests', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCanteen(docSnap.data());
                }
            } catch (error) {
                console.error("Error fetching canteen profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCanteen();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-navblue flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-shuleamber/20 border-t-shuleamber rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!canteen) {
        return (
            <div className="min-h-screen bg-navblue flex flex-col items-center justify-center text-white p-6">
                <h2 className="text-2xl font-black mb-4 uppercase tracking-widest">Facility Not Found</h2>
                <p className="opacity-60 mb-8">The requested canteen registry ID does not exist or has been removed.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-shuleamber text-navblue px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-navblue font-outfit text-white pb-20">
            {/* Header / Cover */}
            <div className="h-64 bg-gradient-to-br from-navblue via-navy-900 to-black relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-shuleamber/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 h-full flex flex-col justify-between py-8 relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                        <HiOutlineArrowLeft className="w-5 h-5 text-shuleamber" />
                    </button>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-shuleamber text-navblue text-[10px] font-black uppercase tracking-widest rounded-full">
                                Verified Facility
                            </span>
                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                Registry ID: {id}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black italic">{canteen.schoolName} Canteen</h1>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase text-shuleamber tracking-[0.2em]">Institutional Host</span>
                                        <div className="flex items-center gap-3">
                                            <HiOutlineLibrary className="w-5 h-5 opacity-40" />
                                            <p className="font-bold text-lg">{canteen.schoolName}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase text-shuleamber tracking-[0.2em]">Physical Premises</span>
                                        <div className="flex items-center gap-3">
                                            <HiOutlineLocationMarker className="w-5 h-5 opacity-40" />
                                            <p className="font-medium opacity-80">{canteen.location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase text-shuleamber tracking-[0.2em]">Served Capacity</span>
                                        <div className="flex items-center gap-3">
                                            <HiOutlineUserGroup className="w-5 h-5 opacity-40" />
                                            <p className="font-bold text-lg">{canteen.capacity} Pax Enrollment</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] font-black uppercase text-shuleamber tracking-[0.2em]">System Status</span>
                                        <div className="flex items-center gap-3">
                                            <HiOutlineCheckCircle className="w-5 h-5 text-green-400" />
                                            <p className="font-bold text-green-400 uppercase tracking-widest text-sm">Active & Certified</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div className="flex flex-col gap-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 text-center">Authorization Badge</h3>
                                <div className="flex justify-center">
                                    <div className="p-4 bg-white rounded-3xl shadow-2xl shadow-shuleamber/10 border-4 border-shuleamber/20">
                                        <QRCodeSVG
                                            value={window.location.href}
                                            size={120}
                                            level="H"
                                            includeMargin={false}
                                            className="w-24 h-24 sm:w-32 sm:h-32"
                                        />
                                    </div>
                                </div>
                                <p className="text-[9px] text-center opacity-30 font-bold uppercase tracking-widest leading-relaxed">
                                    This facility is integrated with the Shule Canteen Ecosystem.<br />
                                    Digital validation signature: {id.slice(-12).toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Quality Seal */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-shuleamber rounded-3xl p-8 text-navblue flex flex-col gap-6 relative overflow-hidden">
                            <HiOutlineShieldCheck className="w-24 h-24 absolute -right-6 -bottom-6 opacity-10 rotate-12" />
                            <h3 className="text-2xl font-black italic tracking-tight">Ecosystem <br />Certified</h3>
                            <p className="text-sm font-bold leading-relaxed opacity-80">
                                This canteen adheres to the Shule Canteen digital inventory and wallet management standards.
                            </p>
                            <ul className="flex flex-col gap-3">
                                {[
                                    'Cashless Transactions',
                                    'Nutritional Tracking',
                                    'Wallet Balance Real-time',
                                    'Authorized Suppliers Only'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter">
                                        <div className="w-1.5 h-1.5 bg-navblue rounded-full"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-4">
                            <h4 className="text-xs font-black uppercase tracking-widest opacity-40 text-shuleamber">Contact Info</h4>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Official Channel</p>
                                <p className="text-sm font-bold">{canteen.email || canteen.canteenEmail || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Direct Helpline</p>
                                <p className="text-sm font-bold">{canteen.phone || canteen.canteenPhone || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanteenProfilePage;
