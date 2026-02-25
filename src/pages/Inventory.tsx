import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const Inventory: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            setLoading(true);
            const data = await api.getProducts();
            setProducts(data || []);
        } catch (error) {
            console.error('Erro ao carregar inventário:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.marca_nome && p.marca_nome.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = filter === 'all' || (filter === 'low' && p.quantidade <= p.quantidade_minima);
        return matchesSearch && matchesFilter;
    });

    const adjustStock = async (produtoId: string, delta: number) => {
        try {
            const updated = await api.updateStock(produtoId, delta);
            setProducts(prev => prev.map(p =>
                p.id === produtoId ? { ...p, quantidade: updated.quantidade } : p
            ));
        } catch (error) {
            console.error('Erro ao ajustar estoque:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-24">
            <main className="max-w-md mx-auto p-4 space-y-6">
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
                        placeholder="Pesquisar no estoque..."
                    />
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex h-10 shrink-0 items-center justify-center px-6 rounded-full font-semibold text-sm transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'glass-card text-slate-400'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`flex h-10 shrink-0 items-center justify-center px-6 rounded-full font-semibold text-sm transition-all ${filter === 'low' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'glass-card text-slate-400'}`}
                    >
                        Baixo Estoque
                    </button>
                </div>

                {/* Summary Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventário Atual</h3>
                        <p className="text-2xl font-bold">{filteredProducts.length} Itens</p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                            <span className="size-2 rounded-full bg-emerald-500" /> Ok
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                            <span className="size-2 rounded-full bg-amber-500" /> Baixo
                        </span>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {filteredProducts.map((item) => (
                        <div
                            key={item.id}
                            className={`glass-card p-3 rounded-2xl flex gap-4 items-center transition-all hover:scale-[1.01] ${item.quantidade <= item.quantidade_minima ? 'ring-1 ring-amber-500/20' : ''
                                }`}
                        >
                            <div className="size-20 rounded-xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                                <img src={item.imagem_url || ''} className="w-full h-full object-cover" alt={item.nome} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-900 dark:text-white truncate">{item.nome}</h4>
                                <p className="text-xs text-slate-400 font-mono tracking-tighter uppercase">{item.marca_nome}</p>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Estoque</span>
                                        <span className={`text-sm font-bold ${item.quantidade <= item.quantidade_minima ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {item.quantidade} unidades
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => adjustStock(item.id, -1)}
                                            className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all font-bold"
                                        >
                                            -
                                        </button>
                                        <button
                                            onClick={() => adjustStock(item.id, 1)}
                                            className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white transition-all font-bold"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* FAB */}
            <button className="fixed bottom-24 right-6 size-14 bg-gradient-to-br from-gold to-accent-gold text-background-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-2 border-white/20">
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
            </button>
        </div>
    );
};

export default Inventory;
