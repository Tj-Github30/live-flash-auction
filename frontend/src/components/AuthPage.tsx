import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { InputOTP, InputOTPGroup, InputOTPSlot } from './ui/input-otp';
import { ArrowLeft } from 'lucide-react';

type AuthMode = 'login' | 'signup';
type LoginMethod = 'email' | 'mobile';
type LoginStep = 'input' | 'otp';
type SignupStep = 'name' | 'mobile' | 'mobile-otp' | 'email' | 'email-otp';

interface AuthPageProps {
  onAuthenticated: () => void;
}

export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [loginStep, setLoginStep] = useState<LoginStep>('input');
  const [signupStep, setSignupStep] = useState<SignupStep>('name');
  
  // Form values
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Login handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep('otp');
  };

  const handleLoginOtpVerify = () => {
    if (otp.length === 6) {
      onAuthenticated();
    }
  };

  const handleBackToLoginInput = () => {
    setLoginStep('input');
    setOtp('');
  };

  // Signup handlers
  const handleSignupNameNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName && lastName) {
      setSignupStep('mobile');
    }
  };

  const handleSignupMobileNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile) {
      setSignupStep('mobile-otp');
    }
  };

  const handleSignupMobileOtpVerify = () => {
    if (otp.length === 6) {
      setOtp('');
      setSignupStep('email');
    }
  };

  const handleSignupEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSignupStep('email-otp');
    }
  };

  const handleSignupEmailOtpVerify = () => {
    if (otp.length === 6) {
      onAuthenticated();
    }
  };

  const handleBackToSignupStep = (step: SignupStep) => {
    setSignupStep(step);
    setOtp('');
  };

  const handleSwitchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setLoginStep('input');
    setSignupStep('name');
    setOtp('');
    setEmail('');
    setMobile('');
    setFirstName('');
    setLastName('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="tracking-tight">Luxe Auction</h1>
          <p className="text-muted-foreground mt-2">Welcome to the world of curated luxury</p>
        </div>

        {/* Auth Box */}
        <div className="bg-white rounded-lg border border-border p-8 shadow-sm">
          {/* Mode Toggle */}
          <div className="flex gap-1 mb-8 p-1 bg-secondary rounded-lg">
            <button
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-2.5 px-4 rounded-md transition-all ${
                authMode === 'login'
                  ? 'bg-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => handleSwitchMode('signup')}
              className={`flex-1 py-2.5 px-4 rounded-md transition-all ${
                authMode === 'signup'
                  ? 'bg-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Flow */}
          {authMode === 'login' && (
            <>
              {loginStep === 'input' && (
                <div>
                  <h3 className="mb-6">Login to your account</h3>
                  
                  {/* Login Method Radio Group */}
                  <RadioGroup 
                    value={loginMethod} 
                    onValueChange={(value) => setLoginMethod(value as LoginMethod)}
                    className="mb-6"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="email" id="email-radio" />
                      <Label htmlFor="email-radio" className="flex-1 cursor-pointer">
                        Login via Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-md border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="mobile" id="mobile-radio" />
                      <Label htmlFor="mobile-radio" className="flex-1 cursor-pointer">
                        Login via Mobile
                      </Label>
                    </div>
                  </RadioGroup>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    {loginMethod === 'email' ? (
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
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="login-mobile">Mobile Number</Label>
                        <Input
                          id="login-mobile"
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                          className="h-11"
                        />
                      </div>
                    )}

                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
                      Submit
                    </Button>
                  </form>
                </div>
              )}

              {loginStep === 'otp' && (
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
                    Enter the 6-digit code sent to {loginMethod === 'email' ? email : mobile}
                  </p>

                  <div className="space-y-5">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleLoginOtpVerify}
                      disabled={otp.length !== 6}
                      className="w-full h-11 bg-primary hover:bg-primary/90"
                    >
                      Verify & Login
                    </Button>

                    <button className="w-full text-center text-muted-foreground hover:text-foreground transition-colors">
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Signup Flow */}
          {authMode === 'signup' && (
            <>
              {signupStep === 'name' && (
                <div>
                  <h3 className="mb-6">Create your account</h3>
                  
                  <form onSubmit={handleSignupNameNext} className="space-y-5">
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

                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
                      Next
                    </Button>
                  </form>
                </div>
              )}

              {signupStep === 'mobile' && (
                <div>
                  <button
                    onClick={() => handleBackToSignupStep('name')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h3 className="mb-2">Verify your mobile number</h3>
                  <p className="text-muted-foreground mb-6">
                    We'll send you a verification code
                  </p>
                  
                  <form onSubmit={handleSignupMobileNext} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="signup-mobile">Mobile Number</Label>
                      <Input
                        id="signup-mobile"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Include your country code (e.g., +1 for US)
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
                      Send Verification Code
                    </Button>
                  </form>
                </div>
              )}

              {signupStep === 'mobile-otp' && (
                <div>
                  <button
                    onClick={() => handleBackToSignupStep('mobile')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h3 className="mb-2">Verify mobile OTP</h3>
                  <p className="text-muted-foreground mb-6">
                    Enter the 6-digit code sent to {mobile}
                  </p>

                  <div className="space-y-5">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleSignupMobileOtpVerify}
                      disabled={otp.length !== 6}
                      className="w-full h-11 bg-primary hover:bg-primary/90"
                    >
                      Verify Mobile
                    </Button>

                    <button className="w-full text-center text-muted-foreground hover:text-foreground transition-colors">
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}

              {signupStep === 'email' && (
                <div>
                  <button
                    onClick={() => handleBackToSignupStep('mobile-otp')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h3 className="mb-2">Verify your email address</h3>
                  <p className="text-muted-foreground mb-6">
                    We'll send you a verification code
                  </p>
                  
                  <form onSubmit={handleSignupEmailNext} className="space-y-5">
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
                      <p className="text-xs text-muted-foreground">
                        We'll use this email for auction notifications
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90">
                      Send Verification Code
                    </Button>
                  </form>
                </div>
              )}

              {signupStep === 'email-otp' && (
                <div>
                  <button
                    onClick={() => handleBackToSignupStep('email')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>

                  <h3 className="mb-2">Verify email OTP</h3>
                  <p className="text-muted-foreground mb-6">
                    Enter the 6-digit code sent to {email}
                  </p>

                  <div className="space-y-5">
                    <div className="flex justify-center">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleSignupEmailOtpVerify}
                      disabled={otp.length !== 6}
                      className="w-full h-11 bg-primary hover:bg-primary/90"
                    >
                      Verify & Create Account
                    </Button>

                    <button className="w-full text-center text-muted-foreground hover:text-foreground transition-colors">
                      Resend OTP
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <a href="#" className="hover:text-foreground transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="hover:text-foreground transition-colors">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
