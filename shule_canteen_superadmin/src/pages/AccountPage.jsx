import { useState } from 'react';
import {
    HiOutlineUser,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLocationMarker,
    HiOutlineShieldCheck,
    HiOutlineBell,
    HiOutlineGlobeAlt,
    HiOutlineCamera
} from 'react-icons/hi';

const AccountPage = () => {
    const [user, setUser] = useState({
        name: 'Munyarwanda Alice',
        role: 'Regional Supplier Manager',
        email: 'alice.m@edupoto.com',
        phone: '+250 788 000 000',
        location: 'Kigali, Rwanda',
        avatar: null
    });

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">My <span className="text-shuleamber">Account</span></h2>
                    <p className="text-sm opacity-60">Regional Supplier Portal & Identity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full bg-navblue/5 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                                <HiOutlineUser className="w-16 h-16 text-navblue/20" />
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-shuleamber text-navblue rounded-xl flex items-center justify-center shadow-lg hover:bg-white transition-all">
                                <HiOutlineCamera className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mt-8">
                            <h3 className="text-navblue text-2xl font-black">{user.name}</h3>
                            <p className="text-xs uppercase opacity-60">{user.role}</p>
                        </div>
                        <div className="w-full h-[1px] bg-gray-50 my-6"></div>
                        <div className="w-full flex flex-col gap-4 text-left">
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlineMail className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Email Address</span>
                                    <span className="text-xs font-bold leading-tight">{user.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlinePhone className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Phone Number</span>
                                    <span className="text-xs font-bold leading-tight">{user.phone}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-navblue">
                                <div className="w-8 h-8 rounded-lg bg-navblue/5 flex items-center justify-center shrink-0">
                                    <HiOutlineLocationMarker className="w-4 h-4 opacity-40" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-30">Office Location</span>
                                    <span className="text-xs font-bold leading-tight">{user.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Panels */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Security Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                <HiOutlineShieldCheck className="w-6 h-6 text-shuleamber" />
                            </div>
                            <div>
                                <h3 className="text-[sm opacity-30">Security & Access</h3>
                                <p className="text-xs font-bold mt-0.5">Password and identification</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm opacity-30 ml-1">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm opacity-30 ml-1">New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all"
                                />
                            </div>
                        </div>
                        <button className="mt-8 bg-navblue text-white px-8 py-2 rounded-lg text-sm hover:bg-shuleamber hover:text-navblue transition-all shadow-xl shadow-navblue/10">
                            Update Security
                        </button>
                    </div>

                    {/* Regional Settings */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-navblue">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-shuleamber/10 flex items-center justify-center">
                                <HiOutlineGlobeAlt className="w-6 h-6 text-shuleamber" />
                            </div>
                            <div>
                                <h3 className="text-[sm opacity-30">Regional Preferences</h3>
                                <p className="text-xs font-bold mt-0.5">Language and timezone</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm opacity-30 ml-1">Preferred Language</label>
                                <select className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all appearance-none">
                                    <option>English (International)</option>
                                    <option>Kinyarwanda</option>
                                    <option>French (Francophone)</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm opacity-30 ml-1">Timezone</label>
                                <select className="bg-navblue/5 border-none rounded-2xl px-5 py-4 text-sm font-bold text-navblue focus:ring-1 focus:ring-navblue transition-all appearance-none">
                                    <option>CAT (UTC+02:00) Kigali</option>
                                    <option>EAT (UTC+03:00) Nairobi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPage;
