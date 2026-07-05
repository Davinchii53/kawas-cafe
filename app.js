// Kawa's Cafe — app.js
// Preact + HTM, no build tools
const { html, render, useState, useEffect, useRef } = htmPreact;

// ─── Menu Data ───
// Descriptions written like a real cafe chalkboard, not marketing copy
const MENU = [
    {
        id: 1,
        name: 'House Drip',
        desc: 'Single origin, medium roast. Clean and balanced.',
        price: 3.00,
        category: 'Coffee',
        img: '☕'
    },
    {
        id: 2,
        name: 'Iced Oat Latte',
        desc: 'Double shot over oat milk and ice. Our best seller.',
        price: 4.50,
        category: 'Coffee',
        img: '🥛'
    },
    {
        id: 3,
        name: 'Matcha Latte',
        desc: 'Ceremonial grade matcha, steamed milk, lightly sweetened.',
        price: 5.00,
        category: 'Coffee',
        img: '🍵'
    },
    {
        id: 4,
        name: 'Butter Croissant',
        desc: 'Baked fresh every morning. Flaky, golden, honest.',
        price: 3.50,
        category: 'Pastries',
        img: '🥐'
    },
    {
        id: 5,
        name: 'Banana Bread',
        desc: 'Dense, moist, made with brown butter and sea salt.',
        price: 4.00,
        category: 'Pastries',
        img: '🍞'
    },
    {
        id: 6,
        name: 'Egg & Cheese Sandwich',
        desc: 'Scrambled eggs, aged cheddar, sourdough. Simple done right.',
        price: 7.50,
        category: 'Mains',
        img: '🥪'
    },
    {
        id: 7,
        name: 'Avocado Toast',
        desc: 'Smashed avo, chili flakes, poached egg, multigrain.',
        price: 8.50,
        category: 'Mains',
        img: '🥑'
    },
    {
        id: 8,
        name: 'Basque Cheesecake',
        desc: 'Burnt top, creamy center. Served at room temperature.',
        price: 6.00,
        category: 'Pastries',
        img: '🍰'
    }
];

const CATEGORIES = ['All', 'Coffee', 'Pastries', 'Mains'];

// ─── Toast Component ───
function Toast({ message, show }) {
    return html`
        <div class="toast ${show ? 'show' : ''}">${message}</div>
    `;
}

// ─── Navigation ───
function Nav({ walletBalance, cartCount, onOpenCart, onOpenTopup }) {
    return html`
        <nav class="nav">
            <a href="#" class="nav-brand">kawa's</a>
            <ul class="nav-links">
                <li>
                    <span class="wallet-pill">
                        $${walletBalance.toFixed(2)}
                        <button onClick=${onOpenTopup} title="Add funds">+</button>
                    </span>
                </li>
                <li>
                    <button class="cart-btn" onClick=${onOpenCart}>
                        Bag${cartCount > 0 ? ` (${cartCount})` : ''}
                        ${cartCount > 0 && html`<span class="cart-badge">${cartCount}</span>`}
                    </button>
                </li>
            </ul>
        </nav>
    `;
}

// ─── Menu Item ───
function MenuCard({ item, onAdd }) {
    return html`
        <div class="menu-item">
            <div class="menu-item-img">${item.img}</div>
            <h3 class="menu-item-name">${item.name}</h3>
            <p class="menu-item-desc">${item.desc}</p>
            <div class="menu-item-footer">
                <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                <button class="add-btn" onClick=${() => onAdd(item)}>Add</button>
            </div>
        </div>
    `;
}

// ─── Cart Drawer ───
function CartDrawer({ isOpen, onClose, cart, walletBalance, onCheckout, onRemove, onUpdateQty }) {
    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const canAfford = walletBalance >= total;

    return html`
        <div>
            <div class="overlay" onClick=${onClose}></div>
            <div class="cart-drawer">
                <div class="cart-header">
                    <h2>Your bag</h2>
                    <button class="close-btn" onClick=${onClose}>×</button>
                </div>

                <div class="cart-body">
                    ${cart.length === 0 ? html`
                        <div class="cart-empty">
                            <p>Nothing here yet.</p>
                            <p style="font-size:0.8rem">Browse the menu and add something good.</p>
                        </div>
                    ` : html`
                        ${cart.map(item => html`
                            <div class="cart-item" key=${item.id}>
                                <div class="cart-item-info">
                                    <h4>${item.name}</h4>
                                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div class="cart-item-actions">
                                    <div class="qty-controls">
                                        <button class="qty-btn" onClick=${() => onUpdateQty(item.id, -1)}>−</button>
                                        <span class="qty-num">${item.quantity}</span>
                                        <button class="qty-btn" onClick=${() => onUpdateQty(item.id, 1)}>+</button>
                                    </div>
                                    <button class="remove-btn" onClick=${() => onRemove(item.id)}>remove</button>
                                </div>
                            </div>
                        `)}
                    `}
                </div>

                ${cart.length > 0 && html`
                    <div class="cart-footer">
                        <div class="cart-summary-row">
                            <span>Wallet balance</span>
                            <span>$${walletBalance.toFixed(2)}</span>
                        </div>
                        <div class="cart-summary-row total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button 
                            class="checkout-btn" 
                            disabled=${!canAfford}
                            onClick=${onCheckout}
                        >
                            ${canAfford ? 'Place order' : 'Insufficient balance'}
                        </button>
                        ${!canAfford && html`<p class="insufficient">Top up your wallet to continue</p>`}
                    </div>
                `}
            </div>
        </div>
    `;
}

// ─── Top Up Modal ───
function TopupModal({ isOpen, onClose, onTopup }) {
    if (!isOpen) return null;
    const [amount, setAmount] = useState(20);

    return html`
        <div>
            <div class="overlay" onClick=${onClose}></div>
            <div class="modal-center">
                <div class="modal-box">
                    <h3>Add funds</h3>
                    <p class="subtitle">Choose an amount to load into your wallet.</p>
                    <div class="topup-options">
                        ${[10, 20, 50].map(val => html`
                            <button 
                                key=${val}
                                class="topup-opt ${amount === val ? 'selected' : ''}"
                                onClick=${() => setAmount(val)}
                            >
                                $${val}
                            </button>
                        `)}
                    </div>
                    <button class="topup-confirm" onClick=${() => { onTopup(amount); onClose(); }}>
                        Add $${amount} to wallet
                    </button>
                    <button class="modal-cancel" onClick=${onClose}>Cancel</button>
                </div>
            </div>
        </div>
    `;
}

// ─── App ───
function App() {
    const [wallet, setWallet] = useState(15.00);
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [topupOpen, setTopupOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('All');
    const [toast, setToast] = useState({ msg: '', show: false });

    const showToast = (msg) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast({ msg: '', show: false }), 2000);
    };

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
        showToast(`Added ${item.name}`);
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(prev => {
            return prev.map(i => {
                if (i.id === id) {
                    const newQty = i.quantity + delta;
                    return newQty <= 0 ? null : { ...i, quantity: newQty };
                }
                return i;
            }).filter(Boolean);
        });
    };

    const handleCheckout = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (wallet >= total) {
            setWallet(prev => prev - total);
            setCart([]);
            setCartOpen(false);
            showToast('Order placed — see you at the counter');
        }
    };

    const filtered = activeCategory === 'All'
        ? MENU
        : MENU.filter(item => item.category === activeCategory);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return html`
        <${Nav} 
            walletBalance=${wallet}
            cartCount=${cartCount}
            onOpenCart=${() => setCartOpen(true)}
            onOpenTopup=${() => setTopupOpen(true)}
        />

        <section class="hero">
            <h2>Good coffee, good food,${' '}nothing complicated.</h2>
            <p>Order ahead, pick up when it's ready. Pay with your Kawa wallet.</p>
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
            ${filtered.map(item => html`
                <${MenuCard} key=${item.id} item=${item} onAdd=${addToCart} />
            `)}
        </div>

        <footer class="site-footer">
            <span>© 2026 Kawa's. Bandung, Indonesia.</span>
            <a href="#">About</a>
        </footer>

        <${CartDrawer}
            isOpen=${cartOpen}
            onClose=${() => setCartOpen(false)}
            cart=${cart}
            walletBalance=${wallet}
            onCheckout=${handleCheckout}
            onRemove=${removeFromCart}
            onUpdateQty=${updateQty}
        />

        <${TopupModal}
            isOpen=${topupOpen}
            onClose=${() => setTopupOpen(false)}
            onTopup=${(amount) => { setWallet(prev => prev + amount); showToast('Wallet topped up'); }}
        />

        <${Toast} message=${toast.msg} show=${toast.show} />
    `;
}

render(html`<${App} />`, document.getElementById('app'));
