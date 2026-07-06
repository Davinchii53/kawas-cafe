// Kawa Noodles — app.js
// Standalone Preact + HTM, zero npm install
// Clean, high-density Developer Console / POS Terminal interface
const { html, render, useState, useEffect } = htmPreact;

// ─── Menu Data ───
const MENU = [
    {
        id: 1,
        name: 'MIE SETAN',
        desc: 'Savoury, salty, hot chili oil base. Choose your spice level.',
        price: 3.50,
        category: 'Noodles',
        customizable: true
    },
    {
        id: 2,
        name: 'MIE IBLIS',
        desc: 'Sweet dark soy glaze tossed with fiery chili paste. Bold and sweet.',
        price: 3.50,
        category: 'Noodles',
        customizable: true
    },
    {
        id: 3,
        name: 'MIE ANGEL',
        desc: 'Zero heat. Tossed in aromatic chicken fat, topped with dried chicken floss.',
        price: 3.00,
        category: 'Noodles',
        customizable: false
    },
    {
        id: 4,
        name: 'UDANG RAMBUTAN',
        desc: 'Golden minced shrimp balls wrapped in crispy pastry threads (3 pcs).',
        price: 2.50,
        category: 'Dimsum',
        customizable: false
    },
    {
        id: 5,
        name: 'UDANG KEJU',
        desc: 'Crispy fried shrimp dumplings stuffed with melted mozzarella (3 pcs).',
        price: 2.50,
        category: 'Dimsum',
        customizable: false
    },
    {
        id: 6,
        name: 'LUMPIA TAHU',
        desc: 'Minced chicken & shrimp spring roll in crispy tofu skin wrapper (3 pcs).',
        price: 2.20,
        category: 'Dimsum',
        customizable: false
    },
    {
        id: 7,
        name: 'ES GENDERUWO',
        desc: 'Fruity syrup ice loaded with jelly, coco gel, and sweetened milk.',
        price: 2.00,
        category: 'Drinks',
        customizable: false
    },
    {
        id: 8,
        name: 'ES POCONG',
        desc: 'Sharp lime juice, sweet basil seeds, and coconut slices over crushed ice.',
        price: 1.80,
        category: 'Drinks',
        customizable: false
    }
];

const ADDONS = [
    { name: 'Extra Udang Keju (1 pc)', price: 0.80 },
    { name: 'Extra Udang Rambutan (1 pc)', price: 0.80 },
    { name: 'Extra Pangsit Goreng (2 pcs)', price: 0.60 }
];

const CATEGORIES = ['All', 'Noodles', 'Dimsum', 'Drinks'];

function App() {
    const [view, setView] = useState('customer'); // 'customer', 'admin' (KDS), 'ledger' (audit)
    const [wallet, setWallet] = useState(25.00);
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [topupOpen, setTopupOpen] = useState(false);
    const [customizeItem, setCustomizeItem] = useState(null);
    
    const [spiceLevel, setSpiceLevel] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Toast notifications
    const [toast, setToast] = useState({ msg: '', show: false });

    // KDS tickets
    const [kdsOrders, setKdsOrders] = useState([
        {
            id: 'ord_7812',
            created_at: new Date(Date.now() - 300000).toISOString(),
            status: 'preparing',
            items: [
                { name: 'MIE SETAN', quantity: 2, spice_level: 5, extra_toppings: ['Extra Udang Keju (1 pc)'] },
                { name: 'ES GENDERUWO', quantity: 1, spice_level: 0, extra_toppings: [] }
            ]
        },
        {
            id: 'ord_9012',
            created_at: new Date(Date.now() - 60000).toISOString(),
            status: 'pending',
            items: [
                { name: 'MIE IBLIS', quantity: 1, spice_level: 8, extra_toppings: ['Extra Pangsit Goreng (2 pcs)'] }
            ]
        }
    ]);

    // Simulated Immutable Ledger (Level 3 requirement)
    const [ledger, setLedger] = useState([
        { id: 'tx_001', amount: 25.00, type: 'topup', created_at: new Date(Date.now() - 600000).toISOString() }
    ]);

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

    const handleTopup = (amount) => {
        setWallet(prev => prev + amount);
        
        // Log transaction to simulated ledger
        const txId = `tx_${Math.floor(100 + Math.random() * 900)}`;
        setLedger(prev => [
            { id: txId, amount, type: 'topup', created_at: new Date().toISOString() },
            ...prev
        ]);
        showToast(`Loaded $${amount.toFixed(2)} to wallet`);
    };

    const handleCheckout = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (wallet < total) {
            showToast('Checkout failed: Insufficient funds');
            return;
        }

        setWallet(prev => prev - total);

        // Log transaction to simulated ledger (Immutable audit logging)
        const txId = `tx_${Math.floor(100 + Math.random() * 900)}`;
        setLedger(prev => [
            { id: txId, amount: -total, type: 'purchase', created_at: new Date().toISOString() },
            ...prev
        ]);

        // Push order ticket to KDS
        const newOrderId = `ord_${Math.floor(1000 + Math.random() * 9000)}`;
        const newTicket = {
            id: newOrderId,
            created_at: new Date().toISOString(),
            status: 'pending',
            items: cart.map(item => ({
                name: item.name,
                quantity: item.quantity,
                spice_level: item.spice_level,
                extra_toppings: item.extra_toppings
            }))
        };

        setKdsOrders(prev => [newTicket, ...prev]);
        setCart([]);
        setCartOpen(false);
        showToast(`Paid $${total.toFixed(2)}. Ticket: ${newOrderId}`);
    };

    const handleKdsStatusChange = (orderId, newStatus) => {
        setKdsOrders(prev => prev.map(ord => {
            if (ord.id === orderId) {
                return { ...ord, status: newStatus };
            }
            return ord;
        }));
        showToast(`Order ${orderId} updated to ${newStatus}`);
    };

    const filteredMenu = activeCategory === 'All'
        ? MENU
        : MENU.filter(i => i.category === activeCategory);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return html`
        <!-- Navigation -->
        <header class="nav">
            <div class="nav-logo-group">
                <a href="#" class="nav-brand" onClick=${() => setView('customer')}>
                    🌶️ KAWA_NOODLES<span>.console</span>
                </a>
            </div>
            
            <div class="nav-controls">
                <div class="role-selector">
                    <button class="role-btn ${view === 'customer' ? 'active' : ''}" onClick=${() => setView('customer')}>ORDER</button>
                    <button class="role-btn ${view === 'admin' ? 'active' : ''}" onClick=${() => setView('admin')}>KDS</button>
                    <button class="role-btn ${view === 'ledger' ? 'active' : ''}" onClick=${() => setView('ledger')}>LEDGER</button>
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
