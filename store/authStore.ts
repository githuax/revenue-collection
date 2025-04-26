import { User } from "@supabase/supabase-js";
import { createStore } from "zustand";

type AuthStore = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const useAuthStore = createStore<AuthStore>((set) => ({
}));



export default useAuthStore;