"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FREE_DELIVERY_MIN = 2000;

export default function CartClient() {
  const pathname = usePathname();

  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(null); // Unselected by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const data = localStorage.getItem("cart");
      const parsed = data ? JSON.parse(data) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setCart([]);
    }

    // Read saved shipping or default to null
    const savedShipping = localStorage.getItem("shipping");
    if (savedShipping && (savedShipping === "60" || savedShipping === "120")) {
      setShipping(savedShipping);
    } else {
      setShipping(null);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function loadPixel() {
      setTimeout(() => {
        (function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
          t = b.createElement(e); t.async = !0;
          t.src = v; s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", "4238792793034225");
        window.fbq("track", "PageView");
      }, 3000);
    }
    if (document.readyState === "complete") {
      loadPixel();
    } else {
      window.addEventListener("load", loadPixel);
      return () => window.removeEventListener("load", loadPixel);
    }
  }, []);

  function saveCart(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function updateQty(id, qtyValue) {
    let qty = parseInt(qtyValue, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    const next = cart.map((item) => (item.id == id ? { ...item, qty } : item));
    saveCart(next);
  }

  function removeItem(id) {
    const next = cart.filter((item) => item.id != id);
    saveCart(next);
  }

  function handleShippingChange(value) {
    setShipping(value);
    localStorage.setItem("shipping", value);
  }

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const isFree = subtotal >= FREE_DELIVERY_MIN;
  const baseShipping = shipping ? parseInt(shipping, 10) : 0;
  const shippingCost = isFree ? 0 : baseShipping;
  const total = subtotal + shippingCost;
  const itemCountTotal = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartCount = itemCountTotal;

  function goToShop() {
    window.location.href = "/products";
  }

  function goToCheckout() {
    if (cart.length === 0) {
      alert("আপনার cart খালি! পণ্য যোগ করুন।");
      return;
    }
    if (!isFree && !shipping) {
      alert("⚠️ অনুগ্রহ করে ডেলিভারি এরিয়া সিলেক্ট করুন (রংপুরের ভেতরে বা বাইরে)!");
      return;
    }
    window.location.href = "/checkout";
  }

  const isActive = (href) => (pathname === href ? "active" : "");

  return (
    <>
      {/* NAVBAR */}
      <header className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <Link href="/" className="logo">
          <Image
            src="/545sd4fdsf54.webp"
            className="logo-img"
            alt="Gentle Vibe BD Logo"
            width={36}
            height={36}
            unoptimized
          />
          <span className="logo-name">
            Gentle Vibe <em>BD</em>
          </span>
        </Link>
        <nav className={`nav-links${mobileMenuOpen ? " open" : ""}`} id="navLinks">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className={isActive("/")}>
            Home
          </Link>
          <Link href="/products" onClick={() => setMobileMenuOpen(false)} className={isActive("/products")}>
            Shop
          </Link>
          <a href="/checkout" onClick={() => setMobileMenuOpen(false)} className={isActive("/checkout")}>
            Checkout
          </a>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className={isActive("/about")}>
            About
          </Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className={isActive("/contact")}>
            Contact Us
          </Link>
          <Link href="/track" onClick={() => setMobileMenuOpen(false)} className={isActive("/track")}>
            Track Order
          </Link>
        </nav>
        <div className="nav-actions">
          <a className="cart-btn" href="/cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" stroke="currentColor">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="cart-count" id="cartCount">{cartCount}</span>
          </a>
          <button
            className={`menu-toggle${mobileMenuOpen ? " open" : ""}`}
            id="menuBtn"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <span className="hero-tag">Review &amp; Order</span>
          <h1 className="hero-title">
            Your <em>Cart</em>
          </h1>
          <p className="hero-sub">Check your selected items and proceed to checkout</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="main-wrapper">
        {/* LEFT: Cart Items */}
        <div className="cart-section">
          <div className="section-label-row">
            <span className="section-label">Selected Items</span>
            <span className="item-count" id="itemCount">
              {itemCountTotal} {itemCountTotal === 1 ? "item" : "items"}
            </span>
          </div>
          <div id="cart">
            {loaded && cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                </div>
                <h2>Your Cart is Empty</h2>
                <p>Add some products and come back here</p>
                <button onClick={goToShop} className="shop-btn">
                  Continue Shopping
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={`${item.id}-${item.size || ""}`}>
                  <Image src={item.image || "/favicon.png"} alt={item.name} width={100} height={100} unoptimized />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">৳{item.price}</p>
                    {item.size && <p className="qty-label">Size: {item.size}</p>}
                    <div className="cart-item-qty">
                      <span className="qty-label">Qty:</span>
                      <input
                        className="qty-input"
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => updateQty(item.id, e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="cart-item-actions">
                    <button onClick={() => removeItem(item.id)} className="remove-btn" title="Remove">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Order Summary */}
        <aside className="summary-section">
          <div className="summary-card">
            <div className="summary-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <h3>Order Summary</h3>
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span id="subtotal">৳{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Charge</span>
                <span id="shipping">
                  {isFree ? (
                    <span className="free-badge">FREE</span>
                  ) : shipping ? (
                    `৳${shipping}`
                  ) : (
                    <span style={{ color: "#c9a84c", fontSize: "12px" }}>সিলেক্ট করুন</span>
                  )}
                </span>
              </div>
            </div>

            {/* Free Delivery Progress Bar */}
            <div id="freeDeliveryBar" className="free-delivery-bar">
              {isFree ? (
                <div className="free-delivery-achieved">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  আপনি Free Delivery পাচ্ছেন!
                </div>
              ) : (
                <>
                  <div className="free-delivery-text">
                    Free Delivery-র জন্য আরও <strong>৳{FREE_DELIVERY_MIN - subtotal}</strong> কিনুন
                  </div>
                  <div className="free-delivery-track">
                    <div
                      className="free-delivery-fill"
                      style={{ width: `${Math.min((subtotal / FREE_DELIVERY_MIN) * 100, 100).toFixed(1)}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>

            <div className="divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span id="total">৳{total}</span>
            </div>

            {/* Shipping Options (UNSELECTED BY DEFAULT) */}
            <div className="shipping-options" id="shippingOptionsBlock" style={{ display: isFree ? "none" : "block" }}>
              <p className="shipping-title">Select Delivery Location *</p>
              <label className="ship-label">
                <input
                  type="radio"
                  name="shipping"
                  value="60"
                  checked={shipping === "60"}
                  onChange={(e) => handleShippingChange(e.target.value)}
                />
                <span className="ship-custom-radio"></span>
                <span className="ship-text">
                  <span className="ship-name">রংপুর জেলার ভেতরে</span>
                  <span className="ship-price">৳60</span>
                </span>
              </label>
              <label className="ship-label">
                <input
                  type="radio"
                  name="shipping"
                  value="120"
                  checked={shipping === "120"}
                  onChange={(e) => handleShippingChange(e.target.value)}
                />
                <span className="ship-custom-radio"></span>
                <span className="ship-text">
                  <span className="ship-name">রংপুর জেলার বাইরে</span>
                  <span className="ship-price">৳120</span>
                </span>
              </label>
            </div>

            {/* Free Shipping Note */}
            <div className="free-ship-note" id="freeShipNote" style={{ display: isFree ? "flex" : "none" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12l5 5L20 7" />
              </svg>
              ৳2000+ অর্ডারে সারা বাংলাদেশে Free Delivery!
            </div>

            <button onClick={goToCheckout} className="checkout-btn">
              <span>Proceed to Checkout</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <p className="secure-note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Secure &amp; safe checkout
            </p>
          </div>
        </aside>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <Link href="/" className={`bottom-nav-item${isActive("/") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" />
          </svg>
          <span>Home</span>
        </Link>
        <Link href="/products" className={`bottom-nav-item${isActive("/products") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>All Product</span>
        </Link>
        <a href="/cart" className={`bottom-nav-item${isActive("/cart") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span className="bottom-cart-count" id="bottomCartCount">{cartCount}</span>
          <span>Cart</span>
        </a>
        <Link href="/track" className={`bottom-nav-item${isActive("/track") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span>Order Track</span>
        </Link>
      </nav>
    </>
  );
}
