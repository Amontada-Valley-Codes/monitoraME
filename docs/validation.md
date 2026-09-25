# Verificação da entrega

- TypeScript estrito: aprovado, sem erros.
- Dados: 9.728 registros; conservação de totais por porte, origem e mês; inteiros em centavos; IDs únicos; filtros; fixture Acaraú 2025 validada após a remoção da categoria não publicada.
- Exportações: geração real de CSV, XLSX e PDF. CSV inspecionado, XLSX reaberto para conferir números e procedência, PDF renderizado e fórmula conferida.
- Browser: dashboard, filtro Acaraú, ocultação de KPIs com origem filtrada, navegação, validação de meta duplicada, criação de meta, salvamento e reabertura de relatório. Corrigida compatibilidade da geração de IDs em HTTP.
- Responsividade: revisão visual de 375 px e 768 px em viewports de iframe, além do desktop. Layout refluindo para uma/duas colunas, menu recolhido e Sheet mobile. Não substitui testes em dispositivos físicos.
- Exportação pelo browser: a ação terminou sem erro visível, mas o capturador de download não retornou evento/arquivo. A transferência no navegador não pôde ser confirmada por essa infraestrutura; a geração dos três formatos foi validada diretamente.
- WebMCP: browser de revisão não oferece modelContext; validação dinâmica indisponível. Recurso é opcional.
- Acessibilidade: implementada na estrutura e controles, sem auditoria completa com leitor de tela.
- Build de produção: executado como etapa obrigatória da publicação; qualquer falha impede a entrega da versão hospedada.

Os dados de teste criados durante QA são locais ao browser de revisão e não fazem parte da fixture publicada. A demonstração não modifica fontes públicas.
