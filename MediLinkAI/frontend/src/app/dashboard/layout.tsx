"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  LayoutDashboard,
  Calendar,
  Users,
  BriefcaseMedical,
  Settings,
  LogOut,
  Bell,
  Stethoscope,
  Database,
  FileText
} from "lucide-react";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [role, setRole] = useState("Patient");
  const [displayName, setDisplayName] = useState("User");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("displayName");
    const storedEmail = localStorage.getItem("email");

    if (!storedToken) {
      router.push("/login");
      return;
    }

    if (storedRole) setRole(storedRole);
    if (storedName) setDisplayName(storedName);
    if (storedEmail) setEmail(storedEmail);
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin", "Doctor", "Receptionist", "Patient", "Pharmacist"] },
    { name: "Appointments", href: "/dashboard/appointments", icon: Calendar, roles: ["Admin", "Doctor", "Receptionist", "Patient"] },
    { name: "Patients List", href: "/dashboard/patients", icon: Users, roles: ["Admin", "Doctor", "Receptionist"] },
    { name: "AI Consultation", href: "/dashboard/ai-consult", icon: Stethoscope, roles: ["Doctor", "Patient"] },
    { name: "Medical Records", href: "/dashboard/records", icon: FileText, roles: ["Admin", "Doctor", "Patient"] },
    { name: "Pharmacy Inventory", href: "/dashboard/inventory", icon: Database, roles: ["Admin", "Pharmacist"] },
  ];

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950/60 backdrop-blur-xl border-r border-slate-900 flex flex-col justify-between p-6">
        <div>
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
              <Activity className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                MediLink AI
              </span>
              <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-semibold">
                Portal Workspace
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems
              .filter((item) => item.roles.includes(role))
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-900/50 transition duration-150"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
          </nav>
        </div>

        {/* Footer Profile & Logout */}
        <div className="border-t border-slate-900 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <span className="block text-sm font-semibold truncate">{displayName}</span>
              <span className="block text-[10px] text-slate-500 font-medium capitalize">{role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/20 hover:bg-red-900/20 border border-red-900/30 text-red-200 text-xs font-semibold rounded-xl transition duration-150"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="h-16 bg-slate-950/30 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-8 z-10">
          <h1 className="text-base font-bold text-slate-300">
            MediLink AI Workspace
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition">
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-blue-500 rounded-full" />
            </button>
            <div className="h-8 w-[1px] bg-slate-900" />
            <div className="text-xs text-right">
              <span className="block text-slate-400">Current Session</span>
              <span className="block font-semibold text-emerald-400">Connected</span>
            </div>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
