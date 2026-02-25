import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import type { Brand } from '../services/api';

const Inventory: React.FC = () => {
    const location = useLocation();
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        nome: '',
        preco: '',
        marca_id: '',
        quantidade: '1'
    });
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const init = async () => {
            const realBrands = await api.ensureDefaultBrands();
            setBrands(realBrands);
            await loadInventory();
        };
        init();
    }, []);

    // Apply brand filter from navigation state
    useEffect(() => {
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
            console.error('Erro ao carregar produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        if (!newProduct.marca_id) {
            setErrorMsg('Selecione uma marca.');
            return;
        }
        try {
            setSaving(true);
            await api.createProduct({
                nome: newProduct.nome,
                preco: parseFloat(newProduct.preco),
                marca_id: newProduct.marca_id,
            }, parseInt(newProduct.quantidade) || 1);
            setIsModalOpen(false);
            setNewProduct({ nome: '', preco: '', marca_id: '', quantidade: '1' });
            await loadInventory();
        } catch (error: any) {
            console.error('Erro ao adicionar produto:', error);
            setErrorMsg(error?.message || 'Erro ao cadastrar produto. Verifique os dados.');
        } finally {
            setSaving(false);
        }
    };

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

    const filteredProducts = products.filter(p => {
        const matchesSearch =
            p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.marca_nome?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filter === 'all' ||
            (filter === 'low' && (p.quantidade ?? 0) <= (p.quantidade_minima ?? 5));
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
            <main className="max-w-md mx-auto p-4 space-y-5">

                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-12 pr-10 py-3.5 glass-card border-none rounded-xl focus:ring-2 focus:ring-primary/50 bg-white/50 dark:bg-white/5 placeholder:text-slate-400"
                        placeholder="Pesquisar produto ou marca..."
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex h-9 shrink-0 items-center px-5 rounded-full font-semibold text-sm transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'glass-card text-slate-400'}`}
                    >
                        Todos ({products.length})
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`flex h-9 shrink-0 items-center px-5 rounded-full font-semibold text-sm transition-all ${filter === 'low' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'glass-card text-slate-400'}`}
                    >
                        Baixo Estoque ({products.filter(p => (p.quantidade ?? 0) <= (p.quantidade_minima ?? 5)).length})
                    </button>
                </div>

                {/* Summary */}
                <div className="flex justify-between items-center px-1">
                    <p className="text-sm font-bold">{filteredProducts.length} Produtos</p>
                    <div className="flex gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                            <span className="size-1.5 rounded-full bg-emerald-500 inline-block" /> Ok
                        </span>
                        <span className="flex items-center gap-1 text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                            <span className="size-1.5 rounded-full bg-amber-500 inline-block" /> Baixo
                        </span>
                    </div>
                </div>

                {/* Product list */}
                <div className="space-y-3">
                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                            <span className="material-symbols-outlined text-5xl mb-3">inventory_2</span>
                            <p className="font-bold">Nenhum produto encontrado</p>
                        </div>
                    )}
                    {filteredProducts.map((item) => (
                        <div
                            key={item.id}
                            className={`glass-card p-3 rounded-2xl flex gap-4 items-center transition-all ${(item.quantidade ?? 0) <= (item.quantidade_minima ?? 5) ? 'ring-1 ring-amber-500/30' : ''}`}
                        >
                            <div className="size-16 rounded-xl shrink-0 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                                {item.imagem_url
                                    ? <img src={item.imagem_url} className="w-full h-full object-cover" alt={item.nome} />
                                    : <span className="material-symbols-outlined text-slate-300 text-3xl">inventory_2</span>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold truncate">{item.nome}</h4>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{item.marca_nome || '—'}</p>
                                <p className="text-sm font-bold text-primary mt-0.5">
                                    R$ {(item.preco ?? 0).toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            <div className="flex flex-col items-center gap-2 shrink-0">
                                <span className={`text-xs font-black ${(item.quantidade ?? 0) <= (item.quantidade_minima ?? 5) ? 'text-amber-500' : 'text-emerald-500'}`}>
                                    {item.quantidade ?? 0} un
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => adjustStock(item.id, -1)}
                                        className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 font-bold text-lg transition-all"
                                    >−</button>
                                    <button
                                        onClick={() => adjustStock(item.id, 1)}
                                        className="size-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-white font-bold text-lg transition-all"
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* FAB */}
            <button
                onClick={() => { setIsModalOpen(true); setErrorMsg(''); }}
                className="fixed bottom-28 right-5 size-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
            >
                <span className="material-symbols-outlined text-2xl">add</span>
            </button>

            {/* Add Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold">Novo Produto</h2>
                            <button onClick={() => setIsModalOpen(false)} className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Marca *</label>
                                <select
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newProduct.marca_id}
                                    onChange={e => setNewProduct({ ...newProduct, marca_id: e.target.value })}
                                >
                                    <option value="">Selecione a marca...</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id} className="bg-slate-900">{b.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Nome do Produto *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                    value={newProduct.nome}
                                    onChange={e => setNewProduct({ ...newProduct, nome: e.target.value })}
                                    placeholder="Ex: Perfume Rose Affair..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Preço (R$) *</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProduct.preco}
                                        onChange={e => setNewProduct({ ...newProduct, preco: e.target.value })}
                                        placeholder="0,00"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Qtd. Inicial</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50"
                                        value={newProduct.quantidade}
                                        onChange={e => setNewProduct({ ...newProduct, quantidade: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">add_circle</span>
                                        Cadastrar Produto
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

export default Inventory;
