"use client";

import { useRouter } from "next/navigation"; 

import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import About from "@/components/landing/About";
import Features from "@/components/landing/Features";
import AIPredictiveShowcase from "@/components/landing/AIPredictiveShowcase";
import Footer from "@/components/landing/Footer";

export default function Home() {
    const router = useRouter(); 

    const handleLoginClick = () => {
        router.push("/login"); 
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white relative">
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-full max-w-7xl -translate-x-1/2 overflow-hidden blur-[140px] opacity-20">
                <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400" />
            </div>

            <Navbar onLoginClick={handleLoginClick} />
            <Hero onLoginClick={handleLoginClick} />
            <About />
            <Features />
            <AIPredictiveShowcase onLoginClick={handleLoginClick} />
            <Footer onLoginClick={handleLoginClick} />
        </main>
    );
}