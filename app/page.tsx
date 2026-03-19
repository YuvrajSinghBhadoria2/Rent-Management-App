'use client';

import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Users,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 dark:mesh-gradient opacity-40 pointer-events-none" />

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-1.5 group cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] group-hover:scale-110 transition-transform">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Rent<span className="text-primary">Flow</span></span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Infrastructure</Link>
          <Link href="#solutions" className="hover:text-white transition-colors">Solutions</Link>
          <Link href="#enterprise" className="hover:text-white transition-colors">Enterprise</Link>
        </div>

        <Link href="/login">
          <Button variant="outline" className="glass-card border-white/10 hover:bg-white/5 rounded-full px-8 h-12 font-black text-[10px] uppercase tracking-widest shadow-2xl">
            Access Protocol
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">v2.0 — Deployment Active</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 max-w-4xl leading-[0.9] animate-fade-in [animation-delay:200ms]">
          Real Estate <br />
          <span className="bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">Optimization Matrix.</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed animate-fade-in [animation-delay:400ms]">
          The ultimate protocol for high-yield portfolio management. Centralize collection, automate escalations, and scale your property empire with precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in [animation-delay:600ms]">
          <Link href="/register">
            <Button className="rounded-full px-12 h-16 font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">
              Initialize Portfolio
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="glass-card border-white/10 hover:bg-white/5 rounded-full px-12 h-16 font-black text-xs uppercase tracking-[0.2em]">
              Resident Access
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 w-full animate-fade-in [animation-delay:800ms]">
          {[
            {
              title: "Yield Scaling",
              desc: "Automated rent optimization engines to maximize portfolio IRR on every unit.",
              icon: TrendingUp,
              color: "text-emerald-400"
            },
            {
              title: "Triage Protocol",
              desc: "Intelligent complaint routing and resolution tracking across all property assets.",
              icon: ShieldCheck,
              color: "text-blue-400"
            },
            {
              title: "Instant Liquidity",
              desc: "Seamless digital collection pipelines with real-time settlement forecasting.",
              icon: Zap,
              color: "text-amber-400"
            }
          ].map((feature, i) => (
            <div key={i} className="glass-card p-10 text-left group hover:bg-white/5 transition-all relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <feature.icon className="w-32 h-32" />
              </div>
              <div className={`p-4 rounded-2xl bg-white/5 w-fit mb-6 ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <section className="mt-40 w-full py-20 rounded-[4rem] bg-gradient-to-br from-primary/10 to-transparent border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">Ready to Scale?</h2>
            <Link href="/register">
              <Button className="rounded-full px-10 h-14 font-black text-[10px] uppercase tracking-widest shadow-2xl">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 mt-20 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <div className="flex items-center gap-1.5 opacity-50">
            <Building2 className="h-4 w-4" />
            <span>© 2026 RentFlow Systems. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-white transition-colors">Legal</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Compliance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

