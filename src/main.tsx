import { createRoot } from "react-dom/client"; // vite-refresh
import "./i18n";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <App />
);
