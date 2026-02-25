import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const PDV: React.FC = () => {
    const navigate = useNavigate();
    const [showSuccess, setShowSuccess] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'pix' | 'dinheiro' | 'credito' | 'debito'>('pix');

    useEffect(() => {
        const savedCart = localStorage.getItem('flordeliz_cart');
        if (savedCart) {
            try { setItems(JSON.parse(savedCart)); } catch (_) { setItems([]); }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('flordeliz_cart', JSON.stringify(items));
    }, [items]);

    const total = items.reduce((acc, item) =>
        acc + ((item.price || item.preco || 0) * (item.quantity || 1)), 0);

    const brands = Array.from(new Set(items.map(item => item.brand || item.marca_nome || 'Geral')));

    const updateQuantity = (id: string, delta: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(0, (item.quantity || 1) + delta) }
                    : item
            ).filter(item => (item.quantity || 0) > 0)
        );
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;
        try {
            setLoading(true);
            const saleData = {
                subtotal: total,
                total: total,
                forma_pagamento: paymentMethod,
                status: 'concluida',
                cliente_id: null,
                funcionario_id: null,
            };
            await api.createSale(saleData, items);
            setItems([]);
            localStorage.removeItem('flordeliz_cart');
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigate('/');
            }, 3000);
        } catch (error: any) {
            console.error('Erro ao finalizar venda:', error);
            alert('Erro ao finalizar venda: ' + (error?.message || 'Verifique sua conexão.'));
        } finally {
            setLoading(false);
        }
    };

    const paymentOptions: { value: typeof paymentMethod; label: string; icon: string }[] = [
        { value: 'pix', label: 'PIX', icon: 'qr_code_2' },
        { value: 'dinheiro', label: 'Dinheiro', icon: 'payments' },
        { value: 'credito', label: 'Crédito', icon: 'credit_card' },
        { value: 'debito', label: 'Débito', icon: 'credit_score' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-56">
            {/* Header */}
            <header className="sticky top-0 z-20 flex items-center bg-white/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-slate-200 dark:border-slate-800">
                <button
                    className="text-primary flex size-10 items-center justify-center hover:bg-white/10 rounded-full"
                    onClick={() => navigate(-1)}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center">Carrinho de Vendas</h2>
                <button
                    className="flex size-10 items-center justify-center text-slate-400 hover:text-red-500"
                    onClick={() => { setItems([]); }}
                >
                    <span className="material-symbols-outlined">delete_sweep</span>
                </button>
            </header>

            <main className="max-w-md mx-auto flex flex-col gap-4 p-4">
                {/* Items by brand */}
                {brands.map(brand => (
                    <section key={brand}>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm">storefront</span>
                            {brand}
                        </h3>
                        <div className="glass-card rounded-2xl p-3 space-y-4">
                            {items.filter(i => (i.brand || i.marca_nome || 'Geral') === brand).map(item => (
                                <div key={item.id} className="flex items-center gap-3 justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                                            {(item.image || item.imagem_url)
                                                ? <img src={item.image || item.imagem_url} className="w-full h-full object-cover" alt={item.name || item.nome} />
                                                : <span className="material-symbols-outlined text-slate-400">inventory_2</span>
                                            }
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{item.name || item.nome}</p>
                                            <p className="text-primary text-sm font-bold">
                                                R$ {(item.price || item.preco || 0).toFixed(2).replace('.', ',')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-2 py-1 shrink-0">
                                        <button
                                            className="size-6 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 shadow-sm"
                                            onClick={() => updateQuantity(item.id, -1)}
                                        >-</button>
                                        <span className="text-sm font-bold min-w-[1.25rem] text-center">{item.quantity}</span>
                                        <button
                                            className="size-6 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm"
                                            onClick={() => updateQuantity(item.id, 1)}
                                        >+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Empty state */}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40">
                        <span className="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                        <p className="text-lg font-bold">Carrinho Vazio</p>
                        <p className="text-sm mt-1">Adicione produtos pelo catálogo.</p>
                    </div>
                )}
            </main>

            {/* Fixed Bottom Summary */}
            <section className="fixed bottom-0 left-0 right-0 z-30 max-w-md mx-auto p-4 bg-white/95 dark:bg-background-dark/95 border-t border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md">
                {/* Payment Options */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {paymentOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setPaymentMethod(opt.value)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-xs font-bold ${paymentMethod === opt.value
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Total + Checkout */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-500 text-sm font-medium">Total</p>
                    <p className="text-2xl font-black">R$ {total.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                    onClick={handleCheckout}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={items.length === 0 || loading}
                >
                    {loading
                        ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                        : <><span className="material-symbols-outlined">shopping_cart_checkout</span> Finalizar Venda</>
                    }
                </button>
            </section>

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-card p-8 rounded-3xl border border-primary/30 max-w-sm w-full text-center shadow-2xl">
                        <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary animate-bounce">
                            <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                        </div>
                        <h3 className="text-2xl font-black mb-2">Venda Finalizada!</h3>
                        <p className="text-slate-400 text-sm">Redirecionando para o início...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDV;
