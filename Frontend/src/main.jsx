import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ClerkProvider } from "@clerk/react";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkKey() {
  return (
    <main className="min-h-screen bg-primary text-on-primary flex items-center justify-center px-6">
      <section className="max-w-xl space-y-4 border border-outline-variant bg-surface-container-lowest text-on-surface p-8">
        <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
          Clerk setup needed
        </p>
        <h1 className="font-display-lg text-headline-lg">Add your Clerk key</h1>
        <p className="font-body-md text-on-surface-variant">
          Set <code>VITE_CLERK_PUBLISHABLE_KEY</code> in your frontend env file,
          then restart the Vite dev server.
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {clerkPublishableKey ? (
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignOutUrl="/"
      >
        <App />
      </ClerkProvider>
    ) : (
      <MissingClerkKey />
    )}
  </StrictMode>,
);
