import { CompanyProfileEntity } from "../domain/types";

export const companyDemoFixture: CompanyProfileEntity = {
  id: "company-demo-nordeste",
  razaoSocial: "Nordeste Soluções e Suprimentos Ltda.",
  nomeFantasia: "Nordeste Conecta",
  cnpj: "00.000.000/0001-91",
  porte: "Microempresa - ME",
  situacao: "Empresa validada e acesso ativo",
  plano: "Equipe",
  valorPlano: "R$ 119,99/mês",
  municipio: "Fortaleza",
  uf: "CE",
  codigoIbge: "2304400",
  contato: "contato@nordeste-conecta.example",
  telefone: "(85) 3000-0000",
  cnaes: [
    { codigo: "6201-5/01", descricao: "Desenvolvimento de programas de computador sob encomenda" },
    { codigo: "6204-0/00", descricao: "Consultoria em tecnologia da informação" },
    { codigo: "4651-6/01", descricao: "Comércio atacadista de equipamentos de informática" }
  ],
  municipiosInteresse: ["Fortaleza", "Itarema", "Caucaia", "Maracanaú"],
  modalidadesPreferidas: ["Pregão Eletrônico", "Dispensa Eletrônica"]
};
