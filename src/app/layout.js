import './globals.css'

export const metadata = {
  title: 'SideQuest',
  description: 'Begin your adventure',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
