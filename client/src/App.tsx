import { Switch, Route, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useAuth } from "@/lib/auth";
import { ReactNode, useEffect } from "react";
import { AnimationProvider, AnimatedSwitch, AnimatedRoute } from "@/components/providers/animation-provider";

// Guest pages
import GuestHome from "./pages/guest/home";
import Movies from "./pages/guest/movies";
import Series from "./pages/guest/series";
import Voting from "./pages/guest/voting";
import LiveStream from "./pages/guest/live-stream";
import MediaDetail from "./pages/guest/media-detail";
import VideoPlayerTest from "./pages/guest/video-player-test";

// Admin pages
import Dashboard from "./pages/admin/dashboard";
import Content from "./pages/admin/content";
import Categories from "./pages/admin/categories";
import AdminLiveStreams from "./pages/admin/live-streams";
import AdminVoting from "./pages/admin/voting";
import Advertisements from "./pages/admin/advertisements";
import Users from "./pages/admin/users";
import Settings from "./pages/admin/settings";

// Not found
import NotFound from "@/pages/not-found";

// Protected route component for admin routes
interface AdminRouteProps {
  component: React.ComponentType<any>;
  path?: string;
}

function AdminRoute({ component: Component, ...rest }: AdminRouteProps) {
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isAdmin) {
      navigate('/', { replace: true });
    }
  }, [isAdmin, navigate]);
  
  return isAdmin ? <Component {...rest} /> : null;
}

// Animated admin route
interface AnimatedAdminRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

function AnimatedAdminRoute({ path, component }: AnimatedAdminRouteProps) {
  return (
    <Route path={path}>
      {(params) => <AdminRoute component={component} {...params} />}
    </Route>
  );
}

function AppRoutes() {
  return (
    <AnimatedSwitch>
      {/* Guest Interface */}
      <AnimatedRoute path="/" component={GuestHome} />
      <AnimatedRoute path="/movies" component={Movies} />
      <AnimatedRoute path="/series" component={Series} />
      <AnimatedRoute path="/voting" component={Voting} />
      <AnimatedRoute path="/live-stream" component={LiveStream} />
      <AnimatedRoute path="/media/:id" component={MediaDetail} />
      <AnimatedRoute path="/video-test" component={VideoPlayerTest} />

      {/* Admin Interface */}
      <AnimatedAdminRoute path="/admin" component={Dashboard} />
      <AnimatedAdminRoute path="/admin/content" component={Content} />
      <AnimatedAdminRoute path="/admin/categories" component={Categories} />
      <AnimatedAdminRoute path="/admin/live-streams" component={AdminLiveStreams} />
      <AnimatedAdminRoute path="/admin/voting" component={AdminVoting} />
      <AnimatedAdminRoute path="/admin/advertisements" component={Advertisements} />
      <AnimatedAdminRoute path="/admin/users" component={Users} />
      <AnimatedAdminRoute path="/admin/settings" component={Settings} />

      {/* Fallback to 404 */}
      <AnimatedRoute path="*" component={NotFound} />
    </AnimatedSwitch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
