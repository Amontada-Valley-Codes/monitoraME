export interface CNAEItem {
  codigo: string;
  descricao: string;
}

export interface CompanyProfileEntity {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  porte: string;
  situacao: string;
  plano: string;
  valorPlano: string;
  municipio: string;
  uf: string;
  codigoIbge: string;
  contato: string;
  telefone: string;
  cnaes: CNAEItem[];
  municipiosInteresse: string[];
  modalidadesPreferidas: string[];
}

export interface UpdatePreferencesDTO {
  cnaes: CNAEItem[];
  municipiosInteresse: string[];
}
