import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import { supabase } from "~/utils/supabase";

type AuthStore = {
    user: User | null;
    session: Session | null;
    login: (email: string, password: string) => void;
    logout: () => void;
}

const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    session: null,
    login: async (email: string, password: string) => {
        if(!email || !password) {
            throw new Error("Email and password are required");
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            console.error("Login error:", error);
            throw error
        };
        
        set({ user: data.user });
        set({ session: data.session });
    },
    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
        set({ session: null });
    }
}));

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        useAuthStore.setState({ user: session?.user });
        useAuthStore.setState({ session });
    } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null });
        useAuthStore.setState({ session: null });
    }
    else if (event === "TOKEN_REFRESHED") {
        useAuthStore.setState({ session });
    }
    else if (event === "USER_UPDATED") {
        useAuthStore.setState({ user: session?.user });
        useAuthStore.setState({ session });
    }
})

export default useAuthStore;