import { supabase } from '../lib/supabase';

// --- Interfaces based on Supabase Schema ---

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
    estoque?: number; // Joined from estoque table
    marca_nome?: string; // Joined from marcas table
}

export interface InventoryItem {
    id: string;
    produto_id: string;
    quantidade: number;
    quantidade_minima: number;
}

export interface Customer {
    id: string;
    nome: string;
    telefone: string | null;
    pontos: number;
    data_nascimento: string | null;
}

export interface Sale {
    id: string;
    cliente_id: string | null;
    total: number;
    forma_pagamento: 'pix' | 'dinheiro' | 'credito' | 'debito' | 'misto';
    status: 'pendente' | 'concluida' | 'cancelada';
}

// --- API Service Methods ---

export const api = {
    // Marcas
    async getBrands() {
        const { data, error } = await supabase
            .from('marcas')
            .select('*')
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return data as Brand[];
    },

    async getAllBrands() {
        const { data, error } = await supabase
            .from('marcas')
            .select('*')
            .order('nome');
        if (error) throw error;
        return data as Brand[];
    },

    async createBrand(brandData: Partial<Brand>) {
        const { data, error } = await supabase
            .from('marcas')
            .insert([brandData])
            .select()
            .single();
        if (error) throw error;
        return data as Brand;
    },

    async updateBrand(id: string, updates: Partial<Brand>) {
        const { data, error } = await supabase
            .from('marcas')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Brand;
    },

    // Produtos
    async getProducts() {
        const { data, error } = await supabase
            .from('produtos_estoque') // Using the view created in schema.sql
            .select('*');
        if (error) throw error;
        return data;
    },

    // Estoque
    async updateStock(produtoId: string, delta: number) {
        const { data: current, error: fetchError } = await supabase
            .from('estoque')
            .select('quantidade')
            .eq('produto_id', produtoId)
            .single();

        if (fetchError) throw fetchError;

        const { data, error } = await supabase
            .from('estoque')
            .update({ quantidade: Math.max(0, current.quantidade + delta) })
            .eq('produto_id', produtoId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Clientes
    async getCustomers() {
        const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return data as Customer[];
    },

    // Vendas
    async createSale(saleData: any, items: any[]) {
        // 1. Create the sale record
        const { data: sale, error: saleError } = await supabase
            .from('vendas')
            .insert([saleData])
            .select()
            .single();

        if (saleError) throw saleError;

        // 2. Create sale items (Triggers in Supabase will handle stock reduction)
        const itemsWithSaleId = items.map(item => ({
            venda_id: sale.id,
            produto_id: item.id,
            quantidade: item.quantity,
            preco_unitario: item.price,
            subtotal: item.price * item.quantity,
            marca_id: item.marca_id
        }));

        const { error: itemsError } = await supabase
            .from('venda_itens')
            .insert(itemsWithSaleId);

        if (itemsError) throw itemsError;

        return sale;
    },

    // Novo Produto
    async createProduct(productData: any, initialStock: number) {
        const { data: product, error: productError } = await supabase
            .from('produtos')
            .insert([productData])
            .select()
            .single();

        if (productError) throw productError;

        const { error: stockError } = await supabase
            .from('estoque')
            .insert({
                produto_id: product.id,
                quantidade: initialStock,
                quantidade_minima: 5
            });

        if (stockError) throw stockError;

        return product;
    }
};
