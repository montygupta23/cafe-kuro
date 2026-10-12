import React, { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen  bg-[#F97316] flex items-center justify-center p-6"
    >
      <form
        onSubmit={submit}
        className="glass-card2 shadows w-full max-w-md rounded-2xl p-8 space-y-6"
      >
        <header className="text-center">
          <LockKeyhole className="w-9 h-9 text-black mx-auto mb-4" />
          {/* <h1 className="font-serif text-2xl text-black font-bold">CAFE NOVA</h1> */}
          <img src="/logo.svg" className="mx-auto mb-4 w-32 h-auto" />
          <p className="text-sm text-black mt-2 ml-2 ">Administrator sign in</p>
        </header>
        {error && (
          <p role="alert" className="text-sm p-3 text-center rounded-lg bg-[#F97316] font-semibold text-white">
            {error}
          </p>
        )}
        <label className="block text-xs text-[#1F2937]">
          Email
          <input
            required
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-[#1F2937]/20 mt-2 p-3 text-[#1F2937]"
          />
        </label>
        <label className="block text-xs text-[#1F2937]">
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-[#1F2937]/20 p-3 text-[#1F2937]"
          />
        </label>
        <button
          disabled={loading}
          className="w-full rounded-lg bg-[#F97316] p-3 text-sm font-bold text-white hover:bg-white border border-[#F97316] hover:text-[#F97316] disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
