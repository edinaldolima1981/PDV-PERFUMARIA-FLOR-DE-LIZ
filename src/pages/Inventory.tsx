import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';

const Inventory: React.FC = () => {
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(location.state?.brand || '');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nome: '',
        preco: '',
        marca_id: '',
        quantidade: '0'
    });

    useEffect(() => {
        loadInventory();
        loadBrands();
        if (location.state?.brand) {
            setSearchTerm(location.state.brand);
        }
    }, [location.state]);

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

    const loadBrands = async () => {
        try {
            const data = await api.getBrands();
            setBrands(data || []);
        } catch (error) {
            console.error('Erro ao carregar marcas:', error);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createProduct({
                nome: newProduct.nome,
                preco: parseFloat(newProduct.preco),
                marca_id: newProduct.marca_id,
            }, parseInt(newProduct.quantidade));

            setIsModalOpen(false);
            setNewProduct({ nome: '', preco: '', marca_id: '', quantidade: '0' });
            loadInventory();
        } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Erro ao adicionar produto');
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

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Novo Produto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome do Produto</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newProduct.nome}
                                    onChange={e => setNewProduct({ ...newProduct, nome: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preço (R$)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProduct.preco}
                                        onChange={e => setNewProduct({ ...newProduct, preco: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Qtd. Inicial</label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProduct.quantidade}
                                        onChange={e => setNewProduct({ ...newProduct, quantidade: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Marca</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                                    value={newProduct.marca_id}
                                    onChange={e => setNewProduct({ ...newProduct, marca_id: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id} className="bg-slate-900">{b.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <button type="submit" className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4">
                                Cadastrar Produto
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 size-14 bg-gradient-to-br from-gold to-accent-gold text-background-dark rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 border-2 border-white/20"
            >
                <span className="material-symbols-outlined text-3xl font-bold">add</span>
            </button>
        </div>
    );
};

export default Inventory;
