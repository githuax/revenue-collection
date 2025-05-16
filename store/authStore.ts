import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserData } from "~/types";

import { Session, User } from "@supabase/supabase-js";
import { supabase } from "~/utils/supabase";

import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthStore = {
    user: User | null;
    userData: UserData | null;
    session: Session | null;
    login: (email: string, password: string) => void;
    logout: () => Promise<void>;
}

const useAuthStore = create<AuthStore>()(
    persist((set) => ({
        user: null,
        userData: null,
        session: null,
        login: async (email: string, password: string) => {
            if (!email || !password) {
                throw new Error("Email and password are required");
            }

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error("Login error:", error);
                throw error
            };

            set({ user: data.user });
            set({ session: data.session });

            const userData = await supabase.from('user').select('*').eq('user_auth_id', data.user?.id).single()
            if (userData.error) {
                console.error("User data error:", userData.error);
                throw userData.error
            }
            set({ userData: userData.data as UserData });
        },
        logout: async () => {
            await supabase.auth.signOut();
            set({ user: null });
            set({ session: null });
            set({ userData: null });
        }
    }), {
        name: 'auth',
        storage: createJSONStorage(() => AsyncStorage),
    })
);

supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN") {
        useAuthStore.setState({ user: session?.user });
        useAuthStore.setState({ session });
    } else if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null });
        useAuthStore.setState({ session: null });
        useAuthStore.setState({ userData: null });
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