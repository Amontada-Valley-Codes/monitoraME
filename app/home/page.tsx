import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { authService } from "@/features/auth/services/auth.service";

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    const store = await cookies();
    const token = store.get("access_token")?.value;

    // 1. Apaga os cookies locais e redireciona IMEDIATAMENTE 
    // (garante que a UI nunca fica travada por problemas de rede/backend)
    store.delete("access_token");
    store.delete("refresh_token");

    try {
      if (token) {
        // 2. Tenta notificar o backend em segundo plano (opcional/não bloqueante)
        await authService.logoutCurrent(token);
      }
    } catch (error) {
      // Ignora falhas do backend no logout para não afetar o utilizador
    }

    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <span className="font-bold text-slate-900 text-lg">Portal Municipal</span>
        </div>
        
        {/* Formulário com Server Action e botão de submissão explícito */}
        <form action={handleLogout}>
          <Button 
            type="submit" 
            variant="outline" 
            className="border-slate-200 text-slate-700 hover:bg-slate-100"
          >
            Terminar Sessão
          </Button>
        </form>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Sessão Autenticada com HttpOnly 🔒
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Os tokens encontram-se protegidos por cookies HttpOnly no navegador, prevenindo o acesso malicioso via scripts client-side (XSS).
          </p>
        </div>
      </main>
    </div>
  );
}
