import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductsClient from "./ProductsClient";
import "./products.css";

export const metadata = {
  title: "Shop — Gentle Vibe BD",
  description:
    "Premium fashion, watches & accessories — curated for you. Shop T-shirts, watches, wallets, sunglasses and combo deals at Gentle Vibe BD.",
};

// Enable ISR: Background revalidation every 60 seconds
export const revalidate = 60;

const CAT_MAP = {
  tshirt: "tshirt",
  watch: "watch",
  wallet: "wallet",
  sunglass: "sunglass",
  sunglasses: "sunglass",
  combo: "combo",
};

async function getProductsData() {
  try {
    const [prodSnap, stockSnap, catSnap] = await Promise.all([
      getDocs(collection(db, "products")),
      getDocs(collection(db, "stock")),
      getDocs(query(collection(db, "categories"), orderBy("order"))),
    ]);

    const stockMap = {};
    stockSnap.docs.forEach((d) => {
      stockMap[d.id] = d.data().inStock !== false;
    });

    const products = prodSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.active !== false)
      .sort((a, b) => {
        const aNew = a.createdAt || 0;
        const bNew = b.createdAt || 0;
        if (aNew && bNew) return bNew - aNew;
        if (aNew && !bNew) return -1;
        if (!aNew && bNew) return 1;
        return Number(a.id) - Number(b.id);
      });

    const categories = catSnap.docs
      .map((d) => d.data())
      .filter((c) => c.id !== "all");

    return { products, stockMap, categories };
  } catch (err) {
    console.error("Firestore fetch error (products page):", err);
    return { products: [], stockMap: {}, categories: [] };
  }
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const { products, stockMap, categories } = await getProductsData();
  const initialCatParam = resolvedSearchParams?.cat || "all";

  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedStockMap = JSON.parse(JSON.stringify(stockMap));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <ProductsClient
      initialProducts={serializedProducts}
      initialStockMap={serializedStockMap}
      initialCategories={serializedCategories}
      initialCatParam={initialCatParam}
      catMap={CAT_MAP}
    />
  );
}
