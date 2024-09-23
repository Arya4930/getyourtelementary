import { inter } from '@/app/styles/fonts.js';
import '@/app/styles/styles.css';

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
