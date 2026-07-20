import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const authService = {
    async login(email: string, password: string){
        const {data, error} = await supabaseBrowser.auth.signInWithPassword({
            email, password
        })
        
        if (error) throw error
        return data
    },

    async register(email: string, password: string, username: string, phone: string, role: string){
        const {data, error} = await supabaseBrowser.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    phone: phone,
                    role: role
                }
            }
        })

        if (error) throw error;
        return data;
    },

    async logout(){
        const {error} = await supabaseBrowser.auth.signOut()
        if(error) throw error
    },

    async getCurrentProfile (supabase: any){
        const {data: {user}} = await supabase.auth.getUser();
        if(!user) return null;

        const {data, error} = await supabase
            .from("profile")
            .select("*")
            .eq("id", user.id)
            .single();

            if(error) throw error;
            return data
    }
}