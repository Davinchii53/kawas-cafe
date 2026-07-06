// Kawa Noodles — app.js
// Standalone Preact + HTM, zero npm install, fast-paced street food vibe
const { html, render, useState, useEffect } = htmPreact;

// ─── Menu Data ───
const MENU = [
    {
        id: 1,
        name: 'Mie Setan',
        desc: 'Savoury, salty, and extremely spicy. Customizable spice level.',
        price: 3.50,
        category: 'Noodles',
        img: '🌶️',
        customizable: true
    },
    {
        id: 2,
        name: 'Mie Iblis',
        desc: 'Sweet, savoury, and spicy. Tossed in dark sweet soy sauce.',
        price: 3.50,
        category: 'Noodles',
        img: '😈',
        customizable: true
    },
    {
        id: 3,
        name: 'Mie Angel',
        desc: 'Zero spice, highly savoury. Sprinkled with chicken floss and green onions.',
        price: 3.00,
        category: 'Noodles',
        img: '👼',
        customizable: false
    },
    {
        id: 4,
        name: 'Udang Rambutan',
        desc: 'Crispy fried shrimp balls wrapped in crunchy noodle threads.',
        price: 2.50,
        category: 'Dimsum',
        img: '🍤',
        customizable: false
    },
    {
        id: 5,
        name: 'Udang Keju',
        desc: 'Fried shrimp dumplings oozing with molten melted cheese.',
        price: 2.50,
        category: 'Dimsum',
        img: '🧀',
        customizable: false
    },
    {
        id: 6,
        name: 'Lumpia Kulit Tahu',
        desc: 'Fresh minced chicken and shrimp wrapped in crispy bean curd skin.',
        price: 2.20,
        category: 'Dimsum',
        img: '🌯',
        customizable: false
    },
    {
        id: 7,
        name: 'Es Genderuwo',
        desc: 'Cold, sweet syrup ice filled with jelly, fruit cocktails, and condensed milk.',
        price: 2.00,
        category: 'Drinks',
        img: '🍧',
        customizable: false
    },
    {
        id: 8,
        name: 'Es Pocong',
        desc: 'Refreshing lime and mint ice, topped with sliced jelly.',
        price: 1.80,
        category: 'Drinks',
        img: '🍹',
        customizable: false
    }
];

const ADDONS = [
    { name: 'Extra Udang Keju (1 pc)', price: 0.80 },
    { name: 'Extra Udang Rambutan (1 pc)', price: 0.80 },
    { name: 'Extra Pangsit Goreng (2 pcs)', price: 0.60 }
];

const CATEGORIES = ['All', 'Noodles', 'Dimsum', 'Drinks'];

// ─── Main App Component ───
function App() {
    const [view, setView] = useState('customer'); // 'customer' or 'admin'
    const [wallet, setWallet] = useState(25.00);
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [topupOpen, setTopupOpen] = useState(false);
    const [customizeItem, setCustomizeItem] = useState(null); // Item currently being customized
    
    // Customization selections
    const [spiceLevel, setSpiceLevel] = useState(1);
    const [selectedAddons, setSelectedAddons] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    
    // Toast notifications
    const [toast, setToast] = useState({ msg: '', show: false });

    // KDS orders (Kitchen Display System)
    const [kdsOrders, setKdsOrders] = useState([
        {
            id: 'ord_108',
            created_at: new Date(Date.now() - 300000).toISOString(),
            status: 'preparing',
            items: [
                { name: 'Mie Setan', quantity: 2, spice_level: 5, extra_toppings: ['Extra Udang Keju (1 pc)'] },
                { name: 'Es Genderuwo', quantity: 1, spice_level: 0, extra_toppings: [] }
            ]
        },
        {
            id: 'ord_109',
            created_at: new Date(Date.now() - 60000).toISOString(),
            status: 'pending',
            items: [
                { name: 'Mie Iblis', quantity: 1, spice_level: 8, extra_toppings: ['Extra Pangsit Goreng (2 pcs)'] }
            ]
        }
    ]);

    const showToast = (msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast({ msg: '', show: false }), 3000);
    };

    // Open modifier panel for item customization
    const openCustomize = (item) => {
        setCustomizeItem(item);
        setSpiceLevel(1);
        setSelectedAddons([]);
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
            img: customizeItem.img,
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
        // Noodles must go through customization for spice selection
        if (item.customizable) {
            openCustomize(item);
            return;
        }

        const cartEntry = {
            id: `${item.id}_0_none`,
            menu_item_id: item.id,
            name: item.name,
            img: item.img,
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

    const handleCheckout = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (wallet < total) {
            showToast('Checkout failed: Insufficient funds');
            return;
        }

        // Deduct from wallet
        setWallet(prev => prev - total);

        // Generate checkout ticket for KDS simulation
        const newOrderId = `ord_${Math.floor(100 + Math.random() * 900)}`;
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
        showToast(`Order placed successfully! Ticket: ${newOrderId}`);
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
        <!-- Header -->
        <header class="nav">
            <div class="nav-logo-group">
                <span class="nav-logo-icon">🍜</span>
                <a href="#" class="nav-brand">KAWA <span>NOODLES</span></a>
            </div>
            
            <div class="nav-controls">
                <div class="role-selector">
                    <button class="role-btn ${view === 'customer' ? 'active' : ''}" onClick=${() => setView('customer')}>Customer</button>
                    <button class="role-btn ${view === 'admin' ? 'active' : ''}" onClick=${() => setView('admin')}>Kitchen (KDS)</button>
                </div>
                
                ${view === 'customer' && html`
                    <div class="wallet-pill">
                        <span>$${wallet.toFixed(2)}</span>
                        <button onClick=${() => setTopupOpen(true)} title="Add funds">+</button>
                    </div>
                    <button class="cart-btn" onClick=${() => setCartOpen(true)}>
                        🛒 Bag
                        <span class="cart-badge">${cartCount}</span>
                    </button>
                `}
            </div>
        </header>

        <!-- Customer View -->
        ${view === 'customer' && html`
            <section class="hero">
                <span class="hero-badge">Indonesian Spicy Noodle Bar</span>
                <h2>Savage Spice. <span>Instant Wallet checkout.</span></h2>
                <p>Pick your spice level from 1 to 8, select premium dimsum add-ons, and checkout instantly with your digital wallet.</p>
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
                    <div class="menu-item" key=${item.id}>
                        ${item.customizable && html`<span class="menu-item-badge">Spice Lvl 1-8</span>`}
                        <div class="menu-item-visual">${item.img}</div>
                        <h3 class="menu-item-name">${item.name}</h3>
                        <p class="menu-item-desc">${item.desc}</p>
                        <div class="menu-item-footer">
                            <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                            <button class="customize-btn" onClick=${() => handleQuickAdd(item)}>
                                ${item.customizable ? 'Customize' : 'Add'}
                            </button>
                        </div>
                    </div>
                `)}
            </div>
        `}

        <!-- Admin Kitchen View (KDS Display) -->
        ${view === 'admin' && html`
            <div class="kds-container">
                <div class="kds-header">
                    <div>
                        <h2 class="kds-title">Active Orders Display</h2>
                        <p class="text-muted" style="font-size: 0.85rem; margin-top: 0.25rem;">Real-time incoming orders list.</p>
                    </div>
                </div>

                <div class="kds-grid">
                    ${kdsOrders.filter(o => o.status !== 'completed').length === 0 ? html`
                        <div class="text-center py-20 w-full" style="grid-column: 1 / -1; color: var(--text-muted);">
                            <span style="font-size: 3rem; display: block; margin-bottom: 1rem;">😴</span>
                            <p>No active tickets right now.</p>
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
                                                <div class="ticket-item-modifiers">🔥 Spice Lvl ${item.spice_level}</div>
                                            `}
                                            ${item.extra_toppings.length > 0 && html`
                                                <div class="ticket-item-modifiers" style="color: var(--brand-yellow)">
                                                    ➕ ${item.extra_toppings.join(', ')}
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

        <!-- Customization / Modifier Modal -->
        ${customizeItem && html`
            <div>
                <div class="overlay" onClick=${() => setCustomizeItem(null)}></div>
                <div class="modal-center">
                    <div class="modal-box">
                        <div class="modal-header">
                            <div>
                                <h3 class="modal-title">${customizeItem.name}</h3>
                                <p class="modal-desc">Configure noodle options</p>
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

                            <div class="modal-section-title">Dimsum Add-ons</div>
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
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">Total Item Price</div>
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
                <div class="cart-header" style="border-bottom: 1px solid var(--border-dark); padding: 1.5rem;">
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
                            ${wallet >= cartTotal ? 'Swipe to Order' : 'Insufficient Balance'}
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
                                <p class="modal-desc">Simulated closed-loop wallet top-up</p>
                            </div>
                            <button class="close-btn" onClick=${() => setTopupOpen(false)}>×</button>
                        </div>
                        
                        <div>
                            <div class="topup-options">
                                ${[10, 20, 50].map(val => html`
                                    <button 
                                        key=${val}
                                        class="topup-opt"
                                        onClick=${() => { setWallet(prev => prev + val); setTopupOpen(false); showToast(`Loaded $${val.toFixed(2)} to wallet`); }}
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
