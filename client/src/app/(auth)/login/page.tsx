"use client";

import React, { useEffect } from "react";
import { useSignIn, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useState } from "react";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";

const LoginPage = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded, signIn } = useSignIn();
  // const { user } = useUser();
  const router = useRouter();

  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState("");
  // const [email, setEmail] = useState("");
  // const [verificationCode, setVerificationCode] = useState("");
  // const [showVerificationInput, setShowVerificationInput] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/");
    }
  }, [authLoaded, isSignedIn, router]);

  if (!isLoaded || !authLoaded) {
    return null;
  }

  // interface SignInResult {
  //   status: "needs_first_factor" | string | null;
  // }

  // const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const result: SignInResult = await signIn.create({
  //       identifier: email,
  //     });

  //     if (result.status === "needs_first_factor") {
  //       setShowVerificationInput(true);
  //     }
  //   } catch (err: unknown) {
  //     console.error("Error during sign-in:", err);
  //     setError("Something went wrong. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const result = await signIn.attemptFirstFactor({
  //       strategy: "email_code",
  //       code: verificationCode,
  //     });

  //     if (result.status === "complete") {
  //       router.replace("/auth/callback");
  //     } else {
  //       setError("Verification failed. Please try again.");
  //     }
  //   } catch (err: unknown) {
  //     console.error("Error verifying code:", err);
  //     setError("Invalid verification code. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleGoogleSignIn = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/callback",
        redirectUrlComplete: "/callback",
      });
    } catch (err: unknown) {
      console.error("Error signing in with Google:", err);
      // setError("Error signing in with Google");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Orion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              // disabled={loading}
            >
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </Button>

            {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div> */}

            {/* <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    placeholder="Enter your email"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending code..." : "Sign In with Email"}
                </Button>
              </form>
            </>
          )}

          {showVerificationInput && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter the verification code sent to your email"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowVerificationInput(false)}
                disabled={loading}
              >
                Back
              </Button>
            </form> */}
          </>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
