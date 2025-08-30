import { AuthProvider } from "@refinedev/core";
import { customAlphabet } from "nanoid";
import { supabaseClient } from "./utility";
import type { TablesInsert } from "../database.types";

const nanoid = customAlphabet('1234567890abcdef', 5)

const authProvider: AuthProvider = {
  login: async (options: { redirectTo: string }) => {
    const { redirectTo } = options;
    const { data, error } = await supabaseClient.auth.signInAnonymously({
      options: {
        data: {
          deviceId: crypto.randomUUID(),
        }
      }
    });

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data.user?.id) {
      await supabaseClient
        .from("users")
        .insert<TablesInsert<"users">>({
          id: data.user.id,
          slug: nanoid(),
        });
    }

    return {
      success: true,
      redirectTo,
    }
  },
  // register: async ({ email, password }) => {
  //   try {
  //     const { data, error } = await supabaseClient.auth.signUp({
  //       email,
  //       password,
  //     });

  //     if (error) {
  //       return {
  //         success: false,
  //         error,
  //       };
  //     }

  //     if (data) {
  //       return {
  //         success: true,
  //         redirectTo: "/",
  //       };
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error,
  //     };
  //   }

  //   return {
  //     success: false,
  //     error: {
  //       message: "Register failed",
  //       name: "Invalid email or password",
  //     },
  //   };
  // },
  // forgotPassword: async ({ email }) => {
  //   try {
  //     const { data, error } = await supabaseClient.auth.resetPasswordForEmail(
  //       email,
  //       {
  //         redirectTo: `${window.location.origin}/update-password`,
  //       }
  //     );

  //     if (error) {
  //       return {
  //         success: false,
  //         error,
  //       };
  //     }

  //     if (data) {
  //       return {
  //         success: true,
  //       };
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error,
  //     };
  //   }

  //   return {
  //     success: false,
  //     error: {
  //       message: "Forgot password failed",
  //       name: "Invalid email",
  //     },
  //   };
  // },
  // updatePassword: async ({ password }) => {
  //   try {
  //     const { data, error } = await supabaseClient.auth.updateUser({
  //       password,
  //     });

  //     if (error) {
  //       return {
  //         success: false,
  //         error,
  //       };
  //     }

  //     if (data) {
  //       return {
  //         success: true,
  //         redirectTo: "/",
  //       };
  //     }
  //   } catch (error: any) {
  //     return {
  //       success: false,
  //       error,
  //     };
  //   }
  //   return {
  //     success: false,
  //     error: {
  //       message: "Update password failed",
  //       name: "Invalid password",
  //     },
  //   };
  // },
  logout: async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/",
    };
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
  check: async () => {
    try {
      const { data } = await supabaseClient.auth.getSession();
      const { session } = data;

      if (!session) {
        return {
          authenticated: false,
          error: {
            message: "Check failed",
            name: "Session not found",
          },
          logout: true,
          redirectTo: "/login",
        };
      }
    } catch (error: any) {
      return {
        authenticated: false,
        error: error || {
          message: "Check failed",
          name: "Not authenticated",
        },
        logout: true,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: true,
    };
  },
  getPermissions: async () => {
    const user = await supabaseClient.auth.getUser();

    if (user) {
      return user.data.user?.role;
    }

    return null;
  },
  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();

    if (data?.user) {
      return data.user;
    }

    return null;
  },
};

export default authProvider;
