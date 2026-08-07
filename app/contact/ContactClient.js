'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactClient() {
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Order Inquiry");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState("");
  const [toast, setToast] = useState({ show: false, msg: "" });

  const showToast = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
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

    // Scroll Reveal Observer for Animations
    const targets = document.querySelectorAll(".reveal-up");
    if (targets.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
      );
      targets.forEach((t) => observer.observe(t));
    }

    // Navbar Scroll Effect
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (navbar) {
        navbar.classList.toggle("scrolled", window.scrollY > 30);
      }
    };
    window.addEventListener("scroll", handleScroll);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg("Sending your message…");

    const data = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      subject,
      message: message.trim(),
      createdAt: serverTimestamp(),
      source: "contact-page"
    };

    try {
      await addDoc(collection(db, "contactMessages"), data);

      setName("");
      setPhone("");
      setEmail("");
      setSubject("Order Inquiry");
      setMessage("");
      setFormMsg("Thanks! Your message has been sent — we'll reply soon.");
      showToast("Message sent successfully");
    } catch (err) {
      console.error("Firestore write failed:", err);
      setFormMsg("Something went wrong. Please try WhatsApp or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className="toast show" id="toast">
          {toast.msg}
        </div>
      )}

      {/* ======== NAVBAR ======== */}
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
          <a href="/about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="/contact" className="active" onClick={() => setMenuOpen(false)}>Contact Us</a>
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

      {/* ======== PAGE HERO ======== */}
      <section className="contact-hero">
        <div className="contact-hero-inner reveal-up">
          <div className="eyebrow">— We'd Love To Hear From You —</div>
          <h1>Get In <span>Touch</span></h1>
          <p>Questions about an order, a product, or just want to say hello? Send us a message and our team will get back to you shortly.</p>
        </div>
      </section>

      {/* ======== CONTACT SECTION ======== */}
      <section className="section contact-section">
        <div className="container contact-grid">

          {/* Contact Info */}
          <div className="contact-info reveal-up">
            <div className="eyebrow">Contact Info</div>
            <h2>Reach Us Directly</h2>
            <p className="contact-lead">Prefer to skip the form? Here's every way to reach the Gentle Vibe BD team.</p>

            <div className="contact-cards">
              <a className="contact-card" href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer">
                <span className="cc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a9 9 0 0 0-7.8 13.5L3 22l6.6-1.2A9 9 0 1 0 12 2z"/><path d="M8.5 8.5c.3 2.8 2.7 5.2 5.5 5.5"/></svg>
                </span>
                <span>
                  <span className="cc-label">WhatsApp / Phone</span>
                  <span className="cc-value">+880 1762-923318</span>
                </span>
              </a>

              <a className="contact-card" href="mailto:gentlevibebd@gmail.com">
                <span className="cc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6 8 7 8-7"/></svg>
                </span>
                <span>
                  <span className="cc-label">Email</span>
                  <span className="cc-value">gentlevibebd@gmail.com</span>
                </span>
              </a>

              <div className="contact-card no-hover">
                <span className="cc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </span>
                <span>
                  <span className="cc-label">Store Address</span>
                  <span className="cc-value">Islambag, R.K Road, Rangpur Sadar, Rangpur-5400</span>
                </span>
              </div>

              <div className="contact-card no-hover">
                <span className="cc-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                </span>
                <span>
                  <span className="cc-label">Response Time</span>
                  <span className="cc-value">Usually within a few hours</span>
                </span>
              </div>
            </div>

            <div className="socials contact-socials">
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

          {/* Contact Form */}
          <div className="contact-form-wrap reveal-up">
            <div className="eyebrow">Send A Message</div>
            <h2>Write To Us</h2>
            <form className="contact-form" id="contactForm" onSubmit={handleSubmit}>

              <div className="form-row">
                <div className="field">
                  <label htmlFor="cName">Full Name</label>
                  <input
                    type="text"
                    id="cName"
                    name="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="cPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="cPhone"
                    name="phone"
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="cEmail">Email Address</label>
                <input
                  type="email"
                  id="cEmail"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="cSubject">Subject</label>
                <select
                  id="cSubject"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option>Order Inquiry</option>
                  <option>Product Question</option>
                  <option>Return / Exchange</option>
                  <option>Partnership</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="cMessage">Message</label>
                <textarea
                  id="cMessage"
                  name="message"
                  rows={5}
                  placeholder="Tell us how we can help..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary contact-submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
              <div className="form-msg" id="contactMsg">{formMsg}</div>
            </form>
          </div>

        </div>
      </section>

      {/* ======== MAP ======== */}
      <section className="section contact-map-section">
        <div className="container">
          <div className="contact-map reveal-up">
            <iframe
              title="Gentle Vibe BD Location"
              src="https://www.google.com/maps?q=Islambag,%20R.K%20Road,%20Rangpur%20Sadar,%20Rangpur-5400&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
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
        <a href="/track" className="bottom-nav-item">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <span>Order Track</span>
        </a>
      </nav>
    </>
  );
}
