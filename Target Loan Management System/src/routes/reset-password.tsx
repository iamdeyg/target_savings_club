import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Target Savings and Loans Club" },
      {
        name: "description",
        content:
          "Reset access to your Target Savings and Loans Club portal account.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword } = useStore();
  const [step, setStep] = useState<"identify" | "password">("identify");
  const [identifier, setIdentifier] = useState("");
  const [passwordDraft, setPasswordDraft] = useState({
    next: "",
    confirm: "",
  });

  const identifierReady = identifier.trim().length > 0;
  const passwordReady =
    passwordDraft.next.length >= 6 && passwordDraft.confirm.length >= 6;
  const passwordsMatch =
    passwordDraft.next.length > 0 &&
    passwordDraft.next === passwordDraft.confirm;

  const continueToPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!identifierReady) {
      toast.error("Enter your member ID, email, or admin email");
      return;
    }
    setStep("password");
  };

  const submitNewPassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordDraft.next.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (!passwordsMatch) {
      toast.error("New passwords do not match");
      return;
    }

    const ok = resetPassword(identifier, passwordDraft.next);
    if (!ok) {
      toast.error("We could not find that account");
      setStep("identify");
      return;
    }

    toast.success("Password reset successfully");
    navigate({ to: "/" });
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
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-12 w-12 rounded-2xl" />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">
                Target Savings and Loans Club
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-primary-strong">
                Account recovery
              </div>
            </div>
          </div>

          <h1 className="mt-10 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
            Restore access.
            <br />
            <span className="text-primary">Stay in control.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Confirm the account you use for the portal, then choose a new
            password for secure access to your savings and loan records.
          </p>

          <div className="mt-8 grid max-w-md gap-3 text-sm">
            {[
              "Use your Member ID, member email, admin email, or admin username.",
              "Choose a password with at least 6 characters.",
              "After reset, sign in with the new password.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-xl border bg-card/70 p-3 backdrop-blur"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <div className="rounded-3xl border bg-card p-6 shadow-elevated md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  Reset password
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step === "identify"
                    ? "Start with the account you want to recover."
                    : "Set a new password for this account."}
                </p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                {step === "identify" ? (
                  <UserRound className="h-5 w-5" />
                ) : (
                  <ShieldCheck className="h-5 w-5" />
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <StepPill active={step === "identify"} label="Account" />
              <StepPill active={step === "password"} label="New password" />
            </div>

            {step === "identify" ? (
              <form onSubmit={continueToPassword} className="mt-6 space-y-5">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Member's ID or email
                  </span>
                  <div className="relative mt-1">
                    <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="e.g. TSL-001 or admin@target.club"
                      className={inputClassName}
                      autoComplete="username"
                      required
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We will match this to a portal account before saving.
                  </p>
                </label>

                <button
                  type="submit"
                  disabled={!identifierReady}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <KeyRound className="h-4 w-4" />
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={submitNewPassword} className="mt-6 space-y-4">
                <div className="rounded-xl border bg-muted/40 px-4 py-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resetting
                  </div>
                  <div className="mt-1 font-semibold">{identifier}</div>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    New password
                  </span>
                  <div className="relative mt-1">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      minLength={6}
                      value={passwordDraft.next}
                      onChange={(e) =>
                        setPasswordDraft({
                          ...passwordDraft,
                          next: e.target.value,
                        })
                      }
                      placeholder="Enter a new password"
                      className={inputClassName}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Confirm password
                  </span>
                  <div className="relative mt-1">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="password"
                      minLength={6}
                      value={passwordDraft.confirm}
                      onChange={(e) =>
                        setPasswordDraft({
                          ...passwordDraft,
                          confirm: e.target.value,
                        })
                      }
                      placeholder="Re-enter new password"
                      className={inputClassName}
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      passwordsMatch ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {passwordsMatch
                      ? "Passwords match"
                      : "Both password fields must match"}
                  </p>
                </label>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setStep("identify")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent-soft"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!passwordReady || !passwordsMatch}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Reset password
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 border-t pt-5 text-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-strong hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPill({ active, label }: { active: boolean; label: string }) {
  return (
    <div
      className={`rounded-full px-3 py-2 text-center text-xs font-semibold ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {label}
    </div>
  );
}

const inputClassName =
  "w-full rounded-xl border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring";
