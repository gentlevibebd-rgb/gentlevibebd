import './style.css';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import SplashScreen from './SplashScreen';

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
        {/* Instant 0ms First-Visit Check in head BEFORE body renders */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (!sessionStorage.getItem('gvb_splash_seen')) {
                  document.documentElement.classList.add('gvb-first-visit');
                }
              } catch(e) {}
            `
          }}
        />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable}`}>
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
