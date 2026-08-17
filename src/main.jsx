import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes, useNavigate, useParams } from "react-router-dom";
import "./styles.css";

const products = [
  { id: 1, name: "Aero Runner", category: "Footwear", price: 3299, oldPrice: 3999, rating: 4.8, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900", tag: "Best Seller", desc: "Lightweight everyday sneakers designed for comfort, movement and clean street style." },
  { id: 2, name: "Minimal Backpack", category: "Accessories", price: 1899, oldPrice: 2399, rating: 4.7, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900", tag: "New", desc: "A compact everyday backpack with a clean silhouette and practical storage." },
  { id: 3, name: "Essential Hoodie", category: "Clothing", price: 2499, oldPrice: 2999, rating: 4.6, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900", tag: "Popular", desc: "Soft heavyweight hoodie with a relaxed fit for everyday layering." },
  { id: 4, name: "Classic Watch", category: "Accessories", price: 4599, oldPrice: 5499, rating: 4.9, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=900", tag: "Premium", desc: "A timeless everyday watch with a minimal dial and refined finish." },
  { id: 5, name: "Urban Jacket", category: "Clothing", price: 3999, oldPrice: 4999, rating: 4.7, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=900", tag: "Sale", desc: "Versatile lightweight jacket made for changing city weather." },
  { id: 6, name: "Studio Headphones", category: "Tech", price: 5999, oldPrice: 6999, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900", tag: "Featured", desc: "Immersive wireless headphones with a comfortable over-ear fit." },
  { id: 7, name: "Everyday Tote", category: "Accessories", price: 1299, oldPrice: 1699, rating: 4.5, image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900", tag: "New", desc: "A durable tote for work, campus and everyday essentials." },
  { id: 8, name: "Cloud Tee", category: "Clothing", price: 999, oldPrice: 1299, rating: 4.6, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900", tag: "Everyday", desc: "Premium cotton t-shirt with a relaxed modern fit." }
];

const money = (n) => `₹${n.toLocaleString("en-IN")}`;

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("shopsphere-cart") || "[]"));

  useEffect(() => localStorage.setItem("shopsphere-cart", JSON.stringify(cart)), [cart]);

  const addToCart = (product) => {
    setCart((items) => {
      const found = items.find((x) => x.id === product.id);
      return found
        ? items.map((x) => x.id === product.id ? { ...x, qty: x.qty + 1 } : x)
        : [...items, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    setCart((items) => qty < 1 ? items.filter((x) => x.id !== id) : items.map((x) => x.id === id ? { ...x, qty } : x));
  };

  return (
    <BrowserRouter>
      <Header count={cart.reduce((s, x) => s + x.qty, 0)} />
      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} />} />
        <Route path="/products" element={<Products addToCart={addToCart} />} />
        <Route path="/product/:id" element={<Product addToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cart={cart} updateQty={updateQty} />} />
        <Route path="/checkout" element={<Checkout cart={cart} setCart={setCart} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

function Header({ count }) {
  return (
    <header className="header">
      <div className="nav container">
        <Link to="/" className="logo">Shop<span>Sphere</span></Link>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/products">Shop</Link>
        </nav>
        <Link to="/cart" className="cart-btn">Cart <b>{count}</b></Link>
      </div>
    </header>
  );
}

function Home({ addToCart }) {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">CURATED FOR EVERYDAY</p>
            <h1>Style that fits your <em>everyday.</em></h1>
            <p className="hero-copy">Discover thoughtfully selected essentials for your wardrobe, workspace and everyday adventures.</p>
            <Link className="primary" to="/products">Explore Collection →</Link>
          </div>
          <div className="hero-card">
            <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200" alt="Modern retail store" />
            <div className="hero-badge">New season<br/><strong>2026</strong></div>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><p className="eyebrow">TRENDING NOW</p><h2>Featured picks</h2></div>
          <Link to="/products" className="text-link">View all →</Link>
        </div>
        <div className="product-grid">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} />)}</div>
      </section>

      <section className="benefits">
        <div className="container benefit-grid">
          <div><strong>01</strong><h3>Quality first</h3><p>Curated products with details that last.</p></div>
          <div><strong>02</strong><h3>Fast delivery</h3><p>Simple, reliable delivery across India.</p></div>
          <div><strong>03</strong><h3>Easy returns</h3><p>A straightforward shopping experience.</p></div>
        </div>
      </section>
    </main>
  );
}

function Products({ addToCart }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (category === "All" || p.category === category) &&
      p.name.toLowerCase().includes(query.toLowerCase())
    );
    if (sort === "low") list.sort((a,b) => a.price - b.price);
    if (sort === "high") list.sort((a,b) => b.price - a.price);
    if (sort === "rating") list.sort((a,b) => b.rating - a.rating);
    return list;
  }, [query, category, sort]);

  return (
    <main className="container shop-page">
      <div className="page-title"><p className="eyebrow">THE COLLECTION</p><h1>Shop all products</h1><p>Find your next everyday essential.</p></div>
      <div className="toolbar">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..." />
        <div className="chips">{categories.map(c => <button className={category === c ? "chip active" : "chip"} onClick={() => setCategory(c)} key={c}>{c}</button>)}</div>
        <select value={sort} onChange={e => setSort(e.target.value)}>
          <option value="featured">Sort: Featured</option><option value="low">Price: Low to high</option><option value="high">Price: High to low</option><option value="rating">Top rated</option>
        </select>
      </div>
      <p className="result-count">{filtered.length} products</p>
      <div className="product-grid">{filtered.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} />)}</div>
    </main>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="image-wrap"><img src={product.image} alt={product.name}/><span>{product.tag}</span></Link>
      <div className="product-info">
        <div className="category">{product.category}</div>
        <Link to={`/product/${product.id}`}><h3>{product.name}</h3></Link>
        <div className="rating">★ {product.rating}</div>
        <div className="price-row"><strong>{money(product.price)}</strong><del>{money(product.oldPrice)}</del></div>
        <button className="add-btn" onClick={() => addToCart(product)}>Add to cart</button>
      </div>
    </article>
  );
}

function Product({ addToCart }) {
  const { id } = useParams();
  const product = products.find(p => p.id === Number(id));
  const [added, setAdded] = useState(false);
  if (!product) return <NotFound />;

  const add = () => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1400); };

  return (
    <main className="container detail">
      <Link to="/products" className="back">← Back to shop</Link>
      <div className="detail-grid">
        <div className="detail-image"><img src={product.image} alt={product.name}/></div>
        <div className="detail-copy">
          <p className="eyebrow">{product.category}</p><h1>{product.name}</h1>
          <div className="rating">★ {product.rating} / 5</div>
          <div className="detail-price">{money(product.price)} <del>{money(product.oldPrice)}</del></div>
          <p>{product.desc}</p>
          <div className="size-row"><span>Choose size</span><button>S</button><button>M</button><button>L</button><button>XL</button></div>
          <button className="primary wide" onClick={add}>{added ? "✓ Added to cart" : "Add to cart"}</button>
          <div className="shipping-note">Free delivery on orders above ₹1,999 · 7-day easy returns</div>
        </div>
      </div>
    </main>
  );
}

function Cart({ cart, updateQty }) {
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
  return (
    <main className="container cart-page">
      <div className="page-title"><p className="eyebrow">YOUR BAG</p><h1>Shopping cart</h1></div>
      {cart.length === 0 ? <div className="empty"><h2>Your cart is empty.</h2><p>Discover something you’ll love.</p><Link className="primary" to="/products">Start shopping</Link></div> :
      <div className="cart-layout">
        <div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image} alt={item.name}/><div className="cart-item-info"><Link to={`/product/${item.id}`}><h3>{item.name}</h3></Link><p>{item.category}</p><strong>{money(item.price)}</strong><div className="qty"><button onClick={() => updateQty(item.id, item.qty - 1)}>−</button><span>{item.qty}</span><button onClick={() => updateQty(item.id, item.qty + 1)}>+</button></div></div><button className="remove" onClick={() => updateQty(item.id, 0)}>Remove</button></div>)}</div>
        <aside className="summary"><h2>Order summary</h2><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Shipping</span><b>{shipping ? money(shipping) : "Free"}</b></div><hr/><div className="total"><span>Total</span><b>{money(subtotal + shipping)}</b></div><Link className="primary wide" to="/checkout">Checkout →</Link></aside>
      </div>}
    </main>
  );
}

function Checkout({ cart, setCart }) {
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const submit = (e) => { e.preventDefault(); setDone(true); setCart([]); };
  if (done) return <main className="container success"><div className="success-icon">✓</div><h1>Order confirmed</h1><p>Thanks for shopping with ShopSphere. Your demo order has been placed successfully.</p><button className="primary" onClick={() => navigate("/")}>Continue shopping</button></main>;
  return (
    <main className="container checkout">
      <div className="page-title"><p className="eyebrow">CHECKOUT</p><h1>Complete your order</h1></div>
      <div className="checkout-grid">
        <form onSubmit={submit} className="form-card">
          <h2>Delivery details</h2><div className="two"><input required placeholder="First name"/><input required placeholder="Last name"/></div>
          <input required placeholder="Email address" type="email"/><input required placeholder="Phone number"/><input required placeholder="Address"/>
          <div className="two"><input required placeholder="City"/><input required placeholder="PIN code"/></div>
          <h2>Payment</h2><div className="payment"><label><input type="radio" defaultChecked name="pay"/> Cash on delivery</label><label><input type="radio" name="pay"/> Card / UPI (demo)</label></div>
          <button className="primary wide" type="submit">Place demo order</button>
        </form>
        <aside className="summary"><h2>Your order</h2>{cart.map(x => <div key={x.id}><span>{x.name} × {x.qty}</span><b>{money(x.price * x.qty)}</b></div>)}<hr/><div className="total"><span>Total</span><b>{money(subtotal)}</b></div></aside>
      </div>
    </main>
  );
}

function NotFound() { return <main className="container empty"><h1>Page not found</h1><Link className="primary" to="/">Go home</Link></main>; }

function Footer() {
  return <footer><div className="container footer-grid"><div><Link to="/" className="logo">Shop<span>Sphere</span></Link><p>Modern essentials, thoughtfully curated.</p></div><div><h4>Explore</h4><Link to="/products">Shop</Link><Link to="/cart">Cart</Link></div><div><h4>Project</h4><p>React · Vite · Responsive UI</p><p>Frontend portfolio project</p></div></div><div className="container copyright">© 2026 ShopSphere. Built with React.</div></footer>;
}

createRoot(document.getElementById("root")).render(<App />);
