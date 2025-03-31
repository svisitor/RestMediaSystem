import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Search } from 'lucide-react';
import i18n from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import LiveStreamBanner from '@/components/live-stream-banner';

interface GuestLayoutProps {
  children: ReactNode;
  showLiveStreamBanner?: boolean;
}

export default function GuestLayout({ children, showLiveStreamBanner = true }: GuestLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  
  const navLinks = [
    { name: i18n.t('home'), href: '/' },
    { name: i18n.t('movies'), href: '/movies' },
    { name: i18n.t('series'), href: '/series' },
    { name: i18n.t('voting'), href: '/voting' },
    { name: i18n.t('liveStream'), href: '/live-stream' },
  ];

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Top Navigation */}
      <nav className="bg-primary shadow-lg py-3 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <Link to="/">
            <div className="text-xl font-bold text-white">استراحة مانجر</div>
          </Link>
          
          <div className="hidden md:flex space-x-6 space-x-reverse">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <a
                  className={`${
                    location === link.href
                      ? 'text-white'
                      : 'text-gray-300 hover:text-secondary'
                  } transition px-2 py-1 rounded-md ${
                    location === link.href ? 'font-medium' : ''
                  }`}
                >
                  {link.name}
                </a>
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          {showSearchInput ? (
            <div className="relative">
              <Input
                type="text"
                placeholder={i18n.t('search')}
                className="w-44 bg-surface-light rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary pr-9"
                autoFocus
                onBlur={() => setShowSearchInput(false)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearchInput(true)}
              className="text-gray-300 hover:text-white md:mr-2"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-700">
                {user?.displayName?.charAt(0) || 'G'}
              </AvatarFallback>
              <AvatarImage src="" />
            </Avatar>
            <span className="hidden md:inline text-sm">
              {i18n.t('greeting')} {user?.displayName || 'زائر'}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-primary border-t border-gray-800 py-2">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href}>
              <a
                className={`block px-4 py-2 ${
                  location === link.href
                    ? 'text-white bg-surface'
                    : 'text-gray-300'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            </Link>
          ))}
        </div>
      )}

      {/* Live Stream Banner */}
      {showLiveStreamBanner && <LiveStreamBanner />}

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
