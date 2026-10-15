# Central de notificações — modo demonstrativo

A central usa a fixture única `features/opportunities/demo-fixture.ts`, identificada por `company-demo-nordeste`. O acesso é isolado pela interface `OpportunityRepository` em `notification-repository.ts`; uma implementação de API poderá substituir `mockOpportunityRepository` sem alterar os componentes.

As ações de leitura são compartilhadas por todas as rotas sob `/oportunidades` e persistidas somente em `sessionStorage`. Não há persistência no backend, sincronização entre dispositivos, envio real de e-mails, ingestão do PNCP nem motor de matching. Scores, confiança, agrupamentos e estados oficiais chegam prontos da fixture e não são recalculados pela interface.

Os seletores “Cenário” permitem demonstrar sucesso, carregamento, vazio, erro e bloqueio de plano. Eventos desatualizados direcionam apenas a uma alternativa válida.
