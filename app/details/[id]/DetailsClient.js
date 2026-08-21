'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

const SIZE_CHARTS = {
  tshirt: {
    title: "Size Guide (Inches)",
    rows: [["M", "38", "27", "17.5"], ["L", "40", "28", "18"], ["XL", "42", "29", "18.5"], ["XXL", "44", "30", "19"]]
  },
  shirt: {
    title: "Size Guide (Inches)",
    rows: [["M", "38", "29", "17.5"], ["L", "40", "30", "18"], ["XL", "42", "31", "18.5"], ["XXL", "44", "32", "19"]]
  }
};

function optimizeImg(url, width = 750) {
  if (!url || typeof url !== "string" || !url.includes("ik.imagekit.io")) return url || "";
  const tr = `tr=w-${width},q-80,f-webp`;
  return url.includes("?") ? `${url}&${tr}` : `${url}?${tr}`;
}

export default function DetailsClient({
  productId,
  initialProduct,
  initialInStock,
  initialReviews,
  initialRelated,
}) {
  const [product] = useState(initialProduct);
  const [inStock] = useState(initialInStock);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [relatedProducts] = useState(initialRelated || []);

  const [cartCount, setCartCount] = useState(0);
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [slideAnim, setSlideAnim] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("desc");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [zoomImg, setZoomImg] = useState(null);
  const [showReviewBox, setShowReviewBox] = useState(false);

  const [reviewName, setReviewName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

  const [toast, setToast] = useState({ show: false, msg: "", isError: false });
  const touchStartX = useRef(0);

  const showToast = (msg, isError = false) => {
    setToast({ show: true, msg, isError });
    setTimeout(() => setToast({ show: false, msg: "", isError: false }), 2500);
  };

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
      setCartCount(total);
    } catch (e) {
      setCartCount(0);
    }
  };

  const changeGalleryImage = (newIdx, direction = null) => {
    if (newIdx === currentImgIdx) return;
    const dir = direction || (newIdx > currentImgIdx ? "slide-right" : "slide-left");
    setSlideAnim(dir);
    setCurrentImgIdx(newIdx);
    setTimeout(() => {
      setSlideAnim("");
    }, 320);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    updateCartCount();

    if (product?.colors && product.colors.length > 0) {
      const first = product.colors[0];
      const name = typeof first === "string" ? first : (first.name || first.hex || "");
      setSelectedColor(name);
    }
  }, [product, productId]);

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "140px 20px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, color: "var(--gold-hi)" }}>Product Not Found</h2>
        <p style={{ marginTop: "12px" }}><a href="/products" style={{ color: "var(--paper)" }}>← Back to Shop</a></p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ["/favicon.png"];
  const hasSizes = product.sizes && product.sizes.length > 0;
  const categoryName = (product.category || "").toLowerCase();
  const isShirtCategory = categoryName.includes("shirt");
  const chartType = categoryName.includes("t-shirt") ? "tshirt" : "shirt";

  const nextImage = () => changeGalleryImage((currentImgIdx + 1) % images.length, "slide-right");
  const prevImage = () => changeGalleryImage((currentImgIdx - 1 + images.length) % images.length, "slide-left");

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextImage();
      else prevImage();
    }
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      showToast("⚠️ অনুগ্রহ করে একটি সাইজ নির্বাচন করুন!", true);
      return false;
    }

    const item = {
      id: productId,
      name: product.name,
      price: product.price,
      image: images[0] || "",
      qty: qty,
      size: selectedSize || null,
      color: selectedColor || null
    };

    try {
      const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const existingIdx = currentCart.findIndex(
        c => c.id === item.id && c.size === item.size && c.color === item.color
      );

      if (existingIdx > -1) {
        currentCart[existingIdx].qty += item.qty;
      } else {
        currentCart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(currentCart));
      updateCartCount();
      showToast("Added to Cart ✓");
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleBuyNow = () => {
    if (!inStock) {
      showToast("দুঃখিত, এই প্রডাক্টটি বর্তমানে স্টকে নেই।", true);
      return;
    }
    const added = handleAddToCart();
    if (added) {
      localStorage.setItem("shipping", "");
      window.location.href = "/checkout";
    }
  };

  const handleShare = (net, e) => {
    e.preventDefault();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (net === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    else if (net === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(product.name + " - " + url)}`, "_blank");
    else if (net === "copy") {
      navigator.clipboard?.writeText(url);
      showToast("Link Copied! ✓");
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      showToast("Please provide your name and review!", true);
      return;
    }
    try {
      await addDoc(collection(db, `reviews_${productId}`), {
        name: reviewName.trim(),
        text: reviewText.trim(),
        rating: selectedRating,
        createdAt: serverTimestamp()
      });

      setReviewName("");
      setReviewText("");
      setShowReviewBox(false);

      const revSnap = await getDocs(collection(db, `reviews_${productId}`));
      const updated = revSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(updated);
      showToast("Thank you! Review submitted ✓");
    } catch (err) {
      showToast("Error submitting review. Try again.", true);
    }
  };

  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviewCount).toFixed(1)
    : "5.0";
  const starsString = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* Toast Alert */}
      {toast.show && <div className={`toast-msg ${toast.isError ? "is-error" : ""}`}>{toast.msg}</div>}

      {/* NAVBAR */}
      <header className="navbar">
        <a href="/" className="logo">
          <Image src="/545sd4fdsf54.webp" className="logo-mark" alt="Logo" width={38} height={38} unoptimized />
          <span className="logo-word">Gentle Vibe <em>BD</em></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="/">Home</a>
          <a href="/products">Shop</a>
          <a href="/checkout">Checkout</a>
          <a href="/about">About Us</a>
          <a href="/contact">Contact</a>
          <a href="/track">Track Order</a>
        </nav>

        <div className="nav-actions">
          <a className="cart-btn" href="/cart" aria-label="Cart">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span>Cart</span>
            <span className="cart-count">{cartCount}</span>
          </a>
          <button className={`menu-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* BREADCRUMB */}
      <div className="breadcrumb-bar">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span className="sep">/</span>
            <a href="/products">Shop</a>
            {product.category && (
              <>
                <span className="sep">/</span>
                <a href={`/products?cat=${encodeURIComponent(product.category)}`}>{product.category}</a>
              </>
            )}
            <span className="sep">/</span>
            <span className="current">{product.name}</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="product-main">
        <div className="container main-grid">

          {/* LEFT: GALLERY */}
          <div className="gallery-section">
            <div className="gallery-container">
              <div
                className="main-image-box"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className={`floating-tag ${inStock ? "" : "out"}`}>
                  <span className="dot" />
                  {inStock ? "In Stock" : "Out of Stock"}
                </div>

                <div className="img-counter">
                  {currentImgIdx + 1} / {images.length}
                </div>

                <div className="gallery-actions">
                  <button
                    className={`g-action-btn ${isWishlisted ? "active" : ""}`}
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    title="Wishlist"
                  >
                    {isWishlisted ? "♥" : "♡"}
                  </button>
                  <button
                    className="g-action-btn"
                    onClick={() => setZoomImg(optimizeImg(images[currentImgIdx], 1200))}
                    title="Zoom"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </button>
                </div>

                {images.length > 1 && (
                  <button className="g-nav-btn prev" onClick={prevImage}>‹</button>
                )}
                <Image
                  className={slideAnim}
                  src={optimizeImg(images[currentImgIdx], 750)}
                  alt={product.name || "Product"}
                  width={750}
                  height={930}
                  priority
                  unoptimized
                />
                {images.length > 1 && (
                  <button className="g-nav-btn next" onClick={nextImage}>›</button>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="thumbnail-strip">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`thumb-item ${i === currentImgIdx ? "active" : ""}`}
                      onClick={() => changeGalleryImage(i)}
                    >
                      <Image src={optimizeImg(img, 150)} alt="thumbnail" width={76} height={94} unoptimized />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mobile-dots">
                {images.map((_, i) => (
                  <span key={i} className={i === currentImgIdx ? "active" : ""} onClick={() => changeGalleryImage(i)} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO & ACTIONS */}
          <div className="info-section">
            {product.category && <span className="product-category-badge">{product.category}</span>}
            <h1 className="product-title">{product.name}</h1>

            <div className="rating-row">
              <div className="stars">{starsString}</div>
              <span className="rating-caption">
                {reviewCount > 0 ? `${avgRating} (${reviewCount} Reviews)` : "5.0 (Customer Rated)"}
              </span>
            </div>

            {/* Price Box */}
            <div className="price-card">
              <div className="price-left">
                <span className="current-price">৳{product.price}</span>
                {hasDiscount && <span className="original-price">৳{product.originalPrice}</span>}
              </div>
              {hasDiscount && (
                <span className="discount-tag">
                  Save ৳{product.originalPrice - product.price} ({discountPercent}% OFF)
                </span>
              )}
            </div>

            {/* Stock Notice */}
            {inStock && (
              <div className="stock-ticker">
                <span>🔥 দ্রুত স্টক শেষ হচ্ছে! অগ্রিম টাকা ছাড়াই অর্ডার করুন।</span>
              </div>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="variant-block">
                <div className="variant-header">
                  <span className="variant-label">Color: <strong>{selectedColor}</strong></span>
                </div>
                <div className="color-options">
                  {product.colors.map((c, i) => {
                    const hex = typeof c === "string" ? c : (c.hex || "#333");
                    const name = typeof c === "string" ? c : (c.name || hex);
                    return (
                      <div
                        key={i}
                        className={`color-circle ${selectedColor === name ? "active" : ""}`}
                        style={{ background: hex }}
                        onClick={() => setSelectedColor(name)}
                        title={name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div className="variant-block">
                <div className="variant-header">
                  <span className="variant-label">Select Size: <strong>{selectedSize || "Select"}</strong></span>
                  {isShirtCategory && (
                    <button className="size-guide-btn" onClick={() => setShowSizeChart(true)}>
                      Size Guide
                    </button>
                  )}
                </div>
                <div className="size-options">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      className={`size-btn ${selectedSize === s ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="qty-row">
              <span className="variant-label">Quantity:</span>
              <div className="qty-stepper">
                <button onClick={() => setQty((prev) => Math.max(1, prev - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty((prev) => prev + 1)}>+</button>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="cta-group">
              <button className="btn-primary-action btn-buy" onClick={handleBuyNow}>
                Buy Now (Cash On Delivery) ⚡
              </button>
              <button className="btn-primary-action btn-cart" onClick={handleAddToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Add To Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-strip">
              <div className="trust-box">
                <span className="trust-icon">🚚</span>
                <strong>Cash on Delivery</strong>
                <span>Pay after receiving</span>
              </div>
              <div className="trust-box">
                <span className="trust-icon">✦</span>
                <strong>100% Original</strong>
                <span>Premium fabric & finish</span>
              </div>
              <div className="trust-box">
                <span className="trust-icon">↺</span>
                <strong>3 Days Return</strong>
                <span>Hassle-free replacement</span>
              </div>
            </div>

            {/* Meta & Share */}
            <div className="product-meta-card">
              <div>SKU: <strong>#{productId}</strong></div>
              <div className="share-links">
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--linen-dim)" }}>SHARE:</span>
                <a href="#" className="share-chip" onClick={(e) => handleShare("facebook", e)}>Facebook</a>
                <a href="#" className="share-chip" onClick={(e) => handleShare("whatsapp", e)}>WhatsApp</a>
                <a href="#" className="share-chip" onClick={(e) => handleShare("copy", e)}>Copy Link</a>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* TABS & REVIEWS */}
      <section className="tabs-section">
        <div className="container">
          <div className="tabs-layout">
            
            <div>
              <div className="tab-nav">
                <button
                  className={`tab-nav-btn ${activeTab === "desc" ? "active" : ""}`}
                  onClick={() => setActiveTab("desc")}
                >
                  Description
                </button>
                <button
                  className={`tab-nav-btn ${activeTab === "shipping" ? "active" : ""}`}
                  onClick={() => setActiveTab("shipping")}
                >
                  Shipping & Info
                </button>
                <button
                  className={`tab-nav-btn ${activeTab === "reviews" ? "active" : ""}`}
                  onClick={() => setActiveTab("reviews")}
                >
                  Customer Reviews ({reviewCount})
                </button>
              </div>

              {activeTab === "desc" && (
                <div className="tab-panel">
                  {product.description || "No description provided for this product."}
                </div>
              )}

{activeTab === "shipping" && (
                <div className="tab-panel">
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    <div>
                      <strong style={{ color: "var(--gold-hi)", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                        🚚 ডেলিভারি সময় ও চার্জ
                      </strong>
                      <p style={{ marginTop: "6px", lineHeight: "1.7", color: "var(--paper)" }}>
                        • <strong>রংপুর জেলার ভেতরে:</strong> ১ থেকে ২ কার্যদিবসের মধ্যে হোম ডেলিভারি (চার্জ ৬০ টাকা)।<br/>
                        • <strong>সারা বাংলাদেশে (ঢাকা ও অন্যান্য জেলা):</strong> ২ থেকে ৩ কার্যদিবসের মধ্যে দ্রুত হোম ডেলিভারি (চার্জ ১২০ টাকা)।
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                      <strong style={{ color: "var(--gold-hi)", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                        💵 ক্যাশ অন ডেলিভারি ও পার্সেল চেক করার সুবিধা
                      </strong>
                      <p style={{ marginTop: "6px", lineHeight: "1.7", color: "var(--paper)" }}>
                        • কোনো প্রকার অগ্রিম পেমেন্ট ছাড়াই সম্পূর্ণ <strong>ক্যাশ অন ডেলিভারি</strong> অথবা বিকাশ/নগদের মাধ্যমে পেমেন্ট করতে পারবেন।<br/>
                        • পার্সেলটি রিসিভ করার সময় ডেলিভারি রাইডারের সামনে খুলে প্রোডাক্ট ও সাইজ চেক করে নেওয়ার পূর্ণ সুবিধা রয়েছে।
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                      <strong style={{ color: "var(--gold-hi)", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                        🔄 ৩ দিনের সহজ এক্সচেঞ্জ ও রিটার্ন পলিসি
                      </strong>
                      <p style={{ marginTop: "6px", lineHeight: "1.7", color: "var(--paper)" }}>
                        • সাইজ বা কালার নিয়ে কোনো সমস্যা হলে পার্সেল হাতে পাওয়ার <strong>৩ দিনের মধ্যে</strong> কোনো ঝামেলা ছাড়াই সহজে এক্সচেঞ্জ করতে পারবেন।<br/>
                        • এক্সচেঞ্জের জন্য প্রোডাক্টটি অব্যবহৃত এবং আসল ট্যাগসহ থাকতে হবে।
                      </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                      <strong style={{ color: "var(--gold-hi)", display: "flex", alignItems: "center", gap: "8px", fontSize: "15px" }}>
                        🧺 কাপড় ধোয়ার সঠিক নিয়ম (Fabric Care)
                      </strong>
                      <p style={{ marginTop: "6px", lineHeight: "1.7", color: "var(--paper)" }}>
                        • ১০০% প্রিমিয়াম কম্বড কটন ফেব্রিক।<br/>
                        • সাধারণ ঠাণ্ডা পানিতে হালকা ডিটারজেন্ট দিয়ে ওয়াশ করুন। কড়া রোদে বেশিক্ষণ রাখবেন না এবং মিডিয়াম হিটে আয়রন করুন।
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="tab-panel">
                  <div className="reviews-header">
                    <h3>Customer Reviews</h3>
                    <button className="btn-write-review" onClick={() => setShowReviewBox(!showReviewBox)}>
                      Write Review
                    </button>
                  </div>

                  {showReviewBox && (
                    <form className="review-form-card" onSubmit={submitReview}>
                      <div className="star-picker">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={star <= selectedRating ? "active" : ""}
                            onClick={() => setSelectedRating(star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        required
                      />
                      <textarea
                        placeholder="ফেব্রিক কোয়ালিটি বা সাইজ নিয়ে আপনার অভিজ্ঞতা লিখুন..."
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        required
                      />
                      <button type="submit" className="btn-write-review" style={{ alignSelf: "flex-start" }}>
                        Submit Review
                      </button>
                    </form>
                  )}

                  <div className="reviews-list">
                    {reviews.length === 0 ? (
                      <p style={{ textAlign: "center", color: "var(--linen-dim)", padding: "20px" }}>
                        এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনিই দিন!
                      </p>
                    ) : (
                      reviews.map((r, i) => (
                        <div key={r.id || i} className="review-item">
                          <div className="review-item-top">
                            <span className="reviewer-name">
                              {r.name || "Verified Customer"}
                              <span className="verified-tag">Verified Buyer</span>
                            </span>
                            <span className="stars">{"★".repeat(r.rating || 5)}</span>
                          </div>
                          <p style={{ fontSize: "13.5px" }}>{r.text}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside>
              <div className="rating-score-card">
                <div className="big-score">{avgRating}</div>
                <div className="stars" style={{ margin: "6px 0" }}>{starsString}</div>
                <div className="score-count">Based on {reviewCount} reviews</div>
              </div>

              <div className="help-card">
                <h4>কোনো প্রশ্ন আছে?</h4>
                <p>সাইজ বা ফেব্রিক নিয়ে বিস্তারিত জানতে সরাসরি আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন।</p>
                <a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                  Chat on WhatsApp
                </a>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <div className="container">
            <div className="section-title-wrap">
              <span className="section-subtitle">Recommended For You</span>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="related-grid">
              {relatedProducts.map((p) => (
                <div
                  key={p.id}
                  className="product-card"
                  onClick={() => { window.location.href = `/details/${p.id}`; }}
                >
                  <Image
                    src={optimizeImg(p.images?.[0] || "", 350)}
                    alt={p.name}
                    width={300}
                    height={375}
                    unoptimized
                  />
                  <div className="product-card-info">
                    <h4 className="product-card-title">{p.name}</h4>
                    <p className="product-card-price">৳{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="mobile-sticky-bar">
        <div className="m-price-col">
          <span className="m-price-label">Price</span>
          <span className="m-price-val">৳{product.price * qty}</span>
        </div>
        <div className="m-btn-group">
          <button className="m-act-btn cart" onClick={handleAddToCart}>Add to Cart</button>
          <button className="m-act-btn buy" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>

      {/* SIZE CHART MODAL */}
      {showSizeChart && (
        <div className="modal-overlay" onClick={() => setShowSizeChart(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowSizeChart(false)}>&times;</button>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--paper)", fontFamily: "var(--font-display)" }}>{SIZE_CHARTS[chartType].title}</h3>
            <table className="size-table">
              <thead>
                <tr><th>Size</th><th>Chest</th><th>Length</th><th>Shoulder</th></tr>
              </thead>
              <tbody>
                {SIZE_CHARTS[chartType].rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIGHTBOX VIEWER */}
      {zoomImg && (
        <div className="modal-overlay" onClick={() => setZoomImg(null)}>
          <Image className="lightbox-image" src={zoomImg} alt="Preview" width={1100} height={1100} unoptimized />
        </div>
      )}

      {/* FOOTER (Restored Original) */}
      <footer>
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="foot-logo">Gentle Vibe <em>BD</em></div>
              <p className="foot-desc">
                Your destination for premium T-shirts, stylish watches, and exclusive combo deals. Crafted for the modern man.
              </p>
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
              <h4>Shop</h4>
              <ul>
                <li><a href="/products">New Arrivals</a></li>
                <li><a href="/products?cat=tshirt">T-Shirts</a></li>
                <li><a href="/products?cat=shirt">Shirts</a></li>
                <li><a href="/products?cat=pant">Pants</a></li>
                <li><a href="/products?cat=watch">Watches</a></li>
                <li><a href="/products?cat=wallet">Wallets</a></li>
                <li><a href="/products?cat=combo">Combo Deals</a></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>Customer Care</h4>
              <ul>
                <li><a href="/contact">Contact Us</a></li>
                <li><a href="/track">Track Order</a></li>
                <li><a href="/terms">Terms &amp; Conditions</a></li>
                <li><a href="/privacy">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="foot-col">
              <h4>About Us</h4>
              <ul>
                <li><a href="/about">Our Story</a></li>
                <li><a href="mailto:gentlevibebd@gmail.com">gentlevibebd@gmail.com</a></li>
                <li><a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer">+8801762923318</a></li>
                <li><span>Islambag, R.K Road, Rangpur Sadar, Rangpur-5400</span></li>
              </ul>
            </div>
          </div>

          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} Gentle Vibe BD. All rights reserved.</span>
            <span>Made with ♥ in Bangladesh</span>
          </div>
        </div>
      </footer>
    </>
  );
}
