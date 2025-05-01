import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode } from "react";

// Add error handling for debugging
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled rejection caught:', event.reason);
});

console.log('Application starting...');

try {
  const rootElement = document.getElementById("root");
  console.log('Root element found:', rootElement);
  
  createRoot(rootElement!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered');
} catch (error) {
  console.error('Failed to render app:', error);
}
