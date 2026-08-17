'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
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

function optimizeImg(url, width = 600) {
  if (!url || typeof url !== "string" || !url.includes("ik.imagekit.io")) return url || "";
  const tr = `tr=w-${width},q-75,f-webp`;
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
  const [isFading, setIsFading] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("descText");
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

  const changeGalleryImage = (newIdx) => {
    if (newIdx === currentImgIdx) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImgIdx(newIdx);
      setIsFading(false);
    }, 150);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    updateCartCount();

    if (product) {
      if (product.colors && product.colors.length > 0) {
        const first = product.colors[0];
        const name = typeof first === "string" ? first : (first.name || first.hex || "");
        setSelectedColor(name);
      }
    }

    // Scroll reveal observer
    const targets = document.querySelectorAll(".reveal-up, .trust-item, .related-card, .summary-card, .tabs-area");
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
        { threshold: 0.1, rootMargin: "0px 0px -20px 0px" }
      );
      targets.forEach((t) => observer.observe(t));
    }
  }, [product, productId]);

  // Facebook Pixel Pattern
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

        if (product) {
          window.fbq("track", "ViewContent", {
            content_name: product.name,
            content_ids: [productId],
            content_type: "product",
            value: product.price,
            currency: "BDT"
          });
        }
      }, 3000);
    }

    if (document.readyState === "complete") loadPixel();
    else {
      window.addEventListener("load", loadPixel);
      return () => window.removeEventListener("load", loadPixel);
    }
  }, [product, productId]);

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", color: "var(--gold)" }}>
        <h2>Product Not Found</h2>
        <p style={{ marginTop: "10px" }}><a href="/products">← Back to Shop</a></p>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ["/favicon.png"];
  const hasSizes = product.sizes && product.sizes.length > 0;
  const categoryName = (product.category || "").toLowerCase();
  const isShirtCategory = categoryName.includes("shirt");
  const chartType = categoryName.includes("t-shirt") ? "tshirt" : "shirt";

  const nextImage = () => changeGalleryImage((currentImgIdx + 1) % images.length);
  const prevImage = () => changeGalleryImage((currentImgIdx - 1 + images.length) % images.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextImage();
      else prevImage();
    }
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) {
      showToast("⚠️ অনুগ্রহ করে একটি সাইজ সিলেক্ট করুন!", true);
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
      showToast("Added ✅");
      return true;
    } catch (e) {
      console.error("Cart save error:", e);
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
      window.location.href = "/checkout";
    }
  };

  const handleShare = (net, e) => {
    e.preventDefault();
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (net === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    else if (net === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(product.name + " - " + url)}`, "_blank");
    else if (net === "copy") {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast("Link copied! ✓");
      }
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewText.trim()) {
      showToast("নাম এবং আপনার মূল্যবান মতামত লিখুন!", true);
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
      const updatedReviews = revSnap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
        };
      });
      setReviews(updatedReviews);
      showToast("ধন্যবাদ! আপনার রিভিউটি গ্রহণ করা হয়েছে ✓");
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast("রিভিউ জমাদানে সমস্যা হয়েছে। আবার চেষ্টা করুন।", true);
    }
  };

  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviewCount).toFixed(1)
    : "0.0";
  const starsString = "★".repeat(Math.round(avgRating)) + "☆".repeat(5 - Math.round(avgRating));

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e1e1e",
            color: "#f5f0e8",
            padding: "12px 24px",
            borderRadius: "30px",
            fontSize: "14px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            zIndex: 99999,
            border: toast.isError ? "1px solid rgba(239,68,68,0.5)" : "1px solid rgba(201,168,76,0.4)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            textAlign: "center",
            maxWidth: "300px",
            pointerEvents: "none"
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* ======== NAVBAR ======== */}
      <header className="navbar" id="navbar">
        <a href="/" className="logo">
          <Image src="/545sd4fdsf54.webp" className="logo-img" alt="Gentle Vibe BD Logo" width={40} height={40} unoptimized />
          <span className="logo-name">Gentle Vibe <em>BD</em></span>
        </a>

        <nav className={`nav-links ${menuOpen ? "open" : ""}`} id="navLinks">
          <a href="/" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="/products" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="/checkout" onClick={() => setMenuOpen(false)}>Checkout</a>
          <a href="/about" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="/contact" onClick={() => setMenuOpen(false)}>Contact</a>
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
          <button className={`menu-toggle ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      {/* ======== BREADCRUMB BAR ======== */}
      <div className="breadcrumb-bar">
        <div className="nav-container">
          <div className="breadcrumb" id="breadcrumb">
            <a href="/">Home</a>
            <span className="sep">›</span>
            <a href="/products">Shop</a>
            {product.category && (
              <>
                <span className="sep">›</span>
                <a href={`/products?cat=${encodeURIComponent(product.category)}`}>{product.category}</a>
              </>
            )}
            <span className="sep">›</span>
            <span className="current">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ======== MAIN PRODUCT DISPLAY ======== */}
      <main className="product-main">
        <div className="nav-container main-grid">

          {/* LEFT: GALLERY */}
          <div className="gallery-section reveal-up in-view">
            <div className="gallery-container">
              <div
                className="main-image-box"
                id="mainImgWrapper"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {images.length > 1 && (
                  <button className="g-nav-btn prev" onClick={prevImage} aria-label="Previous image">‹</button>
                )}
                <Image
                  id="mainImg"
                  className={isFading ? "fade-out" : ""}
                  src={optimizeImg(images[currentImgIdx], 600)}
                  alt={product.name || "Product Image"}
                  width={600}
                  height={600}
                  priority
                  unoptimized
                  style={{ width: "100%", height: "auto", objectFit: "cover" }}
                />
                {images.length > 1 && (
                  <button className="g-nav-btn next" onClick={nextImage} aria-label="Next image">›</button>
                )}
                <button className="zoom-btn" onClick={() => setZoomImg(optimizeImg(images[currentImgIdx], 1000))} title="Zoom Image">🔍</button>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="thumbnail-strip" id="thumbs">
                  {images.map((img, i) => (
                    <Image
                      key={i}
                      src={optimizeImg(img, 150)}
                      alt={`Thumb ${i + 1}`}
                      width={70}
                      height={70}
                      className={i === currentImgIdx ? "active" : ""}
                      onClick={() => changeGalleryImage(i)}
                      unoptimized
                    />
                  ))}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mobile-dots" id="imgDots">
                {images.map((_, i) => (
                  <span key={i} className={i === currentImgIdx ? "active" : ""} onClick={() => changeGalleryImage(i)} />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: INFO & PURCHASE */}
          <div className="info-section reveal-up in-view">
            <div className="product-header animate-preview">
              <h1 id="productTitle" className="product-name">
                {product.name}{" "}
                <span className={`stock-tag ${inStock ? "" : "out"}`}>
                  {inStock ? "In Stock" : "Out of Stock"}
                </span>
              </h1>

              <div className="rating-bar" id="ratingRow">
                <div className="stars-gold">{starsString}</div>
                <span id="ratingText" className="rating-text">
                  {reviewCount > 0 ? `${avgRating} (${reviewCount} Reviews)` : "No reviews yet"}
                </span>
              </div>
            </div>

            <div className="price-container animate-preview">
              <div className="price-group">
                <span className="current-price new">৳{product.price}</span>
                {hasDiscount && <span className="original-price old">৳{product.originalPrice}</span>}
              </div>
              {hasDiscount && discountPercent > 0 && (
                <span className="discount-badge" id="discountPill">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="option-wrapper" id="colorBlock">
                <div className="option-title">
                  Color: <span id="selectedColorName" className="val-highlight">{selectedColor}</span>
                </div>
                <div className="color-list" id="colors">
                  {product.colors.map((c, i) => {
                    const hex = typeof c === "string" ? c : (c.hex || "#333");
                    const name = typeof c === "string" ? c : (c.name || hex);
                    return (
                      <div
                        key={i}
                        className={`color-dot ${selectedColor === name ? "active" : ""}`}
                        style={{ background: hex }}
                        onClick={() => setSelectedColor(name)}
                        data-color={name}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div className="option-wrapper size-block">
                <div className="option-header-flex">
                  <div className="option-title">Select Size</div>
                  {isShirtCategory && (
                    <button id="sizeChartBtn" className="size-guide-link" onClick={() => setShowSizeChart(true)}>
                      📏 Size Guide
                    </button>
                  )}
                </div>
                <div className="size-list sizes">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      className={selectedSize === s ? "active" : ""}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Wishlist */}
            <div className="option-wrapper qty-fav-row">
              <div className="qty-block">
                <div className="option-title">Quantity</div>
                <div className="quantity-picker">
                  <button onClick={() => setQty((prev) => Math.max(1, prev - 1))}>-</button>
                  <span id="qty">{qty}</span>
                  <button onClick={() => setQty((prev) => prev + 1)}>+</button>
                </div>
              </div>
              <button
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                id="favBtn"
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Add to Wishlist"
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="desktop-buy-actions">
              <button className="action-btn btn-add-cart cart-btn-action" onClick={handleAddToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Add To Cart
              </button>
              <button className="action-btn btn-buy-now buy-btn-action" onClick={handleBuyNow}>
                ⚡ Buy Now
              </button>
            </div>

            {/* Trust Features */}
            <div className="trust-grid reveal-up">
              <div className="trust-item">
                <span className="trust-icon">🚚</span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay after receiving product</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✨</span>
                <div>
                  <strong>100% Original</strong>
                  <p>Premium Fabric & Finish</p>
                </div>
              </div>
              <div className="trust-item">
                <span className="trust-icon">🔄</span>
                <div>
                  <strong>3 Days Return</strong>
                  <p>Hassle-free replacement</p>
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="product-meta">
              <div className="meta-row">
                <p><span>SKU:</span> <strong id="sku">{productId}</strong></p>
                <p><span>Category:</span> <strong id="tags">{product.category || "General"}</strong></p>
              </div>
              <div className="share-box">
                <span>Share:</span>
                <a href="#" className="share-link" onClick={(e) => handleShare("facebook", e)}>📘 Facebook</a>
                <a href="#" className="share-link" onClick={(e) => handleShare("whatsapp", e)}>💬 WhatsApp</a>
                <a href="#" className="share-link" onClick={(e) => handleShare("copy", e)}>🔗 Copy Link</a>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ======== TABS & REVIEWS ======== */}
      <section className="tabs-area reveal-up">
        <div className="nav-container">
          <div className="tabs-wrapper">

            <div className="tabs-content-area">
              <div className="tab-header-buttons">
                <button
                  className={`tab-btn ${activeTab === "descText" ? "active" : ""}`}
                  onClick={() => setActiveTab("descText")}
                >
                  Description
                </button>
                <button
                  className={`tab-btn ${activeTab === "infoText" ? "active" : ""}`}
                  onClick={() => setActiveTab("infoText")}
                >
                  Shipping & Info
                </button>
                <button
                  className={`tab-btn ${activeTab === "reviewContent" ? "active" : ""}`}
                  onClick={() => setActiveTab("reviewContent")}
                >
                  Customer Reviews
                </button>
              </div>

              <div className={`tab-pane descText ${activeTab === "descText" ? "active" : ""}`} id="descText">
                {product.description || "No description provided."}
              </div>

              <div className={`tab-pane infoText ${activeTab === "infoText" ? "active" : ""}`} id="infoText">
                {product.sub || product.info || "100% Satisfaction & Quality Check Guaranteed."}
              </div>

              <div className={`tab-pane reviewContent ${activeTab === "reviewContent" ? "active" : ""}`} id="reviewContent">
                <div className="review-top-bar">
                  <h3>Reviews & Ratings</h3>
                  <button onClick={() => setShowReviewBox(!showReviewBox)} className="write-review-btn">
                    + Write Review
                  </button>
                </div>

                {/* Review Form */}
                {showReviewBox && (
                  <form id="reviewBox" className="review-form" onSubmit={submitReview}>
                    <h4>Write Your Review</h4>
                    <div className="star-rating-picker" id="starSelect">
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
                      placeholder="Share details of your experience with this product..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />
                    <button type="submit" className="submit-review-btn">Submit Review</button>
                  </form>
                )}

                <div id="reviewsList" className="reviews-feed">
                  {reviews.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "20px", color: "var(--text-dim)" }}>
                      এখনো কোনো রিভিউ নেই। প্রথম রিভিউটি দিন!
                    </p>
                  ) : (
                    reviews.map((r, i) => (
                      <div key={r.id || i} className="review">
                        <div className="rev-top">
                          <span>{r.name || "Anonymous"}</span>
                          <span className="stars-gold">
                            {"★".repeat(r.rating || 5)}{"☆".repeat(5 - (r.rating || 5))}
                          </span>
                        </div>
                        <div className="rev-text">{r.text || ""}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Rating Summary */}
            <aside className="rating-sidebar">
              <div className="summary-card">
                <div className="score-display" id="summaryScore">
                  {reviewCount > 0 ? avgRating : "–"}
                </div>
                <div className="stars-gold" id="summaryStars">{starsString}</div>
                <div className="review-count" id="summaryCount">
                  {reviewCount > 0 ? `(${reviewCount} Reviews)` : "No reviews yet"}
                </div>
              </div>

              <div className="support-card">
                <h4>Need Assistance?</h4>
                <p>Have questions about size or fabric? Contact our team on WhatsApp.</p>
                <a href="https://wa.me/8801762923318" target="_blank" rel="noopener noreferrer" className="whatsapp-btn">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </aside>

          </div>
        </div>
      </section>

      {/* ======== RELATED PRODUCTS ======== */}
      {relatedProducts.length > 0 && (
        <section className="related-area reveal-up">
          <div className="nav-container">
            <div className="section-heading">
              <span className="sub-title">RECOMMENDED FOR YOU</span>
              <h2>Related Products</h2>
            </div>
            <div className="related-slider">
              <div className="related-track" id="relatedTrack">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="related-card"
                    onClick={() => { window.location.href = `/details/${p.id}`; }}
                  >
                    <Image
                      src={optimizeImg(p.images?.[0] || "", 300)}
                      alt={p.name}
                      width={250}
                      height={250}
                      unoptimized
                    />
                    <div className="related-card-body">
                      <h4>{p.name}</h4>
                      <p>৳{p.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======== MOBILE FIXED BOTTOM ACTION BAR ======== */}
      <div className="mobile-sticky-bar">
        <div className="mobile-price">
          <span className="m-price-label">Total Price</span>
          <span className="m-price-val" id="stickyBarPrice">৳{product.price * qty}</span>
        </div>
        <div className="mobile-btns">
          <button className="m-btn btn-cart cart-btn-action" onClick={handleAddToCart}>Add To Cart</button>
          <button className="m-btn btn-buy buy-btn-action" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </div>

      {/* ======== SIZE CHART MODAL ======== */}
      {showSizeChart && (
        <div id="sizeChartModal" className="modal-overlay" style={{ display: "flex" }}>
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowSizeChart(false)}>&times;</button>
            <h3 id="sizeChartTitle">{SIZE_CHARTS[chartType].title}</h3>
            <div className="table-responsive">
              <table className="size-table">
                <thead>
                  <tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th><th>Shoulder (in)</th></tr>
                </thead>
                <tbody id="sizeChartBody">
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
        </div>
      )}

      {/* ======== LIGHTBOX IMAGE VIEWER ======== */}
      {zoomImg && (
        <div id="imgViewer" className="modal-overlay" style={{ display: "flex" }} onClick={() => setZoomImg(null)}>
          <Image id="viewerImg" className="lightbox-img" src={zoomImg} alt="Enlarged view" width={1000} height={1000} unoptimized />
        </div>
      )}

      {/* ======== FOOTER ======== */}
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
              <h4>SHOP</h4>
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
