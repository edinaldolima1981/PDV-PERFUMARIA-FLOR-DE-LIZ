import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const PDV: React.FC = () => {
    const [showSuccess, setShowSuccess] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem('flordeliz_cart');
        if (savedCart) {
            setItems(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('flordeliz_cart', JSON.stringify(items));
    }, [items]);

    const brands = Array.from(new Set(items.map(item => item.brand || item.marca_nome)));

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        ).filter(item => item.quantity > 0));
    };

    const handleCheckout = async () => {
        try {
            setLoading(true);
            const saleData = {
                subtotal: total,
                total: total,
                forma_pagamento: 'pix', // Default for now
                status: 'concluida',
                cliente_id: null, // Default
                funcionario_id: null // Default
            };

            await api.createSale(saleData, items);

            setShowSuccess(true);
            setItems([]);
            setTimeout(() => {
                setShowSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            alert('Erro ao finalizar venda. Verifique sua conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-64">
            <header className="sticky top-0 z-20 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
                <div className="text-primary flex size-10 items-center justify-center cursor-pointer hover:bg-white/10 rounded-full transition-all" onClick={() => window.history.back()}>
                    <span className="material-symbols-outlined">arrow_back</span>
                </div>
                <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">Carrinho de Luxo</h2>
                <div className="flex w-10 items-center justify-end">
                    <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={() => setItems([])}>
                        <span className="material-symbols-outlined">delete_sweep</span>
                    </button>
                </div>
            </header>

            <main className="max-w-md mx-auto flex flex-col gap-6 p-4">
                {brands.map((brand) => (
                    <section key={brand}>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-gold material-symbols-outlined">
                                {brand === 'O Boticário' ? 'verified' : brand === 'Avon' ? 'stars' : 'eco'}
                            </span>
                            <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold uppercase tracking-widest">{brand}</h3>
                        </div>

                        <div className="glass-card rounded-xl p-3 flex flex-col gap-4 shadow-sm">
                            {items.filter(i => (i.brand || i.marca_nome) === brand).map((item) => (
                                <div key={item.id} className="flex items-center gap-4 justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-16 border border-slate-100 dark:border-slate-700 shadow-inner"
                                            style={{ backgroundImage: `url("${item.image || item.imagem_url}")` }}
                                        />
                                        <div className="flex flex-col justify-center">
                                            <p className="text-slate-900 dark:text-slate-100 text-base font-semibold leading-tight">{item.name || item.nome}</p>
                                            <p className="text-primary text-sm font-medium">R$ {(item.price || item.preco).toFixed(2).replace('.', ',')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1">
                                        <button
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-700 shadow-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >
                                            -
                                        </button>
                                        <span className="text-sm font-bold min-w-[1rem] text-center">{item.quantity}</span>
                                        <button
                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm hover:bg-primary/90 transition-colors"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <span className="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                        <p className="text-lg font-bold">Carrinho Vazio</p>
                        <p className="text-sm">Seus produtos aparecerão aqui.</p>
                    </div>
                )}
            </main>

            {/* Summary Section */}
            <section className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto p-4 bg-white/95 dark:bg-background-dark/95 border-t border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <span className="text-primary material-symbols-outlined">person</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Cliente Registrado</p>
                                <p className="text-sm font-bold">Helena de Souza Fontes</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 font-medium">Total do Carrinho</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">R$ {total.toFixed(2).replace('.', ',')}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="text-green-600 dark:text-green-500">
                                    <span className="material-symbols-outlined">chat</span>
                                </div>
                                <span className="text-sm font-medium">Enviar Comprovante via WhatsApp</span>
                            </div>
                            <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </div>
                        </label>

                        <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined">print</span>
                                </div>
                                <span className="text-sm font-medium">Imprimir Comprovante Local</span>
                            </div>
                            <div className="relative inline-flex items-center">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            </div>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={items.length === 0 || loading}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <span className="material-symbols-outlined">shopping_cart_checkout</span>
                            Finalizar Venda
                        </>
                    )}
                </button>
            </section>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card p-8 rounded-3xl border border-gold/50 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                        <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary animate-bounce">
                            <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">Venda Finalizada!</h3>
                        <p className="text-slate-400 text-sm mb-6">O comprovante foi enviado com sucesso para o cliente.</p>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-progress" style={{ width: '100%' }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDV;
