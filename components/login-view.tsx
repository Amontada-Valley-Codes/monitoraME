import { LoginForm } from "../features/auth/components/login-form";
import { AuthHeroPanel } from "../features/auth/components/auth-hero-panel";
import { LoginFormData } from "../features/auth/schemas/login.schema";
import { ActionResult } from "./register-view";

interface LoginViewProps {
  onSubmitAction: (data: LoginFormData) => Promise<ActionResult>;
}

export function LoginView({ onSubmitAction }: LoginViewProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl mb-6">
        <header className="flex items-center gap-2 font-bold text-blue-600 text-lg">
          <span className="bg-blue-600 text-white p-1 rounded-md flex items-center justify-center text-xs">🛡️</span>
          MonitoraME
        </header>
      </div>

      <div className="bg-white w-full max-w-6xl rounded-[2.5rem] shadow-xl p-8 md:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          <div className="flex flex-col justify-center">
            <LoginForm onSubmitAction={onSubmitAction} />
          </div>
          <div>
            <AuthHeroPanel />
          </div>
        </div>
      </div>
    </div>
  );
}