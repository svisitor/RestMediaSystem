import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Menu, 
  X, 
  Search, 
  LogOut, 
  Settings,
  Home,
  Film,
  Video,
  ThumbsUp,
  Users,
  LayoutDashboard,
  MessageSquare,
  Clock,
  List,
  Bell
} from 'lucide-react';
import i18n from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import LiveStreamBanner from '@/components/live-stream-banner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: ReactNode;
  showLiveStreamBanner?: boolean;
}

export default function AppLayout({ children, showLiveStreamBanner = true }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, isAdmin, logout, login } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Effect to close sidebar when clicking outside of it (on mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location]);

  // Generate navigation links based on user role
  const guestNavLinks = [
    { name: i18n.t('home'), href: '/', icon: <Home className="h-5 w-5 ml-3" /> },
    { name: i18n.t('movies'), href: '/movies', icon: <Film className="h-5 w-5 ml-3" /> },
    { name: i18n.t('series'), href: '/series', icon: <Video className="h-5 w-5 ml-3" /> },
    { name: i18n.t('voting'), href: '/voting', icon: <ThumbsUp className="h-5 w-5 ml-3" /> },
    { name: i18n.t('liveStream'), href: '/live-stream', icon: <Clock className="h-5 w-5 ml-3" /> },
  ];

  const adminNavGroups = isAdmin ? [
    { 
      category: i18n.t('dashboard'),
      items: [
        { name: i18n.t('adminDashboard'), href: '/admin', icon: <LayoutDashboard className="h-5 w-5 ml-3" /> },
      ] 
    },
    { 
      category: i18n.t('content'),
      items: [
        { name: i18n.t('contentManagement'), href: '/admin/content', icon: <Film className="h-5 w-5 ml-3" /> },
        { name: i18n.t('categories'), href: '/admin/categories', icon: <List className="h-5 w-5 ml-3" /> },
        { name: i18n.t('advertisements'), href: '/admin/advertisements', icon: <MessageSquare className="h-5 w-5 ml-3" /> },
      ] 
    },
    { 
      category: i18n.t('liveStream'),
      items: [
        { name: i18n.t('liveStreams'), href: '/admin/live-streams', icon: <Video className="h-5 w-5 ml-3" /> },
        { name: i18n.t('broadcastManagement'), href: '/admin/broadcasts', icon: <Clock className="h-5 w-5 ml-3" /> },
      ] 
    },
    { 
      category: i18n.t('voting'),
      items: [
        { name: i18n.t('votingManagement'), href: '/admin/voting', icon: <ThumbsUp className="h-5 w-5 ml-3" /> },
      ] 
    },
    { 
      category: i18n.t('users'),
      items: [
        { name: i18n.t('userManagement'), href: '/admin/users', icon: <Users className="h-5 w-5 ml-3" /> },
      ] 
    },
    { 
      category: i18n.t('settings'),
      items: [
        { name: i18n.t('systemSettings'), href: '/admin/settings', icon: <Settings className="h-5 w-5 ml-3" /> },
      ] 
    },
  ] : [];
  
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');  // Navigate to home instead of login
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white flex overflow-hidden">
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:relative z-40 w-64 h-screen bg-primary text-white transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">استراحة مانجر</div>
            {isAdmin && <div className="text-sm text-gray-400">{i18n.t('admin')}</div>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-2 overflow-y-auto h-[calc(100vh-4rem)]">
          {!isAdmin && (
            <nav className="space-y-4">
              {guestNavLinks.map((link) => (
                <Link 
                  key={link.href} 
                  to={link.href} 
                  className={`flex items-center px-4 py-2 text-sm ${
                    location === link.href
                      ? 'text-white bg-surface rounded-md font-medium'
                      : 'text-gray-300 hover:bg-surface hover:text-white rounded-md transition'
                  }`}
                >
                  {link.icon}
                  <span className="mr-2">{link.name}</span>
                </Link>
              ))}
            </nav>
          )}

          {isAdmin && (
            <nav className="space-y-4">
              {adminNavGroups.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-2">
                  <div className="text-xs text-gray-400 uppercase px-4 pt-2">{group.category}</div>
                  {group.items.map((item) => (
                    <Link 
                      key={item.href} 
                      to={item.href} 
                      className={`flex items-center px-4 py-2 text-sm ${
                        location === item.href
                          ? 'text-white bg-surface rounded-md font-medium'
                          : 'text-gray-300 hover:bg-surface hover:text-white rounded-md transition'
                      }`}
                    >
                      {item.icon}
                      <span className="mr-2">{item.name}</span>
                    </Link>
                  ))}
                  {groupIndex < adminNavGroups.length - 1 && (
                    <Separator className="my-2 bg-gray-700" />
                  )}
                </div>
              ))}

              <div className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-start text-gray-300 hover:text-white border-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 ml-3" />
                  <span className="mr-2">{i18n.t('logout')}</span>
                </Button>
              </div>
            </nav>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top bar */}
        <header className="bg-primary shadow-lg py-3 px-4 md:px-6 flex items-center justify-between z-30">
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            {/* Show title only on mobile when sidebar is closed */}
            <div className="md:hidden text-xl font-bold text-white">استراحة مانجر</div>
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
            
            {isAdmin && (
              <Button variant="ghost" size="icon" className="text-gray-300">
                <Bell className="h-6 w-6" />
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
                
                <DropdownMenuItem 
                  className="cursor-pointer" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 ml-2" />
                  <span>{i18n.t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Live Stream Banner */}
        {showLiveStreamBanner && !isAdmin && <LiveStreamBanner />}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {children}
        </main>
      </div>
      
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
              className={`${adminLoginError ? 'border-red-500' : ''}`}
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