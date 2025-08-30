import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react";
import { GlobalStyles } from "@/styles/GlobalStyles";
import { theme } from "@/styles/theme";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import VideoLoaderScreen from "./components/VideoLoaderScreen";
import RoleSelection from "./components/RoleSelection";
import ContractorScreen from "./components/roles/ContractorScreen";
import BuilderScreen from "./components/roles/BuilderScreen";
import AdminScreen from "./components/roles/AdminScreen";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

type AppState =
  | "video-loader"
  | "role-selection"
  | "contractor-info"
  | "builder-info"
  | "admin-info"
  | "contractor-login"
  | "builder-login"
  | "admin-login"
  | "contractor-dashboard"
  | "builder-dashboard"
  | "admin-dashboard";

const AuthenticatedAppContent = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // If user is authenticated, show their dashboard directly
  if (isAuthenticated && user) {
    return (
      <Dashboard
        role={user.role.toLowerCase() as "admin" | "builder" | "contractor"}
        onLogout={() => window.location.reload()}
      />
    );
  }

  // If not authenticated, show the normal app flow
  return <AppContent />;
};

const AppContent = () => {
  const [appState, setAppState] = useState<AppState>("video-loader");

  const handleGetStarted = () => {
    setAppState("role-selection");
  };

  const handleRoleSelect = (role: "builder" | "contractor" | "admin") => {
    setAppState(`${role}-info` as AppState);
  };

  const handleLogin = (role: "builder" | "contractor" | "admin") => {
    setAppState(`${role}-login` as AppState);
  };

  const handleLoginSuccess = () => {
    // The useAuth hook will handle the redirect automatically
    // This is kept for backward compatibility with the component interface
  };

  const handleBack = () => {
    switch (appState) {
      case "contractor-info":
      case "builder-info":
      case "admin-info":
        setAppState("role-selection");
        break;
      case "contractor-login":
        setAppState("contractor-info");
        break;
      case "builder-login":
        setAppState("builder-info");
        break;
      case "admin-login":
        setAppState("admin-info");
        break;
      default:
        setAppState("role-selection");
    }
  };

  const handleLogout = () => {
    setAppState("role-selection");
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case "video-loader":
        return <VideoLoaderScreen onGetStarted={handleGetStarted} />;

      case "role-selection":
        return <RoleSelection onRoleSelect={handleRoleSelect} />;

      case "contractor-info":
        return (
          <ContractorScreen
            onLogin={() => handleLogin("contractor")}
            onSignup={() => handleLogin("contractor")}
            onBack={handleBack}
          />
        );

      case "builder-info":
        return (
          <BuilderScreen
            onLogin={() => handleLogin("builder")}
            onSignup={() => handleLogin("builder")}
            onBack={handleBack}
          />
        );

      case "admin-info":
        return (
          <AdminScreen
            onLogin={() => handleLogin("admin")}
            onSignup={() => handleLogin("admin")}
            onBack={handleBack}
          />
        );

      case "contractor-login":
        return (
          <LoginForm
            role="contractor"
            onBack={handleBack}
            onSuccess={handleLoginSuccess}
          />
        );

      case "builder-login":
        return (
          <LoginForm
            role="builder"
            onBack={handleBack}
            onSuccess={handleLoginSuccess}
          />
        );

      case "admin-login":
        return (
          <LoginForm
            role="admin"
            onBack={handleBack}
            onSuccess={handleLoginSuccess}
          />
        );

      case "contractor-dashboard":
        return <Dashboard role="contractor" onLogout={handleLogout} />;

      case "builder-dashboard":
        return <Dashboard role="builder" onLogout={handleLogout} />;

      case "admin-dashboard":
        return <Dashboard role="admin" onLogout={handleLogout} />;

      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return renderCurrentScreen();
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <EmotionThemeProvider theme={theme}>
        <GlobalStyles />
        <ThemeProvider defaultTheme="system" storageKey="constructpro-theme">
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<AuthenticatedAppContent />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </EmotionThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
