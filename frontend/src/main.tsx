// libs
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";
// internals
import { App } from "./App.tsx";
// styles
import "@radix-ui/themes/styles.css";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Theme accentColor="lime" appearance="dark">
        <App />
      </Theme>
    </QueryClientProvider>
  </StrictMode>,
);
