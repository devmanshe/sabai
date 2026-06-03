"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import AppToast from "@/components/AppToast";
import { useApp } from "@/lib/store";
import { products } from "@/lib/data";
import type { UserProfile, UserRole } from "@/lib/types";

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

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isReady, login, register, addToCart } = useApp();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const intent = searchParams.get("intent");
  const productId = searchParams.get("productId");

  const resolvePostLogin = (loggedUserProfileComplete: boolean) => {
    const targetProduct = productId ? products.find((item) => item.id === productId) : null;

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
    password: "",
    role: "user" as UserRole
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

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitted(true);
    const loggedUser = login({
      identifier: loginForm.identifier,
      password: loginForm.password,
      role: loginForm.role
    });

    if (loggedUser.role === "admin" || loggedUser.role === "superadmin") {
      router.push("/admin");
      return;
    }

    resolvePostLogin(isProfileComplete(loggedUser.profile));
  };

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSubmitted(true);
    register({
      name: registerForm.name,
      username: registerForm.username,
      phone: registerForm.phone,
      email: registerForm.email,
      password: registerForm.password
    });
    resolvePostLogin(false);
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
              <div className="auth-field">
                <label className="auth-label">Demo Role</label>
                <select
                  className="auth-input"
                  value={loginForm.role}
                  onChange={(event) =>
                    setLoginForm({ ...loginForm, role: event.target.value as UserRole })
                  }
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
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
