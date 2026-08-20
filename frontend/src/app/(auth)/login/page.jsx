import AuthContainer from "@/components/auth/AuthContainer";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginForm from "@/components/auth/LoginForm";
import GuestGuard from "@/components/auth/GuestGuard";

export default function LoginPage() {
    return (
        <GuestGuard>
            <AuthContainer>
                <LoginHeader />
                <LoginForm />
            </AuthContainer>
        </GuestGuard>
    );
}