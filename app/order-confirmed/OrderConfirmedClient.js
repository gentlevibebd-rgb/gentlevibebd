'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function OrderConfirmedClient() {
  const [order, setOrder] = useState(null);
  const [displayId, setDisplayId] = useState("#GVB-000000");

  const generateOrderId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "#GVB-";
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const formatDateTime = (dateStr) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    };
    return d.toLocaleString("en-BD", options);
  };

  const typewriteId = (finalText) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#-";
    let frame = 0;
    const duration = 800;
    const totalFrames = Math.floor(duration / 50);

    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        setDisplayId(finalText);
        clearInterval(interval);
        return;
      }
      const scrambled = finalText.split("").map((ch, i) => {
        if (ch === "#" || ch === "-" || i < 4) return ch;
        return frame / totalFrames > i / finalText.length
          ? ch
          : chars.charAt(Math.floor(Math.random() * chars.length));
      }).join("");

      setDisplayId(scrambled);
      frame++;
    }, 50);
  };

  useEffect(() => {
    let orderData = null;

    try {
      const raw = localStorage.getItem("gvb_last_order") || localStorage.getItem("last_order");
      if (raw) orderData = JSON.parse(raw);
    } catch (e) {
      console.warn("Could not read order data from localStorage.");
    }

    if (!orderData) {
      const newId = generateOrderId();
      orderData = {
        id: newId,
        name: "Customer",
        address: "Rangpur, Bangladesh",
        payment: "Cash on Delivery",
        total: "৳1,050",
        createdAt: new Date().toISOString(),
        items: [
          {
            name: "Premium Watch + Polo Combo",
            qty: 1,
            size: "M",
            price: "৳1,050",
            img: "https://www.gentlevibebd.com/545sd4fdsf54.webp"
          }
        ]
      };
    }

    if (!orderData.id) {
      orderData.id = generateOrderId();
    }

    setOrder(orderData);

    try {
      localStorage.setItem("gvb_last_order", JSON.stringify(orderData));
    } catch (e) {}

    setTimeout(() => {
      typewriteId(orderData.id);
    }, 400);

    try {
      localStorage.removeItem("cart");
      localStorage.removeItem("gvb_cart");
    } catch (e) {}

    // Particles Animation
    const pContainer = document.getElementById("particles");
    if (pContainer && pContainer.childElementCount === 0) {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        const size = Math.random() * 4 + 1;
        const left = Math.random() * 100;
        const dur = Math.random() * 15 + 10;
        const delay = Math.random() * 10;

        p.style.cssText = `
          width: ${size}px;
          height: ${size}px;
          left: ${left}%;
          bottom: -10px;
          animation-duration: ${dur}s;
          animation-delay: ${delay}s;
          opacity: ${Math.random() * 0.4 + 0.1};
        `;
        pContainer.appendChild(p);
      }
    }

    // Dynamic Confetti Burst
    const launchConfetti = () => {
      const colors = ["#c9a84c", "#e8c96e", "#f7edd6", "#ffffff", "#4caf50", "#fff9e6"];
      const shapes = ["square", "circle", "rect"];
      const count = 90;

      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          const el = document.createElement("div");
          el.className = "confetti-piece";
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const size = Math.random() * 8 + 6;
          const dur = Math.random() * 2.5 + 2;
          const left = Math.random() * 100;
          const delay = Math.random() * 0.5;

          el.style.cssText = `
            position: fixed;
            top: -20px;
            left: ${left}vw;
            width: ${shape === "rect" ? size * 2 : size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape === "circle" ? "50%" : "2px"};
            animation: confettiFall ${dur}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s forwards;
            z-index: 999999;
            pointer-events: none;
          `;

          document.body.appendChild(el);
          setTimeout(() => el.remove(), (dur + delay + 1) * 1000);
        }, i * 20);
      }
    };

    const confettiTimer = setTimeout(launchConfetti, 400);

    const titleInterval = setInterval(() => {
      document.title = document.title.includes("✅")
        ? "🎉 Thank You! — Gentle Vibe BD"
        : "✅ Order Confirmed — Gentle Vibe BD";
    }, 3000);

    return () => {
      clearTimeout(confettiTimer);
      clearInterval(titleInterval);
    };
  }, []);

  useEffect(() => {
    if (!order) return;

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

        if (order.id && !sessionStorage.getItem("purchase_fired_" + order.id)) {
          const numericTotal = parseFloat(String(order.total).replace(/[^\d.]/g, "")) || 0;
          window.fbq("track", "Purchase", {
            value: numericTotal,
            currency: "BDT",
            content_ids: (order.items || []).map(i => i.name),
            content_type: "product",
            num_items: (order.items || []).reduce((s, i) => s + (i.qty || 1), 0)
          });
          sessionStorage.setItem("purchase_fired_" + order.id, "1");
        }
      }, 3000);
    }

    if (document.readyState === "complete") loadPixel();
    else {
      window.addEventListener("load", loadPixel);
      return () => window.removeEventListener("load", loadPixel);
    }
  }, [order]);

  const cleanOrderId = order?.id ? String(order.id).replace(/^#/, "") : "";
  const waMessage = encodeURIComponent(
    `হ্যালো Gentle Vibe BD! আমার অর্ডার সম্পর্কে জানতে চাই।\n` +
    `Order ID: ${order?.id || ""}\n` +
    `নাম: ${order?.name || ""}`
  );

  return (
    <div className="order-confirmed-wrapper">
      {/* Particles Background */}
      <div className="particles" id="particles"></div>

      {/* Header */}
      <header className="header">
        <a href="/" className="logo">
          <Image
            src="https://www.gentlevibebd.com/545sd4fdsf54.webp"
            alt="Gentle Vibe BD Logo"
            width={40}
            height={40}
            unoptimized
          />
          <span>Gentle Vibe <em>BD</em></span>
        </a>
      </header>

      {/* Main Content */}
      <main className="order-confirmed-main">

        {/* Success Icon */}
        <div className="icon-wrap">
          <div className="circle-outer">
            <div className="circle-inner">
              <svg className="checkmark" viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="heading-block">
          <p className="eyebrow">ধন্যবাদ আপনার অর্ডারের জন্য!</p>
          <h1 className="title">Order Confirmed</h1>
          <p className="subtitle">
            আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।<br/>
            শীঘ্রই আমরা আপনার সাথে যোগাযোগ করব।
          </p>
        </div>

        {/* Order Card */}
        <div className="order-card" id="orderCard">
          <div className="order-card-header">
            <span className="order-label">Order ID</span>
            <span className="order-id" id="orderId">{displayId}</span>
          </div>

          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">📦 Status</span>
              <span className="detail-value status-badge">Processing</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">🚚 Delivery</span>
              <span className="detail-value">১–৩ কার্যদিবস</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">💳 Payment</span>
              <span className="detail-value" id="paymentMethod">{order?.payment || "Cash on Delivery"}</span>
            </div>
            <div className="detail-row" id="deliveryRow">
              <span className="detail-label">📍 Address</span>
              <span className="detail-value" id="deliveryAddress">{order?.address || "—"}</span>
            </div>
            <div className="detail-row" id="totalRow">
              <span className="detail-label">💰 Total</span>
              <span className="detail-value total-amount" id="totalAmount">{order?.total || "—"}</span>
            </div>
          </div>

          {/* Items */}
          {order?.items && order.items.length > 0 && (
            <div className="items-section" id="itemsSection">
              <p className="items-label">Your Items</p>
              <div className="items-list" id="itemsList">
                {order.items.map((item, idx) => (
                  <div key={idx} className="item-row">
                    <Image
                      className="item-img"
                      src={item.img || item.image || "https://www.gentlevibebd.com/545sd4fdsf54.webp"}
                      alt={item.name || "Product"}
                      width={50}
                      height={50}
                      unoptimized
                    />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-meta">
                        Qty: {item.qty || 1}
                        {item.size ? ` · Size: ${item.size}` : ""}
                        {item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <span className="item-price">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="timeline">
          <div className="timeline-item active">
            <div className="timeline-dot"></div>
            <div className="timeline-text">
              <strong>Order Placed</strong>
              <span id="orderTime">{formatDateTime(order?.createdAt)}</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-text">
              <strong>Processing</strong>
              <span>১–২ কার্যদিবস</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-text">
              <strong>Shipped</strong>
              <span>Courier-এ পাঠানো হবে</span>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-text">
              <strong>Delivered</strong>
              <span>আপনার দোরগোড়ায়</span>
            </div>
          </div>
        </div>

        {/* Contact Box */}
        <div className="contact-box">
          <p className="contact-title">কোনো সাহায্য দরকার?</p>
          <div className="contact-links">
            <a
              href={`https://wa.me/8801762923318?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L0 24l6.335-1.508A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.017-1.374l-.36-.213-3.753.893.928-3.653-.233-.374A9.818 9.818 0 1112 21.818z"/></svg>
              WhatsApp
            </a>
            <a href="mailto:gentlevibebd@gmail.com" className="contact-btn email">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
              Email
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61587086211874"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-btn facebook"
            >
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="cta-buttons">
          <a href="/products" className="btn-primary">
            আরও কেনাকাটা করুন
          </a>
          <Link href={`/track?id=${encodeURIComponent(cleanOrderId)}`} className="btn-secondary" id="trackOrderBtn">
            📦 Track Order
          </Link>
          <button className="btn-secondary" onClick={() => window.print()}>
            🖨️ Invoice Print
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 Gentle Vibe BD. Made with ♥ in Bangladesh</p>
        <p>📍 R.K Road, Rangpur, Bangladesh</p>
      </footer>
    </div>
  );
}
