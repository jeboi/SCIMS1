"use client";

import { useEffect } from "react";
import { X, Lock } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm"; // Adjust to your LoginForm location

export default function LoginModal({ isOpen, onClose }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                onClick={onClose}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in-0 duration-200"
            />

            {/* MODAL CARD */}
            <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xl shadow-slate-900/20 backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                    <X size={18} />
                </button>

                {/* Modal Header */}
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
                        <Lock size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Sign In to SCIMS</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                        Enter your credentials to access the administrative portal
                    </p>
                </div>

                {/* Actual Form Component */}
                <LoginForm onSuccess={onClose} />
            </div>
        </div>
    );
}