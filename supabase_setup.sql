-- ============================================================
--  EXECUTE NO SUPABASE → SQL Editor → New Query → Run
-- ============================================================

-- 1. Inserir as 4 marcas padrão (ignora se já existirem)
INSERT INTO marcas (nome, ativo)
SELECT nome, true
FROM (VALUES
    ('Boticário'),
    ('Avon'),
    ('Natura'),
    ('Rommanel')
) AS defaults(nome)
WHERE NOT EXISTS (
    SELECT 1 FROM marcas m WHERE m.nome = defaults.nome
);

-- 2. Habilitar RLS nas tabelas (caso não esteja)
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_itens ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas (se existirem) e recriar
DROP POLICY IF EXISTS "allow_read_marcas" ON marcas;
CREATE POLICY "allow_read_marcas" ON marcas FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_marcas" ON marcas;
CREATE POLICY "allow_insert_marcas" ON marcas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_produtos" ON produtos;
CREATE POLICY "allow_read_produtos" ON produtos FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_produtos" ON produtos;
CREATE POLICY "allow_insert_produtos" ON produtos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_estoque" ON estoque;
CREATE POLICY "allow_read_estoque" ON estoque FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_estoque" ON estoque;
CREATE POLICY "allow_insert_estoque" ON estoque FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_estoque" ON estoque;
CREATE POLICY "allow_update_estoque" ON estoque FOR UPDATE USING (true);

DROP POLICY IF EXISTS "allow_read_clientes" ON clientes;
CREATE POLICY "allow_read_clientes" ON clientes FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_clientes" ON clientes;
CREATE POLICY "allow_insert_clientes" ON clientes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_insert_vendas" ON vendas;
CREATE POLICY "allow_insert_vendas" ON vendas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_read_vendas" ON vendas;
CREATE POLICY "allow_read_vendas" ON vendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_venda_itens" ON venda_itens;
CREATE POLICY "allow_insert_venda_itens" ON venda_itens FOR INSERT WITH CHECK (true);
