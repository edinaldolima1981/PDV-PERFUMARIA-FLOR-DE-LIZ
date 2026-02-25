-- ============================================================
--  EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR
--  Dashboard → SQL Editor → New Query → Cole e clique RUN
-- ============================================================

-- 1. Inserir as marcas padrão (só insere se não existirem)
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

-- 2. Permitir leitura pública da tabela marcas (anon key)
CREATE POLICY IF NOT EXISTS "Allow public read on marcas"
    ON marcas FOR SELECT
    USING (true);

-- 3. Permitir leitura pública da tabela produtos
CREATE POLICY IF NOT EXISTS "Allow public read on produtos"
    ON produtos FOR SELECT
    USING (true);

-- 4. Permitir inserção de produtos (anon)
CREATE POLICY IF NOT EXISTS "Allow insert on produtos"
    ON produtos FOR INSERT
    WITH CHECK (true);

-- 5. Permitir leitura/inserção na tabela estoque
CREATE POLICY IF NOT EXISTS "Allow public read on estoque"
    ON estoque FOR SELECT
    USING (true);

CREATE POLICY IF NOT EXISTS "Allow insert on estoque"
    ON estoque FOR INSERT
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow update on estoque"
    ON estoque FOR UPDATE
    USING (true);

-- 6. Permitir inserção de clientes
CREATE POLICY IF NOT EXISTS "Allow insert on clientes"
    ON clientes FOR INSERT
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public read on clientes"
    ON clientes FOR SELECT
    USING (true);

-- 7. Permitir vendas
CREATE POLICY IF NOT EXISTS "Allow insert on vendas"
    ON vendas FOR INSERT
    WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow insert on venda_itens"
    ON venda_itens FOR INSERT
    WITH CHECK (true);
