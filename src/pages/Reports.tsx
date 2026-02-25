import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        pendingPayments: 0,
        lowStockItems: 0,
        topProducts: [] as any[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // In a real scenario, we would have a specific RPC or more complex query
                const products = await api.getProducts();
                const lowStock = products.filter((p: any) => p.quantidade <= p.quantidade_minima).length;

                setStats({
                    totalSales: 4850.00, // Placeholder until more complex sale history is implemented
                    pendingPayments: 1250.00,
                    lowStockItems: lowStock,
                    topProducts: products.slice(0, 3)
                });
            } catch (error) {
                console.error('Erro ao carregar relatórios:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent italic">Relatórios Avançados</h1>
                        <p className="text-xs text-slate-500 font-medium">Análise de desempenho em tempo real</p>
                    </div>
                    <div className="size-10 rounded-xl glass-card flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                </header>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-4 border-l-4 border-emerald-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Faturamento (Mês)</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-400">R$</span>
                            <span className="text-xl font-black">{stats.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-4 border-l-4 border-gold">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">A Receber</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-400">R$</span>
                            <span className="text-xl font-black">{stats.pendingPayments.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Visual Chart Placeholder */}
                <section className="glass-card rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-8xl scale-150">trending_up</span>
                    </div>

                    <h2 className="text-sm font-bold mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                        Curva de Vendas Semanal
                    </h2>

                    <div className="h-32 flex items-end justify-between gap-2 px-2">
                        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-lg transition-all duration-700 hover:scale-x-110 cursor-pointer shadow-lg shadow-primary/10"
                                    style={{ height: `${h}%` }}
                                ></div>
                                <span className="text-[8px] font-black text-slate-400 uppercase">{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Low Stock Alert */}
                {stats.lowStockItems > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
                        <div className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-500">{stats.lowStockItems} Itens com estoque crítico</h3>
                            <p className="text-[10px] text-red-500/70 font-medium">Reposição imediata recomendada</p>
                        </div>
                        <button className="text-[10px] font-black uppercase text-red-500 hover:underline">Ver</button>
                    </div>
                )}

                {/* Top Products */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Produtos Mais Vendidos</h2>
                    <div className="space-y-3">
                        {stats.topProducts.map((product, i) => (
                            <div key={product.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                                <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center text-primary font-black shadow-inner">
                                    #{i + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold">{product.nome}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{product.marca_nome}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-emerald-500">+12%</p>
                                    <p className="text-[9px] text-slate-400">vs Mês Ant.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Reports;
