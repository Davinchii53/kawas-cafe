import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Device-Id']
}));

// GET /api/menu
app.get('/api/menu', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM menu_items').all();
  // SQLite doesn't have boolean, so customizable is 0 or 1. Let's map it.
  const menu = results.map((item: any) => ({
    ...item,
    customizable: item.customizable === 1
  }));
  return c.json(menu);
});

// GET /api/wallet
app.get('/api/wallet', async (c) => {
  const deviceId = c.req.header('X-Device-Id') || 'unknown';
  let profile: any = await c.env.DB.prepare('SELECT wallet_balance FROM profiles WHERE id = ?').bind(deviceId).first();
  if (!profile) {
    await c.env.DB.prepare('INSERT INTO profiles (id, wallet_balance) VALUES (?, ?)').bind(deviceId, 0).run();
    profile = { wallet_balance: 0 };
  }
  return c.json({ balance: profile.wallet_balance });
});

// POST /api/wallet/topup
app.post('/api/wallet/topup', async (c) => {
  const deviceId = c.req.header('X-Device-Id') || 'unknown';
  const { amount } = await c.req.json();
  if (!amount || amount <= 0) return c.json({ error: 'Invalid amount' }, 400);

  const txId = `tx_${Math.floor(100 + Math.random() * 900)}`;

  // Update balance and ledger in a batch (with UPSERT for profiles)
  await c.env.DB.batch([
    c.env.DB.prepare(`
      INSERT INTO profiles (id, wallet_balance) VALUES (?, ?)
      ON CONFLICT(id) DO UPDATE SET wallet_balance = wallet_balance + excluded.wallet_balance
    `).bind(deviceId, amount),
    c.env.DB.prepare('INSERT INTO ledger (id, user_id, amount, type) VALUES (?, ?, ?, ?)').bind(txId, deviceId, amount, 'topup')
  ]);

  return c.json({ success: true, txId });
});

// POST /api/orders/checkout
app.post('/api/orders/checkout', async (c) => {
  const deviceId = c.req.header('X-Device-Id') || 'unknown';
  const { total, items } = await c.req.json();
  
  // Verify balance first
  const profile: any = await c.env.DB.prepare('SELECT wallet_balance FROM profiles WHERE id = ?').bind(deviceId).first();
  if (!profile || profile.wallet_balance < total) {
    return c.json({ error: 'Insufficient funds' }, 400);
  }

  const orderId = `ord_${Math.floor(1000 + Math.random() * 9000)}`;
  const txId = `tx_${Math.floor(100 + Math.random() * 900)}`;

  // Construct batch statements
  const statements = [
    // Deduct balance
    c.env.DB.prepare('UPDATE profiles SET wallet_balance = wallet_balance - ? WHERE id = ?').bind(total, deviceId),
    // Record ledger transaction
    c.env.DB.prepare('INSERT INTO ledger (id, user_id, amount, type) VALUES (?, ?, ?, ?)').bind(txId, deviceId, -total, 'purchase'),
    // Create order
    c.env.DB.prepare('INSERT INTO orders (id, user_id, total_amount, status) VALUES (?, ?, ?, ?)').bind(orderId, deviceId, total, 'pending')
  ];

  // Create order items
  for (const item of items) {
    statements.push(
      c.env.DB.prepare('INSERT INTO order_items (order_id, menu_item_id, name, quantity, spice_level, extra_toppings) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(orderId, item.menu_item_id || 0, item.name, item.quantity, item.spice_level, JSON.stringify(item.extra_toppings || []))
    );
  }

  await c.env.DB.batch(statements);

  return c.json({ success: true, orderId });
});

// GET /api/orders/kds
app.get('/api/orders/kds', async (c) => {
  const { results: orders } = await c.env.DB.prepare("SELECT * FROM orders WHERE status != 'completed' ORDER BY created_at DESC").all();
  
  const kdsOrders = [];
  for (const order of orders) {
    const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
    kdsOrders.push({
      ...order,
      items: items.map((i: any) => ({
        ...i,
        extra_toppings: JSON.parse(i.extra_toppings || '[]')
      }))
    });
  }

  return c.json(kdsOrders);
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();
  
  if (!['pending', 'preparing', 'completed'].includes(status)) {
    return c.json({ error: 'Invalid status' }, 400);
  }

  await c.env.DB.prepare('UPDATE orders SET status = ? WHERE id = ?').bind(status, id).run();
  
  return c.json({ success: true, status });
});

// GET /api/ledger
app.get('/api/ledger', async (c) => {
  const { results } = await c.env.DB.prepare("SELECT * FROM ledger ORDER BY created_at DESC LIMIT 50").all();
  return c.json(results);
});

// GET /api/orders/:id
app.get('/api/orders/:id', async (c) => {
  const id = c.req.param('id');
  const order: any = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first();
  if (!order) return c.json({ error: 'Order not found' }, 404);

  const { results: items } = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(order.id).all();
  
  return c.json({
    ...order,
    items: items.map((i: any) => ({
      ...i,
      extra_toppings: JSON.parse(i.extra_toppings || '[]')
    }))
  });
});

export default app;
