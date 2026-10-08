import { RegisterView } from "@/components/register-view";
import { apiService } from "@/features/auth/services/auth.service";
import { AuthFormData } from "@/features/auth/schemas/auth.schema";
import { redirect } from "next/navigation";
import { ApiError } from "@/services/api";

export default function RegisterPage() {
  async function handleRegister(data: AuthFormData) {
    "use server";
    try {
      await apiService.registerPerson({
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        password: data.senha,
      });
    } catch (error) {
      if (error instanceof ApiError) {
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
