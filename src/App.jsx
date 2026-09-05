// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./features/settings/context/ThemeContext";
import AppLayout from "./components/layouts/AppLayout";
import Login from "./features/auth/pages/Login";
import Setup from "./features/shop-setup/pages/Setup";
import useAuthStore from "./store/authStore";
import { setupService } from "./features/shop-setup/services/setupService";
import { invoke } from "./tauri/commands";
import { useAutoLogout } from "./hooks/useAutoLogout";
import SessionWarningModal from "./shared/SessionWarningModal";
import "./styles/App.css";
import ProductsPage from "./features/products/pages/ProductsPage";
import ToastContainer from "./components/shared/Toast";
import SuppliersPage from "./features/suppliers/pages/SuppliersPage";
import PaymentsPage from "./features/payments/pages/PaymentsPage";
import PurchasesPage from "./features/purchases/pages/PurchasesPage";
import SalesPage from "./features/sales/pages/SalesPage";
import CustomersPage from "./features/customers/pages/CustomersPage";
import ReturnsPage from "./features/returns/pages/ReturnsPage";
import ExpensesPage from "./features/expenses/pages/ExpensesPage";
import ReportsPage from "./features/reports/pages/ReportsPage";
import DashboardPage from "./features/dashboard/pages/DashboardPage";
import SettingsPage from "./features/settings/pages/SettingsPage";

// ═══════════════════════════════════════════════════════
// App Initialization Hook
// ═══════════════════════════════════════════════════════
const useAppInitialization = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const logout = useAuthStore((state) => state.logout);

  const initApp = useCallback(async () => {
    setIsChecking(true);
    try {
      const setupNeeded = await setupService.checkSetupNeeded();

      if (setupNeeded) {
        logout();
        setNeedsSetup(true);
      } else {
        setNeedsSetup(false);

        try {
          const activeSession = await invoke("get_active_session");
          if (activeSession?.user) {
            loginSuccess(activeSession.user, activeSession.session);
          }
        } catch (err) {
          console.log("No active session found");
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
      logout();
      setNeedsSetup(true);
    } finally {
      setIsChecking(false);
      
      // Signal frontend is ready to close splash screen
      try {
        await invoke("set_complete", { task: "frontend" });
        console.log("Frontend task completed, splash screen can close");
      } catch (err) {
        console.error("Failed to signal frontend ready:", err);
      }
    }
  }, [loginSuccess, logout]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  return { isChecking, needsSetup, isAuthenticated };
};

// ═══════════════════════════════════════════════════════
// Route Guards
// ═══════════════════════════════════════════════════════
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// ═══════════════════════════════════════════════════════
// Auto Logout Handler Component
// ═══════════════════════════════════════════════════════
const AutoLogoutHandler = ({ children }) => {
  const { showWarning, countdown, handleLogout, stayLoggedIn } = useAutoLogout();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <>
      {children}
      {isAuthenticated && (
        <SessionWarningModal
          isOpen={showWarning}
          countdown={countdown}
          onStayLoggedIn={stayLoggedIn}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

// ═══════════════════════════════════════════════════════
// App Component
// ═══════════════════════════════════════════════════════
function App() {
  const { isChecking, needsSetup } = useAppInitialization();

  // Remove the React splash screen since we have native Tauri splash
  // The main window is hidden until both tasks complete
  if (isChecking) {
    return null; // Return null - window is hidden anyway
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <AutoLogoutHandler>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/setup"
              element={needsSetup ? <Setup /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/login"
              element={
                needsSetup ? (
                  <Navigate to="/setup" replace />
                ) : (
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                )
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                needsSetup ? (
                  <Navigate to="/setup" replace />
                ) : (
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                )
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="payment-system" element={<PaymentsPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="purchases" element={<PurchasesPage />} />
              <Route path="returns" element={<ReturnsPage />} />
              <Route path="expenses" element={<ExpensesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AutoLogoutHandler>
      </BrowserRouter>
      <ToastContainer />
    </ThemeProvider>
  );
}

export default App;