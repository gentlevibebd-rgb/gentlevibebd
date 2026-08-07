'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PrivacyClient() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeToc, setActiveToc] = useState("introduction");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((a, c) => a + (c.qty || 1), 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }

    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 30);
      }
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);

    // Scroll Reveal Observer
    const targets = document.querySelectorAll(".policy-section, .legal-highlight-card, .legal-cta-inner");
    if (targets.length > 0) {
      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add("visible");
              }, i * 30);
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
      );
      targets.forEach((el) => revealObserver.observe(el));
    }

    // TOC Scrollspy
    const sections = Array.from(document.querySelectorAll(".policy-section"));
    if (sections.length > 0) {
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("id");
              if (id) setActiveToc(id);
            }
          });
        },
        { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((sec) => spyObserver.observe(sec));
    }

    // Facebook Pixel Delay Loading Pattern
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          <a href="/track" onClick={() => setMenuOpen(false)}>Track Order</a>
        </nav>

        <div className="nav-actions">
          <a className="cart-btn" id="cartBtn" href="/cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
      <section className="hero" style={{ backgroundImage: "linear-gradient(160deg, #1a1a1a 0%, #0d0d0d 100%)", height: "360px" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tag">Legal · Effective June 2026</span>
          <h1 className="hero-title">Privacy <em>Policy</em></h1>
          <p className="hero-sub">আপনার তথ্য আমরা কীভাবে সংগ্রহ, ব্যবহার এবং সুরক্ষিত রাখি।</p>
        </div>
      </section>

      {/* ======== QUICK HIGHLIGHTS ======== */}
      <div className="legal-highlights">
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🙅</span>
          <strong>ডেটা বিক্রি নেই</strong>
          <span>আমরা কখনো আপনার personal information বিক্রি করি না</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🍪</span>
          <strong>Cookies</strong>
          <span>Cart, performance আর ads এর জন্য ব্যবহার হয়</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🔒</span>
          <strong>সুরক্ষিত</strong>
          <span>প্রতিটা order এ reasonable safeguard থাকে</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">✉️</span>
          <strong>আপনার Choice</strong>
          <span>যেকোনো সময় unsubscribe বা data delete request করতে পারবেন</span>
        </div>
      </div>

      <div className="updated-badge-wrap">
        <span className="updated-badge">🕓 সর্বশেষ Update: June 26, 2026</span>
      </div>

      {/* ======== TOC CHIP NAV ======== */}
      <nav className="toc-bar" id="tocBar">
        <a href="#introduction" className={`toc-btn ${activeToc === "introduction" ? "active" : ""}`}>Introduction</a>
        <a href="#collect" className={`toc-btn ${activeToc === "collect" ? "active" : ""}`}>Info We Collect</a>
        <a href="#use" className={`toc-btn ${activeToc === "use" ? "active" : ""}`}>How We Use It</a>
        <a href="#cookies" className={`toc-btn ${activeToc === "cookies" ? "active" : ""}`}>Cookies</a>
        <a href="#third-party" className={`toc-btn ${activeToc === "third-party" ? "active" : ""}`}>Third-Party</a>
        <a href="#sharing" className={`toc-btn ${activeToc === "sharing" ? "active" : ""}`}>Sharing</a>
        <a href="#security" className={`toc-btn ${activeToc === "security" ? "active" : ""}`}>Security</a>
        <a href="#rights" className={`toc-btn ${activeToc === "rights" ? "active" : ""}`}>Your Rights</a>
        <a href="#contact" className={`toc-btn ${activeToc === "contact" ? "active" : ""}`}>Contact</a>
      </nav>

      {/* ======== POLICY CONTENT ======== */}
      <main className="policy-wrap">
        <p className="policy-intro">
          এই Privacy Policy এ আমরা explain করছি, <strong>Gentle Vibe BD</strong> (www.gentlevibebd.com)
          আপনার তথ্য কীভাবে সংগ্রহ করে, ব্যবহার করে, এবং সুরক্ষিত রাখে।
        </p>

        <section className="policy-section" id="introduction">
          <div className="policy-heading">
            <span className="policy-heading-icon">👋</span>
            <div>
              <span className="policy-eyebrow">সূচনা</span>
              <h2>Introduction</h2>
            </div>
          </div>
          <p>
            আমরা আপনার privacy কে respect করি এবং আপনার personal information সুরক্ষিত রাখার ব্যাপারে
            committed।
          </p>
        </section>

        <section className="policy-section" id="collect">
          <div className="policy-heading">
            <span className="policy-heading-icon">📋</span>
            <div>
              <span className="policy-eyebrow">তথ্য সংগ্রহ</span>
              <h2>Information We Collect</h2>
            </div>
          </div>
          <p><strong>আপনি যে তথ্য সরাসরি দেন</strong> — যেমন নাম, ফোন নাম্বার, delivery address এবং order details।</p>
        </section>

        <section className="policy-section" id="use">
          <div className="policy-heading">
            <span className="policy-heading-icon">⚙️</span>
            <div>
              <span className="policy-eyebrow">তথ্যের ব্যবহার</span>
              <h2>How We Use Your Information</h2>
            </div>
          </div>
          <p>আমরা সংগ্রহ করা তথ্য অর্ডার ডেলিভারি, আপডেট দেওয়া এবং কাস্টমার সাপোর্টের কাজে ব্যবহার করি।</p>
        </section>

        <section className="policy-section" id="cookies">
          <div className="policy-heading">
            <span className="policy-heading-icon">🍪</span>
            <div>
              <span className="policy-eyebrow">কুকিজ ও ট্র্যাকিং</span>
              <h2>Cookies &amp; Tracking</h2>
            </div>
          </div>
          <p>আমরা shopping cart মনে রাখতে local browser storage ব্যবহার করি।</p>
        </section>

        <section className="policy-section" id="third-party">
          <div className="policy-heading">
            <span className="policy-heading-icon">🔗</span>
            <div>
              <span className="policy-eyebrow">তৃতীয় পক্ষ সেবা</span>
              <h2>Third-Party Services</h2>
            </div>
          </div>
          <p>Firebase, Meta Pixel এবং Courier Services-এর সাথে প্রয়োজনীয় তথ্য শেয়ার করা হয়।</p>
        </section>

        <section className="policy-section" id="sharing">
          <div className="policy-heading">
            <span className="policy-heading-icon">📤</span>
            <div>
              <span className="policy-eyebrow">তথ্য শেয়ারিং</span>
              <h2>Data Sharing</h2>
            </div>
          </div>
          <p>আমরা কখনো আপনার personal information কারো কাছে বিক্রি করি না।</p>
        </section>

        <section className="policy-section" id="security">
          <div className="policy-heading">
            <span className="policy-heading-icon">🔒</span>
            <div>
              <span className="policy-eyebrow">তথ্য সুরক্ষা</span>
              <h2>Data Security</h2>
            </div>
          </div>
          <p>আমরা উপযুক্ত কারিগরি নিরাপত্তার মাধ্যমে তথ্য সুরক্ষিত রাখি।</p>
        </section>

        <section className="policy-section" id="rights">
          <div className="policy-heading">
            <span className="policy-heading-icon">🙋</span>
            <div>
              <span className="policy-eyebrow">আপনার অধিকার</span>
              <h2>Your Rights</h2>
            </div>
          </div>
          <p>আপনি যেকোনো সময় আপনার তথ্য দেখা, সংশোধন বা মুছে ফেলার অনুরোধ করতে পারেন।</p>
        </section>

        <section className="policy-section" id="contact">
          <div className="policy-heading">
            <span className="policy-heading-icon">💬</span>
            <div>
              <span className="policy-eyebrow">যোগাযোগ করুন</span>
              <h2>Contact Us</h2>
            </div>
          </div>
          <ul>
            <li>✉ Email: gentlevibebd@gmail.com</li>
            <li>📱 WhatsApp: +8801762923318</li>
            <li>📍 ঠিকানা: Islambag, R.K Road, Rangpur Sadar, Rangpur-5400</li>
          </ul>
        </section>
      </main>

      <div className="legal-crosslink">
        আমাদের store policy নিয়ে জানতে চান? পড়ুন আমাদের <a href="/terms">Terms &amp; Conditions</a>।
      </div>

      {/* ======== CONTACT CTA ======== */}
      <div className="legal-cta">
        <div className="legal-cta-inner">
          <h3>আরও কোনো <em>Question</em> আছে?</h3>
          <p>আমাদের team সাধারণত কয়েক ঘণ্টার মধ্যেই reply করে।</p>
          <div className="legal-cta-btns">
            <a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer" className="legal-cta-btn-primary">💬 WhatsApp এ Chat করুন</a>
            <a href="mailto:gentlevibebd@gmail.com" className="legal-cta-btn-ghost">✉ Email করুন</a>
          </div>
        </div>
      </div>

      {/* ======== FOOTER ======== */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">Gentle Vibe <em>BD</em></div>
              <p className="foot-desc">Your destination for premium T-shirts, stylish watches, and exclusive combo deals.</p>
            </div>
            <div className="foot-col">
              <h4>SHOP</h4>
              <ul>
                <li><a href="/products">All Products</a></li>
                <li><Link href="/products?cat=tshirt">T-Shirts</Link></li>
              </ul>
            </div>
            <div className="foot-col">
              <h4>CUSTOMER CARE</h4>
              <ul>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/track">Track Order</a></li>
                <li><a href="/terms">Terms &amp; Conditions</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Gentle Vibe BD. All rights reserved.</span>
            <span>Made with ♥ in Bangladesh</span>
          </div>
        </div>
      </footer>

      {showBackToTop && (
        <button className="back-to-top show" onClick={scrollToTop} aria-label="Back to top">↑</button>
      )}
    </>
  );
}
