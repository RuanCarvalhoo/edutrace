import { apiRequest } from "@/services/http";

export async function getAllStudents() {
  return apiRequest('/students');
}

export async function getStudentByEmail(email: string) {
  return apiRequest(`/students/${encodeURIComponent(email)}`);
}
