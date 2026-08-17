import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import DetailsClient from "./DetailsClient";
import "./details.css";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  if (!id) return { title: "Product Details — Gentle Vibe BD" };
  try {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
      const data = snap.data();
      return {
        title: `${data.name || "Product Details"} — Gentle Vibe BD`,
        description: data.description || "Gentle Vibe BD — Premium Men's Fashion",
      };
    }
  } catch (e) {
    console.error("Metadata fetch error:", e);
  }
  return { title: "Product Details — Gentle Vibe BD" };
}

export default async function DetailsPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  let product = null;
  let inStock = true;
  let reviews = [];
  let relatedProducts = [];

  if (id) {
    try {
      const [productSnap, stockSnap, reviewsSnap, allProductsSnap] = await Promise.all([
        getDoc(doc(db, "products", id)),
        getDoc(doc(db, "stock", id)),
        getDocs(collection(db, `reviews_${id}`)),
        getDocs(collection(db, "products"))
      ]);

      if (productSnap.exists()) {
        product = { id: productSnap.id, ...productSnap.data() };
      }

      if (stockSnap.exists()) {
        inStock = stockSnap.data().inStock !== false;
      }

      reviews = reviewsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const allProducts = allProductsSnap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => String(p.id) !== String(id) && p.active !== false);

      const catMatches = product?.category
        ? allProducts.filter(p =>
            (p.category || "").toLowerCase() === (product.category || "").toLowerCase()
          )
        : [];

      relatedProducts = (catMatches.length > 0 ? catMatches : allProducts).slice(0, 6);

    } catch (err) {
      console.error("Firestore Fast Load Error:", err);
    }
  }

  const serializedProduct = product ? JSON.parse(JSON.stringify(product)) : null;
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const serializedRelated = JSON.parse(JSON.stringify(relatedProducts));

  return (
    <DetailsClient
      productId={id}
      initialProduct={serializedProduct}
      initialInStock={inStock}
      initialReviews={serializedReviews}
      initialRelated={serializedRelated}
    />
  );
}
