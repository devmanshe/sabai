import { supabase } from "./supabase";
import type { AddressBookEntry, User, UserProfile, UserRole } from "./types";

export interface AuthSignUpPayload {
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone: string;
}

export interface AuthSignInPayload {
  email: string;
  password: string;
}

export interface UserProfileWithRole extends UserProfile {
  role?: UserRole;
}

function normalizeRole(role: unknown): UserRole {
  return role === "admin" || role === "superadmin" ? (role as UserRole) : "user";
}

/**
 * Sign up a new user with Supabase Auth and create a profile in the database
 */
export async function signUp(payload: AuthSignUpPayload) {
  const { email, password, username, fullName, phone } = payload;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        phone: phone
      }
    }
  });

  if (authError) {
    console.log(authError);
    console.log(authError.message);
    console.log(authError.status);
    console.log(authError.code);

    throw authError;
    }
  if (!authData.user) throw new Error("Failed to create user");

  // Create user profile in database
  const { error: profileError } = await supabase
    .from("profile")
    .insert({
      id: authData.user.id,
      email: authData.user.email,
      username,
      full_name: fullName,
      phone: phone,
      role: "user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    // If profile creation fails, we should delete the auth user
    // await supabase.auth.admin.deleteUser(authData.user.id).catch(() => {});
      console.log("===== PROFILE ERROR =====");
  console.log(profileError);
  console.log("message:", profileError.message);
  console.log("code:", profileError.code);
  console.log("details:", profileError.details);
  console.log("hint:", profileError.hint);
    throw profileError;
  }

  return authData.user;
}



/**
 * Sign in an existing user with Supabase Auth
 */
export async function signIn(payload: AuthSignInPayload) {
  const { email, password } = payload;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  if (!data.user) throw new Error("Failed to sign in");

  return data.user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get current user session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * Change the signed-in user's password via Supabase Auth after verifying the current password.
 */
export async function changePassword(currentPassword: string, newPassword: string) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    throw userError ?? new Error("Sesi login tidak valid.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  });

  if (signInError) {
    throw new Error("Password lama tidak sesuai. Silakan cek kembali password Anda.");
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;
}

/**
 * Get user profile from database
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    if (profileError.code === "PGRST116") {
      return null;
    }
    throw profileError;
  }

  const { data: addressRecords, error: addressError } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  if (addressError) {
    throw addressError;
  }

  const addresses: AddressBookEntry[] = (addressRecords ?? []).map(mapAddressRecord);
  const primaryAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;

  return {
    ...mapProfileData(profileData),
    addressBook: addresses,
    defaultAddressId: primaryAddress?.id ?? null,
    address: primaryAddress?.address ?? "",
    province: primaryAddress?.province ?? "",
    city: primaryAddress?.city ?? "",
    postalCode: primaryAddress?.postalCode ?? ""
  };
}

async function getUserAddressIds(userId: string) {
  const { data, error } = await supabase.from("addresses").select("id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => row.id as string);
}

function mapAddressRecord(data: any): AddressBookEntry {
  return {
    id: data.id,
    label: data.district || "Rumah",
    recipientName: data.recipient_name || "",
    phone: data.phone || "",
    address: data.address || "",
    province: data.province || "",
    city: data.city || "",
    postalCode: data.postal_code || "",
    notes: data.notes ?? "",
    isDefault: Boolean(data.is_default)
  };
}

async function syncUserAddresses(userId: string, addresses: AddressBookEntry[]) {
  const normalized = addresses.map((address) => ({
    id: address.id,
    user_id: userId,
    district: address.label,
    recipient_name: address.recipientName,
    phone: address.phone,
    address: address.address,
    province: address.province,
    city: address.city,
    postal_code: address.postalCode,
    notes: address.notes ?? null,
    is_default: address.isDefault
  }));

  const { error: upsertError } = await supabase
    .from("addresses")
    .upsert(normalized, { onConflict: "id" });

  if (upsertError) throw upsertError;

  const existingIds = await getUserAddressIds(userId);
  const keepIds = normalized.map((address) => address.id);
  const deleteIds = existingIds.filter((id) => !keepIds.includes(id));

  if (deleteIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("addresses")
      .delete()
      .in("id", deleteIds)
      .eq("user_id", userId);

    if (deleteError) throw deleteError;
  }
}

/**
 * Update user profile in database
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
) {
  const profilePayload = {
    full_name: updates.fullName,
    phone: updates.phone,
    avatar_url: updates.avatarUrl,
    birth_date: updates.birthDate,
    gender: updates.gender,
    updated_at: new Date().toISOString()
  };

  const cleanedProfilePayload = Object.fromEntries(
    Object.entries(profilePayload).filter(([, value]) => value !== undefined)
  );

  try {
    const { data, error } = await supabase
      .from("profile")
      .update(cleanedProfilePayload)
      .eq("id", userId)
      .select();
    if (error) {
      console.error("Supabase updateUserProfile failed", {
        userId,
        profilePayload,
        message: error.message,
        code: error.code,
        details: (error as any).details,
        hint: (error as any).hint
      });
      throw error;
    }

    if (updates.addressBook) {
      await syncUserAddresses(userId, updates.addressBook);
    }

    return data;
  } catch (err) {
    console.error("updateUserProfile error", err);
    throw err;
  }
}

/**
 * Map database profile record to UserProfile type
 */
export function mapProfileData(data: any): UserProfileWithRole {
  return {
    fullName: data.full_name || "",
    phone: data.phone || "",
    address: data.address || "",
    province: data.province || "",
    city: data.city || "",
    postalCode: data.postal_code || "",
    avatarUrl: data.avatar_url || null,
    avatarName: data.avatar_name || null,
    birthDate: data.birth_date || null,
    gender: data.gender || "",
    defaultAddressId: data.default_address_id || null,
    addressBook: data.address_book || [],
    notifications: {
      emailStatusOrder: data.email_status_order ?? true,
      emailPayment: data.email_payment ?? true,
      emailShipping: data.email_shipping ?? true,
      whatsappGo: data.whatsapp_go ?? true,
      whatsappArrived: data.whatsapp_arrived ?? true,
      whatsappLink: data.whatsapp_link ?? true
    },
    role: normalizeRole(data.role)
  };
}
