import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uploadProfessionalPhoto } from "@/services/profilePhotoService";
import { supabase, isSupabaseConfigured, clearSupabaseStorage } from "@/lib/supabase";
import type { AccountRole, ProfessionalRecord, Profile } from "@/types/database";

type SignUpClientPayload = {
  nome: string;
  email: string;
  password: string;
  telefone: string;
  endereco: string;
};

type SignUpProfessionalPayload = {
  nome: string;
  email: string;
  password: string;
  telefone: string;
  cidade: string;
  bairro: string;
  valorHora: number;
  servicos: string[];
  descricaoExperiencia: string;
  fotoUri?: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  professional: ProfessionalRecord | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ role: AccountRole; requiresApproval?: boolean }>;
  signUpClient: (payload: SignUpClientPayload) => Promise<{ needsEmailConfirm: boolean }>;
  signUpProfessional: (
    payload: SignUpProfessionalPayload
  ) => Promise<{ needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateClientAddress: (endereco: string, telefone?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [professional, setProfessional] = useState<ProfessionalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserRecords = useCallback(async (currentUser: User | null) => {
    if (!currentUser || !isSupabaseConfigured) {
      setProfile(null);
      setProfessional(null);
      return;
    }

    const { data: profProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", currentUser.id)
      .maybeSingle();

    const typedProfile = (profProfile as Profile | null) ?? null;
    setProfile(typedProfile);

    if (typedProfile?.tipo_conta === "professional") {
      const { data: proData } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      setProfessional((proData as ProfessionalRecord | null) ?? null);
    } else {
      setProfessional(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      await loadUserRecords(initialSession?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      await loadUserRecords(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserRecords]);

  const refreshProfile = useCallback(async () => {
    await loadUserRecords(user);
  }, [loadUserRecords, user]);

  async function signIn(
    email: string,
    password: string
  ): Promise<{ role: AccountRole; requiresApproval?: boolean }> {
    if (!isSupabaseConfigured) {
      throw new Error(
        "Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY no arquivo .env do aplicativo."
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Usuário não encontrado.");

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profileData) {
      throw new Error("Perfil não encontrado na tabela profiles.");
    }

    const typedProfile = profileData as Profile;
    setProfile(typedProfile);

    if (typedProfile.tipo_conta === "professional") {
      const pendingPhotoKey = `pending-professional-photo:${data.user.id}`;
      const pendingPhotoUri = await AsyncStorage.getItem(pendingPhotoKey);
      if (pendingPhotoUri) {
        try {
          await uploadProfessionalPhoto(data.user.id, pendingPhotoUri);
          await AsyncStorage.removeItem(pendingPhotoKey);
        } catch (photoError) {
          console.warn("Não foi possível concluir o envio da foto profissional:", photoError);
        }
      }

      const { data: proData } = await supabase
        .from("professionals")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      setProfessional((proData as ProfessionalRecord | null) ?? null);
      return {
        role: "professional",
        requiresApproval: proData?.status !== "approved",
      };
    }

    return { role: typedProfile.tipo_conta };
  }

  async function signUpClient(
    payload: SignUpClientPayload
  ): Promise<{ needsEmailConfirm: boolean }> {
    if (!isSupabaseConfigured) {
      throw new Error("Configure o .env com as credenciais do Supabase.");
    }

    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: {
        data: {
          nome: payload.nome.trim(),
          telefone: payload.telefone.trim(),
          endereco: payload.endereco.trim(),
          tipo_conta: "client",
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Falha ao criar conta.");

    if (!data.session) {
      return { needsEmailConfirm: true };
    }

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      nome: payload.nome.trim(),
      email: payload.email.trim(),
      telefone: payload.telefone.trim(),
      endereco: payload.endereco.trim(),
      tipo_conta: "client",
    });

    if (upsertError) throw upsertError;

    await loadUserRecords(data.user);
    return { needsEmailConfirm: false };
  }

  async function signUpProfessional(
    payload: SignUpProfessionalPayload
  ): Promise<{ needsEmailConfirm: boolean }> {
    if (!isSupabaseConfigured) {
      throw new Error("Configure o .env com as credenciais do Supabase.");
    }

    // 1. Cria conta no Supabase Auth (mesmo fluxo da Web)
    const { data, error } = await supabase.auth.signUp({
      email: payload.email.trim(),
      password: payload.password,
      options: {
        data: {
          nome: payload.nome.trim(),
          telefone: payload.telefone.trim(),
          tipo_conta: "professional",
        },
      },
    });

    if (error) throw error;
    if (!data.user) throw new Error("Falha ao criar usuário.");

    const pendingPhotoKey = `pending-professional-photo:${data.user.id}`;
    if (payload.fotoUri) {
      await AsyncStorage.setItem(pendingPhotoKey, payload.fotoUri);
    }

    if (!data.session) {
      // O envio ao Storage será concluído no primeiro login após confirmar o e-mail.
      return { needsEmailConfirm: true };
    }

    // 2. Garante registro em public.profiles
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      nome: payload.nome.trim(),
      email: payload.email.trim(),
      telefone: payload.telefone.trim(),
      tipo_conta: "professional",
    });

    if (profileError) throw profileError;

    if (payload.fotoUri) {
      await uploadProfessionalPhoto(data.user.id, payload.fotoUri);
      await AsyncStorage.removeItem(pendingPhotoKey);
    }

    // 3. Cria registro em public.professionals com status 'pending' -> aparece na hora no Admin Web!
    const { error: proError } = await supabase.from("professionals").insert({
      id: data.user.id,
      descricao_experiencia: payload.descricaoExperiencia.trim(),
      cidade: payload.cidade.trim(),
      bairro: payload.bairro.trim(),
      valor_hora: payload.valorHora,
      servicos: payload.servicos,
      status: "pending",
    });

    if (proError) throw proError;

    await loadUserRecords(data.user);
    return { needsEmailConfirm: false };
  }

  async function signOut() {
    setSession(null);
    setUser(null);
    setProfile(null);
    setProfessional(null);

    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut({ scope: "local" });
      }
    } catch {
      // Mesmo se o servidor retornar erro, garante limpeza local abaixo
    } finally {
      await clearSupabaseStorage();
    }
  }

  async function updateClientAddress(endereco: string, telefone?: string) {
    if (!user || !isSupabaseConfigured) return;

    const { data, error } = await supabase
      .from("profiles")
      .update({
        endereco: endereco.trim(),
        ...(telefone !== undefined ? { telefone: telefone.trim() } : {}),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data as Profile);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        professional,
        loading,
        signIn,
        signUpClient,
        signUpProfessional,
        signOut,
        refreshProfile,
        updateClientAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser utilizado dentro de AuthProvider");
  }
  return ctx;
}
