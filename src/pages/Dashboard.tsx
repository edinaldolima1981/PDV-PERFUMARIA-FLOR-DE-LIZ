import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        const init = async () => {
            await api.ensureDefaultBrands();
            loadDashboardData();
        };
        init();
        const savedCart = localStorage.getItem('flordeliz_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const prods = await api.getProducts();
            setProducts(prods || []);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotalValue = cart.reduce((acc, item) => acc + ((item.price || item.preco) * item.quantity), 0);
    const lowStockAlerts = products.filter(p => p.quantidade <= p.quantidade_minima).length;

    const addToCart = (product: any) => {
        const newCart = [...cart];
        const existing = newCart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            newCart.push({
                id: product.id,
                brand: product.marca_nome,
                name: product.nome,
                price: product.preco,
                quantity: 1,
                image: product.imagem_url
            });
        }
        setCart(newCart);
        localStorage.setItem('flordeliz_cart', JSON.stringify(newCart));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-charcoal text-slate-900 dark:text-slate-100 font-display">
            <main className="max-w-7xl mx-auto pb-32">
                {/* Header Section */}
                <section className="p-6 pt-10">
                    <h2 className="text-3xl font-black italic mb-2 tracking-tighter">
                        Olá, <span className="text-primary not-italic">Seja Bem-vinda!</span>
                    </h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Escolha uma marca para começar</p>
                </section>

                {/* Brand Selection Cards - 4 CARDS AS REQUESTED */}
                <section className="px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            name: 'Boticário',
                            color: 'from-[#064e3b] to-[#022c22]',
                            accent: 'emerald',
                            icon: 'compost'
                        },
                        {
                            name: 'Avon',
                            color: 'from-[#be185d] to-[#831843]',
                            accent: 'pink',
                            icon: 'skincare'
                        },
                        {
                            name: 'Natura',
                            color: 'from-[#9a3412] to-[#7c2d12]',
                            accent: 'orange',
                            icon: 'eco'
                        },
                        {
                            name: 'Rommanel',
                            color: 'from-[#d4af37] to-[#92400e]',
                            accent: 'amber',
                            icon: 'diamond'
                        }
                    ].map((brand) => (
                        <button
                            key={brand.name}
                            onClick={() => navigate('/inventory', { state: { brand: brand.name } })}
                            className={`h-48 rounded-3xl relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.03] active:scale-95 bg-gradient-to-br ${brand.color} p-6 text-left`}
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-8xl scale-150">{brand.icon}</span>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all"></div>

                            <div className="relative h-full flex flex-col justify-between z-10">
                                <div className="size-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <span className="material-symbols-outlined text-white">{brand.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-white italic tracking-tighter mb-1">{brand.name}</h4>
                                    <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Ver Catálogo</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </section>

                {/* Secondary Actions / Stats Summary */}
                <section className="p-6 grid grid-cols-2 gap-4">
                    <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-emerald-500/20 bg-emerald-500/5">
                        <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400">Vendas Hoje</p>
                            <p className="text-sm font-bold">R$ 1.250,00</p>
                        </div>
                    </div>
                    <div className="glass-card rounded-2xl p-4 flex items-center gap-4 border border-amber-500/20 bg-amber-500/5" onClick={() => navigate('/inventory')}>
                        <div className="size-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                            <span className="material-symbols-outlined">inventory_2</span>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-slate-400">Estoque</p>
                            <p className="text-sm font-bold text-amber-500">{lowStockAlerts} Alertas</p>
                        </div>
                    </div>
                </section>

                {/* Carrinho Flutuante (Refinado) */}
                {cartCount > 0 && (
                    <section className="px-6 py-2" onClick={() => navigate('/pdv')}>
                        <div className="bg-primary p-4 rounded-2xl flex items-center justify-between shadow-2xl shadow-primary/30 cursor-pointer animate-in slide-in-from-bottom-5 duration-500">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-white">shopping_bag</span>
                                <div>
                                    <span className="text-white font-black uppercase text-[10px] tracking-widest block leading-none">Venda em Aberto</span>
                                    <span className="text-white/70 text-xs font-medium">{cartCount} itens no carrinho</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-white text-lg font-black italic">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </section>
                )}

                {/* Destaques (Opcional, mas mantido para Preenchimento Visual Premium) */}
                <section className="p-6">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Produtos em Destaque</h3>
                        <button className="text-[10px] font-black uppercase text-primary" onClick={() => navigate('/inventory')}>Ver Todos</button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {products.filter(p => p.destaque || p.imagem_url).slice(0, 4).map((product) => (
                            <div key={product.id} className="glass-card rounded-3xl overflow-hidden border border-white/5 group">
                                <div className="aspect-[4/5] bg-white/5 relative flex items-center justify-center">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={product.imagem_url || ''} alt={product.nome} />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <p className="text-[8px] text-white/60 font-black uppercase tracking-tighter truncate">{product.marca_nome}</p>
                                        <h4 className="font-bold text-white text-xs truncate">{product.nome}</h4>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                                        className="absolute top-3 right-3 size-8 rounded-xl bg-primary shadow-lg flex items-center justify-center text-white scale-0 group-hover:scale-100 transition-transform duration-300"
                                    >
                                        <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
