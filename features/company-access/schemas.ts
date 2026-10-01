import { z } from 'zod'

export const companyReviewSchema = z.object({
  legalName: z.string().min(3, 'A Razão Social é obrigatória'),
  tradeName: z.string().optional(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  stateRegistration: z.string().optional(),
  companySize: z.enum(['mei', 'me', 'epp']),
  primaryCnae: z.object({ code: z.string(), description: z.string() }),
  secondaryCnaes: z.array(z.object({ code: z.string(), description: z.string() })),
  address: z.object({
    postalCode: z.string().min(8, 'CEP inválido'),
    street: z.string().min(3, 'Logradouro obrigatório'),
    number: z.string().min(1, 'Número obrigatório'),
    complement: z.string().optional(),
    district: z.string().min(2, 'Bairro obrigatório'),
    city: z.string().min(2, 'Cidade obrigatória'),
    state: z.string().length(2, 'UF inválida'),
  }),
  legalRepresentativeName: z.string().min(5, 'Nome completo obrigatório'),
  legalRepresentativeCpf: z.string().min(11, 'CPF inválido'),
  notificationEmail: z.string().email('E-mail inválido'),
  commercialPhone: z.string().min(10, 'Telefone inválido'),
})