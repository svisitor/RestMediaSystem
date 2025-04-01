import { 
  useLocation, 
  useRoute,
  Switch,
  Route as WouterRoute 
} from "wouter";
import { PropsWithChildren, createElement } from "react";
import { AnimatePresence } from "framer-motion";

interface AnimationProviderProps extends PropsWithChildren {
  // Additional props if needed
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  // Get current location for triggering animations on route changes
  const [location] = useLocation();

  return createElement(
    AnimatePresence,
    { mode: "wait", initial: false },
    createElement("div", { key: location }, children)
  );
}

// Enhanced AnimatedRoute that wraps routes with animation context
interface AnimatedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function AnimatedRoute({ path, component: Component }: AnimatedRouteProps) {
  return (
    <WouterRoute path={path}>
      <Component />
    </WouterRoute>
  );
}

// Wrapper for Switch to ensure proper animation context
export function AnimatedSwitch({ children }: PropsWithChildren) {
  return (
    <AnimationProvider>
      <Switch>{children}</Switch>
    </AnimationProvider>
  );
}