-- ============================================================
--  PDV PERFUMARIA FLOR DE LIZ - SCHEMA COMPLETO
--  Execute no: Supabase → SQL Editor → New Query → Run
-- ============================================================

-- ── 1. EXTENSÕES ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 2. CRIAR TABELAS ─────────────────────────────────────────

-- Marcas
CREATE TABLE IF NOT EXISTS marcas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    logo_url TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Produtos
CREATE TABLE IF NOT EXISTS produtos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL DEFAULT 0,
    marca_id UUID REFERENCES marcas(id),
    imagem_url TEXT,
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estoque
CREATE TABLE IF NOT EXISTS estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(200) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(200),
    data_nascimento DATE,
    pontos INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendas
CREATE TABLE IF NOT EXISTS vendas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID REFERENCES clientes(id),
    funcionario_id UUID,
    subtotal NUMERIC(10, 2) DEFAULT 0,
    desconto NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    forma_pagamento VARCHAR(20) DEFAULT 'pix',
    status VARCHAR(20) DEFAULT 'concluida',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itens da Venda
CREATE TABLE IF NOT EXISTS venda_itens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venda_id UUID REFERENCES vendas(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES produtos(id),
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- View: produtos com estoque e marca
CREATE OR REPLACE VIEW produtos_estoque AS
SELECT
    p.id,
    p.nome,
    p.descricao,
    p.preco,
    p.marca_id,
    p.imagem_url,
    p.ativo,
    p.destaque,
    m.nome AS marca_nome,
    COALESCE(e.quantidade, 0) AS quantidade,
    COALESCE(e.quantidade_minima, 5) AS quantidade_minima
FROM produtos p
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN estoque e ON e.produto_id = p.id
WHERE p.ativo = true;

-- ── 3. INSERIR MARCAS PADRÃO ──────────────────────────────────
INSERT INTO marcas (nome, ativo)
SELECT nome, true
FROM (VALUES
    ('Boticário'),
    ('Avon'),
    ('Natura'),
    ('Rommanel')
) AS d(nome)
WHERE NOT EXISTS (SELECT 1 FROM marcas m WHERE m.nome = d.nome);

-- ── 4. HABILITAR RLS ──────────────────────────────────────────
ALTER TABLE marcas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque      ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens  ENABLE ROW LEVEL SECURITY;

-- ── 5. POLÍTICAS DE ACESSO ────────────────────────────────────

-- marcas
DROP POLICY IF EXISTS "allow_read_marcas"   ON marcas;
DROP POLICY IF EXISTS "allow_insert_marcas" ON marcas;
CREATE POLICY "allow_read_marcas"   ON marcas FOR SELECT USING (true);
CREATE POLICY "allow_insert_marcas" ON marcas FOR INSERT WITH CHECK (true);

-- produtos
DROP POLICY IF EXISTS "allow_read_produtos"   ON produtos;
DROP POLICY IF EXISTS "allow_insert_produtos" ON produtos;
CREATE POLICY "allow_read_produtos"   ON produtos FOR SELECT USING (true);
CREATE POLICY "allow_insert_produtos" ON produtos FOR INSERT WITH CHECK (true);

-- estoque
DROP POLICY IF EXISTS "allow_read_estoque"   ON estoque;
DROP POLICY IF EXISTS "allow_insert_estoque" ON estoque;
DROP POLICY IF EXISTS "allow_update_estoque" ON estoque;
CREATE POLICY "allow_read_estoque"   ON estoque FOR SELECT USING (true);
CREATE POLICY "allow_insert_estoque" ON estoque FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_update_estoque" ON estoque FOR UPDATE USING (true);

-- clientes
DROP POLICY IF EXISTS "allow_read_clientes"   ON clientes;
DROP POLICY IF EXISTS "allow_insert_clientes" ON clientes;
CREATE POLICY "allow_read_clientes"   ON clientes FOR SELECT USING (true);
CREATE POLICY "allow_insert_clientes" ON clientes FOR INSERT WITH CHECK (true);

-- vendas
DROP POLICY IF EXISTS "allow_read_vendas"   ON vendas;
DROP POLICY IF EXISTS "allow_insert_vendas" ON vendas;
CREATE POLICY "allow_read_vendas"   ON vendas FOR SELECT USING (true);
CREATE POLICY "allow_insert_vendas" ON vendas FOR INSERT WITH CHECK (true);

-- venda_itens
DROP POLICY IF EXISTS "allow_read_venda_itens"   ON venda_itens;
DROP POLICY IF EXISTS "allow_insert_venda_itens" ON venda_itens;
CREATE POLICY "allow_read_venda_itens"   ON venda_itens FOR SELECT USING (true);
CREATE POLICY "allow_insert_venda_itens" ON venda_itens FOR INSERT WITH CHECK (true);

-- ── FIM ───────────────────────────────────────────────────────
SELECT 'Setup concluido com sucesso!' AS status;
