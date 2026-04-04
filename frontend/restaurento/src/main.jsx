import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { SocketProvider } from "./context/SocketContext.jsx";
import { LocationProvider } from "./context/LocationContext";
import { showToast } from "./utils/alert.js";
import STATUS_CODES from "./constants/statusCodes.js";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (error.response?.status !== STATUS_CODES.UNAUTHORIZED) {
        showToast(error.response?.data?.message || "Something went wrong fetching data.", "error");
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      if (error.response?.status !== STATUS_CODES.UNAUTHORIZED) {
        showToast(error.response?.data?.message || "Action failed. Please try again.", "error");
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <LocationProvider>
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <QueryClientProvider client={queryClient}>
              <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
                <App />
              </ErrorBoundary>
            </QueryClientProvider>
          </GoogleOAuthProvider>
        </LocationProvider>
      </SocketProvider>
    </Provider>
  </StrictMode>
);
