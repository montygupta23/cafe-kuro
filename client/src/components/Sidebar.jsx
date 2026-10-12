import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Armchair,
  Users,
  ShoppingBag,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  QrCode,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/pos", label: "New order", icon: ShoppingBag },
    { to: "/tables", label: "Table management", icon: Armchair },
    { to: "/customers", label: "Customer directory", icon: Users },
    { to: "/menu", label: "Menu management", icon: UtensilsCrossed },
    { to: "/orders", label: "Order history", icon: Receipt },
    { to: "/reports", label: "Sales & analytics", icon: BarChart3 },
    { to: "/menu-qr", label: "Menu QR", icon: QrCode },
  ];

  return (
    <aside
      className={`app-sidebar w-60 bg-[#F97316] border-r border-amberGold-500/15 flex flex-col justify-between h-screen sticky top-0 p-4 z-20 ${menuOpen ? "app-sidebar-open" : ""}`}
    >
      <div>
        {/* Brand Header */}
        <div className="app-sidebar-brand mb-10 text-center border-b border-white pb-3">
          <NavLink to="/" className="font-serif text-2xl text-white font-bold tracking-wide">
            <img
              src="/logo.svg"
              alt="Logo"
              className=" brightness-0 invert h-10 w-fit px-4 mb-2 mx-auto"
            />
          </NavLink>
          <p className="text-[10px] uppercase tracking-widest text-white mt-1">
            Café Management System
          </p>
          <button
            type="button"
            className="app-sidebar-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav id="primary-navigation" className="app-sidebar-nav space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
             <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-white text-[#F97316] shadow-gold-glow"
                    : "hover:text-[#F97316] hover:bg-white"
                }`}
              >
                <Icon
                className="w-4 h-4"
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer User Info */}
      <div className="app-sidebar-user pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              {user?.name}
            </p>
            <p className="text-[10px] text-white">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="app-sidebar-logout text-white hover:text-white p-2 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-4 text-white" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
