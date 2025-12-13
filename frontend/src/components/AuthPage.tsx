import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../auth/AuthProvider";

type AuthMode = "login" | "signup";
type LoginStep = "input" | "otp";
type SignupStep = "name" | "email" | "email-otp";

interface AuthPageProps {
  onAuthenticated: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const navigate = useNavigate();
  const { refreshTokens } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loginStep, setLoginStep] = useState<LoginStep>("input");
  const [signupStep, setSignupStep] = useState<SignupStep>("name");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [authSession, setAuthSession] = useState<string>("");
  const [challengeName, setChallengeName] = useState<string>("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isSignup: false }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setAuthSession(data.session);
      setChallengeName(data.challengeName);
      setLoginStep("otp");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginOtpVerify = async () => {
    if (otp.length !== 8 || !authSession) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: authSession,
          otp,
          email,
          isSignup: false,
          challengeName: challengeName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      localStorage.setItem(
        "auction_auth_tokens",
        JSON.stringify({
          idToken: data.idToken,
          accessToken: data.accessToken,
          expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
        })
      );

      refreshTokens();
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      console.error("Login OTP verification error:", err);
      setIsLoading(false);
    }
  };

  const handleSignupNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName) {
      setSignupStep("email");
    } else {
      setError("Please fill in both first and last name");
    }
  };

  const handleSignupEmailNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          isSignup: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setAuthSession(data.session);
      setChallengeName(data.challengeName);
      setSignupStep("email-otp");
      setOtp("");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
      console.error("Signup email error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupEmailOtpVerify = async () => {
    if (otp.length !== 8 || !authSession) return;

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session: authSession,
          otp,
          email,
          isSignup: true,
          name: `${firstName} ${lastName}`,
          challengeName: challengeName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // Store tokens in localStorage (same as login flow)
      localStorage.setItem(
        "auction_auth_tokens",
        JSON.stringify({
          idToken: data.idToken,
          accessToken: data.accessToken,
          expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
        })
      );

      refreshTokens();
      
      // Navigate to home page instead of showing success message
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
      console.error("Signup OTP verification error:", err);
      setIsLoading(false);
    }
  };

  const handleBackToSignupStep = (step: SignupStep) => {
    setSignupStep(step);
    setOtp("");
  };

  const handleBackToLoginInput = () => {
    setLoginStep("input");
    setOtp("");
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setLoginStep("input");
    setSignupStep("name");
    setOtp("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-12">
          <h1 className="tracking-tight">Luxe Auction</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to the world of curated luxury
          </p>
        </div>

        {signupSuccess && (
          <div className="bg-white rounded-lg border border-border p-8 shadow-sm mb-4">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Account Verified!</h3>
              <p className="text-muted-foreground mb-4">
                Your account has been successfully created and verified.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to login...
              </p>
            </div>
          </div>
        )}

        {!signupSuccess && (
          <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
            <div className="flex gap-1 mb-8 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => handleSwitchMode("login")}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all ${
                  authMode === "login"
                    ? "bg-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => handleSwitchMode("signup")}
                className={`flex-1 py-2.5 px-4 rounded-md transition-all ${
                  authMode === "signup"
                    ? "bg-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            {authMode === "login" && (
              <>
                {loginStep === "input" && (
                  <div>
                    <h3 className="mb-6">Login to your account</h3>

                    <form onSubmit={handleLoginSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email Address</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? "Sending..." : "Submit"}
                      </Button>
                    </form>
                  </div>
                )}

                {loginStep === "otp" && (
                  <div>
                    <button
                      onClick={handleBackToLoginInput}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>

                    <h3 className="mb-2">Verify OTP</h3>
                    <p className="text-muted-foreground mb-6">
                      Enter the 8-digit code sent to {email}
                    </p>

                    <div className="space-y-5">
                      <div className="flex justify-center">
                        <InputOTP maxLength={8} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                            <InputOTPSlot index={6} />
                            <InputOTPSlot index={7} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        onClick={handleLoginOtpVerify}
                        disabled={otp.length !== 8 || isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? "Verifying..." : "Verify & Login"}
                      </Button>

                      <button 
                        className="w-full text-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={handleBackToLoginInput}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {authMode === "signup" && (
              <>
                {signupStep === "name" && (
                  <div>
                    <h3 className="mb-6">Create your account</h3>

                    <form
                      onSubmit={handleSignupNameNext}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input
                          id="first-name"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input
                          id="last-name"
                          type="text"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        Next
                      </Button>
                    </form>
                  </div>
                )}

                {signupStep === "email" && (
                  <div>
                    <button
                      onClick={() => handleBackToSignupStep("name")}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h3 className="mb-2">Verify your email address</h3>
                    <p className="text-muted-foreground mb-6">
                      We&apos;ll send you a verification code
                    </p>
                    <form
                      onSubmit={handleSignupEmailNext}
                      className="space-y-5"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? "Sending..." : "Send Verification Code"}
                      </Button>
                    </form>
                  </div>
                )}

                {signupStep === "email-otp" && (
                  <div>
                    <button
                      onClick={() => handleBackToSignupStep("email")}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <h3 className="mb-2">Verify email OTP</h3>
                    <p className="text-muted-foreground mb-6">
                      Enter the 8-digit code sent to {email}
                    </p>
                    <div className="space-y-5">
                      <div className="flex justify-center">
                        <InputOTP maxLength={8} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                            <InputOTPSlot index={6} />
                            <InputOTPSlot index={7} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                          {error}
                        </div>
                      )}
                      <Button
                        onClick={handleSignupEmailOtpVerify}
                        disabled={otp.length !== 8 || isLoading}
                        className="w-full h-11 bg-primary hover:bg-primary/90"
                      >
                        {isLoading ? "Verifying..." : "Verify & Create Account"}
                      </Button>
                      <button 
                        className="w-full text-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleBackToSignupStep("email")}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
