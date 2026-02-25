import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<any[]>([]);
    const [brandsData, setBrandsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
        const savedCart = localStorage.getItem('flordeliz_cart');
        if (savedCart) setCart(JSON.parse(savedCart));
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [prods, brnds] = await Promise.all([
                api.getProducts(),
                api.getBrands()
            ]);
            setProducts(prods || []);
            setBrandsData(brnds || []);
        } catch (error) {
            console.error('Erro ao carregar dados do dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotalValue = cart.reduce((acc, item) => acc + ((item.price || item.preco) * item.quantity), 0);

    const lowStockAlerts = products.filter(p => p.quantidade <= p.quantidade_minima).length;

    // UI Brand config
    const brandStyles: any = {
        'O Boticário': { color: 'from-[#064e3b] to-[#022c22]', border: 'border-emerald-900/50' },
        'Avon': { color: 'from-[#be185d] to-[#831843]', border: 'border-pink-900/50' },
        'Natura': { color: 'from-[#9a3412] to-[#7c2d12]', border: 'border-orange-900/50' },
        'Rommanel': { color: 'from-[#d4af37] to-[#92400e]', border: 'border-yellow-700/50' },
    };

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
                {/* Marcas Section */}
                <section className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gold text-primary">Escolha a Marca</h3>
                        <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-2">
                        {brandsData.map((brand) => (
                            <div
                                key={brand.id}
                                className={`aspect-[4/3] lg:aspect-square rounded-xl relative overflow-hidden group border ${brandStyles[brand.nome]?.border || 'border-slate-800'} bg-gradient-to-br ${brandStyles[brand.nome]?.color || 'from-slate-800 to-black'} shadow-lg hover:shadow-primary/20 transition-all cursor-pointer`}
                            >
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="material-symbols-outlined text-[14px] bg-black/40 p-1 rounded-full text-white">edit</span>
                                    <span className="material-symbols-outlined text-[14px] bg-black/40 p-1 rounded-full text-white">photo_camera</span>
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <p className="text-white text-base font-black leading-tight drop-shadow-md">{brand.nome}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="px-4 py-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: 'bar_chart', label: 'Relatórios', path: '/reports' },
                        { icon: 'settings', label: 'Configurações', path: '/settings' },
                        { icon: 'inventory_2', label: 'Estoque', path: '/inventory' },
                        { icon: 'sell', label: 'Produtos', path: '/inventory' },
                    ].map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className="glass-card flex flex-col items-center gap-3 p-6 rounded-2xl border border-white/5 hover:border-gold/50 hover:bg-gold/5 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-gold/20 transition-all pointer-events-none" />
                            <span className="material-symbols-outlined text-gold text-3xl group-hover:scale-110 transition-transform">{action.icon}</span>
                            <span className="text-sm font-black tracking-tight uppercase">{action.label}</span>
                        </button>
                    ))}
                </section>

                {/* Carrinho Bar */}
                <section className="px-4 py-4" onClick={() => navigate('/pdv')}>
                    <div className="bg-primary hover:bg-primary/90 rounded-xl p-4 flex items-center justify-between cursor-pointer shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white">shopping_bag</span>
                            <span className="text-white font-bold uppercase text-sm tracking-wide">Ver Carrinho</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-white/80 text-xs">{cartCount} itens</span>
                            <span className="text-white font-extrabold">R$ {cartTotalValue.toFixed(2).replace('.', ',')}</span>
                        </div>
                    </div>
                </section>

                {/* Destaques */}
                <section className="p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Destaques do Dia</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {products.filter(p => p.destaque).slice(0, 4).map((product) => (
                            <div key={product.id} className="glass-card rounded-xl overflow-hidden border border-white/5 group">
                                <div className="aspect-square bg-white/5 relative flex items-center justify-center">
                                    <img className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src={product.imagem_url || ''} alt={product.nome} />
                                    <div className="absolute top-2 right-2 bg-charcoal/80 p-1 rounded-lg backdrop-blur">
                                        <span className="material-symbols-outlined text-gold text-sm">favorite</span>
                                    </div>
                                </div>
                                <div className="p-3">
                                    <p className="text-xs text-slate-400">{product.marca_nome}</p>
                                    <h4 className="font-bold text-sm line-clamp-1 mb-2">{product.nome}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gold font-bold">R$ {product.preco.toFixed(2).replace('.', ',')}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(product);
                                            }}
                                            className="size-8 rounded-lg bg-gold/20 flex items-center justify-center text-gold border border-gold/30 hover:bg-gold hover:text-white transition-all active:scale-90"
                                        >
                                            <span className="material-symbols-outlined text-sm font-bold">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Avisos e Lembretes */}
                <section className="p-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Avisos e Lembretes</h3>
                    <div className="space-y-3">
                        <div className="glass-card p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold">Alertas de Estoque</span>
                                <span className="text-red-500 text-sm font-bold">{lowStockAlerts} Críticos</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">Produtos com estoque igual ou abaixo do mínimo</p>
                        </div>

                        <div className="glass-card p-4 rounded-xl border border-white/5 flex items-center gap-4">
                            <div className="size-12 rounded-full bg-gold/10 flex items-center justify-center border border-gold/30">
                                <span className="material-symbols-outlined text-gold">cake</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold">Aniversariante do Dia</h4>
                                <p className="text-xs text-slate-400">Mariana Silva (Cliente VIP)</p>
                            </div>
                            <button className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full border border-primary/40 uppercase tracking-tighter hover:bg-primary hover:text-white transition-all">
                                Enviar Cupom
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
