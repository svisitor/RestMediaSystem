import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  Home, 
  Film, 
  Video, 
  ThumbsUp, 
  Users, 
  Settings, 
  Menu, 
  X, 
  LayoutDashboard, 
  MessageSquare,
  Clock,
  LogOut
} from 'lucide-react';
import i18n from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinks = [
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
        { name: i18n.t('advertisements'), href: '/admin/advertisements', icon: <MessageSquare className="h-5 w-5 ml-3" /> },
        { name: i18n.t('liveStreams'), href: '/admin/live-streams', icon: <Video className="h-5 w-5 ml-3" /> },
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
          <nav className="space-y-4">
            {navLinks.map((group, groupIndex) => (
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
                {groupIndex < navLinks.length - 1 && (
                  <Separator className="my-2 bg-gray-700" />
                )}
              </div>
            ))}
            
            <div className="pt-6">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-start text-gray-300 hover:text-white border-gray-700"
                onClick={async () => {
                  try {
                    await logout();
                  } catch (error) {
                    console.error('Logout error:', error);
                  }
                }}
              >
                <LogOut className="h-5 w-5 ml-3" />
                <span className="mr-2">{i18n.t('logout')}</span>
              </Button>
            </div>
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
