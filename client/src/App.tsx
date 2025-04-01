import { Switch, Route, Router, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/components/providers/auth-provider";
import { useAuth } from "@/lib/auth";
import { ReactNode, useEffect } from "react";

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

function AppRoutes() {
  return (
    <Switch>
      {/* Guest Interface */}
      <Route path="/" component={GuestHome} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/voting" component={Voting} />
      <Route path="/live-stream" component={LiveStream} />
      <Route path="/media/:id" component={MediaDetail} />
      <Route path="/video-test" component={VideoPlayerTest} />

      {/* Admin Interface */}
      <Route path="/admin">
        {(params) => <AdminRoute component={Dashboard} {...params} />}
      </Route>
      <Route path="/admin/content">
        {(params) => <AdminRoute component={Content} {...params} />}
      </Route>
      <Route path="/admin/categories">
        {(params) => <AdminRoute component={Categories} {...params} />}
      </Route>
      <Route path="/admin/live-streams">
        {(params) => <AdminRoute component={AdminLiveStreams} {...params} />}
      </Route>
      <Route path="/admin/voting">
        {(params) => <AdminRoute component={AdminVoting} {...params} />}
      </Route>
      <Route path="/admin/advertisements">
        {(params) => <AdminRoute component={Advertisements} {...params} />}
      </Route>
      <Route path="/admin/users">
        {(params) => <AdminRoute component={Users} {...params} />}
      </Route>
      <Route path="/admin/settings">
        {(params) => <AdminRoute component={Settings} {...params} />}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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
