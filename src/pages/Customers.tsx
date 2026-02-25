import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Customers: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredCustomers = customers.filter(c =>
        c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.telefone && c.telefone.includes(searchTerm))
    );

    const receivableStats = [
        { name: 'Beatriz Soares', progress: 100, status: 'Em Dia' },
        { name: 'Ricardo Mendes', progress: 92, status: 'Em Dia' },
        { name: 'Juliana Lima', progress: 65, status: 'Atraso 5d', type: 'pending' },
        { name: 'Gustavo Pereira', progress: 30, status: 'Crítico', type: 'critical' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-24">
            <main className="max-w-md mx-auto p-4 space-y-8">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-4 py-3.5 glass-card border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-base placeholder:text-slate-400 bg-white/50 dark:bg-white/5 backdrop-blur-md"
                        placeholder="Buscar cliente..."
                    />
                </div>
                {/* Loyalty Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">workspace_premium</span>
                            Programa de Fidelidade
                        </h2>
                        <span className="text-[10px] font-black tracking-widest text-primary px-2 py-1 bg-primary/10 rounded uppercase">Top Tier</span>
                    </div>

                    <div className="space-y-3">
                        {filteredCustomers.map((customer) => (
                            <div key={customer.id} className="glass-card rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-all cursor-pointer">
                                <div className="relative">
                                    <div className="size-16 rounded-full border-2 border-primary overflow-hidden shadow-inner bg-slate-800 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-3xl">person</span>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-gold text-[9px] font-black px-2 py-0.5 rounded-full text-white shadow-lg uppercase tracking-tighter">VIP</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate">{customer.nome}</h3>
                                    <p className="text-xs text-slate-400">{customer.telefone}</p>
                                    <div className="flex gap-4 mt-2 opacity-70 text-[9px] font-black uppercase tracking-widest">
                                        <span>Última: Ver histórico</span>
                                        <span className="text-gold">{customer.pontos} Pontos</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <p className="text-center py-10 opacity-50">Nenhum cliente encontrado.</p>
                        )}
                    </div>
                </section>

                {/* Payment Flow Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                            Fluxo de Recebíveis
                        </h2>
                    </div>

                    {/* Sections: In Order */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
                                <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                Destaque: Em Dia
                            </h3>
                            <div className="glass-card rounded-2xl p-5 space-y-5 shadow-inner">
                                {receivableStats.filter(s => !s.type).map((s) => (
                                    <div key={s.name} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold">{s.name}</span>
                                            <span className="text-emerald-500 font-black">{s.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full shadow-lg" style={{ width: `${s.progress}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                                <span className="size-2 bg-primary rounded-full" />
                                Atenção: Pendências
                            </h3>
                            <div className="glass-card rounded-2xl p-5 space-y-5 shadow-inner">
                                {receivableStats.filter(s => s.type).map((s) => (
                                    <div key={s.name} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-bold">{s.name}</span>
                                            <span className={`font-black ${s.type === 'critical' ? 'text-red-500' : 'text-primary'}`}>
                                                {s.progress}% ({s.status})
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full shadow-lg ${s.type === 'critical' ? 'bg-red-500' : 'bg-primary opacity-60'}`}
                                                style={{ width: `${s.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Floating Action Button */}
            <button className="fixed bottom-24 right-6 size-14 bg-gradient-to-br from-gold to-accent-gold text-background-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-2 border-white/20">
                <span className="material-symbols-outlined text-3xl font-bold">person_add</span>
            </button>
        </div>
    );
};

export default Customers;
