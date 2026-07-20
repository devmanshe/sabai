import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User, UserProfile, UserRole } from "./types";
import { getUserProfile, mapProfileData } from "./auth-service";

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  supabaseUser: any; // Supabase auth user
}

/**
 * Hook to manage Supabase authentication and user session
 * Should be called at the top level of your app (e.g., in store provider)
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get current session
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session?.user) {
          // Load user profile from database
          const profile = await getUserProfile(session.user.id);

          if (profile) {
            const profileWithRole = profile as UserProfile & { role?: UserRole };
            const appUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email || "",
              username: session.user.email?.split("@")[0] || "",
              email: session.user.email || "",
              role: profileWithRole.role ?? "user",
              profile
            };

            setUser(appUser);
            setSupabaseUser(session.user);
          }
        }

        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to initialize auth";
        setError(message);
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);

          if (profile) {
            const profileWithRole = profile as UserProfile & { role?: UserRole };
            const appUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email || "",
              username: session.user.email?.split("@")[0] || "",
              email: session.user.email || "",
              role: profileWithRole.role ?? "user",
              profile
            };

            setUser(appUser);
            setSupabaseUser(session.user);
          }
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setUser(null);
          setSupabaseUser(null);
        }
      } else {
        // User signed out
        setUser(null);
        setSupabaseUser(null);
      }

      setError(null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
    supabaseUser
  };
}
