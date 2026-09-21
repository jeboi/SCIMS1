"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { csrf, login } from "@/services/api";

export default function LoginForm() {
    const router = useRouter();
    const { clearAuthData } = useAuth();

    const [form, setForm] = useState({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Clear ALL previous auth state (localStorage, sessionStorage, cookies)
            clearAuthData();

            // 2. Get CSRF cookie
            await csrf();

            // 3. Login
            const response = await login(form);

            // 4. Save ONLY token, user, and permissions to localStorage
            if (response?.token) {
                localStorage.setItem("token", response.token);
            }
            if (response?.access_token) {
                localStorage.setItem("access_token", response.access_token);
            }
            if (response?.user) {
                localStorage.setItem("user", JSON.stringify(response.user));
            }
            if (response?.permissions) {
                localStorage.setItem("permissions", JSON.stringify(response.permissions));
            }

            // 5. Set welcome toast flag
            sessionStorage.setItem("show_welcome_toast", "true");

            // 6. HARD REDIRECT — forces full page reload with fresh state
            window.location.href = "/dashboard";
        } catch (err) {
            console.error(err);
            const errorMessage =
                err.response?.data?.message || "Invalid credentials. Please try again.";
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-medium text-red-400 animate-in fade-in-0 duration-150">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Email Address
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Mail size={18} />
                    </div>
                    <input
                        required
                        name="email"
                        type="email"
                        placeholder="name@scims.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                </label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock size={18} />
                    </div>
                    <input
                        required
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-700/80 bg-slate-900/60 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-slate-100 transition-colors">
                    <input
                        type="checkbox"
                        name="remember"
                        checked={form.remember}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900/60 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-0"
                    />
                    <span>Remember me</span>
                </label>

                <Link
                    href="/forgot-password"
                    className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                >
                    Forgot password?
                </Link>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Signing In...
                    </span>
                ) : (
                    "Sign In"
                )}
            </button>
        </form>
    );
}