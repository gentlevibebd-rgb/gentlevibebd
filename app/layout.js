import './style.css';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Gentle Vibe BD — Premium Men\'s Fashion',
  description: 'Gentle Vibe BD — Bangladesh\'s premium destination for men\'s T-shirts, shirts, luxury watches, wallets, sunglasses & exclusive combo deals. Free delivery over ৳2000.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Gentle Vibe BD",
              "url": "https://www.gentlevibebd.com",
              "logo": "https://www.gentlevibebd.com/545sd4fdsf54.webp",
              "description": "Gentle Vibe BD is a premium men's fashion brand based in Rangpur, Bangladesh. We offer high-quality T-shirts, Casual & Stylish Shirts, Formal Pants, Luxury watches, and exclusive combo deals.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "R.K Road",
                "addressLocality": "Rangpur",
                "addressCountry": "BD"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+8801762923318",
                "contactType": "customer service"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61587086211874",
                "https://www.instagram.com/gentlevibebd2252/"
              ]
            })
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
