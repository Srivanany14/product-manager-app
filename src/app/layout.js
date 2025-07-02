import './globals.css'

export const metadata = {
  title: 'InventoryPro - Walmart-Style Inventory Management',
  description: 'Professional inventory management system with AI-powered forecasting',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}