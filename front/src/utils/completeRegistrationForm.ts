export type CompleteRegistrationFormData = {
  cpf: string;
  senha: string;
  confirmarSenha: string;
};

export type CompleteRegistrationResult =
  | { ok: true; data: { cpf: string; password: string } }
  | { ok: false; error: string };

export function buildCompleteRegistration(
  form: CompleteRegistrationFormData,
): CompleteRegistrationResult {
  const cpf = form.cpf.replace(/\D/g, "");

  if (cpf.length !== 11) {
    return { ok: false, error: "O CPF deve ter 11 dígitos." };
  }

  if (form.senha.length < 8) {
    return { ok: false, error: "A senha deve ter no mínimo 8 caracteres." };
  }

  if (form.senha !== form.confirmarSenha) {
    return { ok: false, error: "As senhas não coincidem." };
  }

  return { ok: true, data: { cpf, password: form.senha } };
}
