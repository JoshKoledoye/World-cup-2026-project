import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/react";
import Everything from "./components/everything";

function AuthPage({ mode }) {
  const isSignIn = mode === "sign-in";
  const title = isSignIn ? "Welcome back" : "Join TriOnda 26";
  const subtitle = isSignIn
    ? "Sign in to keep your tournament dashboard synced."
    : "Create your account for match picks, trivia, and fan events.";

  return (
    <main className="min-h-screen bg-primary text-on-primary flex items-center justify-center px-margin-mobile py-lg">
      <section className="w-full max-w-6xl grid gap-lg lg:grid-cols-[0.95fr_1.05fr] items-center">
        <div className="space-y-md">
          <Link
            to="/"
            className="inline-flex font-label-caps text-label-caps text-tertiary-fixed hover:text-tertiary-fixed-dim transition-colors"
          >
            Back to TriOnda 26
          </Link>
          <div className="space-y-sm">
            <p className="font-label-caps text-label-caps uppercase text-on-primary-container">
              Account access
            </p>
            <h1 className="font-display-lg text-headline-lg md:text-display-lg uppercase">
              {title}
            </h1>
            <p className="font-body-lg text-on-primary-container max-w-md">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          {isSignIn ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full",
                  card: "shadow-none border border-outline-variant",
                },
              }}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full",
                  card: "shadow-none border border-outline-variant",
                },
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Everything />} />
        <Route path="/sign-in/*" element={<AuthPage mode="sign-in" />} />
        <Route path="/sign-up/*" element={<AuthPage mode="sign-up" />} />
      </Routes>
    </BrowserRouter>
  );
}
