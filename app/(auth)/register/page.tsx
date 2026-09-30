import { RegisterView } from "@/components/register-view";
import { authService } from "@/features/auth/services/auth.service";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";
import { redirect } from "next/navigation";
import { ApiError } from "@/services/api";

export default function RegisterPage() {
  async function handleRegister(data: AuthFormData) {
    "use server";
    try {
      const response = await authService.register(data);
      console.log("Conta criada com sucesso:", response);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(`Erro da API (${error.status}):`, error.message);
        if (error.status === 409) {
          throw new Error("E-mail ou CPF já cadastrado.");
        }
      }
      throw error;
    }

    redirect("/login");
  }

  return <RegisterView onSubmitAction={handleRegister} />;
}