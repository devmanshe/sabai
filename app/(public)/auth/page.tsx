"use client"

<<<<<<< Updated upstream
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
=======
import { FormComponent } from "@/components/form/Form"
import { registerGroup, loginGroup } from "@/fields/authFields"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import AppToast from "@/components/AppToast"
import { useLogin, useRegister } from "@/hooks/useAuth"
import { Phone } from "lucide-react"
import { loginSchema, registerSchema } from "@/schema/authSchema"
>>>>>>> Stashed changes

export default function AuthPage(){
  const router = useRouter()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  const [registerForm, setRegisterForm] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    confirm: "",
  })

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "login" | "register",
    fieldName: string
  ) => {
    if(formType === "login"){
      setLoginForm((prev) => ({...prev, [fieldName]: e.target.value}))
    } else {
      setRegisterForm((prev) => ({...prev, [fieldName]: e.target.value}))
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    console.log("this button fired")
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const result = loginSchema.safeParse(loginForm)
    console.log("login parse result ", result)
    if(!result.success){
      const errors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if(err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFieldErrors(errors)
      return
    }
    loginMutation.mutate({
      email: loginForm.email,
      password: loginForm.password
    })
  }

  const handleRegister = (e: React.FormEvent) => {
    console.log("this button fired register")
    e.preventDefault();
    setError("");
    setFieldErrors({})
    const result = registerSchema.safeParse(registerForm)
        console.log("register parse result ", result)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message
      })
      setFieldErrors(errors)
      return
  }
    registerMutation.mutate({
      email: registerForm.email,
      password: registerForm.password,
      username: registerForm.username,
      phone: registerForm.phone,
      role: "Buyer"
    })
  }

  const isLoading = loginMutation.isPending || registerMutation.isPending

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
              Manage Thailand merch group orders with calm workflows, clear
              status updates, and easy coordination.
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
            <h2 className="auth-title">
              {tab === "login" ? "Welcome Back" : "Sign Up"}
            </h2>
            <p className="auth-subtitle">Your Social Campaigns</p>
          </div>

          {tab === "login" ? (
            <form onSubmit={handleLogin}>
<<<<<<< Updated upstream
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
=======
              {loginGroup.map((group, groupIdx) => (
                <React.Fragment key={`login-group-${groupIdx}`}>
                  {group.fields.map((field) => (
                    <div key={field.name} className="auth-field">
                      <label className="auth-label">{field.label}</label>
                      <input
                        type={field.type}
                        className="auth-input"
                        value={loginForm[field.name as keyof typeof loginForm] || ""}
                        onChange={(e) => handleInputChange(e, "login", field.name)}
                        placeholder={field.label}
                        required
                      />
                    </div>
                  ))}
                </React.Fragment>
              ))}

              <div className="auth-divider">Or with</div>
              <div className="auth-socials">
                <button type="button" className="auth-social-btn">Sign in with Google</button>
                <button type="button" className="auth-social-btn">Sign in with Apple</button>
              </div>
              <button type="submit" className="auth-primary" disabled={isLoading}>
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
>>>>>>> Stashed changes
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
              {registerGroup.map((group, groupIdx) => (
                <React.Fragment key={`register-group-${groupIdx}`}>
                  {group.fields.map((field) => (
                    <div key={field.name} className="auth-field">
                      <label className="auth-label">{field.label}</label>
                      <input
                        type={field.type === "number" ? "text" : field.type}
                        className="auth-input"
                        value={registerForm[field.name as keyof typeof registerForm] || ""}
                        onChange={(e) => handleInputChange(e, "register", field.name)}
                        placeholder={field.placeholder || field.label}
                        required
                      />
                      {field.name === "password" && field.placeholder && (
                        <p className="auth-help">{field.placeholder}</p>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}

              <label className="auth-checkbox">
                <input type="checkbox" required /> I accept the Terms
              </label>
<<<<<<< Updated upstream
              
              <button type="submit" className="auth-primary">
                Sign Up
=======

              <div className="auth-divider">Or with</div>
              <div className="auth-socials">
                <button type="button" className="auth-social-btn">Sign up with Google</button>
                <button type="button" className="auth-social-btn">Sign up with Apple</button>
              </div>
              <button type="submit" className="auth-primary" disabled={isLoading}>
                {registerMutation.isPending ? "Creating account..." : "Sign Up"}
>>>>>>> Stashed changes
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

// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams } from "next/navigation";
// import { useRouter } from "next/navigation";
// import AppToast from "@/components/AppToast";
// import { useApp } from "@/lib/store";
// import { products } from "@/lib/data";
// import { loginGroup, registerGroup } from "@/fields/authFields";
// import type { UserProfile, UserRole } from "@/lib/types";

// const isProfileComplete = (profile: UserProfile) => {
//   return (
//     Boolean(profile.fullName) &&
//     Boolean(profile.phone) &&
//     Boolean(profile.address) &&
//     Boolean(profile.province) &&
//     Boolean(profile.city) &&
//     Boolean(profile.postalCode)
//   );
// };

// export default function AuthPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { user, isReady, login, register, addToCart } = useApp();
//   const [tab, setTab] = useState<"login" | "register">("login");
//   const [error, setError] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const intent = searchParams.get("intent");
//   const productId = searchParams.get("productId");
//   const resolvePostLogin = (loggedUserProfileComplete: boolean) => {
//     const targetProduct = productId ? products.find((item) => item.id === productId) : null;

//     if (intent === "cart" && targetProduct) {
//       addToCart(targetProduct, 1);
//       router.push("/cart");
//       return;
//     }

//     if (intent === "buy" && targetProduct) {
//       if (!loggedUserProfileComplete) {
//         router.push("/profile");
//         return;
//       }
//       addToCart(targetProduct, 1);
//       router.push("/checkout");
//       return;
//     }

//     if (!loggedUserProfileComplete) {
//       router.push("/profile");
//       return;
//     }

//     router.push("/");
//   };

//   const [loginForm, setLoginForm] = useState({
//     identifier: "",
//     password: "",
//     role: "User" as UserRole
//   });

//   const [registerForm, setRegisterForm] = useState({
//     name: "",
//     username: "",
//     phone: "",
//     email: "",
//     password: "",
//     confirm: ""
//   });

//   useEffect(() => {
//     if (!isReady || !user || submitted) return;

//     if (user.role === "Admin" || user.role === "Superadmin") {
//       router.replace("/admin");
//       return;
//     }

//     if (!isProfileComplete(user.profile)) {
//       router.replace("/profile");
//       return;
//     }

//     router.replace("/");
//   }, [isReady, router, submitted, user]);

//   if (!isReady) {
//     return (
//       <div className="auth-shell" style={{ display: "grid", placeItems: "center" }}>
//         <p style={{ fontWeight: 700, color: "#4e626a" }}>Preparing authentication...</p>
//       </div>
//     );
//   }

//   if (user) {
//     return (
//       <div className="auth-shell" style={{ display: "grid", placeItems: "center" }}>
//         <p style={{ fontWeight: 700, color: "#4e626a" }}>Redirecting...</p>
//       </div>
//     );
//   }

//   const handleLogin = (event: React.FormEvent) => {
//     event.preventDefault();
//     setError("");
//     setSubmitted(true);
//     const loggedUser = login({
//       identifier: loginForm.identifier,
//       password: loginForm.password,
//       role: loginForm.role
//     });

//     if (loggedUser.role === "Admin" || loggedUser.role === "Superadmin") {
//       router.push("/admin");
//       return;
//     }

//     resolvePostLogin(isProfileComplete(loggedUser.profile));
//   };

//   const handleRegister = (event: React.FormEvent) => {
//     event.preventDefault();
//     if (registerForm.password !== registerForm.confirm) {
//       setError("Passwords do not match.");
//       return;
//     }
//     setError("");
//     setSubmitted(true);
//     register({
//       name: registerForm.name,
//       username: registerForm.username,
//       phone: registerForm.phone,
//       email: registerForm.email,
//       password: registerForm.password
//     });
//     resolvePostLogin(false);
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement>,
//     formType: "login" | "register",
//     fieldName: string
//   ) => {
//     if(formType === "login"){
//       setLoginForm((prev) => ({...prev, [fieldName]: e.target.value}))
//     } else {
//       setRegisterForm((prev) => ({...prev, [fieldName]: e.target.value}))
//     }
//   }

//   return (
//     <div className="auth-shell">
//       <AppToast
//         open={Boolean(error)}
//         variant="error"
//         title="Perlu Diperbaiki"
//         message={error || "Terjadi kesalahan saat proses autentikasi."}
//         onClose={() => setError("")}
//         autoHideMs={2800}
//       />
//       <section className="auth-frame">
//         <div className="auth-hero">
//           <div>
//             <p className="auth-eyebrow">Sabai Merch GO</p>
//             <h1>Fast, Efficient and Productive</h1>
//             <p>
//               Manage Thailand merch group orders with calm workflows, clear status updates, and
//               easy coordination.
//             </p>
//           </div>
//           <div className="auth-hero-footer">
//             <div className="auth-language">
//               <span>EN</span>
//               <span>English</span>
//             </div>
//             <div className="auth-hero-links">
//               <button type="button">Terms</button>
//               <button type="button">Plans</button>
//               <button type="button">Contact Us</button>
//             </div>
//           </div>
//         </div>

//         <div className="auth-card">
//           <div className="auth-tabs">
//             <button
//               type="button"
//               onClick={() => setTab("register")}
//               className={`auth-tab ${tab === "register" ? "active" : ""}`}
//             >
//               Sign Up
//             </button>
//             <button
//               type="button"
//               onClick={() => setTab("login")}
//               className={`auth-tab ${tab === "login" ? "active" : ""}`}
//             >
//               Sign In
//             </button>
//           </div>

//           <div>
//             <h2 className="auth-title">{tab === "login" ? "Welcome Back" : "Sign Up"}</h2>
//             <p className="auth-subtitle">Your Social Campaigns</p>
//           </div>

//           {tab === "login" ? (
//             <form onSubmit={handleLogin}>
//               {/* Dynamic Login Fields */}
//               {loginGroup.map((group, groupIdx) => (
//                 <div key={`login-group-${groupIdx}`} style={{ display: "contents" }}>
//                   {group.fields.map((field) => (
//                     <div key={field.name} className="auth-field">
//                       <label className="auth-label">{field.label}</label>
//                       <input
//                         type={field.type}
//                         className="auth-input"
//                         value={loginForm[field.name as keyof typeof loginForm] || ""}
//                         onChange={(e) => handleInputChange(e, "login", field.name)}
//                         placeholder={field.label}
//                         required
//                       />
//                     </div>
//                   ))}
//                 </div>
//               ))}

//               <div className="auth-divider">Or with</div>
//               <div className="auth-socials">
//                 <button type="button" className="auth-social-btn">Sign in with Google</button>
//                 <button type="button" className="auth-social-btn">Sign in with Apple</button>
//               </div>
//               <button type="submit" className="auth-primary">Sign In</button>
//               <div className="auth-switch">
//                 New here? <button type="button" onClick={() => setTab("register")}>Create account</button>
//               </div>
//             </form>
//           ) : (
//             <form onSubmit={handleRegister}>
//               {/* Dynamic Register Fields */}
//               {registerGroup.map((group, groupIdx) => (
//                 <div key={`reg-group-${groupIdx}`} style={{ display: "contents" }}>
//                   {group.fields.map((field) => (
//                     <div key={field.name} className="auth-field">
//                       <label className="auth-label">{field.label}</label>
//                       <input
//                         type={field.type === "number" ? "text" : field.type}
//                         className="auth-input"
//                         value={registerForm[field.name as keyof typeof registerForm] || ""}
//                         onChange={(e) => handleInputChange(e, "register", field.name)}
//                         placeholder={field.placeholder || field.label}
//                         required
//                       />
//                       {field.name === "password" && field.placeholder && (
//                         <p className="auth-help">{field.placeholder}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ))}

//               <label className="auth-checkbox">
//                 <input type="checkbox" required /> I accept the Terms
//               </label>
            
//               <div className="auth-divider">Or with</div>
//               <div className="auth-socials">
//                 <button type="button" className="auth-social-btn">Sign up with Google</button>
//                 <button type="button" className="auth-social-btn">Sign up with Apple</button>
//               </div>
//               <button type="submit" className="auth-primary">Sign Up</button>
//               <div className="auth-switch">
//                 Already have an account? <button type="button" onClick={() => setTab("login")}>Sign In</button>
//               </div>
//             </form>
//           )}        
//         </div>
//       </section>
//     </div>
//   );
// }
