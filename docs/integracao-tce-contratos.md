# Consulta de contratos do TCE-CE

A integração está em `features/tce/contratos.ts` e chama somente o proxy
`GET /pipeline/tce/contratos`. Por padrão, o proxy é
`http://localhost:3000`; configure outro endereço com `TCE_PROXY_BASE_URL` ou
com a opção `baseUrl` da chamada.

```ts
import { consultarContratosTce } from '@/features/tce/contratos';

const contratosDeAmontada = await consultarContratosTce({
  data_inicial: '2025-01-01',
  data_final: '2025-04-01',
  codigo_municipio: '010',
});

const contratosDeTodosOsMunicipios = await consultarContratosTce({
  data_inicial: '2025-01-01',
  data_final: '2025-04-01',
});

console.log({
  totalInformado: contratosDeTodosOsMunicipios.totais.contratos,
  itensRecebidos: contratosDeTodosOsMunicipios.dados.length,
});
```

O código municipal é opcional. Quando ausente, ele não é incluído na URL.
Erros podem ser distinguidos com `erro instanceof ErroContratosTce` e pelo
campo `erro.codigo`: `VALIDACAO`, `TIMEOUT`, `CANCELADO`, `REDE`, `HTTP`,
`JSON_INVALIDO` ou `RESPOSTA_INVALIDA`.

## Suposições adotadas

- `nao_informado` é convertido em `null` nos campos textuais conhecidos; dados
  mascarados como `********` são preservados.
- `dados: []` é uma resposta válida. O total informado pelo backend não é
  recalculado a partir de `dados.length`.
- `limite_resposta` é preservado como metadado sem inferir paginação, pois seu
  formato e sua semântica ainda não foram definidos.
- Sem confirmação de que o proxy o exige, `enriquecer_fornecedores` não é
  enviado. Caso o contrato do proxy passe a exigi-lo, ele deve ser fixado como
  `false`, sem ser exposto como parâmetro público desta integração.
