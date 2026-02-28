export const metadata = {
  title: 'Slides from Code',
  description: 'Production-ready slides maker from HTML/CSS/JS code',
};

import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
