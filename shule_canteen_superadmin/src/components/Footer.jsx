const Footer = () => {
    return (
        <footer className="flex flex-col items-center space-y-6 mt-12 pb-8">
            <div className="flex items-center space-x-4">
                <div className="h-[1px] w-12 bg-linear-to-r from-transparent to-white/10"></div>
                <div className="flex items-center space-x-1.5 whitespace-nowrap">
                    <span className="text-white/40 text-xs font-bold">Managed by</span>
                    <span className="text-white font-black text-lg leading-none tracking-tighter">
                        EDU<span className="text-shuleamber">POTO</span>
                    </span>
                </div>
                <div className="h-[1px] w-12 bg-linear-to-l from-transparent to-white/10"></div>
            </div>
            <div className="flex flex-col items-center space-y-4 px-4 text-center">
                <div className="flex items-center space-x-2 opacity-30">
                    <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                    <p className="text-white text-[10px] sm:text-xs font-bold leading-relaxed">
                        © {new Date().getFullYear()} Edupoto Global. All rights reserved.
                    </p>
                    <div className="w-1 h-1 rounded-full bg-shuleamber"></div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
