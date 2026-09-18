import React, { useState } from "react";
import { ArrowRight, Brain, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import KnowledgeCore from "../components/KnowledgeCore";
import API_URL from "../config";

function Login() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);

    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090a] text-white">
      <KnowledgeCore />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_42%)]" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black shadow-2xl shadow-white/10">
              <Brain size={20} />
            </div>

            <p className="mt-5 text-[10px] font-semibold tracking-[0.28em] text-zinc-500">
              CHAOS AI
            </p>

            <h1 className="mt-3 text-3xl font-medium tracking-[-0.035em] text-zinc-100">
              Welcome back.
            </h1>

            <p className="mx-auto mt-3 max-w-xs text-xs leading-6 text-zinc-500">
              Your study material is waiting for you.
              Continue where you left off.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-800/90 bg-[#0d0f11]/90 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="group flex w-full items-center justify-between rounded-2xl border border-zinc-700 bg-white px-4 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.92-4.18 2.92-7.42Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 21.9c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.93-3.31.93-2.54 0-4.69-1.72-5.46-4.03H3.29v2.53A9.74 9.74 0 0 0 12 21.9Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.54 14c-.2-.58-.31-1.2-.31-1.84s.11-1.26.31-1.84V7.79H3.29A9.74 9.74 0 0 0 2.25 12c0 1.52.36 2.95 1.04 4.21L6.54 14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 6.29c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.36 14.63 2.1 12 2.1a9.74 9.74 0 0 0-8.71 5.69L6.54 10c.77-2.31 2.92-3.71 5.46-3.71Z"
                    />
                  </svg>
                </div>

                <span>
                  {loading ? "Connecting..." : "Continue with Google"}
                </span>
              </div>

              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[9px] tracking-[0.15em] text-zinc-700">
                SECURE ACCESS
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-zinc-500"
              />

              <p className="text-[10px] leading-5 text-zinc-600">
                Sign in securely with your Google account.
                Chaos AI never asks for or stores your Google password.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-zinc-700">
            By continuing, you agree to use Chaos AI for educational purposes.
          </p>
        </motion.div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-10 text-center">
        <p className="text-[9px] tracking-[0.2em] text-zinc-700">
          YOUR MATERIAL · YOUR KNOWLEDGE · YOUR WORKSPACE
        </p>
      </div>
    </div>
  );
}

export default Login;