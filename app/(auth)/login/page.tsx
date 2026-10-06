import { LoginView } from "@/components/login-view"
import { apiService } from "@/features/auth/services/auth.service";
import { LoginFormData } from "@/features/auth/schemas/login.schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/services/api";

export default function LoginPage() {
  async function handleLogin(data: LoginFormData) {
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
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new Error("E-mail ou palavra-passe incorretos.");
        }
        throw new Error(error.message);
      }
      throw error;
    }

    redirect("/analitico");
  }

  return <LoginView onSubmitAction={handleLogin} />
}
