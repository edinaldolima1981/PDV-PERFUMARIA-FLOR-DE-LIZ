import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const MainLayout: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Início', icon: 'home' },
        { path: '/inventory', label: 'Estoque', icon: 'package_2' },
        { path: '/pdv', label: 'Vendas', icon: 'sell' },
        { path: '/reports', label: 'Relatórios', icon: 'analytics' },
        { path: '/customers', label: 'Clientes', icon: 'group' },
        { path: '/settings', label: 'Ajustes', icon: 'settings' },
    ];

    return (
        <div className="flex flex-col h-screen w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative pb-24 lg:pb-0">
                {/* Desktop Header / Mobile Header */}
                <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-xl z-20 sticky top-0">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white">temp_preferences_custom</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight italic">
                            Flor de Liz <span className="text-primary not-italic text-sm ml-2 font-medium opacity-50 hidden sm:inline">Luxury PDV</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2.5 rounded-xl glass-card hover:bg-primary/10 transition-colors">
                            <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
                        </button>
                        <div className="size-10 rounded-full border-2 border-primary/30 p-0.5">
                            <div className="size-full rounded-full bg-slate-800 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-xl">person</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Outlet */}
                <section className="flex-1 overflow-y-auto bg-slate-50 dark:bg-background-dark relative">
                    {/* Background Light Effects */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] -z-10 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[140px] -z-10" />

                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </section>
            </main>

            {/* Bottom Navigation (Always Visible Footer) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 h-24 glass-card border-t border-white/10 px-6 flex justify-around items-center bg-white/90 dark:bg-background-dark/95 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1.5 transition-all duration-300 transform ${isActive
                                ? 'text-primary scale-110 -translate-y-1'
                                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                }`}
                        >
                            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-primary/15 shadow-inner' : ''}`}>
                                <span
                                    className="material-symbols-outlined text-2xl"
                                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                                >
                                    {item.icon}
                                </span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};

export default MainLayout;
