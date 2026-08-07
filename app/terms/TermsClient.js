'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function TermsClient() {
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

    // Facebook Pixel Delay Pattern
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
          <span className="hero-tag">Legal · কার্যকর জুন ২০২৬ থেকে</span>
          <h1 className="hero-title">Terms &amp; <em>Conditions</em></h1>
          <p className="hero-sub">অর্ডার করার আগে অনুগ্রহ করে এই শর্তাবলী মনোযোগ দিয়ে পড়ুন।</p>
        </div>
      </section>

      {/* ======== QUICK HIGHLIGHTS ======== */}
      <div className="legal-highlights">
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🚚</span>
          <strong>Delivery / ডেলিভারি</strong>
          <span>সারা বাংলাদেশে শিপিং, ৳২০০০-এর উপরে ফ্রি</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🔄</span>
          <strong>Returns / রিটার্ন</strong>
          <span>ডেলিভারির ৩ দিনের মধ্যে ঝামেলামুক্ত রিটার্ন</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">💳</span>
          <strong>Payment / পেমেন্ট</strong>
          <span>Cash on Delivery, শীঘ্রই আসছে আরও অপশন</span>
        </div>
        <div className="legal-highlight-card">
          <span className="legal-highlight-icon">🛡️</span>
          <strong>Fair Use / ন্যায্য ব্যবহার</strong>
          <span>শিপমেন্টের আগে অর্ডার verify করা হতে পারে</span>
        </div>
      </div>

      <div className="updated-badge-wrap">
        <span className="updated-badge">🕓 সর্বশেষ আপডেট: ২৬ জুন, ২০২৬</span>
      </div>

      {/* ======== TOC CHIP NAV ======== */}
      <nav className="toc-bar" id="tocBar">
        <a href="#introduction" className={`toc-btn ${activeToc === "introduction" ? "active" : ""}`}>ভূমিকা</a>
        <a href="#using-website" className={`toc-btn ${activeToc === "using-website" ? "active" : ""}`}>Website ব্যবহার</a>
        <a href="#products-pricing" className={`toc-btn ${activeToc === "products-pricing" ? "active" : ""}`}>Products &amp; Price</a>
        <a href="#orders-payment" className={`toc-btn ${activeToc === "orders-payment" ? "active" : ""}`}>Order &amp; Payment</a>
        <a href="#delivery" className={`toc-btn ${activeToc === "delivery" ? "active" : ""}`}>Delivery</a>
        <a href="#returns" className={`toc-btn ${activeToc === "returns" ? "active" : ""}`}>Returns &amp; Refund</a>
        <a href="#cancellation" className={`toc-btn ${activeToc === "cancellation" ? "active" : ""}`}>Cancellation</a>
        <a href="#ip" className={`toc-btn ${activeToc === "ip" ? "active" : ""}`}>মেধাস্বত্ব</a>
        <a href="#liability" className={`toc-btn ${activeToc === "liability" ? "active" : ""}`}>দায়বদ্ধতা</a>
        <a href="#law" className={`toc-btn ${activeToc === "law" ? "active" : ""}`}>আইন</a>
        <a href="#changes" className={`toc-btn ${activeToc === "changes" ? "active" : ""}`}>পরিবর্তন</a>
        <a href="#contact" className={`toc-btn ${activeToc === "contact" ? "active" : ""}`}>যোগাযোগ</a>
      </nav>

      {/* ======== POLICY CONTENT ======== */}
      <main className="policy-wrap">
        <p className="policy-intro">
          <strong>Gentle Vibe BD</strong> (www.gentlevibebd.com)-তে আপনাকে স্বাগতম। এই Terms &amp; Conditions
          আমাদের website ব্যবহার এবং আপনার প্রতিটি purchase-কে govern করে। আমাদের site browse করলে,
          order দিলে বা app download করলে আপনি নিচের শর্তগুলোতে সম্মত হচ্ছেন বলে ধরা হবে।
        </p>

        <section className="policy-section" id="introduction">
          <div className="policy-heading">
            <span className="policy-heading-icon">👋</span>
            <div>
              <span className="policy-eyebrow">সূচনা</span>
              <h2>Introduction / ভূমিকা</h2>
            </div>
          </div>
          <p>
            Gentle Vibe BD হলো রংপুর, বাংলাদেশ-ভিত্তিক একটি men's fashion brand। আমরা এই website
            এবং আমাদের official app-এর মাধ্যমে premium T-shirt, shirt, pants, watch, wallet, sunglasses ও
            combo deal বিক্রি করি।
          </p>
          <p>
            এই শর্তগুলো সকল visitor, customer এবং app user-এর ক্ষেত্রে প্রযোজ্য। এর পাশাপাশি
            আমাদের <a href="/privacy" style={{ color: "var(--gold)" }}>Privacy Policy</a> প্রযোজ্য।
          </p>
        </section>

        <section className="policy-section" id="using-website">
          <div className="policy-heading">
            <span className="policy-heading-icon">🖥️</span>
            <div>
              <span className="policy-eyebrow">ওয়েবসাইট ব্যবহার</span>
              <h2>Using Our Website / ওয়েবসাইট ব্যবহারের নিয়ম</h2>
            </div>
          </div>
          <p>www.gentlevibebd.com ব্যবহার করে আপনি নিচের বিষয়গুলোতে সম্মত হচ্ছেন:</p>
          <ul>
            <li>Order দেওয়ার সময় সঠিক তথ্য দেবেন — নাম, ফোন নম্বর এবং delivery address।</li>
            <li>Website শুধুমাত্র বৈধ কাজে ব্যবহার করবেন; hack বা misuse করার চেষ্টা করবেন না।</li>
            <li>লিখিত অনুমতি ছাড়া আমাদের product listing, price, ছবি বা content copy করবেন না।</li>
          </ul>
        </section>

        <section className="policy-section" id="products-pricing">
          <div className="policy-heading">
            <span className="policy-heading-icon">🏷️</span>
            <div>
              <span className="policy-eyebrow">প্রোডাক্ট ও মূল্য</span>
              <h2>Products &amp; Pricing / পণ্য ও মূল্য</h2>
            </div>
          </div>
          <p>
            আমাদের website-এ সকল price বাংলাদেশি টাকায় (৳) দেওয়া।
            Price, discount ও offer যেকোনো সময় পূর্ব নোটিশ ছাড়াই পরিবর্তন হতে পারে।
          </p>
        </section>

        <section className="policy-section" id="orders-payment">
          <div className="policy-heading">
            <span className="policy-heading-icon">🛒</span>
            <div>
              <span className="policy-eyebrow">অর্ডার ও পেমেন্ট</span>
              <h2>Orders &amp; Payment / অর্ডার ও পেমেন্ট</h2>
            </div>
          </div>
          <p>
            আমরা বর্তমানে সারা বাংলাদেশে <strong>Cash on Delivery (COD)</strong> গ্রহণ করি।
          </p>
        </section>

        <section className="policy-section" id="delivery">
          <div className="policy-heading">
            <span className="policy-heading-icon">🚚</span>
            <div>
              <span className="policy-eyebrow">ডেলিভারি পলিসি</span>
              <h2>Delivery Policy / ডেলিভারি নীতি</h2>
            </div>
          </div>
          <ul>
            <li>আমরা বিশ্বস্ত courier partner-এর মাধ্যমে সারা বাংলাদেশে delivery দিই।</li>
            <li><strong>৳২০০০-এর উপরে order-এ delivery সম্পূর্ণ ফ্রি।</strong></li>
          </ul>
        </section>

        <section className="policy-section" id="returns">
          <div className="policy-heading">
            <span className="policy-heading-icon">🔄</span>
            <div>
              <span className="policy-eyebrow">রিটার্ন ও রিফান্ড</span>
              <h2>Returns &amp; Refunds / রিটার্ন ও রিফান্ড</h2>
            </div>
          </div>
          <p>
            <strong>Delivery-র ৩ দিনের মধ্যে</strong> শর্ত পূরণ সাপেক্ষে return বা exchange করতে পারবেন।
          </p>
        </section>

        <section className="policy-section" id="cancellation">
          <div className="policy-heading">
            <span className="policy-heading-icon">✋</span>
            <div>
              <span className="policy-eyebrow">অর্ডার বাতিল</span>
              <h2>Order Cancellation / অর্ডার বাতিল</h2>
            </div>
          </div>
          <p>
            Courier-এ handover হওয়ার আগে যেকোনো সময় বিনামূল্যে আপনার order cancel করতে পারবেন।
          </p>
        </section>

        <section className="policy-section" id="ip">
          <div className="policy-heading">
            <span className="policy-heading-icon">©️</span>
            <div>
              <span className="policy-eyebrow">মালিকানা স্বত্ব</span>
              <h2>Intellectual Property / মেধাস্বত্ব</h2>
            </div>
          </div>
          <p>
            এই website-এর সকল content Gentle Vibe BD-এর সম্পত্তি।
          </p>
        </section>

        <section className="policy-section" id="liability">
          <div className="policy-heading">
            <span className="policy-heading-icon">⚖️</span>
            <div>
              <span className="policy-eyebrow">দায়বদ্ধতার সীমা</span>
              <h2>Limitation of Liability / দায়বদ্ধতার সীমা</h2>
            </div>
          </div>
          <p>
            Gentle Vibe BD নিয়ন্ত্রণের বাইরের ঘটনার জন্য দায়ী থাকবে না।
          </p>
        </section>

        <section className="policy-section" id="law">
          <div className="policy-heading">
            <span className="policy-heading-icon">🇧🇩</span>
            <div>
              <span className="policy-eyebrow">পরিচালনাকারী আইন</span>
              <h2>Governing Law / প্রযোজ্য আইন</h2>
            </div>
          </div>
          <p>
            এই Terms &amp; Conditions বাংলাদেশের আইন দ্বারা পরিচালিত হবে।
          </p>
        </section>

        <section className="policy-section" id="changes">
          <div className="policy-heading">
            <span className="policy-heading-icon">📝</span>
            <div>
              <span className="policy-eyebrow">শর্তাবলীর পরিবর্তন</span>
              <h2>Changes to These Terms / শর্তাবলীর পরিবর্তন</h2>
            </div>
          </div>
          <p>
            আমরা যেকোনো সময় এই শর্তাবলী পরিবর্তন করতে পারি।
          </p>
        </section>

        <section className="policy-section" id="contact">
          <div className="policy-heading">
            <span className="policy-heading-icon">💬</span>
            <div>
              <span className="policy-eyebrow">যোগাযোগ করুন</span>
              <h2>Contact Us / যোগাযোগ</h2>
            </div>
          </div>
          <ul>
            <li>✉ Email: gentlevibebd@gmail.com</li>
            <li>📱 WhatsApp: +8801762923318</li>
            <li>📍 Islambag, R.K Road, Rangpur Sadar, Rangpur-5400</li>
          </ul>
        </section>
      </main>

      <div className="legal-crosslink">
        আমরা আপনার data কীভাবে ব্যবহার করি জানতে পড়ুন আমাদের <a href="/privacy">Privacy Policy</a>।
      </div>

      {/* ======== CONTACT CTA ======== */}
      <div className="legal-cta">
        <div className="legal-cta-inner">
          <h3>আরও কোনো <em>প্রশ্ন আছে?</em></h3>
          <p>আমাদের team সাধারণত কয়েক ঘণ্টার মধ্যে reply করে।</p>
          <div className="legal-cta-btns">
            <a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer" className="legal-cta-btn-primary">💬 WhatsApp-এ Chat করুন</a>
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
              <p className="foot-desc">Your destination for premium T-shirts, stylish watches, and exclusive combo deals. Crafted for the modern man.</p>
            </div>
            <div className="foot-col">
              <h4>SHOP</h4>
              <ul>
                <li><a href="/products">All Products</a></li>
                <li><Link href="/products?cat=tshirt">T-Shirts</Link></li>
                <li><Link href="/products?cat=shirt">Shirts</Link></li>
                <li><Link href="/products?cat=pant">Pants</Link></li>
                <li><Link href="/products?cat=watch">Watches</Link></li>
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
            <div className="foot-col">
              <h4>ABOUT US</h4>
              <ul>
                <li><a href="/about">Our Story</a></li>
                <li><a href="mailto:gentlevibebd@gmail.com">gentlevibebd@gmail.com</a></li>
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
