import "./products.css";

export default function ProductsLoading() {
  return (
    <>
      {/* Top 3px Glowing Line */}
      <div className="top-progress-line" />

      {/* Centered Our Shop Loading */}
      <div className="shop-loading-center">
        <span className="shop-loading-tag">Gentle Vibe BD</span>
        <h2 className="shop-loading-title">Our <em>Shop</em></h2>
        <div className="shop-loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </>
  );
}
