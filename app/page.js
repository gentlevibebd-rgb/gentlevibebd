import HomeClient from './HomeClient';
import { db } from "@/lib/firebase";
import { collection, getDocs } from 'firebase/firestore';
import './style.css';

export const metadata = {
  title: 'Gentle Vibe BD — Premium Men\'s Fashion',
  description: 'Gentle Vibe BD — Bangladesh\'s premium destination for men\'s T-shirts, shirts, luxury watches, wallets, sunglasses & exclusive combo deals. Free delivery over ৳2000.',
};

async function getProducts() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    const list = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(p => p.active !== false);

    return list.slice(0, 8);
  } catch (e) {
    console.error("Firestore Home Products error:", e);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();
  const serializedProducts = JSON.parse(JSON.stringify(products));

  return <HomeClient products={serializedProducts} />;
}
