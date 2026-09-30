import { z } from "zod";

function isValidCPF(cpf: string) {
  const cleanCpf = cpf.replace(/[^\d]/g, "");
  if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false;
  
  return true;
}

export const authSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  cpf: z.string().refine((val) => isValidCPF(val), {
    message: "CPF inválido",
  }),
  email: z.string().email("E-mail inválido"),
  senha: z.string()
    .min(8, "A senha deve ter no mínimo 8 caracteres")
    .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "Deve conter pelo menos um caractere especial (!@#$%^&*)"),
  confirmarSenha: z.string(),
  termos: z.literal(true, {
    message: "Você deve aceitar os Termos de Uso para continuar",
  }),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
});

export type AuthFormData = z.infer<typeof authSchema>;
