// Extract globals provided by htmPreact UMD build
const { html, render, useState, useEffect } = htmPreact;

// Mock Data
const MOCK_MENU = [
    { id: 1, name: 'Strawberry Matcha Latte', price: 5.50, category: 'Drinks', emoji: '🍵🍓' },
    { id: 2, name: 'Classic Butter Croissant', price: 3.50, category: 'Pastries', emoji: '🥐' },
    { id: 3, name: 'Sakura Mochi', price: 4.00, category: 'Desserts', emoji: '🍡' },
    { id: 4, name: 'Iced Caramel Macchiato', price: 4.75, category: 'Drinks', emoji: '☕' },
    { id: 5, name: 'Avocado Toast & Egg', price: 8.50, category: 'Mains', emoji: '🥑' },
    { id: 6, name: 'Berry Basque Cheesecake', price: 6.00, category: 'Desserts', emoji: '🍰' }
];

function Header({ walletBalance, onOpenTopup, onOpenCart, cartCount }) {
    return html`
        <header class="bg-white shadow-sm sticky top-0 z-10">
            <div class="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="text-3xl">☕</span>
                    <h1 class="text-2xl font-extrabold text-brand-dark tracking-tight">Kawa Cafe</h1>
                </div>
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-full shadow-inner border border-amber-200">
                        <span class="text-sm font-semibold text-amber-800">Wallet: $${walletBalance.toFixed(2)}</span>
                        <button onClick=${onOpenTopup} class="ml-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                            +
                        </button>
                    </div>
                    <button onClick=${onOpenCart} class="relative bg-brand hover:bg-brand-dark text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                        ${cartCount > 0 && html`<span class="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">${cartCount}</span>`}
                    </button>
                </div>
            </div>
        </header>
    `;
}

function MenuItem({ item, onAdd }) {
    return html`
        <div class="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-shadow border border-pink-50 flex flex-col items-center text-center group">
            <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">${item.emoji}</div>
            <h3 class="font-bold text-lg text-slate-800 mb-1">${item.name}</h3>
            <span class="text-sm text-slate-500 font-medium mb-4">${item.category}</span>
            <div class="mt-auto w-full flex items-center justify-between">
                <span class="font-extrabold text-xl text-brand">$${item.price.toFixed(2)}</span>
                <button onClick=${() => onAdd(item)} class="bg-brand-light text-brand hover:bg-brand hover:text-white px-4 py-2 rounded-full font-bold transition-colors">
                    Add
                </button>
            </div>
        </div>
    `;
}

function CartModal({ isOpen, onClose, cart, walletBalance, onCheckout, onRemove }) {
    if (!isOpen) return null;

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const canAfford = walletBalance >= total;

    return html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
            <div class="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in">
                <div class="p-6 border-b flex justify-between items-center bg-brand-light/30">
                    <h2 class="text-2xl font-extrabold text-brand-dark">Your Order</h2>
                    <button onClick=${onClose} class="text-slate-400 hover:text-brand-dark bg-white rounded-full p-1 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                
                <div class="flex-grow overflow-y-auto p-6">
                    ${cart.length === 0 ? html`
                        <div class="h-full flex flex-col items-center justify-center text-slate-400">
                            <span class="text-6xl mb-4">🛒</span>
                            <p class="font-medium text-lg">Your cart is empty.</p>
                        </div>
                    ` : html`
                        <ul class="space-y-4">
                            ${cart.map(item => html`
                                <li class="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div class="flex items-center gap-3">
                                        <span class="text-2xl">${item.emoji}</span>
                                        <div>
                                            <p class="font-bold text-slate-700">${item.name}</p>
                                            <p class="text-sm text-brand font-semibold">$${item.price.toFixed(2)} x ${item.quantity}</p>
                                        </div>
                                    </div>
                                    <button onClick=${() => onRemove(item.id)} class="text-red-400 hover:text-red-600 font-bold px-2 py-1 bg-red-50 rounded-lg">X</button>
                                </li>
                            `)}
                        </ul>
                    `}
                </div>

                <div class="p-6 border-t bg-slate-50">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-slate-500 font-semibold">Subtotal</span>
                        <span class="font-bold text-slate-700">$${total.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between items-center mb-6">
                        <span class="text-slate-500 font-semibold">Wallet Balance</span>
                        <span class="font-bold ${canAfford ? 'text-green-600' : 'text-red-500'}">$${walletBalance.toFixed(2)}</span>
                    </div>
                    
                    <button 
                        disabled=${cart.length === 0 || !canAfford}
                        onClick=${onCheckout}
                        class="w-full py-4 rounded-2xl font-extrabold text-lg transition-all shadow-lg text-white 
                        ${cart.length === 0 || !canAfford ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-brand hover:bg-brand-dark hover:-translate-y-1'}"
                    >
                        ${!canAfford && cart.length > 0 ? 'Insufficient Funds' : 'Pay & Order'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function TopupModal({ isOpen, onClose, onTopup }) {
    if (!isOpen) return null;
    
    const [amount, setAmount] = useState(20);

    return html`
        <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
                <div class="text-center mb-6">
                    <span class="text-5xl mb-2 block">💳</span>
                    <h2 class="text-2xl font-extrabold text-slate-800">Top Up Wallet</h2>
                    <p class="text-slate-500 text-sm mt-1">Add funds to your Kawa account</p>
                </div>
                
                <div class="grid grid-cols-3 gap-2 mb-6">
                    ${[10, 20, 50].map(val => html`
                        <button 
                            onClick=${() => setAmount(val)}
                            class="py-3 rounded-xl font-bold border-2 transition-colors ${amount === val ? 'border-accent bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-600 hover:border-amber-200'}"
                        >
                            $${val}
                        </button>
                    `)}
                </div>
                
                <button 
                    onClick=${() => { onTopup(amount); onClose(); }}
                    class="w-full bg-accent hover:bg-amber-600 text-white py-4 rounded-xl font-extrabold text-lg shadow-lg hover:-translate-y-1 transition-all"
                >
                    Add $${amount}
                </button>
                <button onClick=${onClose} class="w-full mt-3 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
            </div>
        </div>
    `;
}

function App() {
    const [walletBalance, setWalletBalance] = useState(15.00);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isTopupOpen, setIsTopupOpen] = useState(false);

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.id !== id));
    };

    const handleTopup = (amount) => {
        setWalletBalance(prev => prev + amount);
    };

    const handleCheckout = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (walletBalance >= total) {
            setWalletBalance(prev => prev - total);
            setCart([]);
            setIsCartOpen(false);
            alert("Order placed successfully! ☕🎉");
        }
    };

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return html`
        <div class="min-h-screen flex flex-col pb-20">
            <${Header} 
                walletBalance=${walletBalance} 
                cartCount=${cartCount}
                onOpenCart=${() => setIsCartOpen(true)}
                onOpenTopup=${() => setIsTopupOpen(true)}
            />
            
            <main class="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
                <div class="mb-10 text-center">
                    <h2 class="text-4xl font-extrabold text-slate-800 mb-4">Fresh & Ready for You</h2>
                    <p class="text-lg text-slate-500 font-medium max-w-xl mx-auto">Explore our handcrafted menu, order in seconds, and pay seamlessly with your Kawa Wallet.</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${MOCK_MENU.map(item => html`
                        <${MenuItem} key=${item.id} item=${item} onAdd=${addToCart} />
                    `)}
                </div>
            </main>

            <${CartModal} 
                isOpen=${isCartOpen} 
                onClose=${() => setIsCartOpen(false)}
                cart=${cart}
                walletBalance=${walletBalance}
                onCheckout=${handleCheckout}
                onRemove=${removeFromCart}
            />

            <${TopupModal}
                isOpen=${isTopupOpen}
                onClose=${() => setIsTopupOpen(false)}
                onTopup=${handleTopup}
            />
        </div>
    `;
}

render(html`<${App} />`, document.getElementById('app'));
