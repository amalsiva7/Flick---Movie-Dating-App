import { Home, User, CreditCard, Settings, Phone, Info } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: User, label: 'UserProfile', href: '/profile' },
    { icon: CreditCard, label: 'Subscription', href: '/subscription' },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: Phone, label: 'Contact us', href: '/contact' },
    { icon: Info, label: 'About us', href: '/about' },
  ]

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}

