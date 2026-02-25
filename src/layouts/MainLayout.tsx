import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Início', icon: 'home' },
        { path: '/pdv', label: 'Vender', icon: 'sell' },
        { path: '/inventory', label: 'Produtos', icon: 'package_2' },
        { path: '/customers', label: 'Clientes', icon: 'group' },
        { path: '/settings', label: 'Ajustes', icon: 'settings' },
    ];

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-72 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#120b08] flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 bg-primary flex items-center justify-center rounded-lg shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-white">temp_preferences_custom</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold leading-none">Luxury PDV</h2>
                        <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mt-1">Fragrance System</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-4 px-4">Menu Principal</div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-primary/10 text-primary border-l-4 border-primary rounded-l-none'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                            >
                                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{item.icon}</span>
                                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-white/5">
                        <div className="size-8 rounded-full bg-gold/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gold text-sm">person</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold truncate">Arquiteto de Sistema</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Plano Premium Luxury</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Desktop Header / Mobile Header */}
                <header className="h-20 flex items-center justify-between px-4 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/80 backdrop-blur-md z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-gold lg:hidden">menu</span>
                        <h1 className="text-lg lg:text-xl font-bold tracking-tight">
                            {navItems.find(n => n.path === location.pathname)?.label || 'Luxury Edition'}
                            <span className="text-primary font-black hidden sm:inline ml-2">- Luxury PDV</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">shopping_cart</span>
                            <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold px-1.5 rounded-full border-2 border-white dark:border-charcoal">0</span>
                        </button>
                        <div className="size-10 rounded-full border border-gold/30 gold-border bg-gold/10 hidden sm:flex items-center justify-center">
                            <span className="material-symbols-outlined text-gold">person</span>
                        </div>
                    </div>
                </header>

                {/* Page Outlet */}
                <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark relative">
                    {/* Background Light Effect */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10" />

                    <Outlet />
                </section>

                {/* Mobile Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass-card border-t border-white/10 px-4 pb-6 pt-3 flex justify-between items-center bg-white dark:bg-background-dark/95 backdrop-blur-xl">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center gap-1 flex-1 transition-colors ${isActive ? 'text-gold' : 'text-slate-400'
                                    }`}
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {item.icon}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </main>
        </div>
    );
};

export default MainLayout;
