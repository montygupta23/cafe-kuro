import React from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CustomerManager from "./pages/CustomerManager";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import MenuManager from "./pages/MenuManager";
import OrderHistory from "./pages/OrderHistory";
import OrderPOS from "./pages/OrderPOS";
import SalesReport from "./pages/SalesReport";
import TableManager from "./pages/TableManager";
import MenuQr from "./pages/MenuQr";

function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  return user ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

function LoginRoute() {
  const { user } = useAuth();
  const location = useLocation();

  return user ? (
    <Navigate to={location.state?.from?.pathname || "/"} replace />
  ) : (
    <Login />
  );
}

function Layout() {
  return (
    <div className="app-layout flex min-h-screen bg-obsidian-950 font-sans">
      <Sidebar />
      <main className="app-main min-w-0 flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <section className="space-y-3">
      <h1 className="font-serif text-3xl font-bold text-black">
        Page not found
      </h1>
      <p className="text-sm text-[#1F2937] border-b border-[#F97316] pb-3">
        The page you requested does not exist.
      </p>
      <Link className="inline-block  text-sm px-4 py-2 rounded-lg text-white font-semibold bg-[#F97316] hover:bg-white border border-[#F97316] hover:text-[#F97316]" to="/">
        Return to dashboard
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="pos" element={<OrderPOS />} />
              <Route path="orders" element={<OrderHistory />} />
              <Route path="tables" element={<TableManager />} />
              <Route path="customers" element={<CustomerManager />} />
              <Route path="menu" element={<MenuManager />} />
              <Route path="reports" element={<SalesReport />} />
              <Route path="menu-qr" element={<MenuQr />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
