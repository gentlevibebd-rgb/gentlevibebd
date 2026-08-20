"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { collection, doc, setDoc, runTransaction, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const FREE_DELIVERY_MIN = 2000;
const BKASH_NUMBER = "01762923318";
const NAGAD_NUMBER = "01762923318";
const ROCKET_NUMBER = "01762923318";

export default function CheckoutClient() {
  const pathname = usePathname();
  const router = useRouter();
  const paymentBoxRef = useRef(null);

  // ---------- navbar / layout state ----------
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ---------- cart + shipping ----------
  const [cart, setCart] = useState([]);
  const [shipping, setShipping] = useState(null); // Unselected by default
  const [loaded, setLoaded] = useState(false);

  // ---------- form fields ----------
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [orderNote, setOrderNote] = useState("");

  // ---------- payment ----------
  const [paymentDropdownOpen, setPaymentDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [onlineMethod, setOnlineMethod] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");

  // ---------- errors ----------
  const [phoneError, setPhoneError] = useState(false);
  const [senderError, setSenderError] = useState(false);
  const [trxError, setTrxError] = useState(false);
  const [trxDuplicateError, setTrxDuplicateError] = useState(false);

  // ---------- order state ----------
  const [orderMsg, setOrderMsg] = useState({ text: "", color: "" });
  const [processing, setProcessing] = useState(false);
  const [btnText, setBtnText] = useState("Confirm Order");

  // ---------- load cart + shipping ----------
  useEffect(() => {
    try {
      const data = localStorage.getItem("cart");
      const parsed = data ? JSON.parse(data) : [];
      setCart(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setCart([]);
    }

    const savedShipping = localStorage.getItem("shipping");
    if (savedShipping === "60" || savedShipping === "120") {
      setShipping(savedShipping);
    } else {
      setShipping(null);
    }
    setLoaded(true);
  }, []);

  // ---------- navbar scroll ----------
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 30);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ---------- close payment dropdown on outside click ----------
  useEffect(() => {
    function onDocClick(e) {
      if (paymentBoxRef.current && !paymentBoxRef.current.contains(e.target)) {
        setPaymentDropdownOpen(false);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // ---------- Facebook Pixel ----------
  useEffect(() => {
    function loadPixel() {
      setTimeout(() => {
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
      }, 3000);
    }
    if (document.readyState === "complete") {
      loadPixel();
    } else {
      window.addEventListener("load", loadPixel);
      return () => window.removeEventListener("load", loadPixel);
    }
  }, []);

  // ---------- cart mutation helpers ----------
  function saveCart(next) {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function changeQty(index, delta) {
    const next = [...cart];
    next[index] = { ...next[index], qty: next[index].qty + delta };
    if (next[index].qty <= 0) {
      next.splice(index, 1);
    }
    saveCart(next);
  }

  function removeItem(index) {
    const next = [...cart];
    next.splice(index, 1);
    saveCart(next);
  }

  function handleShippingChange(value) {
    setShipping(value);
    localStorage.setItem("shipping", value);
  }

  // ---------- computed totals ----------
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const isFree = subtotal >= FREE_DELIVERY_MIN;
  const baseShipping = (shipping === "60" || shipping === "120") ? parseInt(shipping, 10) : 0;
  const shippingCost = isFree ? 0 : baseShipping;
  const total = subtotal + shippingCost;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const bagCountLabel = cart.length + (cart.length === 1 ? " item" : " items");

  // ---------- payment dropdown ----------
  function togglePayment() {
    setPaymentDropdownOpen((o) => !o);
  }

  function selectPayment(value) {
    setPaymentMethod(value);
    setPaymentDropdownOpen(false);
  }

  function handleOnlineMethodChange(value) {
    setOnlineMethod(value);
  }

  const onlineNumbers = { bkash: BKASH_NUMBER, Nagad: NAGAD_NUMBER, Rocket: ROCKET_NUMBER };
  const onlineLabels = { bkash: "Bkash", Nagad: "Nagad", Rocket: "Rocket" };

  const paymentText = useMemo(() => {
    if (!onlineMethod || !onlineNumbers[onlineMethod]) return "";
    return `📌 Send money to: ${onlineNumbers[onlineMethod]} (${onlineLabels[onlineMethod]}) | 💰 Amount: ৳${total} — অর্ডার নিশ্চিত করার আগে পেমেন্ট সম্পন্ন করুন। পেমেন্টের পর আপনার ${onlineLabels[onlineMethod]} TRX ID ও Sender Number দিয়ে confirm করুন।`;
  }, [onlineMethod, total]);

  // ---------- place order ----------
  async function placeOrder() {
    setOrderMsg({ text: "", color: "" });

    // 1. Strict Delivery Area Check
    if (!isFree && shipping !== "60" && shipping !== "120") {
      setOrderMsg({ text: "⚠️ অনুগ্রহ করে ডেলিভারি এরিয়া সিলেক্ট করুন (রংপুরের ভেতরে বা বাইরে)!", color: "#c0392b" });
      const block = document.getElementById("shippingOptions");
      if (block) {
        block.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();
    const trimmedEmail = email.trim();
    const trimmedNote = orderNote.trim();

    if (!trimmedName || !trimmedPhone || !trimmedAddress) {
      setOrderMsg({ text: "❌ নাম, ফোন এবং ঠিকানা দেওয়া আবশ্যক!", color: "#c0392b" });
      return;
    }

    if (!/^01[3-9][0-9]{8}$/.test(trimmedPhone)) {
      setPhoneError(true);
      setOrderMsg({ text: "❌ সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)", color: "#c0392b" });
      return;
    }
    setPhoneError(false);

    if (!paymentMethod) {
      setOrderMsg({ text: "❌ Payment method সিলেক্ট করুন!", color: "#c0392b" });
      return;
    }

    if (!cart || cart.length === 0) {
      setOrderMsg({ text: "🛒 কোনো প্রোডাক্ট সিলেক্ট করা হয়নি!", color: "#c0392b" });
      return;
    }

    let trxVal = "";
    let senderVal = "";

    if (paymentMethod === "Online Payment") {
      trxVal = trxId.trim();
      senderVal = senderNumber.trim();

      setSenderError(false);
      setTrxError(false);
      setTrxDuplicateError(false);

      if (!onlineMethod) {
        setOrderMsg({ text: "❌ Bkash / Nagad / Rocket সিলেক্ট করুন!", color: "#c0392b" });
        return;
      }

      let valid = true;

      if (!/^01[3-9][0-9]{8}$/.test(senderVal)) {
        setSenderError(true);
        valid = false;
      }

      if (!/^[A-Za-z0-9]{8,12}$/.test(trxVal)) {
        setTrxError(true);
        valid = false;
      }

      if (!valid) return;

      try {
        const trxQuery = query(collection(db, "orders"), where("trxId", "==", trxVal));
        const trxSnapshot = await getDocs(trxQuery);
        if (!trxSnapshot.empty) {
          setTrxDuplicateError(true);
          setOrderMsg({ text: "❌ এই TRX ID আগে ব্যবহার করা হয়েছে! নতুন TRX ID দিন।", color: "#c0392b" });
          return;
        }
      } catch (checkErr) {
        console.error("TRX layer-1 check error:", checkErr);
      }
    }

    setBtnText("Processing…");
    setProcessing(true);

    const finalSubtotal = subtotal;
    const finalIsFree = finalSubtotal >= FREE_DELIVERY_MIN;
    const finalBaseShipping = baseShipping;
    const finalShippingCost = finalIsFree ? 0 : finalBaseShipping;
    const finalTotal = finalSubtotal + finalShippingCost;
    const shippingLabel = finalIsFree ? "Free" : finalBaseShipping === 120 ? "Outside Rangpur" : "Inside Rangpur";

    try {
      const orderDate = new Date();
      const dateStr =
        orderDate.getFullYear().toString().slice(2) +
        String(orderDate.getMonth() + 1).padStart(2, "0") +
        String(orderDate.getDate()).padStart(2, "0");
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderId = `GVB-${dateStr}-${random}`;

      if (paymentMethod === "Online Payment" && trxVal) {
        const trxRef = doc(db, "usedTrxIds", trxVal);
        await runTransaction(db, async (transaction) => {
          const trxDoc = await transaction.get(trxRef);
          if (trxDoc.exists()) {
            throw new Error("DUPLICATE_TRX");
          }
          transaction.set(trxRef, {
            trxId: trxVal,
            orderId: orderId,
            usedAt: orderDate,
          });
        });
      }

      let paymentField = paymentMethod;
      if (paymentMethod === "Online Payment" && onlineMethod) {
        paymentField = `${onlineMethod} (${senderVal} / TRX: ${trxVal})`;
      }

      await setDoc(doc(db, "orders", orderId), {
        name: trimmedName,
        phone: trimmedPhone,
        address: trimmedAddress,
        email: trimmedEmail,
        note: trimmedNote,
        payment: paymentField,
        onlineMethod,
        trxId: trxVal,
        sender: senderVal,
        shipping: shippingLabel,
        shippingCost: finalShippingCost,
        freeDelivery: finalIsFree,
        total: finalTotal,
        product: cart.map((i) => i.name).join(", "),
        size: cart.map((i) => i.size).join(", "),
        items: cart,
        status: "pending",
        date: orderDate,
        orderId: orderId,
      });

      if (paymentMethod === "Online Payment") {
        setOrderMsg({ text: `💳 Payment Received! ✅ Order Confirmed 🎉\nOrder ID: ${orderId}`, color: "#1a6b3c" });
      } else {
        setOrderMsg({ text: `✅ Order Confirmed 🎉\nOrder ID: ${orderId}`, color: "#1a6b3c" });
      }

      setBtnText("✔ Done!");

      localStorage.setItem(
        "gvb_last_order",
        JSON.stringify({
          id: "#" + orderId,
          name: trimmedName,
          address: trimmedAddress,
          total: "৳" + finalTotal,
          payment: paymentField,
          createdAt: orderDate.toISOString(),
          items: cart.map((i) => ({
            name: i.name,
            qty: i.qty,
            size: i.size || "",
            price: "৳" + i.price,
            img: i.image || "",
          })),
        })
      );

      setTimeout(() => {
        localStorage.removeItem("cart");
        localStorage.removeItem("shipping");
        window.location.href = "/order-confirmed";
      }, 1000);
    } catch (err) {
      console.error("Order error:", err);

      if (err.message === "DUPLICATE_TRX") {
        setTrxDuplicateError(true);
        setOrderMsg({ text: "❌ এই TRX ID আগে ব্যবহার করা হয়েছে! নতুন TRX ID দিন।", color: "#c0392b" });
      } else {
        setOrderMsg({ text: "❌ Order failed! আবার চেষ্টা করুন। (" + err.message + ")", color: "#c0392b" });
      }

      setBtnText("Confirm Order");
      setProcessing(false);
    }
  }

  const isActive = (href) => (pathname === href ? "active" : "");

  return (
    <>
      {/* NAVBAR */}
      <header className={`navbar${scrolled ? " scrolled" : ""}`} id="navbar">
        <a href="/" className="logo">
          <Image src="/545sd4fdsf54.webp" className="logo-img" alt="Logo" width={36} height={36} unoptimized />
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
          <a className="cart-btn" href="/cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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

      {/* HERO STRIP */}
      <div className="page-hero">
        <p className="page-eyebrow">SECURE CHECKOUT</p>
        <h1 className="page-title">Complete Your Order</h1>
      </div>

      {/* MAIN WRAPPER */}
      <div className="wrapper">
        <div className="checkout-grid">
          {/* LEFT: Cart + Shipping */}
          <div className="col-left">
            <section className="card" id="cartSection">
              <div className="card-header">
                <h2>Your Bag</h2>
                <span className="item-count" id="bagCount">{bagCountLabel}</span>
              </div>
              <div id="cartItems">
                {loaded && cart.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#888880", fontSize: "14px" }}>
                    Your bag is empty.
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div className="cart-item" key={`${item.id}-${item.size || ""}-${index}`}>
                      <Image src={item.image || "/favicon.png"} alt={item.name} width={80} height={80} unoptimized />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-meta">Size: {item.size || "N/A"}</p>
                        <p className="item-price">৳{item.price}</p>
                      </div>
                      <div className="qty-control">
                        <button onClick={() => changeQty(index, -1)} aria-label="Decrease">−</button>
                        <span className="qty-num">{item.qty}</span>
                        <button onClick={() => changeQty(index, 1)} aria-label="Increase">+</button>
                      </div>
                      <div className="remove-btn" onClick={() => removeItem(index)} title="Remove">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="card shipping-card">
              <div className="card-header">
                <h2>Select Delivery Area *</h2>
              </div>
              <div className="shipping-options" id="shippingOptions">
                <label
                  className="shipping-option"
                  id="shOpt1"
                  style={isFree ? { opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" } : {}}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="60"
                    checked={shipping === "60"}
                    onChange={(e) => handleShippingChange(e.target.value)}
                  />
                  <div className="ship-info">
                    <strong>রংপুর জেলার ভেতরে</strong>
                    <span>Standard delivery</span>
                  </div>
                  <span className="ship-price">24 Hours</span>
                </label>
                <label
                  className="shipping-option"
                  id="shOpt2"
                  style={isFree ? { opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" } : {}}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value="120"
                    checked={shipping === "120"}
                    onChange={(e) => handleShippingChange(e.target.value)}
                  />
                  <div className="ship-info">
                    <strong>রংপুর জেলার বাইরে</strong>
                    <span>Standard delivery</span>
                  </div>
                  <span className="ship-price">2-3 Days</span>
                </label>
              </div>
              <div className="free-ship-note" id="freeShipNote" style={{ display: isFree ? "flex" : "none" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12l5 5L20 7" />
                </svg>
                🎁 অভিনন্দন! আপনি ফ্রি ডেলিভারি পেয়েছেন 🎉
              </div>
            </section>
          </div>

          {/* RIGHT: Summary + Form */}
          <div className="col-right">
            <section className="card summary-card">
              <div className="card-header">
                <h2>Order Summary</h2>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span id="subtotalDisplay">৳{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span id="shippingDisplay">
                  {isFree ? (
                    <span className="free-badge">FREE</span>
                  ) : shipping ? (
                    `৳${shipping}`
                  ) : (
                    <span style={{ color: "#c9a84c", fontSize: "12px" }}>সিলেক্ট করুন</span>
                  )}
                </span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>৳<span id="totalPrice">{total}</span></span>
              </div>
            </section>

            <section className="card form-card">
              <div className="card-header">
                <h2>Your Details</h2>
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className={phoneError ? "error" : ""}
                />
              </div>
              <div className="form-group">
                <label>Full Address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, Road, Area, District" />
              </div>
              <div className="form-group">
                <label>Email <span className="optional">(optional)</span></label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>

              {/* PAYMENT */}
              <div className="form-group" ref={paymentBoxRef}>
                <label>Payment Method</label>
                <div className="pay-select-box" onClick={togglePayment}>
                  <span id="selectedPayment">{paymentMethod || "Select Payment"}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
                <div className="pay-options" id="paymentOptions" style={{ display: paymentDropdownOpen ? "block" : "none" }}>
                  <div className="pay-option" onClick={() => selectPayment("Online Payment")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Online Payment
                  </div>
                  <div className="pay-option" onClick={() => selectPayment("Cash on Delivery")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Cash on Delivery
                  </div>
                </div>
              </div>

              {/* ONLINE PAYMENT DETAILS */}
              {paymentMethod === "Online Payment" && (
                <div className="online-pay-box">
                  <select value={onlineMethod} onChange={(e) => handleOnlineMethodChange(e.target.value)}>
                    <option value="">— Select Method —</option>
                    <option value="bkash">Bkash</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Nagad" disabled>Nagad (Unavailable)</option>
                  </select>
                  {paymentText && <p>{paymentText}</p>}
                  <div className="form-group" style={{ marginTop: "12px" }}>
                    <label>Sender Number</label>
                    <input
                      type="text"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className={senderError ? "error" : ""}
                    />
                    {senderError && <small className="field-error">Invalid number</small>}
                  </div>
                  <div className="form-group">
                    <label>Transaction ID</label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value)}
                      placeholder="TRX ID"
                      className={trxError || trxDuplicateError ? "error" : ""}
                    />
                    {trxError && <small className="field-error">Invalid TRX ID</small>}
                    {trxDuplicateError && (
                      <small className="field-error">❌ এই TRX ID আগে ব্যবহার করা হয়েছে। ✅ সঠিক TRX ID দিন!</small>
                    )}
                  </div>
                </div>
              )}

              {/* ORDER NOTE */}
              <div className="form-group">
                <label>Order Note <span className="optional">(optional)</span></label>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder={"কোনো বিশেষ নির্দেশনা থাকলে লিখুন...\nযেমন: রঙ, সাইজ, ডেলিভারি সময় ইত্যাদি"}
                  rows={3}
                ></textarea>
              </div>

              <button id="orderBtn" onClick={placeOrder} className="confirm-btn" disabled={processing}>
                <span id="btnText">{btnText}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>

              <div className="order-msg" style={{ color: orderMsg.color, whiteSpace: "pre-line" }}>
                {orderMsg.text}
              </div>
            </section>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <p>© 2026 Gentle Vibe BD — All rights reserved</p>
      </footer>
    </>
  );
}
