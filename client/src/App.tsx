import { Switch, Route, Router } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/components/providers/auth-provider";

// Guest pages
import Login from "./pages/login";
import GuestHome from "./pages/guest/home";
import Movies from "./pages/guest/movies";
import Series from "./pages/guest/series";
import Voting from "./pages/guest/voting";
import LiveStream from "./pages/guest/live-stream";
import MediaDetail from "./pages/guest/media-detail";

// Admin pages
import Dashboard from "./pages/admin/dashboard";
import Content from "./pages/admin/content";
import AdminLiveStreams from "./pages/admin/live-streams";
import AdminVoting from "./pages/admin/voting";
import Advertisements from "./pages/admin/advertisements";
import Users from "./pages/admin/users";
import Settings from "./pages/admin/settings";

// Not found
import NotFound from "@/pages/not-found";

function AppRoutes() {
  return (
    <Switch>
      {/* Auth */}
      <Route path="/login" component={Login} />
      
      {/* Guest Interface */}
      <Route path="/" component={GuestHome} />
      <Route path="/movies" component={Movies} />
      <Route path="/series" component={Series} />
      <Route path="/voting" component={Voting} />
      <Route path="/live-stream" component={LiveStream} />
      <Route path="/media/:id" component={MediaDetail} />

      {/* Admin Interface */}
      <Route path="/admin" component={Dashboard} />
      <Route path="/admin/content" component={Content} />
      <Route path="/admin/live-streams" component={AdminLiveStreams} />
      <Route path="/admin/voting" component={AdminVoting} />
      <Route path="/admin/advertisements" component={Advertisements} />
      <Route path="/admin/users" component={Users} />
      <Route path="/admin/settings" component={Settings} />

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
