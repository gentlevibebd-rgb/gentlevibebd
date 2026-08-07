"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const HERO_SLIDES = [
  "/bannerimage1.webp",
  "/bannerimage3.webp",
  "/bannerimage2.webp",
  "/gentlevibebdbanner2.webp",
];

const UPCOMING = [
  { img: "/db6c416d580d44c598c017daa30b0cac.webp", title: "Sharingan — Spinning Mangekyō Watch", id: "upcoming-1" },
  { img: "/d63d625075a8986954b2a095499ff74d.webp", title: "Japanese Anime Dial Quartz Watch", id: "upcoming-2" },
  { img: "/bae4c1556515c102f407e92639c66ba5.webp", title: "Skmei Rotary Dial Watch", id: "upcoming-3" },
  { img: "/8fe8547c4edd3f5e585fe49157c68e69.webp", title: "Binbond Luxury Magnetic Watch", id: "upcoming-4" },
  { img: "/c68bb150064d0584803c5f29dac79616.webp", title: "Luxury Poedagar Watch", id: "upcoming-1" },
  { img: "/c79436b9d53d7deeb253117cc01b0a1e.webp", title: "Hublot Skeleton Watch", id: "upcoming-2" },
  { img: "/70274ec0952410c0c9b2aba21d8764e1.webp", title: "Hublot Skeleton Watch II", id: "upcoming-2" },
  { img: "/51501adde946d8d907f15c0ae52d7f22.webp", title: "Luxury Men's Leather Wallet", id: "upcoming-6" },
];

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxKtfJQBVprDnVryQ-AvWifAQHGRyVRq8NmhqM8LET2eV0fb9orGzmemDeU0g98nT1x/exec";

const PRODUCT_CACHE_PREFIX = "gvbd_product_";

function discountBadge(p) {
  if (p.discount) return `${p.discount}% OFF`;
  if (p.badge) return p.badge;
  return "Sale";
}

function normalizeCat(catMap, cat) {
  return catMap[cat] || cat;
}

function filterProductsList(list, filter, catMap) {
  if (filter === "all") return list;
  if (filter === "Sale") return list.filter((p) => p.discount);
  return list.filter((p) => normalizeCat(catMap, p.category) === filter);
}

function sortProductsList(list, sort) {
  const arr = [...list];
  if (sort === "low-high") arr.sort((a, b) => a.price - b.price);
  else if (sort === "high-low") arr.sort((a, b) => b.price - a.price);
  return arr;
}

export default function ProductsClient({
  initialProducts,
  initialStockMap,
  initialCategories,
  initialCatParam,
  catMap,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [products] = useState(initialProducts || []);
  const [stockMap] = useState(initialStockMap || {});
  const [categories] = useState(initialCategories || []);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categoryLabel, setCategoryLabel] = useState("All Categories");
  const [sortBy, setSortBy] = useState("default");
  const [sortLabel, setSortLabel] = useState("Sort By");
  const [openDropdown, setOpenDropdown] = useState(null); // 'category' | 'sort' | null

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [toast, setToast] = useState({ msg: "", show: false });

  const [sizeModal, setSizeModal] = useState({ open: false, product: null, selectedSize: null });

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const dropdownRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ---------- initial ?cat= param handling ----------
  useEffect(() => {
    if (initialCatParam === "Sale") {
      setCategoryFilter("Sale");
      setCategoryLabel("🔥 Sale");
    } else if (initialCatParam && initialCatParam !== "all") {
      const match = categories.find((c) => c.id === initialCatParam);
      if (match) {
        setCategoryFilter(match.id);
        setCategoryLabel(`${match.icon || ""} ${match.label}`.trim());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- cart count from localStorage ----------
  function refreshCartCount() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.reduce((s, i) => s + (i.qty || 0), 0));
    } catch (e) {
      setCartCount(0);
    }
  }

  useEffect(() => {
    refreshCartCount();
  }, []);

  // ---------- page loader ----------
  useEffect(() => {
    const t = setTimeout(() => setPageLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  // ---------- navbar scroll shadow ----------
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- hero slider auto-rotate ----------
  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // ---------- close dropdown on outside click ----------
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---------- Facebook Pixel (3s delay after window load) ----------
  useEffect(() => {
    function loadPixel() {
      setTimeout(() => {
        /* eslint-disable */
        (function (f, b, e, v, n, t, s) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = "2.0";
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", "4238792793034225");
        window.fbq("track", "PageView");
        /* eslint-enable */
      }, 3000);
    }
    if (document.readyState === "complete") {
      loadPixel();
    } else {
      window.addEventListener("load", loadPixel);
      return () => window.removeEventListener("load", loadPixel);
    }
  }, []);

  // ---------- toast ----------
  function showToast(msg) {
    setToast({ msg, show: true });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2400);
  }

  // ---------- filtered + sorted list ----------
  const visibleProducts = useMemo(() => {
    let list = filterProductsList(products, categoryFilter, catMap);
    list = sortProductsList(list, sortBy);
    return list;
  }, [products, categoryFilter, sortBy, catMap]);

  // ---------- category / sort selection ----------
  function selectCategory(id, label) {
    setCategoryFilter(id);
    setCategoryLabel(label);
    setOpenDropdown(null);
  }

  function selectSort(value, label) {
    setSortBy(value);
    setSortLabel(label);
    setOpenDropdown(null);
  }

  // ---------- card click -> cache + navigate to details ----------
  function cacheProductForDetails(p) {
    try {
      const inStock = stockMap[String(p.id)] !== false;
      sessionStorage.setItem(
        PRODUCT_CACHE_PREFIX + p.id,
        JSON.stringify({ product: p, inStock, savedAt: Date.now() })
      );
    } catch (e) {
      console.warn("Prefetch cache failed:", e);
    }
  }

  // ---------- size modal (ported for parity — not wired to grid cards,
  // exactly like the original products.html) ----------
  function openSizeModal(p) {
    if (p.sizes && p.sizes.length > 0) {
      setSizeModal({ open: true, product: p, selectedSize: p.sizes[0] });
    } else {
      addToCartAndGoCheckout(p, null);
    }
  }

  function closeSizeModal() {
    setSizeModal({ open: false, product: null, selectedSize: null });
  }

  function confirmSizeAndCheckout() {
    const { product, selectedSize } = sizeModal;
    closeSizeModal();
    addToCartAndGoCheckout(product, selectedSize);
  }

  function addToCartAndGoCheckout(p, size) {
    if (!p) return;
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem("cart")) || [];
    } catch (e) {}
    const existing = cart.find((c) => c.id === p.id && c.size === size);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.images?.[0] || "",
        qty: 1,
        size,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    refreshCartCount();
    router.push("/checkout");
  }

  // ---------- newsletter subscribe ----------
  async function handleSubscribe(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@")) {
      showToast("সঠিক email দিন");
      return;
    }
    setSubscribing(true);
    try {
      await addDoc(collection(db, "subscribers"), {
        email: value,
        subscribedAt: serverTimestamp(),
      });
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: new URLSearchParams({ email: value }),
      });
      showToast("Thanks for subscribing! Check your inbox for 10% off.");
      setEmail("");
    } catch (err) {
      console.error("Newsletter subscribe error:", err);
      showToast("কিছু ভুল হয়েছে, আবার চেষ্টা করুন");
    } finally {
      setSubscribing(false);
    }
  }

  const isActive = (href) => (pathname === href ? "active" : "");

  return (
    <>
      {/* PAGE LOADER */}
      <div id="pageLoader" className={pageLoading ? "" : "hidden"}>
        <div className="loader-spinner"></div>
        <span>Wait a sec...</span>
      </div>

      {/* NAVBAR */}
      <header className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <a href="/" className="logo">
          <Image
            src="/545sd4fdsf54.webp"
            className="logo-img"
            alt="Gentle Vibe BD Logo"
            width={36}
            height={36}
          />
          <span className="logo-name">
            Gentle Vibe <em>BD</em>
          </span>
        </a>
        <nav className={`nav-links${mobileMenuOpen ? " open" : ""}`} id="navLinks">
          <a href="/" onClick={() => setMobileMenuOpen(false)} className={isActive("/")}>
            Home
          </a>
          <a href="/products" onClick={() => setMobileMenuOpen(false)} className={isActive("/products")}>
            Shop
          </a>
          <a href="/checkout" onClick={() => setMobileMenuOpen(false)} className={isActive("/checkout")}>
            Checkout
          </a>
          <a href="/about" onClick={() => setMobileMenuOpen(false)} className={isActive("/about")}>
            About
          </a>
          <a href="/contact" onClick={() => setMobileMenuOpen(false)} className={isActive("/contact")}>
            Contact Us
          </a>
          <a href="/track" onClick={() => setMobileMenuOpen(false)} className={isActive("/track")}>
            Track Order
          </a>
        </nav>
        <div className="nav-actions">
          <button className="cart-btn" onClick={() => router.push("/cart")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span className="cart-count" id="cartCount">{cartCount}</span>
          </button>
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

      {/* HERO */}
      <section className="hero" id="heroSlider">
        {HERO_SLIDES.map((src, i) => (
          <div key={src} className={`hero-slide${i === currentSlide ? " active" : ""}`}>
            <Image src={src} alt="" fill sizes="100vw" style={{ objectFit: "cover" }} priority={i === 0} />
          </div>
        ))}
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <span className="hero-tag">New Collection 2026</span>
          <h1 className="hero-title">
            Our <em>Shop</em>
          </h1>
          <p className="hero-sub">Premium fashion, watches &amp; accessories — curated for you</p>
        </div>
        <div className="hero-dots" id="heroDots">
          {HERO_SLIDES.map((_, i) => (
            <span
              key={i}
              className={i === currentSlide ? "active" : ""}
              onClick={() => setCurrentSlide(i)}
            ></span>
          ))}
        </div>
      </section>

      {/* SECTION TITLE */}
      <div className="section-head">
        <div className="section-label">Bestsellers</div>
        <h2 className="section-title">Our Trending Products</h2>
      </div>

      {/* FILTER + SORT DROPDOWNS */}
      <div className="filter-controls" id="filterControls" ref={dropdownRef}>
        <div className={`dropdown-box${openDropdown === "category" ? " open" : ""}`} id="categoryBox">
          <button
            className="dropdown-toggle"
            id="categoryToggle"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown((d) => (d === "category" ? null : "category"));
            }}
          >
            <span className="dt-icon">🗂️</span>
            <span id="categoryLabel">{categoryLabel}</span>
            <svg className="dt-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="dropdown-menu" id="categoryMenu">
            <button
              className={`dropdown-item${categoryFilter === "all" ? " active" : ""}`}
              onClick={() => selectCategory("all", "All Categories")}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`dropdown-item${categoryFilter === c.id ? " active" : ""}`}
                onClick={() => selectCategory(c.id, `${c.icon || ""} ${c.label}`.trim())}
              >
                {`${c.icon || ""} ${c.label}`.trim()}
              </button>
            ))}
          </div>
        </div>

        <div className={`dropdown-box${openDropdown === "sort" ? " open" : ""}`} id="sortBox">
          <button
            className="dropdown-toggle"
            id="sortToggle"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown((d) => (d === "sort" ? null : "sort"));
            }}
          >
            <span className="dt-icon">↕️</span>
            <span id="sortLabel">{sortLabel}</span>
            <svg className="dt-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          <div className="dropdown-menu" id="sortMenu">
            <button className={`dropdown-item${sortBy === "default" ? " active" : ""}`} onClick={() => selectSort("default", "Default")}>
              Default
            </button>
            <button className={`dropdown-item${sortBy === "low-high" ? " active" : ""}`} onClick={() => selectSort("low-high", "Price: Low to High")}>
              Price: Low to High
            </button>
            <button className={`dropdown-item${sortBy === "high-low" ? " active" : ""}`} onClick={() => selectSort("high-low", "Price: High to Low")}>
              Price: High to Low
            </button>
          </div>
        </div>
      </div>

      {/* SCROLL TEXT */}
      <div className="scroll-hint">
        <div className="scroll-hint-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i}>✦ যে Product টি দেখতে চান তার উপরে click করুন ✦</span>
          ))}
        </div>
      </div>

      {/* PRODUCTS GRID */}
      <section className="main">
        {visibleProducts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888", padding: "40px", width: "100%" }}>
            কোনো product পাওয়া যায়নি
          </p>
        ) : (
          <div className="products" id="productsGrid">
            {visibleProducts.map((p) => {
              const cat = normalizeCat(catMap, p.category);
              const inStock = stockMap[String(p.id)] !== false;
              const img = p.images?.[0] || "";
              return (
                <Link
                  key={p.id}
                  href={`/details/${p.id}`}
                  className={`card${!inStock ? " out-of-stock" : ""}`}
                  data-cat={cat}
                  data-id={p.id}
                  onClick={() => cacheProductForDetails(p)}
                >
                  <div className="card-img-wrap">
                    <span className="tag">{discountBadge(p)}</span>
                    {!inStock && <span className="out-of-stock-badge">স্টক নেই</span>}
                    {img && (
                      <Image
                        src={img}
                        alt={p.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 220px"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div className="card-body">
                    <h4>{p.name}</h4>
                    <p className="price">
                      ৳{p.price} <del>৳{p.originalPrice}</del>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* SIZE MODAL (ported for parity, not wired to grid — matches original) */}
      <div className={`size-modal-overlay${sizeModal.open ? " active" : ""}`} id="sizeModal" onClick={(e) => {
        if (e.target.id === "sizeModal") closeSizeModal();
      }}>
        <div className="size-modal">
          <div className="size-modal-product" id="sizeModalProduct">
            {sizeModal.product && (
              <>
                <Image
                  src={sizeModal.product.images?.[0] || ""}
                  alt={sizeModal.product.name}
                  width={56}
                  height={56}
                />
                <div className="size-modal-product-info">
                  <h4>{sizeModal.product.name}</h4>
                  <span>৳{sizeModal.product.price}</span>
                </div>
              </>
            )}
          </div>
          <div className="size-modal-divider"></div>
          <h3>Select Your Size</h3>
          <div className="size-modal-btns" id="sizeModalBtns">
            {sizeModal.product?.sizes?.map((size) => (
              <button
                key={size}
                className={sizeModal.selectedSize === size ? "active" : ""}
                onClick={() => setSizeModal((m) => ({ ...m, selectedSize: size }))}
              >
                {size}
              </button>
            ))}
          </div>
          <button className="size-modal-confirm" onClick={confirmSizeAndCheckout}>
            Confirm &amp; Buy Now →
          </button>
          <br />
          <button className="size-modal-cancel" onClick={closeSizeModal}>
            Cancel
          </button>
        </div>
      </div>

      {/* UPCOMING SLIDER */}
      <div className="section-head">
        <div className="section-label">Coming Soon</div>
        <h2 className="section-title">🚀 Upcoming Products</h2>
        <p className="section-sub">Pre-book now before they sell out</p>
      </div>

      <section className="upcoming">
        <div className="slider">
          <div className="slide-track">
            {UPCOMING.map((u, i) => (
              <div className="up-card" key={i}>
                <Image src={u.img} alt={u.title} width={230} height={140} />
                <h4>{u.title}</h4>
                <button onClick={() => router.push(`/details/${u.id}`)}>Pre-Book</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter">
        <div className="newsletter-inner">
          <div className="newsletter-text">
            <div className="section-label light">Newsletter</div>
            <h2>
              Get 10% Off
              <br />
              Your First Order
            </h2>
            <p>Join our exclusive members list for early access to new arrivals and special deals.</p>
          </div>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              id="emailInput"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button id="subscribeBtn" type="submit" disabled={subscribing}>
              {subscribing ? "Please wait..." : "Subscribe"}
            </button>
            <small>No spam. Unsubscribe anytime.</small>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">
                Gentle Vibe <em>BD</em>
              </div>
              <p className="foot-desc">
                Your destination for premium T-shirts, stylish watches, and exclusive combo deals. Crafted for the modern man.
              </p>
              <div className="socials">
                <a className="social-btn" href="https://www.instagram.com/gentlevibebd2252/" target="_blank" rel="noopener" aria-label="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" />
                  </svg>
                </a>
                <a className="social-btn" href="https://www.facebook.com/profile.php?id=61587086211874" target="_blank" rel="noopener" aria-label="Facebook">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M15 8h2V4h-2a4 4 0 0 0-4 4v2H9v4h2v6h4v-6h2l1-4h-3V8a1 1 0 0 1 1-1z" />
                  </svg>
                </a>
                <a className="social-btn" href="https://wa.me/8801762923318" target="_blank" rel="noopener" aria-label="WhatsApp">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M12 2a9 9 0 0 0-7.8 13.5L3 22l6.6-1.2A9 9 0 1 0 12 2z" />
                    <path d="M8.5 8.5c.3 2.8 2.7 5.2 5.5 5.5" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="foot-col">
              <h4>SHOP</h4>
              <ul>
                <li><Link href="/#bestsellers">New Arrivals</Link></li>
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
                <li><a href="https://wa.me/8801762923318" target="_blank" rel="noopener">+8801762923318</a></li>
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

      <div className={`toast${toast.show ? " show" : ""}`} id="toast">{toast.msg}</div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="mobile-bottom-nav">
        <a href="/" className={`bottom-nav-item${isActive("/") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 9.5L12 3l9 6.5V21a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z" />
          </svg>
          <span>Home</span>
        </a>
        <a href="/products" className={`bottom-nav-item${isActive("/products") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>All Product</span>
        </a>
        <a href="/cart" className={`bottom-nav-item${isActive("/cart") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span className="bottom-cart-count" id="bottomCartCount">{cartCount}</span>
          <span>Cart</span>
        </a>
        <a href="/track" className={`bottom-nav-item${isActive("/track") ? " active" : ""}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
          </svg>
          <span>Order Track</span>
        </a>
      </nav>

      {/* Meta Pixel noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src="https://www.facebook.com/tr?id=4238792793034225&ev=PageView&noscript=1"
          alt=""
        />
      </noscript>
    </>
  );
}
