import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen flex-shrink-0">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FC</span>
            </div>
            <span className="font-semibold text-gray-900">FinCompta</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Jean Dupont</p>
              <p className="text-xs text-gray-500">Expert-comptable</p>
            </div>
          </div>
          <button className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}