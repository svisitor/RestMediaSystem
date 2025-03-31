import { ReactNode, useState, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Search, LogOut, Settings } from 'lucide-react';
import i18n from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import LiveStreamBanner from '@/components/live-stream-banner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface GuestLayoutProps {
  children: ReactNode;
  showLiveStreamBanner?: boolean;
}

export default function GuestLayout({ children, showLiveStreamBanner = true }: GuestLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, isAdmin, logout, login } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);
  
  // Generate navigation links based on user role
  const baseNavLinks = [
    { name: i18n.t('home'), href: '/' },
    { name: i18n.t('movies'), href: '/movies' },
    { name: i18n.t('series'), href: '/series' },
    { name: i18n.t('voting'), href: '/voting' },
    { name: i18n.t('liveStream'), href: '/live-stream' },
  ];

  // Admin links to show if user is admin
  const adminNavLinks = isAdmin ? [
    { name: i18n.t('adminDashboard'), href: '/admin' },
    { name: i18n.t('content'), href: '/admin/content' },
    { name: i18n.t('liveStreams'), href: '/admin/live-streams' },
    { name: i18n.t('advertisements'), href: '/admin/advertisements' },
    { name: i18n.t('users'), href: '/admin/users' },
    { name: i18n.t('settings'), href: '/admin/settings' },
  ] : [];

  const navLinks = [...baseNavLinks, ...(isAdmin ? adminNavLinks : [])];
  
  const handleAdminLogin = async () => {
    if (adminPassword === '123456') { // Hard-coded admin password as requested
      // Use 'suhail' as the admin username with the password '123456'
      const success = await login('suhail', adminPassword);
      if (success) {
        setAdminDialogOpen(false);
        navigate('/admin'); // Redirect to admin dashboard
      } else {
        setAdminLoginError(true);
      }
    } else {
      setAdminLoginError(true);
    }
  };

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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center space-x-3 space-x-reverse cursor-pointer hover:opacity-80 transition-opacity">
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
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 telegram-fade-in">
              <div className="flex items-center justify-start p-2">
                <Avatar className="h-10 w-10 mr-2">
                  <AvatarFallback className="bg-gray-700">
                    {user?.displayName?.charAt(0) || 'G'}
                  </AvatarFallback>
                  <AvatarImage src="" />
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.displayName || 'زائر'}</span>
                  <span className="text-xs text-gray-400">{user?.username || '-'}</span>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              
              {isAdmin ? (
                <Link to="/admin">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="h-4 w-4 ml-2" />
                    <span>{i18n.t('adminDashboard')}</span>
                  </DropdownMenuItem>
                </Link>
              ) : (
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => setAdminDialogOpen(true)}
                >
                  <Settings className="h-4 w-4 ml-2" />
                  <span>{i18n.t('adminAccess')}</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="cursor-pointer" onClick={logout}>
                <LogOut className="h-4 w-4 ml-2" />
                <span>{i18n.t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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
      
      {/* Admin Login Dialog */}
      <Dialog open={adminDialogOpen} onOpenChange={setAdminDialogOpen}>
        <DialogContent className="sm:max-w-md telegram-fade-in">
          <DialogHeader>
            <DialogTitle className="text-center">{i18n.t('adminAccess')}</DialogTitle>
            <DialogDescription className="text-center">
              {i18n.t('enterAdminPassword')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-4">
            <Input 
              type="password"
              placeholder={i18n.t('password')}
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setAdminLoginError(false);
              }}
              className={`text-black ${adminLoginError ? 'border-red-500' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdminLogin();
                }
              }}
            />
            {adminLoginError && (
              <p className="text-sm text-red-500">{i18n.t('invalidPassword')}</p>
            )}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="secondary"
              onClick={handleAdminLogin}
              className="w-full"
            >
              {i18n.t('login')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
