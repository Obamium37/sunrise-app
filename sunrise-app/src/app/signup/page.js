"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/home");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 parallax-container">
        {/* Sky Layer - Gradient (slightly different for signup) */}
        <div 
          className="parallax-layer absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, #0f0c29 0%, #302b63 30%, #24243e 50%, #ff6b6b 70%, #ffa500 85%, #ffd700 100%)",
            transform: "translateZ(-50px) scale(1.5)",
          }}
        />

        {/* Stars Layer */}
        <div 
          className="parallax-layer absolute inset-0"
          style={{ transform: "translateZ(-40px) scale(1.4)" }}
        >
          {[...Array(60)].map((_, i) => {
            // Use index-based values for consistent SSR/client rendering
            const top = ((i * 41) % 60);
            const left = ((i * 67) % 100);
            const delay = ((i * 0.11) % 3);
            const opacity = 0.3 + ((i * 0.019) % 0.7);
            
            return (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  opacity: opacity,
                }}
              />
            );
          })}
        </div>

        {/* Rising Sun Layer */}
        <div 
          className="parallax-layer absolute inset-0 flex items-end justify-center pb-24"
          style={{ transform: "translateZ(-30px) scale(1.3)" }}
        >
          <div className="relative">
            {/* Sun Glow */}
            <div className="absolute inset-0 animate-pulse-slow">
              <div className="w-72 h-72 bg-orange-300 rounded-full blur-3xl opacity-60" />
            </div>
            {/* Sun Core - Larger for signup */}
            <div className="relative w-56 h-56 bg-gradient-to-br from-yellow-300 via-orange-500 to-red-600 rounded-full animate-float shadow-2xl">
              {/* Inner glow */}
              <div className="absolute inset-4 bg-gradient-to-br from-yellow-100 to-orange-300 rounded-full blur-md" />
            </div>
            {/* Sun Rays - More dramatic */}
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-3 h-40 bg-gradient-to-t from-orange-400 via-yellow-300 to-transparent origin-bottom animate-rotate-rays"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 22.5}deg)`,
                  animationDelay: `${i * 0.08}s`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Clouds Layer - More clouds */}
        <div 
          className="parallax-layer absolute inset-0"
          style={{ transform: "translateZ(-20px) scale(1.2)" }}
        >
          <div className="absolute top-16 left-5 w-40 h-20 bg-white/20 rounded-full blur-md animate-cloud-1" />
          <div className="absolute top-24 right-10 w-48 h-24 bg-white/15 rounded-full blur-md animate-cloud-2" />
          <div className="absolute top-40 left-1/4 w-36 h-18 bg-white/10 rounded-full blur-md animate-cloud-3" />
          <div className="absolute top-52 right-1/4 w-44 h-22 bg-white/12 rounded-full blur-md animate-cloud-1" style={{ animationDelay: '2s' }} />
        </div>

        {/* Mountains Layer */}
        <div 
          className="parallax-layer absolute bottom-0 left-0 right-0"
          style={{ transform: "translateZ(-10px) scale(1.1)" }}
        >
          {/* Back Mountains */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path
              d="M0,200 L200,100 L400,150 L600,50 L800,120 L1000,80 L1200,140 L1200,300 L0,300 Z"
              fill="#2d3561"
              opacity="0.6"
            />
          </svg>
          {/* Front Mountains */}
          <svg className="absolute bottom-0 w-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path
              d="M0,250 L150,180 L300,220 L500,140 L700,200 L900,160 L1200,220 L1200,300 L0,300 Z"
              fill="#1a1f3a"
              opacity="0.8"
            />
          </svg>
        </div>

        {/* Birds Layer */}
        <div 
          className="parallax-layer absolute inset-0"
          style={{ transform: "translateZ(-15px) scale(1.15)" }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bird-fly"
              style={{
                top: `${20 + i * 10}%`,
                left: `-10%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${15 + i * 2}s`,
              }}
            >
              <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                <path d="M0 10 Q 7 5, 15 10 Q 23 5, 30 10" stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 backdrop-blur-md bg-white/90">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              SUNRISE
            </h1>
            <p className="text-lg font-bold text-muted-foreground">
              Start Your Journey
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm font-semibold">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-600 hover:text-orange-700 font-bold underline">
                Log in
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .parallax-container {
          perspective: 100px;
          height: 100vh;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .parallax-layer {
          position: absolute;
          inset: 0;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate-rays {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.9; }
        }

        @keyframes cloud-1 {
          0% { transform: translateX(-20vw); }
          100% { transform: translateX(120vw); }
        }

        @keyframes cloud-2 {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-20vw); }
        }

        @keyframes cloud-3 {
          0% { transform: translateX(-10vw); }
          100% { transform: translateX(110vw); }
        }

        @keyframes bird-fly {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(110vw) translateY(-50px); }
        }

        .animate-twinkle {
          animation: twinkle 3s infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-rotate-rays {
          animation: rotate-rays 3s infinite;
        }

        .animate-cloud-1 {
          animation: cloud-1 60s linear infinite;
        }

        .animate-cloud-2 {
          animation: cloud-2 80s linear infinite;
        }

        .animate-cloud-3 {
          animation: cloud-3 70s linear infinite;
        }

        .animate-bird-fly {
          animation: bird-fly linear infinite;
        }
      `}</style>
    </div>
  );
}