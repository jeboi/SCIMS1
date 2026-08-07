"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { csrf, login, getUser } from "@/services/api";

export default function LoginForm() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        console.log("1. Getting CSRF");
        await csrf();

        console.log("2. Logging in");
        const loginResponse = await login(form);
        console.log("LOGIN RESPONSE:", loginResponse);

        console.log("3. Getting user");
        const user = await getUser();
        console.log("USER:", user);

        console.log("4. Redirecting...");
        router.push("/dashboard");

        console.log("5. Redirect called");

    } catch (err) {
        console.error("ERROR:", err);

        if (err.response) {
            console.log("Status:", err.response.status);
            console.log("Data:", err.response.data);
        }
    }
};

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-4">

                <div>
                    <Label>Email</Label>

                    <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <Label>Password</Label>

                    <Input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </div>

                {error && (
                    <p className="text-red-500 text-sm">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Signing In..." : "Sign In"}
                </Button>

            </form>
        </Card>
    );
}