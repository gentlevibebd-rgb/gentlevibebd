import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
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

  if (id) {
    try {
      // Instant Fast Parallel Fetch for Product & Stock
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
    } catch (err) {
      console.error("Firestore Fast Load Error:", err);
    }
  }

  const serializedProduct = product ? JSON.parse(JSON.stringify(product)) : null;

  return (
    <DetailsClient
      productId={id}
      initialProduct={serializedProduct}
      initialInStock={inStock}
    />
  );
}
