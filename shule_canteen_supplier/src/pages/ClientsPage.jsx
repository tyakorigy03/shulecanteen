import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineLibrary,
    HiOutlineLocationMarker,
    HiOutlineUser,
    HiOutlinePlus,
} from 'react-icons/hi';

const ClientsPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);

    const clients = [
        { id: 'CLN-1021', name: 'GS Kigali Canteen', location: 'Nyarugenge, Dist.', contact: 'Jean Bosco', phone: '0788111222', status: 'Active' },
        { id: 'CLN-1022', name: 'Riviera High School', location: 'Gasabo, Dist.', contact: 'Uwase Aline', phone: '0788222333', status: 'Active' },
        { id: 'CLN-1023', name: 'Green Hills Academy', location: 'Nyarutarama', contact: 'Mugabe Dan', phone: '0788333444', status: 'Active' },
        { id: 'CLN-1024', name: 'White Dove Girls', location: 'Kicukiro, Dist.', contact: 'Umuhoza Marie', phone: '0788444555', status: 'In Review' },
    ];

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (id) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    return (
        <div className="flex flex-col gap-6 font-outfit text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h2 className="text-3xl font-black">Client <span className="text-shuleamber">Registry</span></h2>
                    <p className="text-sm opacity-60 mt-1">Manage school canteens and supply agreements</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                    <span className="text-[10px] font-bold text-navblue/60 uppercase tracking-widest">Client Registry ({filteredClients.length})</span>
                    <div className="relative w-full max-w-none sm:max-w-xs">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-navblue/30 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by school or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-navblue/5 border-none rounded-xl py-2 pl-10 pr-4 text-xs text-navblue focus:ring-1 focus:ring-navblue transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left text-navblue text-xs relative">
                        <thead className="bg-navblue/5 border-b border-gray-100 uppercase text-[9px] tracking-wider text-navblue/40 font-bold">
                            <tr>
                                <th className="px-4 sm:px-6 py-4">Client Info</th>
                                <th className="hidden sm:table-cell px-6 py-4">Location</th>
                                <th className="hidden md:table-cell px-6 py-4">Focal Person</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Status</th>
                                <th className="px-4 sm:px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredClients.map(client => (
                                <tr key={client.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[11px] sm:text-xs leading-tight">{client.name}</span>
                                            <div className="sm:hidden flex flex-col gap-0.5 mt-0.5">
                                                <span className="text-[9px] opacity-40 italic">{client.location}</span>
                                                <span className="text-[9px] opacity-60 font-medium">{client.contact}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell px-6 py-4 opacity-70 italic font-medium">{client.location}</td>
                                    <td className="hidden md:table-cell px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{client.contact}</span>
                                            <span className="text-[10px] opacity-40">{client.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right">
                                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${client.status === 'Active' ? 'text-green-500 bg-green-50' : 'text-blue-500 bg-blue-50'
                                            }`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-right relative">
                                        <button
                                            onClick={() => toggleMenu(client.id)}
                                            className="text-navblue/20 hover:text-navblue transition-colors p-1"
                                        >
                                            <HiOutlineDotsVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredClients.length === 0 && (
                    <div className="p-12 text-center text-navblue opacity-30 italic">
                        No clients found in registry.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsPage;
