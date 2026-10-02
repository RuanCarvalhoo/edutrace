import { apiRequest } from "@/services/http";

export async function completeRegistration(cpf: string, password: string) {
  return apiRequest("/auth/complete-registration", {
    method: "POST",
    body: { cpf, password },
  });
}
