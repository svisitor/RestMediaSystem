import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bell, Home, Film, Video, ThumbsUp, Users, Settings, Menu, X } from 'lucide-react';
import i18n from '@/lib/i18n';
import { useAuth } from '@/lib/auth';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
    { name: i18n.t('dashboard'), href: '/admin', icon: <Home className="h-5 w-5 ml-3" /> },
    { name: i18n.t('content'), href: '/admin/content', icon: <Film className="h-5 w-5 ml-3" /> },
    { name: i18n.t('liveStream'), href: '/admin/live-streams', icon: <Video className="h-5 w-5 ml-3" /> },
    { name: i18n.t('voting'), href: '/admin/voting', icon: <ThumbsUp className="h-5 w-5 ml-3" /> },
    { name: i18n.t('users'), href: '/admin/users', icon: <Users className="h-5 w-5 ml-3" /> },
    { name: i18n.t('settings'), href: '/admin/settings', icon: <Settings className="h-5 w-5 ml-3" /> },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar for larger screens */}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-primary text-white flex-shrink-0`}>
        <div className="p-4 border-b border-gray-700">
          <div className="text-xl font-bold">استراحة مانجر</div>
          <div className="text-sm text-gray-400">{i18n.t('admin')}</div>
        </div>
        
        <div className="p-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                <a
                  className={`flex items-center px-4 py-2 ${
                    location === link.href
                      ? 'text-white bg-surface rounded-md'
                      : 'text-gray-300 hover:bg-surface hover:text-white rounded-md transition'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </a>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-primary border-b border-gray-700 flex items-center justify-between p-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <h1 className="text-xl font-semibold">{i18n.t('admin')}</h1>
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button variant="ghost" size="icon" className="text-gray-300">
              <Bell className="h-6 w-6" />
            </Button>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <span className="ml-2 hidden md:inline-block">
                {i18n.t('greeting')} {user?.displayName || i18n.t('admin')}
              </span>
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gray-600">
                  {user?.displayName?.charAt(0) || 'A'}
                </AvatarFallback>
                <AvatarImage src="" />
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
