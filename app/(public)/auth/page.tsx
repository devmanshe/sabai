"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import { products as fallbackProducts } from "@/lib/data";
import type { UserProfile } from "@/lib/types";

const isProfileComplete = (profile: UserProfile) => {
  return (
    Boolean(profile.fullName.trim()) &&
    /^\d{8,15}$/.test(profile.phone.trim()) &&
    Boolean(profile.address.trim()) &&
    Boolean(profile.province.trim()) &&
    Boolean(profile.city.trim()) &&
    /^\d{5}$/.test(profile.postalCode.trim())
  );
};

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isReady, login, register, addToCart, products } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const intent = searchParams.get("intent");
  const productId = searchParams.get("productId");

  const resolvePostLogin = (loggedUserProfileComplete: boolean) => {
    const targetProduct = productId
      ? products.find((item) => item.id === productId) ?? fallbackProducts.find((item) => item.id === productId)
      : null;

    if (intent === "cart" && targetProduct) {
      addToCart(targetProduct, 1);
      router.push("/cart");
      return;
    }

    if (intent === "buy" && targetProduct) {
      if (!loggedUserProfileComplete) {
        router.push("/profile");
        return;
      }
      addToCart(targetProduct, 1);
      router.push("/checkout");
      return;
    }

    if (!loggedUserProfileComplete) {
      router.push("/profile");
      return;
    }

    router.push("/");
  };

  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirm: ""
  });

  useEffect(() => {
    if (!isReady || !user || submitted) return;

    if (user.role === "admin" || user.role === "superadmin") {
      router.replace("/admin");
      return;
    }

    if (!isProfileComplete(user.profile)) {
      router.replace("/profile");
      return;
    }

    router.replace("/");
  }, [isReady, router, submitted, user]);

  if (!isReady) {
    return (
      <div className="auth-shell" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ fontWeight: 700, color: "#4e626a" }}>Preparing authentication...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="auth-shell" style={{ display: "grid", placeItems: "center" }}>
        <p style={{ fontWeight: 700, color: "#4e626a" }}>Redirecting...</p>
      </div>
    );
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      setSubmitted(true);
      const loggedUser = await login({
        identifier: loginForm.identifier,
        password: loginForm.password
      });

      if (loggedUser.role === "admin" || loggedUser.role === "superadmin") {
        router.push("/admin");
        return;
      }

      resolvePostLogin(isProfileComplete(loggedUser.profile));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      setError(message);
      setSubmitted(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError("");

    try {
      setSubmitted(true);
      const registeredUser = await register({
        name: registerForm.name,
        username: registerForm.username,
        phone: registerForm.phone,
        email: registerForm.email,
        password: registerForm.password
      });

      resolvePostLogin(isProfileComplete(registeredUser.profile));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Register gagal";
      setError(message);
      setSubmitted(false);
    }
  };

  return (
    <div className="auth-shell">
      <AppToast
        open={Boolean(error)}
        variant="error"
        title="Perlu Diperbaiki"
        message={error || "Terjadi kesalahan saat proses autentikasi."}
        onClose={() => setError("")}
        autoHideMs={2800}
      />
      <section className="auth-frame">
        <div className="auth-hero">
          <div>
            <p className="auth-eyebrow">Sabai Merch GO</p>
            <h1>Fast, Efficient and Productive</h1>
            <p>
              Manage Thailand merch group orders with calm workflows, clear status updates, and
              easy coordination.
            </p>
          </div>
          <div className="auth-hero-footer">
            <div className="auth-language">
              <span>EN</span>
              <span>English</span>
            </div>
            <div className="auth-hero-links">
              <button type="button">Terms</button>
              <button type="button">Plans</button>
              <button type="button">Contact Us</button>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`auth-tab ${tab === "register" ? "active" : ""}`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`auth-tab ${tab === "login" ? "active" : ""}`}
            >
              Sign In
            </button>
          </div>

          <div>
            <h2 className="auth-title">{tab === "login" ? "Welcome Back" : "Sign Up"}</h2>
            <p className="auth-subtitle">Your Social Campaigns</p>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
              <div className="auth-field">
                <label className="auth-label">Email or Username</label>
                <input
                  className="auth-input"
                  value={loginForm.identifier}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, identifier: event.target.value })
                  }
                  placeholder="you@sabai.com"
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  className="auth-input"
                  value={loginForm.password}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, password: event.target.value })
                  }
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="auth-primary">
                Sign In
              </button>
              <div className="auth-switch">
                New here?{" "}
                <button type="button" onClick={() => setTab("register")}>
                  Create account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="auth-field">
                <label className="auth-label">Name</label>
                <input
                  className="auth-input"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, name: event.target.value })
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  className="auth-input"
                  value={registerForm.username}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, username: event.target.value })
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Phone</label>
                <input
                  className="auth-input"
                  value={registerForm.phone}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, phone: event.target.value })
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  className="auth-input"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, email: event.target.value })
                  }
                  required
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  type="password"
                  className="auth-input"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, password: event.target.value })
                  }
                  required
                />
                <p className="auth-help">Use 8 or more characters with a mix of letters and numbers.</p>
              </div>
              <div className="auth-field">
                <label className="auth-label">Repeat Password</label>
                <input
                  type="password"
                  className="auth-input"
                  value={registerForm.confirm}
                  onChange={(event) =>
                    setRegisterForm({ ...registerForm, confirm: event.target.value })
                  }
                  required
                />
              </div>
              <label className="auth-checkbox">
                <input type="checkbox" required /> I accept the Terms
              </label>
              
              <button type="submit" className="auth-primary">
                Sign Up
              </button>
              <div className="auth-switch">
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")}>
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AuthPage() { return <Suspense fallback={null}><AuthPageContent /></Suspense>; }
