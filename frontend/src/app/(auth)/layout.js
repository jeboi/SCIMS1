import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata = {
    title: "SCIMS Portal",
    description: "Supply Chain & Inventory Management System",
};

export default function AuthLayout({ children }) {
    return (
        <AuthProvider>
            <main>{children}</main>
        </AuthProvider>
    );
}