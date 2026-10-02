# Visão Geral integrada ao pipeline TCE

A Visão Geral consulta exclusivamente `GET /pipeline/tce/overview` por meio do
BFF `GET /pipeline/tce/overview`. A URL do pipeline e a credencial opcional
ficam no servidor; consulte `.env.example` para a configuração completa.

## Cache

O projeto usa Next.js 16.3.6, App Router e Cache Components. A chamada axios é
envolvida por uma função com `'use cache'`, `cacheLife` e `cacheTag`; uma camada
externa de `React.cache()` deduplica leituras iguais durante a mesma renderização.

- resposta parcial: 5 minutos;
- exercício corrente completo: 1 hora;
- exercício encerrado completo: 24 horas.

Os tempos podem ser alterados pelas variáveis `PIPELINE_CACHE_*`. Erros são
lançados antes de a função cacheada produzir um valor e, portanto, não geram
entrada de cache.

No navegador, os hooks compartilham um registro por ano e município. Assim,
cards e gráficos consultam seus próprios seletores sem repetir a chamada ao BFF.
O cabeçalho `x-pipeline-stale-time` mantém o cache do cliente alinhado ao TTL do
servidor.

## Invalidação sob demanda

Configure `PIPELINE_REVALIDATE_SECRET` e envie o segredo como Bearer token:

```bash
curl -X POST https://seu-front.example/api/revalidate/pipeline-tce-overview \
  -H "Authorization: Bearer $PIPELINE_REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"ano":"2026","codigo_municipio":"010"}'
```

Sem `ano`, a tag global é invalidada. Com `ano` e município opcional, somente a
entrada correspondente é invalidada.
