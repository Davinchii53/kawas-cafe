// Kawa Noodles — app.js
// Standalone Preact + HTM, zero npm install
// Clean, high-density Developer Console / POS Terminal interface
const { html, render, useState, useEffect } = htmPreact;

const API_BASE = 'https://kawas-cafe-backend.kelvinanshary.workers.dev/api';

const ADDONS = [
    { name: 'Extra Udang Keju (1 pc)', price: 0.80 },
    { name: 'Extra Udang Rambutan (1 pc)', price: 0.80 },
    { name: 'Extra Pangsit Goreng (2 pcs)', price: 0.60 }
];

const CATEGORIES = ['All', 'Noodles', 'Dimsum', 'Drinks'];

function App() {
    const [view, setView] = useState('customer');
    const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('kawa_session')) || null);
    const [authMode, setAuthMode] = useState('login'); // 'select', 'customer', 'staff'
    const [confirmDialog, setConfirmDialog] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [theme, setTheme] = useState(() => localStorage.getItem('kawa_theme') || 'dark');
    const [wallet, setWallet] = useState(0);
    const [menu, setMenu] = useState([]);
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [topupOpen, setTopupOpen] = useState(false);
    const [customizeItem, setCustomizeItem] = useState(null);
    
    const [spiceLevel, setSpiceLevel] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    
    const deviceId = session ? session.id : 'unknown';

    useEffect(() => {
        if (session) localStorage.setItem('kawa_session', JSON.stringify(session));
        else localStorage.removeItem('kawa_session');
    }, [session]);

    // Track Order
    const [trackId, setTrackId] = useState(() => localStorage.getItem('kawa_last_order') || '');

    const [trackedOrder, setTrackedOrder] = useState(null);
    
    // Toast notifications
    const [toast, setToast] = useState({ msg: '', show: false });

    // KDS tickets
    const [kdsOrders, setKdsOrders] = useState([]);

    // Simulated Immutable Ledger (Level 3 requirement)
    const [ledger, setLedger] = useState([]);

    // Initial fetch (menu, wallet)
    useEffect(() => {
        if (trackId) localStorage.setItem('kawa_last_order', trackId);
    }, [trackId]);

    useEffect(() => {
        fetch(`${API_BASE}/menu`).then(r => r.json()).then(setMenu).catch(console.error);
        fetch(`${API_BASE}/wallet`, { headers: { 'X-Device-Id': deviceId } }).then(r => r.json()).then(d => setWallet(d.balance)).catch(console.error);
    }, []);

    useEffect(() => {
        localStorage.setItem('kawa_theme', theme);
        if (theme === 'light') {
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
        }
    }, [theme]);

    // Polling for real-time views
    useEffect(() => {
        let interval;
        const fetchData = async () => {
            if (view === 'admin') {
                try {
                    const r = await fetch(`${API_BASE}/orders/kds`);
                    const data = await r.json();
                    setKdsOrders(data);
                } catch(e) {}
            } else if (view === 'ledger') {
                try {
                    const r = await fetch(`${API_BASE}/ledger`);
                    const data = await r.json();
                    setLedger(data);
                } catch(e) {}
            } else if (view === 'accounts') {
                try {
                    const r = await fetch(`${API_BASE}/profiles`);
                    const data = await r.json();
                    setProfiles(data);
                } catch(e) {}
            } else if (view === 'track' && trackId) {
                try {
                    const r = await fetch(`${API_BASE}/orders/${trackId}`);
                    if (r.ok) {
                        const data = await r.json();
                        setTrackedOrder(data);
                    } else {
                        setTrackedOrder(null);
                    }
                } catch(e) {}
            }
        };
        fetchData();
        interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, [view, trackId]);

    // Track simulated time
    const [timeStr, setTimeStr] = useState('');
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeStr(now.toTimeString().split(' ')[0]);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const showToast = (msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast({ msg: '', show: false }), 3000);
    };

    const handleAddonToggle = (addon) => {
        setSelectedAddons(prev => {
            if (prev.some(a => a.name === addon.name)) {
                return prev.filter(a => a.name !== addon.name);
            }
            return [...prev, addon];
        });
    };

    const handleAddCustomizeToCart = () => {
        const itemTotalAddonPrice = selectedAddons.reduce((sum, a) => sum + a.price, 0);
        const itemFinalPrice = customizeItem.price + itemTotalAddonPrice;

        const cartEntry = {
            id: `${customizeItem.id}_${spiceLevel}_${selectedAddons.map(a => a.name).join('_')}`,
            menu_item_id: customizeItem.id,
            name: customizeItem.name,
            price: itemFinalPrice,
            spice_level: customizeItem.customizable ? spiceLevel : 0,
            extra_toppings: selectedAddons.map(a => a.name),
            quantity: 1
        };

        setCart(prev => {
            const existing = prev.find(i => i.id === cartEntry.id);
            if (existing) {
                return prev.map(i => i.id === cartEntry.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, cartEntry];
        });

        setCustomizeItem(null);
        showToast(`Added ${cartEntry.name} (Lvl ${spiceLevel}) to bag`);
    };

    const handleAddClick = (item) => {
        if (item.customizable) {
            setCustomizeItem(item);
            setSpiceLevel(1);
            setSelectedAddons([]);
            return;
        }

        const cartEntry = {
            id: `${item.id}_0_none`,
            menu_item_id: item.id,
            name: item.name,
            price: item.price,
            spice_level: 0,
            extra_toppings: [],
            quantity: 1
        };

        setCart(prev => {
            const existing = prev.find(i => i.id === cartEntry.id);
            if (existing) {
                return prev.map(i => i.id === cartEntry.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, cartEntry];
        });

        showToast(`Added ${item.name} to bag`);
    };

    const updateCartQty = (id, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.quantity + delta;
                return newQty <= 0 ? null : { ...item, quantity: newQty };
            }
            return item;
        }).filter(Boolean));
    };

    const handleTopup = async (amount) => {
        try {
            const r = await fetch(`${API_BASE}/wallet/topup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Id': deviceId
                },
                body: JSON.stringify({ amount })
            });
            if (r.ok) {
                setWallet(prev => prev + amount);
                showToast(`Loaded $${amount.toFixed(2)} to wallet`);
                if (view === 'ledger') fetch(`${API_BASE}/ledger`).then(r=>r.json()).then(setLedger);
            }
        } catch(e) { showToast('Topup failed'); }
    };

    const handleCheckout = async () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (wallet < total) {
            showToast('Checkout failed: Insufficient funds');
            return;
        }

        try {
            const r = await fetch(`${API_BASE}/orders/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Device-Id': deviceId
                },
                body: JSON.stringify({ total, items: cart })
            });
            if (r.ok) {
                const data = await r.json();
                setWallet(prev => prev - total);
                setCart([]);
                setCartOpen(false);
                setTrackId(data.orderId);
                setTrackedOrder(null);
                setView('track');
                showToast(`Checkout successful! Invoice: ${data.orderId}`);
            } else {
                const err = await r.json();
                showToast(`Checkout failed: ${err.error}`);
            }
        } catch(e) { showToast('Checkout failed'); }
    };

    const handleKdsStatusChange = async (orderId, newStatus) => {
        try {
            const r = await fetch(`${API_BASE}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ status: newStatus })
            });
            if (r.ok) {
                setKdsOrders(prev => prev.map(ord => {
                    if (ord.id === orderId) {
                        return { ...ord, status: newStatus };
                    }
                    return ord;
                }));
                showToast(`Order ${orderId} updated to ${newStatus}`);
            }
        } catch (e) { showToast('Failed to update status'); }
    };

    const filteredMenu = activeCategory === 'All'
        ? menu
        : menu.filter(i => i.category === activeCategory);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!session) {
        return html`
            <div class="app-wrapper" style="justify-content: center; align-items: center; min-height: 100vh;">
                <div class="modal-box" style="width: 100%; max-width: 360px;">
                    <div class="modal-header">
                        <div>
                            <h3 class="modal-title">${authMode === 'register' ? 'CREATE ACCOUNT' : 'SYSTEM LOGIN'}</h3>
                            <p class="modal-desc">${authMode === 'register' ? 'Register a new customer account' : 'Enter credentials'}</p>
                        </div>
                    </div>
                    <div style="display:flex; flex-direction:column; gap: 1rem; margin-top: 1rem;">
                        <input type="text" id="loginId" class="track-input" placeholder="Username" />
                        <input type="password" id="loginPin" class="track-input" placeholder="Password" />
                        <button class="action-btn primary" onClick=${async () => {
                            const id = document.getElementById('loginId').value;
                            const password = document.getElementById('loginPin').value;
                            if(!id || !password) return showToast('Credentials Required');
                            try {
                                const endpoint = authMode === 'register' ? '/auth/register' : '/auth/login';
                                const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, password }) });
                                const data = await res.json();
                                if(data.success) { setSession(data); setView(data.role === 'customer' ? 'customer' : 'admin'); setWallet(data.balance); }
                                else showToast(data.error);
                            } catch(e) { showToast(authMode === 'register' ? 'Registration Failed' : 'Login Failed'); }
                        }}>${authMode === 'register' ? 'REGISTER' : 'LOGIN'}</button>
                        <div style="text-align: center; margin-top: 0.5rem;">
                            ${authMode === 'register' ? html`
                                <span style="font-size: 0.75rem; color: var(--text-muted-term);">Already have an account? </span>
                                <a href="#" style="color: var(--accent-green);" onClick=${() => setAuthMode('login')}>Login here</a>
                            ` : html`
                                <span style="font-size: 0.75rem; color: var(--text-muted-term);">New customer? </span>
                                <a href="#" style="color: var(--accent-green);" onClick=${() => setAuthMode('register')}>Create account</a>
                            `}
                        </div>
                    </div>
                </div>
                ${toast.show && html`<div style="position:fixed; bottom:20px; right:20px; background:var(--surface-term); border:1px solid var(--border-term); padding:1rem; color:var(--accent-green); z-index:100;">${toast.msg}</div>`}
            </div>
        `;
    }

    return html`
        <!-- Navigation -->
        <header class="nav">
            <div class="nav-logo-group">
                <a href="#" class="nav-brand" onClick=${() => setView('customer')}>
                    🌶️ KAWA_NOODLES<span>.console</span>
                </a>
            </div>
            
            <div class="nav-controls">
                <button class="theme-toggle-btn" onClick=${() => setTheme(theme === 'dark' ? 'light' : 'dark')} title="Toggle Theme">
                    <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                    <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                </button>
                <div class="role-selector">
                    ${session?.role === 'customer' ? html`
                        <button class="role-btn ${view === 'customer' ? 'active' : ''}" onClick=${() => setView('customer')}>MENU</button>
                        <button class="role-btn ${view === 'track' ? 'active' : ''}" onClick=${() => setView('track')}>TRACK</button>
                        <button class="role-btn" style="color: var(--accent-red)" onClick=${async () => {
                            setConfirmDialog({
                                message: 'Are you sure you want to delete your account? This action is irreversible.',
                                onConfirm: async () => {
                                    await fetch(`${API_BASE}/profiles/${session.id}`, { method: 'DELETE' });
                                    setSession(null);
                                    setAuthMode('login');
                                    setConfirmDialog(null);
                                },
                                onCancel: () => setConfirmDialog(null)
                            });
                        }}>DEL_ACCT</button>
                    ` : html`
                        <button class="role-btn ${view === 'admin' ? 'active' : ''}" onClick=${() => setView('admin')}>KDS</button>
                        <button class="role-btn ${view === 'ledger' ? 'active' : ''}" onClick=${() => setView('ledger')}>LEDGER</button>
                        <button class="role-btn ${view === 'accounts' ? 'active' : ''}" onClick=${() => setView('accounts')}>ACCOUNTS</button>
                    `}
                    <button class="role-btn" onClick=${() => { setSession(null); setAuthMode('login'); }}>LOGOUT (${session.id})</button>
                </div>
                
                ${view === 'customer' && html`
                    <div class="wallet-pill">
                        <span>BAL: $${wallet.toFixed(2)}</span>
                        <button onClick=${() => setTopupOpen(true)} title="Add funds">+</button>
                    </div>
                    <button class="cart-btn" onClick=${() => setCartOpen(true)}>
                        BAG <span class="cart-badge">[${cartCount}]</span>
                    </button>
                `}
            </div>
        </header>

        <!-- Status Indicator Strip -->
        <div class="status-strip">
            <div class="status-item">STATUS: <span style="color: var(--accent-green);">ONLINE</span></div>
            <div class="status-item">WS_GATEWAY: <span style="color: var(--accent-green);">ACTIVE (postgres_changes)</span></div>
            <div class="status-item">TERM_TIME: <span>${timeStr}</span></div>
        </div>

        <!-- Customer Storefront View -->
        ${view === 'customer' && html`
            <section class="hero">
                <div class="hero-banner">
                    <div class="hero-banner-title">
                        <h2>KAWA NOODLES <span>v1.0.4</span></h2>
                        <div style="font-size: 0.7rem; color: var(--accent-amber); margin-top: 0.25rem;">SPICY NOODLE ORDERING TERMINAL</div>
                    </div>
                    <p class="hero-banner-desc">
                        Standard POS interface for high-throughput ordering. Custom spice modifier levels (1-8) and add-on configurations. Transactions validated against closed-loop balance.
                    </p>
                </div>
            </section>

            <div class="categories">
                ${CATEGORIES.map(cat => html`
                    <button 
                        key=${cat}
                        class="cat-btn ${activeCategory === cat ? 'active' : ''}"
                        onClick=${() => setActiveCategory(cat)}
                    >
                        [${cat.toUpperCase()}]
                    </button>
                `)}
            </div>

            <div class="menu-grid">
                ${filteredMenu.map(item => html`
                    <div class="menu-row" key=${item.id}>
                        <div class="menu-item-info">
                            <div class="menu-item-title-row">
                                <span class="menu-item-name">${item.id.toString().padStart(2, '0')}. ${item.name}</span>
                                ${item.customizable && html`<span class="menu-item-badge">MODS: LVL 1-8</span>`}
                            </div>
                            <p class="menu-item-desc">${item.desc}</p>
                        </div>
                        <div class="menu-item-action">
                            <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                            <button class="action-btn ${item.customizable ? '' : 'primary'}" onClick=${() => handleAddClick(item)}>
                                ${item.customizable ? '[ CONFIGURE ]' : '[ ADD ]'}
                            </button>
                        </div>
                    </div>
                `)}
            </div>
        `}

        <!-- Track Order View -->
        ${view === 'track' && html`
            <div class="track-container">
                <div class="track-input-group">
                    <input 
                        class="track-input" 
                        type="text" 
                        placeholder="Enter Invoice ID (e.g. ord_1234)"
                        value=${trackId}
                        onInput=${e => setTrackId(e.target.value)}
                    />
                    <button class="track-btn" onClick=${() => trackId && setView('track')}>[ SEARCH ]</button>
                </div>

                ${trackedOrder ? html`
                    <div class="digital-receipt">
                        <div class="receipt-header">
                            <div style="font-size: 0.75rem; color: var(--text-muted-term);">INVOICE</div>
                            <div style="font-size: 1.15rem; font-weight: 700; color: var(--text-term);">${trackedOrder.id.toUpperCase()}</div>
                            <div class="receipt-status-badge ${trackedOrder.status}">
                                ${trackedOrder.status.toUpperCase()}
                            </div>
                        </div>
                        <div class="ticket-items">
                            ${trackedOrder.items.map((item, idx) => html`
                                <div class="ticket-item" key=${idx}>
                                    <div class="ticket-item-header">
                                        <span>${item.quantity}x ${item.name}</span>
                                    </div>
                                    ${item.spice_level > 0 && html`
                                        <div class="ticket-item-modifiers">>> SPICE LEVEL: ${item.spice_level}</div>
                                    `}
                                    ${item.extra_toppings.length > 0 && html`
                                        <div class="ticket-item-modifiers" style="color: var(--accent-amber);">
                                            + ${item.extra_toppings.join(', ')}
                                        </div>
                                    `}
                                </div>
                            `)}
                        </div>
                        <div style="text-align: right; font-weight: 700; margin-top: 1rem; color: var(--accent-green);">
                            TOTAL: $${trackedOrder.total_amount.toFixed(2)}
                        </div>
                    </div>
                ` : (trackId ? html`
                    <div style="margin-top: 2rem; color: var(--text-muted-term); font-size: 0.85rem;">[ SEARCHING INVOICE... ]</div>
                ` : html`
                    <div style="margin-top: 2rem; color: var(--text-muted-term); font-size: 0.85rem;">[ WAITING FOR INVOICE ID ]</div>
                `)}
            </div>
        `}

        <!-- Kitchen Display System (KDS) View -->
        ${view === 'admin' && html`
            <div class="kds-container">
                <div class="kds-header">
                    <h2 class="kds-title">ACTIVE ORDER TICKETS (KDS)</h2>
                    <p style="font-size: 0.75rem; color: var(--text-muted-term); margin-top: 0.25rem;">Real-time feed connected to profiles/orders tables.</p>
                </div>

                <div class="kds-grid">
                    ${kdsOrders.filter(o => o.status !== 'completed').length === 0 ? html`
                        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; color: var(--text-muted-term);">
                            [ NO INCOMING TICKETS ON QUEUE ]
                        </div>
                    ` : html`
                        ${kdsOrders.filter(o => o.status !== 'completed').map(order => html`
                            <div class="kds-ticket ${order.status === 'preparing' ? 'preparing' : ''}" key=${order.id}>
                                <div class="ticket-header">
                                    <span class="ticket-id">${order.id.toUpperCase()}</span>
                                    <span>${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                </div>
                                <div class="ticket-items">
                                    ${order.items.map((item, idx) => html`
                                        <div class="ticket-item" key=${idx}>
                                            <div class="ticket-item-header">
                                                <span>${item.quantity}x ${item.name}</span>
                                            </div>
                                            ${item.spice_level > 0 && html`
                                                <div class="ticket-item-modifiers">>> SPICE LEVEL: ${item.spice_level}</div>
                                            `}
                                            ${item.extra_toppings.length > 0 && html`
                                                <div class="ticket-item-modifiers" style="color: var(--accent-amber);">
                                                    + ${item.extra_toppings.join(', ')}
                                                </div>
                                            `}
                                        </div>
                                    `)}
                                </div>
                                <div class="ticket-footer">
                                    ${order.status === 'pending' ? html`
                                        <button class="kds-action-btn prepare" onClick=${() => handleKdsStatusChange(order.id, 'preparing')}>[ START PREPARATION ]</button>
                                    ` : html`
                                        <button class="kds-action-btn complete" onClick=${() => handleKdsStatusChange(order.id, 'completed')}>[ SERVE TICKET ]</button>
                                    `}
                                </div>
                            </div>
                        `)}
                    `}
                </div>
            </div>
        `}

        <!-- Audit Ledger View -->
        ${view === 'ledger' && html`
            <div class="ledger-container">
                <div class="ledger-header">
                    <h2 class="kds-title">WALLETS & AUDIT LEDGER</h2>
                    <p style="font-size: 0.75rem; color: var(--text-muted-term); margin-top: 0.25rem;">Immutable transactions log captured via after-update trigger.</p>
                </div>
                
                <table class="ledger-table">
                    <thead>
                        <tr>
                            <th class="ledger-th">TXID</th>
                            <th class="ledger-th">TX_TYPE</th>
                            <th class="ledger-th">DELTA</th>
                            <th class="ledger-th">TIMESTAMP</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ledger.map(tx => html`
                            <tr class="ledger-tr" key=${tx.id}>
                                <td class="ledger-td" style="font-weight: 700;">${tx.id.toUpperCase()}</td>
                                <td class="ledger-td" style="font-weight: 500;">
                                    ${tx.type.toUpperCase()}
                                </td>
                                <td class="ledger-td">
                                    <span class="amount-badge ${tx.amount > 0 ? 'positive' : 'negative'}">
                                        ${tx.amount > 0 ? '+' : ''}$${tx.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td class="ledger-td text-muted-term">${new Date(tx.created_at).toLocaleString()}</td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `}

        <!-- Accounts View -->
        ${view === 'accounts' && html`
            <div class="ledger-container">
                <div class="ledger-header" style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 class="kds-title">ACCOUNTS MANAGEMENT</h2>
                    <button class="action-btn primary" onClick=${async () => {
                        const id = prompt('New User ID:');
                        if (!id) return;
                        const role = prompt('Role (customer/admin):', 'customer');
                        const password = prompt('Password:');
                        await fetch(`${API_BASE}/profiles`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ id, role, password }) });
                        fetch(`${API_BASE}/profiles`).then(r => r.json()).then(setProfiles);
                    }}>+ CREATE</button>
                </div>
                <table class="ledger-table">
                    <thead><tr><th class="ledger-th">ID</th><th class="ledger-th">ROLE</th><th class="ledger-th">BALANCE</th><th class="ledger-th">ACT</th></tr></thead>
                    <tbody>
                        ${profiles.map(p => html`
                            <tr class="ledger-tr" key=${p.id}>
                                <td class="ledger-td">${p.id}</td>
                                <td class="ledger-td">${p.role}</td>
                                <td class="ledger-td">$${p.wallet_balance.toFixed(2)}</td>
                                <td class="ledger-td">
                                    <button class="action-btn" style="color:var(--accent-red); border-color:var(--accent-red);" onClick=${async () => {
                                        setConfirmDialog({
                                            message: `Delete user "${p.id}" from the system?`,
                                            onConfirm: async () => {
                                                await fetch(`${API_BASE}/profiles/${p.id}`, { method: 'DELETE' });
                                                setProfiles(prev => prev.filter(x => x.id !== p.id));
                                                setConfirmDialog(null);
                                            },
                                            onCancel: () => setConfirmDialog(null)
                                        });
                                    }}>DEL</button>
                                </td>
                            </tr>
                        `)}
                    </tbody>
                </table>
            </div>
        `}

        <!-- Confirm Dialog Modal -->
        ${confirmDialog && html`
            <div>
                <div class="overlay" onClick=${confirmDialog.onCancel}></div>
                <div class="modal-center">
                    <div class="modal-box" style="border-color: var(--accent-red); max-width: 320px; text-align: center;">
                        <div class="modal-header" style="justify-content: center; border-bottom: none; padding-bottom: 0;">
                            <div>
                                <h3 class="modal-title" style="color: var(--accent-red); margin-bottom: 1rem;">CONFIRM ACTION</h3>
                                <p class="modal-desc" style="font-size: 1rem; color: var(--text-term);">${confirmDialog.message}</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                            <button class="action-btn" style="flex: 1;" onClick=${confirmDialog.onCancel}>CANCEL</button>
                            <button class="action-btn" style="flex: 1; background: var(--accent-red); color: #000; border-color: var(--accent-red);" onClick=${confirmDialog.onConfirm}>CONFIRM</button>
                        </div>
                    </div>
                </div>
            </div>
        `}

        <!-- Customization Modal -->
        ${customizeItem && html`
            <div>
                <div class="overlay" onClick=${() => setCustomizeItem(null)}></div>
                <div class="modal-center">
                    <div class="modal-box">
                        <div class="modal-header">
                            <div>
                                <h3 class="modal-title">${customizeItem.name}</h3>
                                <p class="modal-desc">Configure item options</p>
                            </div>
                            <button class="close-btn" onClick=${() => setCustomizeItem(null)}>×</button>
                        </div>

                        <div>
                            <div class="modal-section-title">Select Spice Level (1-8)</div>
                            <div class="spice-grid">
                                ${[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => html`
                                    <button 
                                        key=${lvl}
                                        class="spice-opt ${spiceLevel === lvl ? 'selected' : ''}"
                                        onClick=${() => setSpiceLevel(lvl)}
                                    >
                                        LVL ${lvl}
                                    </button>
                                `)}
                            </div>

                            <div class="modal-section-title">Add-ons</div>
                            <div class="addon-list">
                                ${ADDONS.map((addon, idx) => {
                                    const isSelected = selectedAddons.some(a => a.name === addon.name);
                                    return html`
                                        <div 
                                            key=${idx} 
                                            class="addon-item ${isSelected ? 'selected' : ''}"
                                            onClick=${() => handleAddonToggle(addon)}
                                        >
                                            <div class="addon-info">
                                                <input 
                                                    type="checkbox" 
                                                    class="addon-checkbox" 
                                                    checked=${isSelected}
                                                    readOnly
                                                />
                                                <span class="addon-name">${addon.name}</span>
                                            </div>
                                            <span class="addon-price">+$${addon.price.toFixed(2)}</span>
                                        </div>
                                    `;
                                })}
                            </div>

                            <div class="modal-footer-action">
                                <div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted-term);">ITEM PRICE</div>
                                    <span class="modal-total-price">
                                        $${(customizeItem.price + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(2)}
                                    </span>
                                </div>
                                <button class="add-cart-confirm" onClick=${handleAddCustomizeToCart}>[ ADD TO BAG ]</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `}

        <!-- Cart Drawer -->
        <div>
            ${cartOpen && html`<div class="overlay" onClick=${() => setCartOpen(false)}></div>`}
            <div class="cart-drawer ${cartOpen ? 'open' : ''}">
                <div class="cart-header">
                    <h2 class="modal-title">SHOPPING BAG</h2>
                    <button class="close-btn" onClick=${() => setCartOpen(false)}>×</button>
                </div>

                <div class="cart-body">
                    ${cart.length === 0 ? html`
                        <div class="cart-empty">
                            <p style="font-weight: 700; color: var(--text-muted-term); margin-bottom: 0.5rem;">[ BAG IS EMPTY ]</p>
                            <p>Select items from menu terminal to fill.</p>
                        </div>
                    ` : html`
                        ${cart.map(item => html`
                            <div class="cart-item" key=${item.id}>
                                <div class="cart-item-details">
                                    <h4>${item.name}</h4>
                                    <div class="cart-item-modifiers">
                                        ${item.spice_level > 0 && html`<span>>> SPICE LEVEL: ${item.spice_level}</span>`}
                                        ${item.extra_toppings.map(t => html`<span>>> ADD: ${t}</span>`)}
                                    </div>
                                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                                    <div class="qty-controls">
                                        <button class="qty-btn" onClick=${() => updateCartQty(item.id, -1)}>−</button>
                                        <span class="qty-num">${item.quantity}</span>
                                        <button class="qty-btn" onClick=${() => updateCartQty(item.id, 1)}>+</button>
                                    </div>
                                    <button class="cart-remove-btn" onClick=${() => updateCartQty(item.id, -item.quantity)}>[remove]</button>
                                </div>
                            </div>
                        `)}
                    `}
                </div>

                ${cart.length > 0 && html`
                    <div class="cart-footer">
                        <div class="cart-footer-row">
                            <span>WALLET BALANCE</span>
                            <span style="font-weight: 700; color: ${wallet >= cartTotal ? 'var(--accent-green)' : 'var(--accent-red)'}">
                                $${wallet.toFixed(2)}
                            </span>
                        </div>
                        <div class="cart-footer-row total">
                            <span>TOTAL DUE</span>
                            <span>$${cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            class="checkout-btn" 
                            disabled=${wallet < cartTotal}
                            onClick=${handleCheckout}
                        >
                            ${wallet >= cartTotal ? '[ CONFIRM CHECKOUT ]' : '[ INSUFFICIENT BALANCE ]'}
                        </button>
                    </div>
                `}
            </div>
        </div>

        <!-- Top Up Modal -->
        ${topupOpen && html`
            <div>
                <div class="overlay" onClick=${() => setTopupOpen(false)}></div>
                <div class="modal-center">
                    <div class="modal-box">
                        <div class="modal-header">
                            <div>
                                <h3 class="modal-title">TOP UP BAL</h3>
                                <p class="modal-desc">Simulated balance incrementation</p>
                            </div>
                            <button class="close-btn" onClick=${() => setTopupOpen(false)}>×</button>
                        </div>
                        
                        <div>
                            <div class="topup-options">
                                ${[10, 20, 50].map(val => html`
                                    <button 
                                        key=${val}
                                        class="topup-opt"
                                        onClick=${() => { handleTopup(val); setTopupOpen(false); }}
                                    >
                                        +$${val}
                                    </button>
                                `)}
                            </div>
                            <button class="modal-cancel" onClick=${() => setTopupOpen(false)}>[ CANCEL ]</button>
                        </div>
                    </div>
                </div>
            </div>
        `}

        <!-- Toast Notification -->
        <div class="toast ${toast.show ? 'show' : ''}">${toast.msg.toUpperCase()}</div>
    `;
}

render(html`<${App} />`, document.getElementById('app'));
