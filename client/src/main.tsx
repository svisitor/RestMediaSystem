import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import i18n from "./lib/i18n";

// Initialize internationalization
i18n.init();

createRoot(document.getElementById("root")!).render(<App />);
