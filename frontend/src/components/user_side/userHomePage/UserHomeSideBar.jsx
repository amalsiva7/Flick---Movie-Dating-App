import { Home, User, CreditCard, Settings, Phone, Info } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: 'Home', path: '/user/home' },
    { icon: User, label: 'UserProfile', path: '/user/profile' },
    { icon: CreditCard, label: 'Subscription', path: '/user/subscription' },
    { icon: Settings, label: 'Settings', path: '/user/settings' },
    { icon: Phone, label: 'Contact us', path: '/user/contact' },
    { icon: Info, label: 'About us', path: '/user/about' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    console.log('NAVIGATE TO', path);
  };

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 cursor-pointer ${
                isActive ? 'bg-gray-100' : ''
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
