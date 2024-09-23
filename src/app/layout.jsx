import { inter } from './styles/fonts.js/index.js';
import '@/app/ui/styles.css';

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
