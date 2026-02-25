import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Brand } from '../services/api';

const Settings: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        loadBrands();
        // Theme detection
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
    }, []);

    const loadBrands = async () => {
        try {
            setLoading(true);
            const data = await api.getAllBrands();
            setBrands(data || []);
        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createBrand({ nome: newBrandName, ativo: true });
            setNewBrandName('');
            setIsBrandModalOpen(false);
            loadBrands();
        } catch (error) {
            console.error('Erro ao criar marca:', error);
            alert('Erro ao criar marca');
        }
    };

    const toggleBrandStatus = async (brand: Brand) => {
        try {
            const updated = await api.updateBrand(brand.id, { ativo: !brand.ativo });
            setBrands(prev => prev.map(b => b.id === brand.id ? updated : b));
        } catch (error) {
            console.error('Erro ao atualizar marca:', error);
        }
    };

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
            <main className="max-w-2xl mx-auto p-6 space-y-8">
                {/* Profile Header */}
                <section className="flex items-center gap-6 p-6 glass-card rounded-3xl border border-white/10">
                    <div className="size-20 rounded-full border-4 border-primary/30 p-1">
                        <div className="size-full rounded-full bg-slate-800 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-4xl">person</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black italic tracking-tighter">Edinaldo Lima</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Administrador Premium</p>
                        <div className="mt-2 flex gap-2">
                            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-md border border-primary/20 uppercase">Luxury PDV</span>
                            <span className="px-2 py-1 bg-gold/10 text-gold text-[10px] font-black rounded-md border border-gold/20 uppercase">Acesso Total</span>
                        </div>
                    </div>
                </section>

                {/* System Preferences */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Preferências do Sistema</h3>
                    <div className="glass-card rounded-3xl overflow-hidden border border-white/10 divide-y divide-white/5">
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined">{darkMode ? 'dark_mode' : 'light_mode'}</span>
                                </div>
                                <div>
                                    <p className="font-bold">Modo Noturno</p>
                                    <p className="text-xs text-slate-500">Ajustar visual para ambientes escuros</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 size-6 bg-white rounded-full shadow-md transition-transform duration-300 ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold">
                                    <span className="material-symbols-outlined">notifications_active</span>
                                </div>
                                <div>
                                    <p className="font-bold">Notificações</p>
                                    <p className="text-xs text-slate-500">Alertas de estoque e aniversários</p>
                                </div>
                            </div>
                            <button className="w-14 h-8 rounded-full relative bg-primary">
                                <div className="absolute top-1 translate-x-7 size-6 bg-white rounded-full shadow-md" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Brand Management */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between ml-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Gerenciar Marcas</h3>
                        <button
                            onClick={() => setIsBrandModalOpen(true)}
                            className="text-[10px] font-black uppercase text-primary flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-xs">add</span> Nova Marca
                        </button>
                    </div>

                    <div className="glass-card rounded-3xl overflow-hidden border border-white/10">
                        <div className="max-h-[300px] overflow-y-auto divide-y divide-white/5 no-scrollbar">
                            {brands.map((brand) => (
                                <div key={brand.id} className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`size-10 rounded-xl flex items-center justify-center font-black italic text-white shadow-lg ${brand.ativo ? 'bg-gradient-to-br from-primary to-primary/60' : 'bg-slate-500 opacity-50'}`}>
                                            {brand.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`font-bold ${!brand.ativo ? 'text-slate-500 line-through' : ''}`}>{brand.nome}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-tight">{brand.ativo ? 'Ativo' : 'Inativo'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleBrandStatus(brand)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${brand.ativo ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}
                                    >
                                        {brand.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Store Info (Static Placeholder) */}
                <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-2">Dados da Unidade</h3>
                    <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Razão Social</p>
                                <p className="font-bold text-sm">Perfumaria Flor de Liz LTDA</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">CNPJ</p>
                                <p className="font-bold text-sm">12.345.678/0001-90</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Telefone</p>
                                <p className="font-bold text-sm">(81) 9 9999-9999</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Cidade</p>
                                <p className="font-bold text-sm">Jaboatão dos Guararapes, PE</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Backup & Support */}
                <section className="flex gap-4">
                    <button className="flex-1 p-6 glass-card rounded-3xl border border-blue-500/20 bg-blue-500/5 text-blue-500 flex flex-col items-center gap-2 hover:bg-blue-500/10 transition-all">
                        <span className="material-symbols-outlined">cloud_upload</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Backup Cloud</span>
                    </button>
                    <button className="flex-1 p-6 glass-card rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 flex flex-col items-center gap-2 hover:bg-emerald-500/10 transition-all">
                        <span className="material-symbols-outlined">support_agent</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Suporte Técnico</span>
                    </button>
                </section>

                <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-4">
                    Versão 2.4.0 (Luxury Edition)
                </p>
            </main>

            {/* Brand Modal */}
            {isBrandModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-xl font-bold mb-6">Nova Marca</h2>
                        <form onSubmit={handleCreateBrand} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome da Marca</label>
                                <input
                                    required
                                    autoFocus
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newBrandName}
                                    onChange={e => setNewBrandName(e.target.value)}
                                    placeholder="Ex: Dior, Chanel..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setIsBrandModalOpen(false)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 rounded-xl transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
