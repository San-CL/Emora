import React, { useState } from "react";
import { ShieldAlert, AlertOctagon, Phone, User, LogOut, Menu, X, Landmark, BookOpen, Layers, Heart } from "lucide-react";
import { Profile } from "../types";

interface NavbarProps {
  currentUser: Profile | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openEmergencyModal: () => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  openEmergencyModal
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "home", label: "Home", icon: Layers },
    { id: "alerts", label: "Active Alerts", icon: AlertOctagon },
    { id: "report", label: "Report Case", icon: ShieldAlert, auth: true },
    { id: "ngo", label: "NGO Help Network", icon: Landmark },
    { id: "education", label: "Children Education Hub", icon: BookOpen },
    { id: "women", label: "Women Space", icon: Heart },
  ];

  // Filters visible tabs based on user authorizations
  const visibleNavItems = navItems.filter(item => {
    if (item.auth && !currentUser) return false;
    return true;
  });

  return (
    <nav className="bg-[#0f1f3d] border-b border-[#1e3a8a] sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab("home")}>
            <div className="p-2 bg-[#1a56db] rounded-lg mr-3 shadow-md hover:scale-105 transition-all">
              <ShieldAlert className="h-6 w-6 text-white" id="brand-logo" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">Emora</span>
              <span className="text-[10px] font-mono tracking-widest text-[#10b981] uppercase font-bold">Cameroon Security</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex space-x-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1a56db] text-white shadow-md shadow-[#1a56db]/30"
                      : "text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User Account Controls + Panic Button */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Pulsing Emergency SOS Button */}
            <button
              id="sos-button-navbar"
              onClick={openEmergencyModal}
              className="relative px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs uppercase tracking-wider flex items-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30 pointer-events-none"></div>
              <Phone className="h-3 w-3 mr-1.5 fill-white animate-pulse" />
              SOS Panic Alert
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-700">
                <div 
                  onClick={() => setActiveTab("dashboard")}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <div className="h-8 w-8 rounded-full bg-[#1e293b] flex items-center justify-center text-white border border-[#1a56db] group-hover:bg-[#1a56db] transition-colors">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-white block max-w-[110px] truncate group-hover:text-[#10b981] transition-colors">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[9px] font-mono capitalize block text-[#cbd5e1]/70 leading-none">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                {/* Role Triage Shortcut */}
                {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                  <button
                    onClick={() => setActiveTab("triage")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                      activeTab === "triage"
                        ? "bg-[#10b981] text-[#0a1628]"
                        : "bg-[#1e293b] text-[#10b981] hover:bg-[#10b981]/20 border border-[#10b981]/45"
                    }`}
                  >
                    AI Triage
                  </button>
                )}

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider transition-all ${
                      activeTab === "admin"
                        ? "bg-[#ef4444] text-[#0a1628]"
                        : "bg-[#1e293b] text-[#ef4444] hover:bg-red-500/20 border border-[#ef4444]/40"
                    }`}
                  >
                    Admin
                  </button>
                )}

                <button
                  id="navbar-logout"
                  onClick={onLogout}
                  title="Sign out of Emora"
                  className="p-1.5 text-slate-400 hover:text-[#ef4444] hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("login")}
                className="flex items-center py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-[#cbd5e1] hover:text-white text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <User className="h-3.5 w-3.5 mr-1" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={openEmergencyModal}
              className="relative p-2 bg-red-600 text-white rounded-full text-xs uppercase shadow-md active:scale-90"
            >
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></div>
              <Phone className="h-3.5 w-3.5" />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-850 rounded-md"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a1628] border-b border-[#1e3a8a] px-2 pt-2 pb-4 space-y-1 shadow-inner animate-fade-in">
          {visibleNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 rounded-md text-base font-medium transition-all ${
                  isActive
                    ? "bg-[#1a56db] text-white"
                    : "text-[#cbd5e1] hover:bg-[#1e293b]"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-800 px-4">
            {currentUser ? (
              <div className="space-y-2">
                <div onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }} className="flex items-center space-x-3 cursor-pointer">
                  <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white border border-[#1a56db]">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{currentUser.full_name}</div>
                    <div className="text-xs text-slate-400 capitalize">{currentUser.role} Subscription</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {(currentUser.role === 'admin' || currentUser.role === 'moderator') && (
                    <button
                      onClick={() => { setActiveTab("triage"); setMobileMenuOpen(false); }}
                      className="px-3 py-1 bg-[#10b981] text-[#0a1628] rounded text-xs font-bold uppercase"
                    >
                      AI Triage
                    </button>
                  )}
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
                      className="px-3 py-1 bg-red-600 text-[#0a1628] rounded text-xs font-bold uppercase"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center px-3 py-1 bg-slate-800 text-slate-300 hover:text-red-500 rounded text-xs font-bold"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setActiveTab("login"); setMobileMenuOpen(false); }}
                className="flex items-center justify-center w-full py-2 bg-slate-800 text-white rounded-md text-sm font-semibold border border-slate-700"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
