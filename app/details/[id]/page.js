import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import DetailsClient from "./DetailsClient";
import "./details.css";

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
  let initialReviews = [];
  let initialRelated = [];

  if (id) {
    try {
      const [productSnap, stockSnap] = await Promise.all([
        getDoc(doc(db, "products", id)),
        getDoc(doc(db, "stock", id))
      ]);

      if (productSnap.exists()) {
        product = { id: productSnap.id, ...productSnap.data() };
      }
      if (stockSnap.exists()) {
        inStock = stockSnap.data().inStock !== false;
      }

      if (product) {
        // Fetch product reviews
        try {
          const revSnap = await getDocs(collection(db, `reviews_${id}`));
          initialReviews = revSnap.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
            };
          });
        } catch (e) {
          console.error("Error fetching reviews:", e);
        }

        // Fetch related products
        if (product.category) {
          try {
            const q = query(
              collection(db, "products"),
              where("category", "==", product.category),
              limit(6)
            );
            const relSnap = await getDocs(q);
            initialRelated = relSnap.docs
              .map(d => ({ id: d.id, ...d.data() }))
              .filter(p => String(p.id) !== String(id));
          } catch (e) {
            console.error("Error fetching related products:", e);
          }
        }
      }
    } catch (err) {
      console.error("Firestore Load Error:", err);
    }
  }

  // Sanitize Firestore Timestamp/Dates for Server-to-Client props serialization
  const serializedProduct = product ? JSON.parse(JSON.stringify(product)) : null;
  const serializedReviews = JSON.parse(JSON.stringify(initialReviews));
  const serializedRelated = JSON.parse(JSON.stringify(initialRelated));

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
