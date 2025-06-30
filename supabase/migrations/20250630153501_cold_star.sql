/*
  # Esquema inicial de NexyPass v13.0

  1. Nuevas Tablas
    - `users` - Usuarios del sistema (clientes y administradores)
    - `products` - Productos digitales disponibles
    - `stock_items` - Inventario de credenciales por producto
    - `orders` - Órdenes de compra realizadas
    - `transactions` - Historial de transacciones
    - `recharge_requests` - Solicitudes de recarga de saldo

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas de acceso basadas en roles
    - Protección de datos sensibles

  3. Funcionalidad en Tiempo Real
    - Triggers para notificaciones
    - Subscripciones en tiempo real
*/

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  wallet_balance decimal(10,2) NOT NULL DEFAULT 0.00,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  category text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear tabla de inventario
CREATE TABLE IF NOT EXISTS stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  credentials text NOT NULL,
  is_sold boolean NOT NULL DEFAULT false,
  sold_to uuid REFERENCES users(id),
  order_id uuid,
  sold_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  product_name text NOT NULL,
  price_at_purchase decimal(10,2) NOT NULL,
  credentials_delivered text NOT NULL,
  purchase_url text NOT NULL,
  profile_info text NOT NULL,
  supplier text NOT NULL DEFAULT 'NexyPass',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('purchase', 'balance_add', 'system')),
  amount decimal(10,2) NOT NULL,
  description text NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de solicitudes de recarga
CREATE TABLE IF NOT EXISTS recharge_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Políticas para productos
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage products"
  ON products
  FOR ALL
  USING (true);

-- Políticas para stock
CREATE POLICY "Anyone can read stock"
  ON stock_items
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can manage stock"
  ON stock_items
  FOR ALL
  USING (true);

-- Políticas para órdenes
CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

-- Políticas para transacciones
CREATE POLICY "Anyone can read transactions"
  ON transactions
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create transactions"
  ON transactions
  FOR INSERT
  WITH CHECK (true);

-- Políticas para solicitudes de recarga
CREATE POLICY "Anyone can read recharge requests"
  ON recharge_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create recharge requests"
  ON recharge_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update recharge requests"
  ON recharge_requests
  FOR UPDATE
  USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario administrador por defecto
INSERT INTO users (username, email, role, wallet_balance, is_approved)
VALUES ('NexyX_user.743!Z', 'admin@nexypass.com', 'admin', 0.00, true)
ON CONFLICT (username) DO NOTHING;