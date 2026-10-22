import { connection } from "next/server";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { apiService } from "@/features/auth/services/auth.service";
import { ApiError } from "@/services/api";

export default async function OnboardingPage() {
  // This authenticated flow is request-time UI, not a page to prerender.
  await connection();

  async function handleOnboarding(data: { name: string; email: string; phone: string }) {
    "use server";
    try {
      await apiService.startOnboarding(data);
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-slate-50">
      <OnboardingForm onSubmitAction={handleOnboarding} />
    </div>
  );
}
