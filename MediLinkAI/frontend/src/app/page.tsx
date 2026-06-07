import Link from "next/link";
import { Activity, ArrowRight, Shield, Brain, ShoppingBag, Smartphone } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#070b19] font-sans text-white overflow-hidden flex flex-col justify-between">
      {/* Visual background details */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,#101a35_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              MediLink AI
            </span>
            <span className="block text-[8px] text-slate-400 uppercase tracking-widest font-semibold">
              Intelligent Hospital Ecosystem
            </span>
          </div>
        </div>
        
        <Link
          href="/login"
          className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-semibold transition duration-200 shadow-xl shadow-black/10"
        >
          Portal Login
        </Link>
      </header>

      {/* Main Content Hero */}
      <main className="relative flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6 text-center z-10 py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs text-blue-300 font-semibold mb-6">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
          Sprint 1 Live MVP Ready
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-none">
          Smart Healthcare Management,{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Powered by AI.
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
          MediLink AI is a unified healthcare management ecosystem integrating smart hospital ERP operations, intelligent doctor assistant workflows, and a digital pharmacy inventory network.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.99] transition duration-150 flex items-center justify-center gap-2 text-sm select-none"
          >
            Enter Portal Workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-300 hover:text-white rounded-2xl text-sm font-semibold transition duration-200"
          >
            Read Architecture docs
          </a>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 text-left">
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <Brain className="h-6 w-6 text-blue-400 mb-3" />
            <h3 className="text-sm font-bold mb-1">AI Diagnostics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Symptom analysis & recommended treatments.</p>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <Shield className="h-6 w-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-bold mb-1">Hospital ERP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Bed inventory, scheduling, and billing.</p>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <ShoppingBag className="h-6 w-6 text-amber-400 mb-3" />
            <h3 className="text-sm font-bold mb-1">Digital Pharmacy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Verify prescriptions & stock replenishment.</p>
          </div>
          <div className="p-5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
            <Smartphone className="h-6 w-6 text-purple-400 mb-3" />
            <h3 className="text-sm font-bold mb-1">Patient Mobile App</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Medicine reminders and tracking records.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative w-full max-w-6xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 z-10 gap-4">
        <span>© 2026 MediLink AI. All rights reserved. Developed for SIR BILAL ARIF.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300">Privacy Policy</a>
          <a href="#" className="hover:text-slate-300">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}
