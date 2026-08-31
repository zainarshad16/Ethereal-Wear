"use client";

import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10,15}$/, "Phone number must be 10-15 digits"),
  address: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const oauthError = searchParams.get("error");

  const handleCaptchaChange = (value: string | null) => {
    if (value) {
      setCaptchaVerified(true);
    }
  };

  const handleGoogleLogin = () => {
    if (!captchaVerified) {
      toast.error("Please verify the reCAPTCHA first.");
      return;
    }
    signIn("google", { callbackUrl: "/" });
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignUpLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const password = formData.get("password") as string;

    const validationResult = signUpSchema.safeParse({ name, email, phone, address, password });
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message || "Validation error");
      setSignUpLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, address, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Registration failed. Please try again.");
        setSignUpLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing you in...");

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setIsLogin(true);
        setSignUpLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      console.error("Sign up error:", err);
      toast.error("Something went wrong during sign up.");
      setSignUpLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!captchaVerified) {
      toast.error("Please verify the reCAPTCHA first.");
      return;
    }
    
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).toLowerCase().trim();
    const password = formData.get("password") as string;
    
    const validationResult = signInSchema.safeParse({ email, password });
    if (!validationResult.success) {
      toast.error(validationResult.error.issues[0]?.message || "Validation error");
      setLoading(false);
      return;
    }

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (res?.error) {
        toast.error("Invalid email or password.");
        setLoading(false);
      } else {
        const sessionRes = await fetch("/api/auth/session");
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role === "ADMIN") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (err) {
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        return; 
      }
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-12 sm:px-6 lg:px-8 overflow-hidden relative">
      
      {/* Back to store link */}
      <Link href="/" className="absolute top-8 left-8 text-sm font-semibold tracking-widest hover:text-gray-500 transition-colors z-50">
        &larr; BACK TO STORE
      </Link>

      <div className="relative w-full max-w-5xl h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden flex">
        
        {/* --- SIGN UP FORM CONTAINER --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isLogin ? "opacity-0 invisible translate-x-[100%]" : "opacity-100 visible translate-x-0 z-20"
          }`}
        >
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-2">Create Account</h2>
            <p className="text-sm text-gray-500 mb-8">Join Ethereal Wear for exclusive benefits.</p>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <input
                name="name" type="text" required placeholder="Full Name"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              <input
                name="email" type="email" required placeholder="Email address"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              <input
                name="phone" type="tel" required placeholder="Phone Number"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              <input
                name="address" type="text" placeholder="Address (Optional)"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              <input
                name="password" type="password" required placeholder="Password"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors mb-6"
              />
              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full bg-black py-4 text-sm font-bold tracking-widest text-white hover:bg-gray-800 transition-colors mt-6 disabled:bg-gray-400"
              >
                {signUpLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
              </button>
            </form>
          </div>
        </div>

        {/* --- LOG IN FORM CONTAINER --- */}
        <div 
          className={`absolute top-0 left-1/2 w-1/2 h-full p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isLogin ? "opacity-100 visible translate-x-0 z-20" : "opacity-0 invisible translate-x-[-100%]"
          }`}
        >
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-3xl font-serif tracking-tight text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-500 mb-8">Sign in to your Ethereal Wear account.</p>

            {oauthError === "OAuthSignin" && (
              <div className="mb-6 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded leading-relaxed">
                Google OAuth keys are not configured in <code className="bg-amber-100 px-1 rounded">.env</code>. Please use your Email and Password below to sign in.
              </div>
            )}

            <form className="space-y-6" onSubmit={handleEmailLogin}>
              <input
                name="email" type="email" required placeholder="Email address"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              <input
                name="password" type="password" required placeholder="Password"
                className="w-full border-b border-gray-300 py-3 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 sm:text-sm bg-transparent transition-colors"
              />
              
              <div className="flex justify-center my-6">
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={handleCaptchaChange}
                />
              </div>
              
              <button
                type="submit"
                disabled={!captchaVerified || loading}
                className={`w-full py-4 text-sm font-bold tracking-widest text-white transition-colors ${
                  captchaVerified && !loading ? "bg-black hover:bg-gray-800" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "PROCESSING..." : "SIGN IN"}
              </button>
            </form>

            <div className="mt-4 flex justify-center">
              <Link href="/forgot-password" className="text-xs text-gray-500 hover:text-black transition-colors uppercase tracking-widest border-b border-transparent hover:border-black">
                Forgot Password?
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <span className="w-1/5 border-b border-gray-200 lg:w-1/4"></span>
              <span className="text-xs text-center text-gray-500 uppercase tracking-widest">or sign in with</span>
              <span className="w-1/5 border-b border-gray-200 lg:w-1/4"></span>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={!captchaVerified || loading}
              className={`mt-6 w-full flex items-center justify-center py-4 border border-gray-300 rounded text-sm font-bold tracking-widest transition-colors ${
                captchaVerified && !loading ? "bg-white text-gray-700 hover:bg-gray-50" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h5.51c-.18 1.09-1.18 3.52-5.51 3.52-3.35 0-6.1-2.73-6.1-6.1s2.75-6.1 6.1-6.1c1.55 0 2.87.58 3.86 1.48l2.13-2.13C16.63 3.03 14.52 2 12.18 2 6.64 2 2.15 6.49 2.15 12s4.49 10 10.03 10c5.78 0 9.61-4.06 9.61-9.77 0-.76-.09-1.28-.21-1.89z" />
              </svg>
              GOOGLE
            </button>
          </div>
        </div>

        {/* --- OVERLAY BANNER --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
            isLogin ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="relative w-full h-full bg-black text-white flex flex-col justify-center items-center text-center px-12">
            <div className="absolute inset-0 opacity-40">
               <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop" alt="Ethereal Fashion" className="w-full h-full object-cover" />
            </div>
            
            <div className="relative z-10 w-full h-full flex flex-col justify-center transition-all duration-700 ease-in-out">
              {isLogin ? (
                <div className="animate-fade-in">
                  <h2 className="text-4xl font-serif tracking-tighter mb-4">Hello, Friend!</h2>
                  <p className="text-sm font-light tracking-widest mb-8 max-w-sm mx-auto leading-relaxed">
                    Enter your personal details and start your journey with Ethereal Wear.
                  </p>
                  <button 
                    onClick={() => setIsLogin(false)}
                    className="border-2 border-white px-10 py-3 text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    SIGN UP
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <h2 className="text-4xl font-serif tracking-tighter mb-4">Welcome Back!</h2>
                  <p className="text-sm font-light tracking-widest mb-8 max-w-sm mx-auto leading-relaxed">
                    To keep connected with us please login with your personal info.
                  </p>
                  <button 
                    onClick={() => setIsLogin(true)}
                    className="border-2 border-white px-10 py-3 text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-colors"
                  >
                    SIGN IN
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-sm text-gray-500 font-sans">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
