import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { BrandLogo } from "@/components/brand";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in — Target Savings and Loans Club" },
      {
        name: "description",
        content:
          "Access the Target Savings and Loans Club portal as an admin or as a cooperative member.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { authenticateAdmin, authenticateMember, loginAdmin, loginMember } =
    useStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const identifierReady = identifier.trim().length > 0;
  const passwordReady = password.length > 0;
  const canSubmit = identifierReady && passwordReady;
  const identifierHint = identifierReady
    ? identifier.includes("@")
      ? "Email entered"
      : "Member ID entered"
    : "Use your Member ID, email, or admin email";
  const passwordHint = passwordReady
    ? "Password entered"
    : "Enter the password issued by the admin";

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (authenticateAdmin(identifier, password)) {
      loginAdmin();
      navigate({ to: "/admin" });
      return;
    }

    const member = authenticateMember(identifier, password);
    if (member) {
      loginMember(member.id);
      navigate({ to: "/member" });
      return;
    }

    toast.error("Invalid member ID/email or password");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-primary-soft via-background to-accent-soft">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, oklch(0.85 0.1 130 / 0.35), transparent 40%), radial-gradient(circle at 90% 80%, oklch(0.85 0.08 175 / 0.35), transparent 40%)",
        }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Left — brand + copy */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-12 w-12 rounded-2xl" />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">
                Target Savings and Loans Club
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-strong">
                Cooperative portal
              </div>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Save together.
            <br />
            <span className="text-primary">Grow together.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Manage your monthly contributions, apply for cooperative loans on a
            1% monthly declining balance, and track every naira in one place.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-xs">
            {[
              { k: "1%", v: "Monthly interest" },
              { k: "18 mo", v: "Max repayment" },
              { k: "2×", v: "Loan multiplier" },
            ].map((s) => (
              <div
                key={s.k}
                className="rounded-xl border bg-card/70 p-3 text-center backdrop-blur"
              >
                <div className="text-lg font-bold text-primary">{s.k}</div>
                <div className="mt-0.5 text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — sign in */}
        <div className="w-full">
          <div className="rounded-3xl border bg-card p-6 shadow-elevated md:p-8">
            <h2 className="text-xl font-bold tracking-tight">
              Sign in to continue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Access your cooperative account securely.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Member's ID or email
                </span>
                <div className="relative mt-1">
                  <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. TSL-001 or name@example.com"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    autoComplete="username"
                    required
                  />
                </div>
                <p
                  className={`mt-1 text-xs ${
                    identifierReady ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {identifierHint}
                </p>
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </span>
                <div className="relative mt-1">
                  <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    autoComplete="current-password"
                    required
                  />
                </div>
                <p
                  className={`mt-1 text-xs ${
                    passwordReady ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {passwordHint}
                </p>
              </label>
              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                {canSubmit ? "Sign in" : "Fill required fields"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
