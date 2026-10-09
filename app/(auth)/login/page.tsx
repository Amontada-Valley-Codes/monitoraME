import { LoginView } from "@/components/login-view";
import { ApiError, apiService } from "@/features/auth/services/auth.service";
import { LoginFormData } from "@/features/auth/schemas/login.schema";
import { cookies } from "next/headers";
import { ActionResult } from "@/components/register-view";

export default function LoginPage() {
  async function handleLogin(data: LoginFormData): Promise<ActionResult> {
    "use server";

    try {
      const response = await apiService.login(data);
      const { accessToken, refreshToken } = response;
      const cookieStore = await cookies();

      if (accessToken) {
        cookieStore.set({
          name: "access_token",
          value: accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 15,
          sameSite: "lax",
        });
      }

      if (refreshToken) {
        cookieStore.set({
          name: "refresh_token",
          value: refreshToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      }

      return { success: true };
    } catch (error: unknown) {
      if (error instanceof ApiError || (typeof error === "object" && error !== null && "message" in error)) {
        return {
          success: false,
          error: (error as { message: string }).message,
        };
      }

      return {
        success: false,
        error: "E-mail ou senha incorretos.",
      };
    }
  }

  return <LoginView onSubmitAction={handleLogin} />;
}