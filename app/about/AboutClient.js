'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AboutClient() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Newsletter State
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  useEffect(() => {
    // Read Cart Count
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((a, c) => a + (c.qty || 1), 0);
      setCartCount(count);
    } catch (e) {
      setCartCount(0);
    }

    // Navbar Scroll Effect
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 20);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Scroll Reveal Intersection Observer
    const reveals = document.querySelectorAll(".reveal");
    if (reveals.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add("visible");
              }, i * 60);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      reveals.forEach((el) => observer.observe(el));
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

  return (
    <>
      {/* ── NAVBAR ─────────────────────────── */}
      <header className="navbar" id="navbar">
        <a href="/" className="logo">
          <Image
            src="https://www.gentlevibebd.com/545sd4fdsf54.webp"
            className="logo-img"
            alt="Gentle Vibe BD Logo"
            width={40}
            height={40}
            unoptimized
          />
          <span className="logo-name">Gentle Vibe <em>BD</em></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} id="navLinks">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/products" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="/checkout" onClick={() => setMenuOpen(false)}>Checkout</a>
          <a href="/about" className="active" onClick={() => setMenuOpen(false)}>About</a>
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

      {/* ── HERO ───────────────────────────── */}
      <section className="hero">
        <div className="hero-ornament"></div>
        <div className="hero-content">
          <span className="hero-tag">EST. 2026 · Rangpur, Bangladesh</span>
          <h1 className="hero-title">আমাদের <em>Story</em></h1>
          <div className="hero-divider"></div>
          <p className="hero-sub">Premium lifestyle brand — যেখানে old money aesthetic আর modern elegance এর মিলনে তৈরি হয় কিছু special।</p>
        </div>
      </section>

      {/* ── STORY SECTION ──────────────────── */}
      <div className="section-head reveal">
        <div className="section-label">আমাদের শুরুর গল্প</div>
        <h2 className="section-title">Who We Are</h2>
        <p className="section-sub">একটা ছোট স্বপ্ন থেকে যাত্রা শুরু, আজ হাজারো মানুষের পছন্দের brand</p>
      </div>

      <div className="story-section reveal">
        <div className="story-grid">
          <div className="story-text-side">
            <div className="story-label">Our Journey</div>
            <h2 className="story-heading">Style is not about<br />money — it's about<br /><em>attitude.</em></h2>
            <p className="story-para">
              Gentle Vibe BD যাত্রা শুরু করে ২০২৬ সালে রংপুর থেকে। আমাদের founder Md. Arafat Islam এর একটাই লক্ষ্য ছিল — Bangladesh এ affordable price এ world-class quality দেওয়া।
            </p>
            <p className="story-para">
              আমরা বিশ্বাস করি প্রতিটা মানুষ deserve করে premium feel — সেটা হোক একটা elegant watch, একটা stylish polo, বা একটা quality leather wallet।
            </p>
            <p className="story-para">
              প্রতিটা product আমরা carefully select করি যেন আপনি পান best value, best quality, আর best vibe।
            </p>
          </div>
          <div className="story-visual-side">
            <div className="story-card-bg">
              <div className="story-year">2026</div>
              <div className="story-brand">Gentle Vibe <em>BD</em></div>
              <div className="story-tagline">Premium Lifestyle Brand</div>
              <div className="story-card-divider"></div>
              <div className="story-location">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                R.K Road, Rangpur, Bangladesh
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ───────────────────────────── */}
      <div className="stats-row reveal">
        <div className="stat-item">
          <div className="stat-number">1K+</div>
          <div className="stat-label">Happy Customers</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">15+</div>
          <div className="stat-label">Premium Products</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">4.9★</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      {/* ── COLLECTION ─────────────────────── */}
      <div className="section-head reveal">
        <div className="section-label">আমাদের Collection</div>
        <h2 className="section-title">What We Offer</h2>
        <p className="section-sub">চারটি premium category — একটাই লক্ষ্য, আপনাকে আরো elegant করে তোলা</p>
      </div>

      <div className="collection-section reveal">
        <div className="collection-grid">

          <div className="col-card">
            <div className="col-icon" style={{ animationDelay: "0s" }}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/><path d="M12 9v3l2 2"/><path d="M9.5 3.5l1 2.5M14.5 3.5l-1 2.5M9.5 20.5l1-2.5M14.5 20.5l-1-2.5"/></svg>
            </div>
            <h3>Watches</h3>
            <p>Premium quality ঘড়ি যা আপনার personality কে আরো elegant করে তুলবে</p>
          </div>

          <div className="col-card">
            <div className="col-icon" style={{ animationDelay: "0.5s" }}>
              <svg viewBox="0 0 24 24"><path d="M3 6l3-3 6 3 6-3 3 3-3 3v9H6V9L3 6z"/></svg>
            </div>
            <h3>T-Shirts</h3>
            <p>Old money style এর polo t-shirt যা comfort আর class দুটোই দেবে</p>
          </div>

          <div className="col-card">
            <div className="col-icon" style={{ animationDelay: "1s" }}>
              <svg viewBox="0 0 24 24"><circle cx="7" cy="13" r="3"/><circle cx="17" cy="13" r="3"/><path d="M2 13h2M20 13h2M10 13h4"/><path d="M2 10l2-4h16l2 4"/></svg>
            </div>
            <h3>Sunglasses</h3>
            <p>Stylish সানগ্লাস দিয়ে আপনার look কে দিন একটা bold statement</p>
          </div>

          <div className="col-card">
            <div className="col-icon" style={{ animationDelay: "1.5s" }}>
              <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 12h2"/><path d="M2 10h20"/></svg>
            </div>
            <h3>Wallets</h3>
            <p>Premium leather wallet যা আপনার class আর taste represent করবে</p>
          </div>

        </div>
      </div>

      {/* ── MISSION ─────────────────────────── */}
      <div className="section-head reveal">
        <div className="section-label">আমাদের উদ্দেশ্য</div>
        <h2 className="section-title">Our Mission</h2>
      </div>

      <div className="mission-section reveal">
        <div className="mission-inner">
          <div className="mission-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h3>আমাদের Mission</h3>
          <p>
            আমাদের mission হলো Bangladesh এ affordable price এ premium quality products দেওয়া। আমরা বিশ্বাস করি — style is not about money, it's about attitude।
            প্রতিটা product আমরা carefully select করি যেন আপনি পান best value আর best vibe।
          </p>
          <div className="mission-quote">
            "Every person deserves to feel premium."
          </div>
        </div>
      </div>

      {/* ── WHY US ──────────────────────────── */}
      <div className="section-head reveal">
        <div className="section-label">কেন আমরা আলাদা</div>
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-sub">আমাদের তিনটি মূল প্রতিশ্রুতি যা আমাদের করে আলাদা</p>
      </div>

      <div className="why-section reveal">
        <div className="why-grid">

          <div className="why-card">
            <div className="why-icon">
              <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
            </div>
            <h4>100% Authentic</h4>
            <p>প্রতিটা product আমরা personally verify করি quality ensure করতে। কোনো compromise নেই।</p>
          </div>

          <div className="why-card">
            <div className="why-icon">
              <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h4>Fast Delivery</h4>
            <p>সারা Bangladesh এ দ্রুত delivery — Rangpur তে ২৪ ঘণ্টার মধ্যে পৌঁছে যাবে।</p>
          </div>

          <div className="why-card">
            <div className="why-icon">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <h4>Customer First</h4>
            <p>আমাদের কাছে customer satisfaction সবার আগে — সবসময়, প্রতিটা order এ।</p>
          </div>

        </div>
      </div>

      {/* ── CTA ────────────────────────────── */}
      <div className="cta-section reveal">
        <div className="cta-inner">
          <h2>Ready to Elevate Your Style?</h2>
          <p>আমাদের exclusive collection দেখুন এবং আপনার পছন্দের product টি আজই order করুন।</p>
          <a href="/products" className="cta-btn">Shop Now</a>
        </div>
      </div>

      {/* ── NEWSLETTER ──────────────────────── */}
      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <div className="nl-label">Newsletter</div>
            <h2>Get 10% Off<br />Your First Order</h2>
            <p>Join our exclusive members list for early access to new arrivals and special deals.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" style={subscribed ? { background: "#4caf50", color: "#fff" } : {}}>
              {subscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
            <small>No spam. Unsubscribe anytime.</small>
          </form>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">Gentle Vibe <em>BD</em></div>
              <p className="foot-desc">Your destination for premium T-shirts, stylish watches, and exclusive combo deals. Crafted for the modern man.</p>
              <div className="socials">
                <a className="social-btn" href="https://www.instagram.com/gentlevibebd2252/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                </a>
                <a className="social-btn" href="https://www.facebook.com/profile.php?id=61587086211874" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 8h2V4h-2a4 4 0 0 0-4 4v2H9v4h2v6h4v-6h2l1-4h-3V8a1 1 0 0 1 1-1z"/></svg>
                </a>
                <a className="social-btn" href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a9 9 0 0 0-7.8 13.5L3 22l6.6-1.2A9 9 0 1 0 12 2z"/><path d="M8.5 8.5c.3 2.8 2.7 5.2 5.5 5.5"/></svg>
                </a>
              </div>
            </div>

            <div className="foot-col">
              <h4>SHOP</h4>
              <ul>
                <li><a href="/products">All Products</a></li>
                <li><Link href="/products?cat=tshirt">T-Shirts</Link></li>
                <li><Link href="/products?cat=shirt">Shirts</Link></li>
                <li><Link href="/products?cat=pant">Pants</Link></li>
                <li><Link href="/products?cat=watch">Watches</Link></li>
                <li><Link href="/products?cat=wallet">Wallets</Link></li>
                <li><Link href="/products?cat=combo">Combo Deals</Link></li>
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
                <li><a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer">+8801762923318</a></li>
                <li><span>Islambag, R.K Road, Rangpur Sadar, Rangpur-5400</span></li>
              </ul>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© 2026 Gentle Vibe BD. All rights reserved.</span>
            <span>Made with ♥ in Bangladesh</span>
          </div>
        </div>
      </footer>
    </>
  );
}
