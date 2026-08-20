export default function AuthContainer({ children }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#070d19] px-4 py-12 sm:px-6 lg:px-8 selection:bg-blue-500 selection:text-white overflow-hidden">
            {/* Subtle background glow effects */}
            <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="rounded-2xl border border-slate-800/80 bg-[#0f172a]/90 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-xl">
                    {children}
                </div>
            </div>
        </div>
    );
}