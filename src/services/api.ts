import { supabase } from '../lib/supabase';

// --- Interfaces ---
export interface Brand {
    id: string;
    nome: string;
    logo_url: string | null;
    ativo: boolean;
}

export interface Product {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number;
    marca_id: string;
    imagem_url: string | null;
    ativo: boolean;
    quantidade?: number;
    quantidade_minima?: number;
    marca_nome?: string;
}

export interface Customer {
    id: string;
    nome: string;
    telefone: string | null;
    pontos: number;
    data_nascimento: string | null;
}

// --- API Service ---
export const api = {

    // ── MARCAS ──────────────────────────────────────────────────────────────
    async getBrands(): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('*')
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return (data || []) as Brand[];
    },

    async getAllBrands(): Promise<Brand[]> {
        const { data, error } = await supabase
            .from('marcas')
            .select('*')
            .order('nome');
        if (error) throw error;
        return (data || []) as Brand[];
    },

    /** Guarantees the 4 main brands exist and returns all active brands with real UUIDs */
    async ensureDefaultBrands(): Promise<Brand[]> {
        const defaults = ['Boticário', 'Avon', 'Natura', 'Rommanel'];
        try {
            const { data: existing } = await supabase.from('marcas').select('nome');
            const existingNames = (existing || []).map((b: { nome: string }) => b.nome);
            const toInsert = defaults
                .filter(n => !existingNames.includes(n))
                .map(n => ({ nome: n, ativo: true }));
            if (toInsert.length > 0) {
                await supabase.from('marcas').insert(toInsert);
            }
        } catch (_) {
            // Ignore RLS/insert errors – fetching below will still work if brands already exist
        }
        const { data: all } = await supabase.from('marcas').select('*').eq('ativo', true).order('nome');
        return (all || []) as Brand[];
    },

    async createBrand(brandData: Partial<Brand>): Promise<Brand> {
        const { data, error } = await supabase
            .from('marcas')
            .insert([brandData])
            .select()
            .single();
        if (error) throw error;
        return data as Brand;
    },

    async updateBrand(id: string, updates: Partial<Brand>): Promise<Brand> {
        const { data, error } = await supabase
            .from('marcas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Brand;
    },

    // ── PRODUTOS ─────────────────────────────────────────────────────────────
    async getProducts(): Promise<Product[]> {
        // Try the view first, fall back to a manual join if the view doesn't exist
        const { data: viewData, error: viewError } = await supabase
            .from('produtos_estoque')
            .select('*');
        if (!viewError) return (viewData || []) as Product[];

        // Fallback: join manually
        const { data, error } = await supabase
            .from('produtos')
            .select(`
                *,
                marcas ( nome ),
                estoque ( quantidade, quantidade_minima )
            `)
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return ((data || []) as any[]).map((p: any) => ({
            ...p,
            marca_nome: p.marcas?.nome ?? '',
            quantidade: p.estoque?.[0]?.quantidade ?? 0,
            quantidade_minima: p.estoque?.[0]?.quantidade_minima ?? 5,
        })) as Product[];
    },

    async createProduct(productData: { nome: string; preco: number; marca_id: string; descricao?: string }, initialStock: number): Promise<Product> {
        // Insert product
        const { data: product, error: productError } = await supabase
            .from('produtos')
            .insert([{ ...productData, ativo: true }])
            .select()
            .single();
        if (productError) throw productError;

        // Insert stock record
        const { error: stockError } = await supabase
            .from('estoque')
            .insert({
                produto_id: product.id,
                quantidade: initialStock,
                quantidade_minima: 5,
            });
        // Non-fatal: log but don't crash if stock record fails (trigger may have done it)
        if (stockError) console.warn('Estoque insert warning:', stockError.message);

        return product as Product;
    },

    // ── ESTOQUE ───────────────────────────────────────────────────────────────
    async updateStock(produtoId: string, delta: number): Promise<{ quantidade: number }> {
        const { data: current, error: fetchError } = await supabase
            .from('estoque')
            .select('quantidade')
            .eq('produto_id', produtoId)
            .single();
        if (fetchError) throw fetchError;

        const newQty = Math.max(0, current.quantidade + delta);
        const { data, error } = await supabase
            .from('estoque')
            .update({ quantidade: newQty })
            .eq('produto_id', produtoId)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // ── CLIENTES ──────────────────────────────────────────────────────────────
    async getCustomers(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return (data || []) as Customer[];
    },

    async createCustomer(customerData: { nome: string; telefone?: string; data_nascimento?: string }): Promise<Customer> {
        const { data, error } = await supabase
            .from('clientes')
            .insert([{ ...customerData, pontos: 0, ativo: true }])
            .select()
            .single();
        if (error) throw error;
        return data as Customer;
    },

    // ── VENDAS ────────────────────────────────────────────────────────────────
    async createSale(saleData: any, items: any[]): Promise<any> {
        const { data: sale, error: saleError } = await supabase
            .from('vendas')
            .insert([saleData])
            .select()
            .single();
        if (saleError) throw saleError;

        const itemsToInsert = items.map(item => ({
            venda_id: sale.id,
            produto_id: item.id,
            quantidade: item.quantity,
            preco_unitario: item.price || item.preco || 0,
            subtotal: (item.price || item.preco || 0) * item.quantity,
        }));

        const { error: itemsError } = await supabase
            .from('venda_itens')
            .insert(itemsToInsert);
        if (itemsError) throw itemsError;

        return sale;
    },

    // ── RELATÓRIOS ────────────────────────────────────────────────────────────
    async getSalesTotal(): Promise<number> {
        const { data, error } = await supabase
            .from('vendas')
            .select('total')
            .eq('status', 'concluida');
        if (error) return 0;
        return (data || []).reduce((acc: number, v: any) => acc + (v.total || 0), 0);
    },
};
