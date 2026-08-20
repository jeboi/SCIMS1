export default function LoginHeader() {
    return (
        <div className="mb-8 flex flex-col items-center text-center">
            {/* SCIMS App Icon */}
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/25 ring-1 ring-white/20">
                <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                SCIMS Portal
            </h1>

            <p className="mt-2 text-xs font-medium text-slate-400">
                Sign in to access your Supply Chain and Inventory Management workspace
            </p>
        </div>
    );
}