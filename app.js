// Kawa Noodles — app.js
// Standalone Preact + HTM, zero npm install
// Styled as a high-character brutalist design (de-slopped)
const { html, render, useState, useEffect } = htmPreact;

// ─── Menu Data (Stamps/Text replace plain emojis for a crafted look) ───
const MENU = [
    {
        id: 1,
        name: 'MIE SETAN',
        desc: 'Savoury, salty, hot chili oil base. Choose your spice level.',
        price: 3.50,
        category: 'Noodles',
        stamp: '🔥 SETAN',
        customizable: true,
        featured: true
    },
    {
        id: 2,
        name: 'MIE IBLIS',
        desc: 'Sweet dark soy glaze tossed with fiery chili paste. Bold and sweet.',
        price: 3.50,
        category: 'Noodles',
        stamp: '🌶️ IBLIS',
        customizable: true,
        featured: false
    },
    {
        id: 3,
        name: 'MIE ANGEL',
        desc: 'Zero heat. Tossed in aromatic chicken fat, topped with dried chicken floss.',
        price: 3.00,
        category: 'Noodles',
        stamp: '✨ ANGEL',
        customizable: false,
        featured: false
    },
    {
        id: 4,
        name: 'UDANG RAMBUTAN',
        desc: 'Golden minced shrimp balls wrapped in crispy pastry threads (3 pcs).',
        price: 2.50,
        category: 'Dimsum',
        stamp: '🍤 RAMB',
        customizable: false,
        featured: true
    },
    {
        id: 5,
        name: 'UDANG KEJU',
        desc: 'Crispy fried shrimp dumplings stuffed with melted mozzarella (3 pcs).',
        price: 2.50,
        category: 'Dimsum',
        stamp: '🧀 KEJU',
        customizable: false,
        featured: false
    },
    {
        id: 6,
        name: 'LUMPIA TAHU',
        desc: 'Minced chicken & shrimp spring roll in crispy tofu skin wrapper (3 pcs).',
        price: 2.20,
        category: 'Dimsum',
        stamp: '🌯 LUMPIA',
        customizable: false,
        featured: false
    },
    {
        id: 7,
        name: 'ES GENDERUWO',
        desc: 'Fruity syrup ice loaded with jelly, coco gel, and sweetened milk.',
        price: 2.00,
        category: 'Drinks',
        stamp: '❄️ GEND',
        customizable: false,
        featured: false
    },
    {
        id: 8,
        name: 'ES POCONG',
        desc: 'Sharp lime juice, sweet basil seeds, and coconut slices over crushed ice.',
        price: 1.80,
        category: 'Drinks',
        stamp: '🧊 PCO',
        customizable: false,
        featured: false
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

    const handleQuickAdd = (item) => {
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
        // Update wallet
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

        // Deduct wallet balance
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
                <span class="nav-logo-icon">🌶️</span>
                <a href="#" class="nav-brand" onClick=${() => setView('customer')}>KAWA <span>NOODLES</span></a>
            </div>
            
            <div class="nav-controls">
                <div class="role-selector">
                    <button class="role-btn ${view === 'customer' ? 'active' : ''}" onClick=${() => setView('customer')}>Order</button>
                    <button class="role-btn ${view === 'admin' ? 'active' : ''}" onClick=${() => setView('admin')}>KDS</button>
                    <button class="role-btn ${view === 'ledger' ? 'active' : ''}" onClick=${() => setView('ledger')}>Audit Ledger</button>
                </div>
                
                ${view === 'customer' && html`
                    <div class="wallet-pill">
                        <span>$${wallet.toFixed(2)}</span>
                        <button onClick=${() => setTopupOpen(true)} title="Add funds">+</button>
                    </div>
                    <button class="cart-btn" onClick=${() => setCartOpen(true)}>
                        Bag
                        <span class="cart-badge">${cartCount}</span>
                    </button>
                `}
            </div>
        </header>

        <!-- Customer Storefront View -->
        ${view === 'customer' && html`
            <section class="hero">
                <div class="hero-layout">
                    <div>
                        <span class="hero-badge">Est. 2026</span>
                        <h2>Frictionless. <span>Savage Spice.</span></h2>
                    </div>
                    <div>
                        <p>High-throughput spicy noodles inspired by street stalls. Custom modifier system, instant wallet balance deductions.</p>
                    </div>
                </div>
            </section>

            <div class="categories">
                ${CATEGORIES.map(cat => html`
                    <button 
                        key=${cat}
                        class="cat-btn ${activeCategory === cat ? 'active' : ''}"
                        onClick=${() => setActiveCategory(cat)}
                    >
                        ${cat}
                    </button>
                `)}
            </div>

            <div class="menu-grid">
                ${filteredMenu.map(item => html`
                    <div class="menu-item ${item.featured ? 'featured' : ''}" key=${item.id}>
                        ${item.customizable && html`<span class="menu-item-badge">Custom Lvl 1-8</span>`}
                        <div class="menu-item-visual">
                            <span class="menu-item-visual-logo">${item.name.split(' ')[0]}</span>
                            <span class="menu-item-visual-overlay">${item.stamp.split(' ')[0]}</span>
                        </div>
                        <h3 class="menu-item-name">${item.name}</h3>
                        <p class="menu-item-desc">${item.desc}</p>
                        <div class="menu-item-footer">
                            <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                            <button class="customize-btn" onClick=${() => handleQuickAdd(item)}>
                                ${item.customizable ? 'Options' : 'Add'}
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
                    <div>
                        <h2 class="kds-title">Active Order Tickets</h2>
                        <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">Live order updates via simulated WebSocket subscription.</p>
                    </div>
                </div>

                <div class="kds-grid">
                    ${kdsOrders.filter(o => o.status !== 'completed').length === 0 ? html`
                        <div class="text-center py-20 w-full" style="grid-column: 1 / -1; color: var(--text-muted);">
                            <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">📭</span>
                            <p>No active noodle orders on the board.</p>
                        </div>
                    ` : html`
                        ${kdsOrders.filter(o => o.status !== 'completed').map(order => html`
                            <div class="kds-ticket ${order.status === 'preparing' ? 'preparing' : ''}" key=${order.id}>
                                <div class="ticket-header">
                                    <span class="ticket-id font-display">${order.id}</span>
                                    <span>${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                </div>
                                <div class="ticket-items">
                                    ${order.items.map((item, idx) => html`
                                        <div class="ticket-item" key=${idx}>
                                            <div class="ticket-item-header">
                                                <span>${item.quantity}x ${item.name}</span>
                                            </div>
                                            ${item.spice_level > 0 && html`
                                                <div class="ticket-item-modifiers">Spice Lvl ${item.spice_level}</div>
                                            `}
                                            ${item.extra_toppings.length > 0 && html`
                                                <div class="ticket-item-modifiers" style="color: var(--brand-yellow); font-size: 0.7rem;">
                                                    + ${item.extra_toppings.join(', ')}
                                                </div>
                                            `}
                                        </div>
                                    `)}
                                </div>
                                <div class="ticket-footer">
                                    ${order.status === 'pending' ? html`
                                        <button class="kds-action-btn prepare" onClick=${() => handleKdsStatusChange(order.id, 'preparing')}>Prepare</button>
                                    ` : html`
                                        <button class="kds-action-btn complete" onClick=${() => handleKdsStatusChange(order.id, 'completed')}>Serve</button>
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
                    <h2 class="kds-title">Immutable Audit Trail</h2>
                    <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">
                        Simulated trigger-based transactions ledger verifying Level 3 security audit logging.
                    </p>
                </div>
                
                <table class="ledger-table">
                    <thead>
                        <tr>
                            <th class="ledger-th">TXID</th>
                            <th class="ledger-th">Type</th>
                            <th class="ledger-th">Value Change</th>
                            <th class="ledger-th">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ledger.map(tx => html`
                            <tr class="ledger-tr" key=${tx.id}>
                                <td class="ledger-td font-display" style="font-weight: 700;">${tx.id}</td>
                                <td class="ledger-td" style="text-transform: uppercase; font-size: 0.8rem; font-weight: 700;">
                                    ${tx.type}
                                </td>
                                <td class="ledger-td">
                                    <span class="amount-badge ${tx.amount > 0 ? 'positive' : 'negative'}">
                                        ${tx.amount > 0 ? '+' : ''}$${tx.amount.toFixed(2)}
                                    </span>
                                </td>
                                <td class="ledger-td text-muted">${new Date(tx.created_at).toLocaleString()}</td>
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
                                <p class="modal-desc">Select modifications</p>
                            </div>
                            <button class="close-btn" onClick=${() => setCustomizeItem(null)}>×</button>
                        </div>

                        <div>
                            <div class="modal-section-title">Select Spice Level</div>
                            <div class="spice-grid">
                                ${[1, 2, 3, 4, 5, 6, 7, 8].map(lvl => html`
                                    <button 
                                        key=${lvl}
                                        class="spice-opt ${spiceLevel === lvl ? 'selected' : ''}"
                                        onClick=${() => setSpiceLevel(lvl)}
                                    >
                                        Lvl ${lvl}
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
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Calculated Price</div>
                                    <span class="modal-total-price">
                                        $${(customizeItem.price + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(2)}
                                    </span>
                                </div>
                                <button class="add-cart-confirm" onClick=${handleAddCustomizeToCart}>Add to Bag</button>
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
                    <h2 class="modal-title">Shopping Bag</h2>
                    <button class="close-btn" onClick=${() => setCartOpen(false)}>×</button>
                </div>

                <div class="cart-body">
                    ${cart.length === 0 ? html`
                        <div class="cart-empty">
                            <span style="font-size: 3rem;">🛒</span>
                            <p class="font-display" style="font-weight: 700;">Bag is empty</p>
                            <p style="font-size: 0.8rem;">Add some noodles to get started!</p>
                        </div>
                    ` : html`
                        ${cart.map(item => html`
                            <div class="cart-item" key=${item.id}>
                                <div class="cart-item-details">
                                    <h4>${item.name}</h4>
                                    <div class="cart-item-modifiers">
                                        ${item.spice_level > 0 && html`<span>🔥 Spice Level ${item.spice_level}</span>`}
                                        ${item.extra_toppings.map(t => html`<span>➕ ${t}</span>`)}
                                    </div>
                                    <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem;">
                                    <div class="qty-controls">
                                        <button class="qty-btn" onClick=${() => updateCartQty(item.id, -1)}>−</button>
                                        <span class="qty-num">${item.quantity}</span>
                                        <button class="qty-btn" onClick=${() => updateCartQty(item.id, 1)}>+</button>
                                    </div>
                                    <button class="cart-remove-btn" onClick=${() => updateCartQty(item.id, -item.quantity)}>Remove</button>
                                </div>
                            </div>
                        `)}
                    `}
                </div>

                ${cart.length > 0 && html`
                    <div class="cart-footer">
                        <div class="cart-footer-row">
                            <span>Balance Available</span>
                            <span style="font-weight: 700; color: ${wallet >= cartTotal ? 'var(--success)' : 'var(--brand-red)'}">
                                $${wallet.toFixed(2)}
                            </span>
                        </div>
                        <div class="cart-footer-row total">
                            <span>Total Due</span>
                            <span>$${cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            class="checkout-btn" 
                            disabled=${wallet < cartTotal}
                            onClick=${handleCheckout}
                        >
                            ${wallet >= cartTotal ? 'Pay & Order' : 'Insufficient Balance'}
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
                                <h3 class="modal-title">Load Wallet</h3>
                                <p class="modal-desc">Select amount to top up</p>
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
                            <button class="modal-cancel" onClick=${() => setTopupOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `}

        <!-- Toast Notification -->
        <div class="toast ${toast.show ? 'show' : ''}">${toast.msg}</div>
    `;
}

render(html`<${App} />`, document.getElementById('app'));
