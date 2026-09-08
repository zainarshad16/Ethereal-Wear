"use client";

import { signIn } from "next-auth/react";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      console.error("Google sign in error:", err);
      toast.error("Google sign in is currently unavailable. Please sign in with email.");
    }
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
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-12 pb-24 sm:px-6 lg:px-8 relative">
      
      {/* Back to store link */}
      <Link href="/" className="absolute top-6 left-6 sm:top-8 sm:left-8 text-xs sm:text-sm font-semibold tracking-widest text-neutral-800 hover:text-black transition-colors z-50 flex items-center gap-1.5">
        &larr; <span>BACK TO STORE</span>
      </Link>

      {/* Main Container */}
      <div className="relative w-full max-w-md md:max-w-5xl md:h-[780px] bg-white rounded-3xl shadow-2xl overflow-hidden md:flex mt-8 md:mt-0">
        
        {/* --- SIGN UP FORM CONTAINER --- */}
        <div 
          className={`w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isLogin 
              ? "hidden md:flex md:opacity-0 md:invisible md:translate-x-[100%]" 
              : "flex opacity-100 visible md:translate-x-0 z-20"
          }`}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-gray-900 mb-2">Create Account</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">Join Ethereal Wear for exclusive benefits & rapid checkout.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Full Name</label>
                <input
                  name="name" type="text" required placeholder="e.g. Ayesha Khan"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input
                  name="email" type="email" required placeholder="name@example.com"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Phone Number (COD Verification)</label>
                <input
                  name="phone" type="tel" required placeholder="03001234567"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Delivery Address (Optional)</label>
                <input
                  name="address" type="text" placeholder="Street, City, Province"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                <input
                  name="password" type="password" required placeholder="Minimum 6 characters"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={signUpLoading}
                className="w-full bg-black py-3.5 sm:py-4 text-xs sm:text-sm font-bold tracking-widest text-white hover:bg-gray-800 transition-colors mt-6 disabled:bg-gray-400 rounded-xl md:rounded-none shadow-md cursor-pointer"
              >
                {signUpLoading ? "CREATING ACCOUNT..." : "SIGN UP"}
              </button>
            </form>

            {/* Toggle to Sign In */}
            <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className="font-bold text-black hover:underline cursor-pointer tracking-wider ml-1"
              >
                LOG IN
              </button>
            </p>
          </div>
        </div>

        {/* --- LOG IN FORM CONTAINER --- */}
        <div 
          className={`w-full md:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out ${
            isLogin 
              ? "flex opacity-100 visible md:translate-x-0 z-20" 
              : "hidden md:flex md:opacity-0 md:invisible md:translate-x-[-100%]"
          }`}
        >
          <div className="w-full max-w-md mx-auto">
            <div className="text-center md:text-left">
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">Sign in to your Ethereal Wear account.</p>
            </div>

            {oauthError && (
              <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl leading-relaxed">
                Google OAuth keys are not configured in production environment variables. Please use your Email and Password below to sign in.
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Email Address</label>
                <input
                  name="email" type="email" required placeholder="name@example.com"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password</label>
                <input
                  name="password" type="password" required placeholder="Enter password"
                  className="w-full border-b border-gray-300 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-0 text-sm bg-transparent transition-colors"
                />
              </div>
              
              <div className="flex justify-center my-4 sm:my-6 overflow-hidden">
                <div className="scale-90 sm:scale-100 origin-center">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={handleCaptchaChange}
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!captchaVerified || loading}
                className={`w-full py-3.5 sm:py-4 text-xs sm:text-sm font-bold tracking-widest text-white transition-colors rounded-xl md:rounded-none shadow-md ${
                  captchaVerified && !loading ? "bg-black hover:bg-gray-800 cursor-pointer" : "bg-gray-400 cursor-not-allowed"
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

            <div className="mt-5 flex items-center justify-between">
              <span className="w-1/5 border-b border-gray-200 lg:w-1/4"></span>
              <span className="text-[11px] text-center text-gray-400 uppercase tracking-widest">or sign in with</span>
              <span className="w-1/5 border-b border-gray-200 lg:w-1/4"></span>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="mt-4 w-full flex items-center justify-center py-3.5 border border-gray-300 rounded-xl md:rounded-none text-xs sm:text-sm font-bold tracking-widest text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.35 11.1h-9.17v2.73h5.51c-.18 1.09-1.18 3.52-5.51 3.52-3.35 0-6.1-2.73-6.1-6.1s2.75-6.1 6.1-6.1c1.55 0 2.87.58 3.86 1.48l2.13-2.13C16.63 3.03 14.52 2 12.18 2 6.64 2 2.15 6.49 2.15 12s4.49 10 10.03 10c5.78 0 9.61-4.06 9.61-9.77 0-.76-.09-1.28-.21-1.89z" />
              </svg>
              GOOGLE
            </button>

            {/* Toggle to Sign Up */}
            <p className="mt-6 text-center text-xs sm:text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="font-bold text-black hover:underline cursor-pointer tracking-wider ml-1"
              >
                SIGN UP
              </button>
            </p>
          </div>
        </div>

        {/* --- OVERLAY BANNER (DESKTOP ONLY) --- */}
        <div 
          className={`hidden md:block absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${
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
                    className="border-2 border-white px-10 py-3 text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer"
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
                    className="border-2 border-white px-10 py-3 text-sm font-bold tracking-widest hover:bg-white hover:text-black transition-colors cursor-pointer"
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
