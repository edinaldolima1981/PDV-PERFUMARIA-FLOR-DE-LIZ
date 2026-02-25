import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ nome: '', telefone: '', data_nascimento: '' });
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            setLoading(true);
            const data = await api.getCustomers();
            setCustomers(data || []);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            setSaving(true);
            await api.createCustomer({
                nome: newCustomer.nome,
                telefone: newCustomer.telefone || undefined,
                data_nascimento: newCustomer.data_nascimento || undefined,
            });
            setIsModalOpen(false);
            setNewCustomer({ nome: '', telefone: '', data_nascimento: '' });
            await loadCustomers();
        } catch (error: any) {
            setErrorMsg(error?.message || 'Erro ao cadastrar cliente.');
        } finally {
            setSaving(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telefone?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
            <main className="max-w-md mx-auto p-4 space-y-6">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 glass-card border-none rounded-xl focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-white/5 placeholder:text-slate-400"
                        placeholder="Buscar cliente..."
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">workspace_premium</span>
                        Clientes ({filteredCustomers.length})
                    </h2>
                </div>

                {/* Customer List */}
                <div className="space-y-3">
                    {filteredCustomers.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                            <span className="material-symbols-outlined text-5xl mb-3">group</span>
                            <p className="font-bold">Nenhum cliente encontrado</p>
                            <p className="text-sm mt-1">Toque no + para cadastrar</p>
                        </div>
                    )}
                    {filteredCustomers.map((customer) => (
                        <div key={customer.id} className="glass-card rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-all">
                            <div className="size-14 rounded-full border-2 border-primary/40 bg-slate-800 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-primary text-2xl">person</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold truncate">{customer.nome}</h3>
                                <p className="text-xs text-slate-400">{customer.telefone || 'Sem telefone'}</p>
                                <p className="text-[10px] text-gold font-black uppercase tracking-wider mt-1">{customer.pontos ?? 0} Pontos</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                    ))}
                </div>
            </main>

            {/* FAB */}
            <button
                onClick={() => { setIsModalOpen(true); setErrorMsg(''); }}
                className="fixed bottom-28 right-5 size-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <span className="material-symbols-outlined text-2xl">person_add</span>
            </button>

            {/* Add Customer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">Novo Cliente</h2>
                            <button onClick={() => setIsModalOpen(false)} className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleAddCustomer} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Nome Completo *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newCustomer.nome}
                                    onChange={e => setNewCustomer({ ...newCustomer, nome: e.target.value })}
                                    placeholder="Ex: Maria Silva"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">WhatsApp</label>
                                <input
                                    type="tel"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newCustomer.telefone}
                                    onChange={e => setNewCustomer({ ...newCustomer, telefone: e.target.value })}
                                    placeholder="(81) 9 9999-9999"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Data de Nascimento</label>
                                <input
                                    type="date"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newCustomer.data_nascimento}
                                    onChange={e => setNewCustomer({ ...newCustomer, data_nascimento: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">person_add</span>
                                        Cadastrar Cliente
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customers;
