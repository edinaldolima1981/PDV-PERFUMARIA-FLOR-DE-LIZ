import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Reports: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [totalSales, setTotalSales] = useState(0);
    const [lowStockItems, setLowStockItems] = useState(0);
    const [topProducts, setTopProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [products, salesTotal] = await Promise.all([
                    api.getProducts(),
                    api.getSalesTotal(),
                ]);
                const lowStock = products.filter((p: any) => (p.quantidade ?? 0) <= (p.quantidade_minima ?? 5)).length;
                setLowStockItems(lowStock);
                setTopProducts(products.slice(0, 5));
                setTotalSales(salesTotal);
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-28">
            <main className="max-w-md mx-auto p-4 space-y-6">
                <header>
                    <h1 className="text-2xl font-black italic bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">Relatórios</h1>
                    <p className="text-xs text-slate-500 font-medium">Análise de desempenho em tempo real</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-4 border-l-4 border-emerald-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Faturamento Total</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-slate-400">R$</span>
                            <span className="text-xl font-black">{totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-4 border-l-4 border-amber-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Estoque Crítico</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-amber-500">{lowStockItems}</span>
                            <span className="text-sm font-bold text-slate-400">itens</span>
                        </div>
                    </div>
                </div>

                {/* Weekly Chart */}
                <section className="glass-card rounded-3xl p-6 shadow-xl">
                    <h2 className="text-sm font-bold mb-5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-sm">show_chart</span>
                        Curva de Vendas Semanal
                    </h2>
                    <div className="h-28 flex items-end justify-between gap-2">
                        {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div
                                    className="w-full bg-gradient-to-t from-primary/30 to-primary rounded-t-md transition-all duration-700 hover:opacity-80"
                                    style={{ height: `${h}%` }}
                                />
                                <span className="text-[8px] font-black text-slate-400 uppercase">{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Low stock alert */}
                {lowStockItems > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                        <div className="size-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-sm">warning</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-red-500">{lowStockItems} item(s) com estoque crítico</h3>
                            <p className="text-[10px] text-red-400 font-medium">Reposição recomendada</p>
                        </div>
                    </div>
                )}

                {/* Top Products */}
                <section>
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Produtos no Catálogo</h2>
                    <div className="space-y-3">
                        {topProducts.length === 0 && (
                            <p className="text-center py-8 opacity-40 text-sm">Nenhum produto cadastrado ainda.</p>
                        )}
                        {topProducts.map((product, i) => (
                            <div key={product.id} className="glass-card rounded-2xl p-4 flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                    #{i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold truncate">{product.nome}</h4>
                                    <p className="text-[10px] text-slate-400 uppercase">{product.marca_nome || '—'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black">R$ {(product.preco ?? 0).toFixed(2).replace('.', ',')}</p>
                                    <p className={`text-[10px] font-bold ${(product.quantidade ?? 0) <= (product.quantidade_minima ?? 5) ? 'text-amber-500' : 'text-emerald-500'}`}>
                                        {product.quantidade ?? 0} un
                                    </p>
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
