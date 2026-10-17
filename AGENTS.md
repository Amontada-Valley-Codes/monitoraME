## Missão e contexto
- MonitoraME é uma plataforma GovTech que transforma dados públicos de compras governamentais em transparência, indicadores territoriais e oportunidades acionáveis para empresas.
- Atende visitantes, empresas (MEI, ME, EPP e demais portes, conforme acesso), prefeituras/órgãos e perfis internos de monitoramento.
- O foco inicial é o Ceará, com arquitetura extensível a outros estados brasileiros.
- Os dados oficiais vêm principalmente do PNCP (oportunidades), TCE-CE (despesas empenhadas), Receita Federal (porte, situação e localização do fornecedor) e IBGE (municípios).
- O produto não é um portal oficial de licitações nem recebe propostas; deve direcionar o usuário à fonte oficial.

## Responsabilidade desta camada
- Construir interfaces acessíveis, responsivas, consistentes e demonstráveis.
- Integrar APIs sem duplicar regras autoritativas de negócio, permissões ou cálculos financeiros.
- Tratar carregamento, erros, estados vazios, ausência de dados, sincronização e falta de permissão como estados de primeira classe.
- Diferenciar claramente dados reais, simulados e informações geradas por IA.

## Stack e convenções
- Web: Next.js + React + TypeScript em modo strict, Tailwind CSS e componentes shadcn/ui, conforme dependências existentes.
- Priorizar Server Components quando adequados; Client Components apenas para interatividade.
- Preferir Axios e camada de serviço tipada se esse for o padrão adotado no repositório.
- Respeitar padrões já existentes de organização, nomenclatura, lint, formatação, ícones e design tokens.
- Criar componentes pequenos, reutilizáveis e semanticamente acessíveis; evitar lógica de negócio pesada em componentes.
- Não introduzir bibliotecas, padrões de estado ou mecanismos de cache sem necessidade demonstrável.
- Contratos de API devem estar tipados e refletir nomes dos campos reais, preferencialmente `snake_case` nos payloads.

## Públicos e níveis de acesso
- Visitante: descoberta e listagens públicas; exibir chamadas para cadastro/assinatura em capacidades restritas.
- Empresa gratuita: detalhes dos editais e anexos, com demonstrações de recursos avançados quando previsto.
- Assinante sem workspace: buscas salvas, alertas, carteira, calendário, monitoramento, exportações e inteligência de mercado conforme plano.
- Assinante com workspace: recursos colaborativos, responsáveis, permissões e consolidação.
- Órgão público: recursos vinculados ao seu cadastro e competência, quando habilitados.
- Monitor/admin: dashboards e ferramentas internas conforme RBAC.
- Não tratar ocultação de botão como autorização: o backend valida cada operação.

## Módulo analítico (compras públicas)
- Seções: Visão Geral, Municípios, Análise territorial, Comparar resultados e Despesas empenhadas.
- A Visão Geral pública apresenta exclusivamente indicadores de Micro Empresas, conforme definição validada nos contratos.
- O fluxo público previsto é Frontend → FastAPI; o fluxo restrito é Frontend → Backend → FastAPI.
- Indicadores incluem valores empenhados, participação por porte, origem territorial do fornecedor, séries mensais, elementos/naturezas de despesa e recortes municipais.
- Filtros de município usam código IBGE + UF; não usar nome como identificador.
- Percentuais e variações devem reproduzir contratos e regras do pipeline, sem recalcular arbitrariamente no cliente.
- Tratar ausência de denominador, exercícios incompletos, atualização da base e arredondamento com transparência.

## Módulo de oportunidades (PNCP)
- Exibir listagem, busca, filtros, detalhes, anexos e link oficial do edital.
- Filtros: texto; CNAE principal/secundários; categoria do objeto; modalidade; situação; publicação; órgão; município; região; atualização; anexos; esclarecimentos; salvas; abrangência/elegibilidade; amostra; forma de participação; critério por item/lote/global.
- Matching considera CNAEs, porte e interesse regional; sempre exibir grau de compatibilidade e motivos compreensíveis quando disponíveis.
- Pipeline interno possui etapas fixas: Em análise; Interessada; Preparando documentação; Participação confirmada; Proposta enviada (registro manual); Aguardando resultado; Vencida; Não vencida; Descartada; Encerrada internamente.
- "Proposta enviada" é apenas registro interno: **nunca** disponibilizar envio efetivo de proposta pela plataforma.
- Não criar comentários públicos, feed social ou chat privilegiado com órgão.
- Exibir esclarecimentos e atualizações oficiais preservando proveniência; atualização do edital é feita pela sincronização com PNCP.
- Alertas previstos: oportunidade compatível; prazo próximo; alteração de data; novo anexo; suspensão/revogação; prazo interno; documento a vencer; pendência atrasada.
- IA para resumo/leitura de editais é evolução futura, não dependência obrigatória do MVP.

## Dados mockados e demonstração
- Desenvolver telas visuais com fixtures tipadas enquanto APIs não estiverem disponíveis.
- Centralizar mocks e marcar explicitamente o que é demonstração; não simular dado real sem aviso.
- Planejar substituição por adaptadores de serviço sem reescrever componentes.
- Não persistir como definitivo valores, documentos, fornecedores ou status gerados para demo.

## Segurança, privacidade e UX
- Sessões autenticadas devem respeitar cookies httpOnly quando definidos pelo backend; nunca expor tokens em JavaScript ou logs.
- Não cachear entre usuários páginas e respostas privadas (`/feed`, `/company`, `/admin`, `/profile`, `/saved-searches`, `/my-opportunities`).
- Usar cache com TTL somente em recursos públicos apropriados e observar invalidação/frescor.
- Restringir exibição de dados pessoais e contatos conforme a LGPD e políticas de acesso.
- Implementar loading/skeleton, navegação por teclado, labels, contraste, textos de erro úteis e layout responsivo.
- Linkar a publicação/documentos oficiais e indicar data de atualização e origem dos registros.

## Fluxo de implementação para agentes
1. Inspecione o projeto e os contratos existentes antes de modificar estrutura ou interfaces.
2. Confirme qual perfil e qual nível de acesso a feature atende.
3. Separe componentes de apresentação, hooks/estado e acesso a serviços.
4. Tipifique dados, valide estados extremos e evite hardcodes de regras.
5. Adicione testes quando houver lógica, autorização refletida na UI ou componentes críticos.
6. Execute lint, checagem TypeScript, testes e build disponíveis; relate comandos e limitações.
7. Entregue um resumo do que mudou, arquivos afetados e como demonstrar a feature.

## Não fazer
- Não implementar envio de proposta, conversas privadas com órgãos ou interações sociais sem nova decisão de produto e revisão jurídica.
- Não alterar critérios de matching, limites de plano, elegibilidade ou métricas por iniciativa própria.
- Não apresentar cálculo local como resultado oficial do TCE-CE/PNCP.
- Não inferir permissão pelo plano exibido no cliente, nem assumir que CPF/CNPJ ou dados pessoais possam ser públicos.
