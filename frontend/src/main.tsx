import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MsalProvider } from "@azure/msal-react";
import { Toaster } from "react-hot-toast";
import { msalInstance } from "./auth/msalInstance";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root") as HTMLElement;

createRoot(rootElement).render(
  <StrictMode>
    <MsalProvider instance={msalInstance}>
      <App />
      <Toaster position="top-right" />
    </MsalProvider>
  </StrictMode>
);
