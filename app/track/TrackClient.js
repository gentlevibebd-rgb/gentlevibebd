'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];
const STATUS_LABELS = {
  pending:    { label: "Pending",    bn: "অপেক্ষায়",     icon: "⏳" },
  confirmed:  { label: "Confirmed",  bn: "নিশ্চিত",      icon: "✅" },
  processing: { label: "Processing", bn: "প্রস্তুত হচ্ছে", icon: "📦" },
  shipped:    { label: "Shipped",    bn: "পথে আছে",      icon: "🚚" },
  delivered:  { label: "Delivered",  bn: "পৌঁছে গেছে",   icon: "🎉" },
  cancelled:  { label: "Cancelled",  bn: "বাতিল",        icon: "❌" }
};

export default function TrackClient() {
  const [activeTab, setActiveTab] = useState("orderId");
  const [orderIdInput, setOrderIdInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orders, setOrders] = useState([]);

  // Fetch Cart Count & URL Auto ID
  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }

    // Navbar Scroll Effect
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 30);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Auto search by URL param ?id=...
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const autoId = urlParams.get("id");
      if (autoId) {
        setOrderIdInput(autoId.toUpperCase());
        trackByOrderId(autoId.toUpperCase());
      }
    }

    // Facebook Pixel Pattern
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

    if (document.readyState === "complete") loadPixel();
    else {
      window.addEventListener("load", loadPixel);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Track by Order ID
  const trackByOrderId = async (idToSearch) => {
    const searchId = (idToSearch || orderIdInput).trim().toUpperCase();
    setErrorMsg("");
    setOrders([]);

    if (!searchId) {
      setErrorMsg("❌ Order ID দিন!");
      return;
    }

    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "orders", searchId));
      if (!snap.exists()) {
        setErrorMsg("❌ এই Order ID তে কোনো অর্ডার পাওয়া যায়নি।");
      } else {
        setOrders([{ id: snap.id, ...snap.data() }]);
      }
    } catch (err) {
      console.error("Tracking Error:", err);
      setErrorMsg("❌ কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  // Track by Phone
  const trackByPhone = async () => {
    const searchPhone = phoneInput.trim();
    setErrorMsg("");
    setOrders([]);

    if (!/^01[3-9][0-9]{8}$/.test(searchPhone)) {
      setErrorMsg("❌ সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)");
      return;
    }

    setLoading(true);
    try {
      const q = query(collection(db, "orders"), where("phone", "==", searchPhone));
      const snap = await getDocs(q);

      if (snap.empty) {
        setErrorMsg("❌ এই নাম্বারে কোনো অর্ডার পাওয়া যায়নি।");
      } else {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
        setOrders(list);
      }
    } catch (err) {
      console.error("Tracking Error:", err);
      setErrorMsg("❌ কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = (status) => {
    if (status === "cancelled") return null;
    const currentIdx = STATUS_STEPS.indexOf(status);
    const pct = currentIdx <= 0 ? 0 : (currentIdx / (STATUS_STEPS.length - 1)) * 100;

    return (
      <div className="progress-wrap">
        <div className="progress-title">ডেলিভারি অগ্রগতি</div>
        <div className="progress-steps">
          <div className="progress-line" style={{ width: `calc(${pct}% - 28px)` }}></div>
          {STATUS_STEPS.map((s, i) => {
            let cls = "";
            if (i < currentIdx) cls = "done";
            else if (i === currentIdx) cls = "active";
            const info = STATUS_LABELS[s];
            return (
              <div key={s} className={`step ${cls}`}>
                <div className="step-dot">{cls === "done" ? "✓" : info.icon}</div>
                <div className="step-label">{info.bn}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ======== NAVBAR ======== */}
      <header className="navbar" id="navbar">
        <a href="/" className="logo">
          <Image
            src="https://www.gentlevibebd.com/545sd4fdsf54.webp"
            className="logo-img"
            alt="Gentle Vibe BD Logo"
            width={36}
            height={36}
            unoptimized
          />
          <span className="logo-name">Gentle Vibe <em>BD</em></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} id="navLinks">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/products" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="/checkout" onClick={() => setMenuOpen(false)}>Checkout</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact Us</a>
          <a href="/track" className="active" onClick={() => setMenuOpen(false)}>Track Order</a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="/cart" className="cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="cart-count" id="cartCount">{cartCount}</span>
          </a>
          <button
            className={`menu-toggle ${menuOpen ? "open" : ""}`}
            id="menuBtn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* ======== HERO ======== */}
      <div className="page-hero">
        <p className="page-eyebrow">GENTLE VIBE BD</p>
        <h1 className="page-title">Track Your <em>Order</em></h1>
      </div>

      {/* ======== MAIN ======== */}
      <div className="wrapper">
        <div className="search-card">
          <div className="tab-switch">
            <button
              className={activeTab === "orderId" ? "active" : ""}
              onClick={() => {
                setActiveTab("orderId");
                setErrorMsg("");
                setOrders([]);
              }}
            >
              📦 Order ID দিয়ে
            </button>
            <button
              className={activeTab === "phone" ? "active" : ""}
              onClick={() => {
                setActiveTab("phone");
                setErrorMsg("");
                setOrders([]);
              }}
            >
              📱 Phone দিয়ে
            </button>
          </div>

          {activeTab === "orderId" && (
            <div id="orderIdSection">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="যেমন: GVB-260619-AB12"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && trackByOrderId()}
                />
                <button className="track-btn" onClick={() => trackByOrderId()}>
                  Track করুন
                </button>
              </div>
            </div>
          )}

          {activeTab === "phone" && (
            <div id="phoneSection">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  maxLength={11}
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && trackByPhone()}
                />
                <button className="track-btn" onClick={() => trackByPhone()}>
                  Track করুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS AREA */}
        <div className="result-area" id="resultArea">
          {loading && (
            <p style={{ textAlign: "center", color: "#888", padding: "20px", fontSize: "13px" }}>
              খোঁজা হচ্ছে...
            </p>
          )}

          {errorMsg && <div className="error-msg">{errorMsg}</div>}

          {!loading && orders.length > 0 && (
            <>
              {orders.length > 1 && (
                <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px", textAlign: "center" }}>
                  {orders.length}টি অর্ডার পাওয়া গেছে
                </p>
              )}
              {orders.map((o) => {
                const statusInfo = STATUS_LABELS[o.status] || STATUS_LABELS["pending"];
                const dateStr = o.date?.seconds
                  ? new Date(o.date.seconds * 1000).toLocaleDateString("bn-BD", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })
                  : "";

                return (
                  <div key={o.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">{o.orderId || o.id || "—"}</div>
                      <span className={`status-badge status-${o.status}`}>
                        {statusInfo.icon} {statusInfo.bn}
                      </span>
                    </div>

                    <div className="order-card-body">
                      <div className="info-row">
                        <span className="info-label">নাম</span>
                        <span className="info-value">{o.name || "—"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">ফোন</span>
                        <span className="info-value">{o.phone || "—"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">ঠিকানা</span>
                        <span className="info-value">{o.address || "—"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">ডেলিভারি</span>
                        <span className="info-value">{o.shipping || "—"}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">পেমেন্ট</span>
                        <span className="info-value">{o.payment || "—"}</span>
                      </div>
                      {dateStr && (
                        <div className="info-row">
                          <span className="info-label">তারিখ</span>
                          <span className="info-value">{dateStr}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="info-label">মোট</span>
                        <span className="info-value gold">৳{o.total || "—"}</span>
                      </div>
                    </div>

                    {renderProgressBar(o.status)}

                    {o.items && o.items.length > 0 && (
                      <div className="items-wrap">
                        <div className="items-title">অর্ডার আইটেম</div>
                        {o.items.map((item, idx) => (
                          <div key={idx} className="order-item">
                            <Image
                              src={item.image || "https://www.gentlevibebd.com/545sd4fdsf54.webp"}
                              alt={item.name || "Item"}
                              width={48}
                              height={48}
                              unoptimized
                            />
                            <div className="order-item-info">
                              <h5>{item.name}</h5>
                              <span>Size: {item.size || "N/A"} · Qty: {item.qty}</span>
                            </div>
                            <div className="order-item-price">৳{item.price}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="site-footer">
        <p>© 2026 Gentle Vibe BD — All rights reserved</p>
      </footer>

      {/* ======== MOBILE BOTTOM NAV ======== */}
      <nav className="mobile-bottom-nav">
        <a href="/" className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z"/>
          </svg>
          <span>Home</span>
        </a>
        <a href="/products" className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span>All Product</span>
        </a>
        <a href="/cart" className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          <span className="bottom-cart-count" id="bottomCartCount">{cartCount}</span>
          <span>Cart</span>
        </a>
        <a href="/track" className="bottom-nav-item active">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <span>Order Track</span>
        </a>
      </nav>
    </>
  );
}
