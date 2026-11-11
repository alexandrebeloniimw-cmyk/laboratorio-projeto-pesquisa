# Laboratório de Projeto de Pesquisa — resumo para continuar o trabalho

> Cole este texto inteiro no início da conversa com o Gemini (ou com outro assistente).
> Ele explica o que já existe, onde está cada coisa e o que ainda falta.

## 1. O que é

Página web interativa que orienta alunos a construir o **Projeto de Pesquisa Teológico-Ministerial**, do tema aos objetivos.
Autor: **Prof. Alexandre Fonseca do Prado Beloni**. Idioma: português do Brasil.

**Regra importante:** o laboratório **não pode estar vinculado a nenhuma instituição** (não citar IWE, Cascadura nem outra instituição no laboratório nem no PDF gerado).

## 2. Endereços

| O quê | Endereço |
|---|---|
| Laboratório (no ar) | https://alexandrebeloniimw-cmyk.github.io/laboratorio-projeto-pesquisa/ |
| Repositório do laboratório | https://github.com/alexandrebeloniimw-cmyk/laboratorio-projeto-pesquisa |
| Acervo de trabalhos aprovados | https://alexandrebeloniimw-cmyk.github.io/revistateologicoministerialiwecascadura2026/acervo.html |
| Repositório da revista/acervo | https://github.com/alexandrebeloniimw-cmyk/revistateologicoministerialiwecascadura2026 |
| Recebimento dos envios (Google Apps Script, conta pavimentandoocaminho@gmail.com) | https://script.google.com/macros/s/AKfycbxIoKt6ruAz1aZFxNNmbfm6K758PVPKx8SWiSOR-vGt-AaEfINlX5K6AVS_GO-WWMyx/exec |
| Livro na UICLAP | https://loja.uiclap.com/titulo/ua207553 |
| Livro na Amazon | https://www.amazon.com.br/dp/B0HLD75W74 |

## 3. Arquivos do repositório do laboratório

- `index.html` — a página inteira (HTML, CSS e JavaScript num só arquivo, cerca de 135 KB).
- `dados/referencias.js` — lista de 790 referências completas (ABNT NBR 6023) usada para completar as obras indicadas pelos alunos (`window.LISTA_REFS`).
- `img/capa-livro.jpg` — capa do livro *Sobrevivendo ao Projeto de Pesquisa*.
- `apps-script/Codigo.gs` — código do Google Apps Script que recebe os projetos e salva no Google Drive.
- `README.md` — descrição do projeto.

O site é publicado pelo **GitHub Pages** (ramo `main`, pasta raiz). Toda alteração salva no GitHub aparece no site em 1 a 2 minutos.

## 4. O que o laboratório faz hoje

**9 etapas:** 1 Tema (+ relevância para a atualidade) · 2 Título (título + subtítulo) · 3 Contextualização · 4 Delimitação (campo geral, específico, espaço, tempo) · 5 Justificativa (relevância teológica + referência; relevância social e ministerial) · 6 Problematização · 7 Objetivo geral · 8 Objetivos específicos (a, b, c) · 9 Obras de referência (até 3).

Recursos:
- Botões **Analisar minha resposta** e **Melhorar meu texto** em cada etapa (critérios pedagógicos automáticos, sem IA).
- Barra de progresso; rascunho salvo no aparelho; **Baixar / Abrir / Apagar rascunho**.
- **Verificação no acervo**: compara tema e título com 159 trabalhos aprovados (títulos de 2019–2026 e temas de 2026); tema igual bloqueia exportação e envio.
- Etapa 9 completa automaticamente a referência ABNT quando a obra está na lista (`dados/referencias.js`); as obras entram nas Referências do projeto.
- **Aperfeiçoar e exportar**: situação de cada etapa, coerência entre as partes, quadro "O que ainda falta no projeto", visualização do documento, **Exportar em PDF**, **Copiar texto**, **Enviar ao professor**.
- Documento gerado: A4, Times New Roman 12, espaçamento 1,5, margens 3/2 cm; cabeçalho "LABORATÓRIO PROJETO DE PESQUISA – DO TEMA AOS OBJETIVOS"; rodapé "Elaborado no Laboratório de Projeto de Pesquisa – Prof. Alexandre Fonseca do Prado Beloni"; seções a desenvolver com o orientador marcadas (Sumário, 7 Fundamentação teórica, 8 Metodologia, 9 Recursos, 10 Cronograma, bibliografia ampliada). Instituição e curso **não** aparecem no PDF.
- Documento segue a **ABNT NBR 15287:2025** (projeto de pesquisa): folha de rosto (autor, título: subtítulo, natureza do trabalho, orientador, cidade e ano), sumário, seções 1 a 10 (inclui 9 Recursos e 10 Cronograma; sem Considerações finais, que não constam na NBR 15287), Referências e Sumário centralizados, páginas pré-textuais contadas mas não numeradas, numeração no canto superior direito a partir da parte textual. Campo novo na identificação: Cidade.
- Envio ao professor: o Apps Script cria no Drive a pasta "Laboratório de Projeto de Pesquisa – Envios", subpasta por turma, o projeto em Google Docs + PDF + rascunho (.json) e a planilha "Registro de envios".
- Indicação do livro *Sobrevivendo ao Projeto de Pesquisa* (Alexandre Prado) com capa, botões UICLAP e Amazon.
- Botão "← Voltar ao acervo" no topo. Aviso: o laboratório não substitui a sala de aula; vale a orientação do professor orientador.
- Citações no texto seguem a **ABNT NBR 10520:2023**: (Bonhoeffer, 2004), só inicial maiúscula; na lista de referências o sobrenome continua em MAIÚSCULAS.

## 5. Onde mexer no `index.html` (procure estes nomes)

- `const ETAPAS = [` — textos, campos, orientações e exemplos de cada etapa.
- `const ANALISE = {` — regras de análise de cada etapa; `const MELHORAR = {` — dicas de "Melhorar meu texto".
- `let ACERVO =` — lista do acervo usada na verificação de temas e títulos.
- `const URL_ENVIO =` — endereço do Apps Script.
- `const CAB_DOC`, `const ROD_DOC`, `const SECOES_FALTAM` — cabeçalho, rodapé e seções a desenvolver no documento.
- `const URL_LIVRO`, `const URL_AMAZON` — links do livro.
- `function documentoHTML()` (PDF), `function blocosProjeto()` (documento do Drive), `function textoPlano()` (texto copiado).

## 6. O que ainda está pendente

1. **Testar o envio ao Drive.** Atualizar o código no Apps Script (colar o `apps-script/Codigo.gs` mais recente, rodar a função `autorizar` uma vez, depois Implantar → Gerenciar implantações → lápis → Nova versão → Implantar) e fazer um envio de teste pelo laboratório.
2. **Ideia adiada:** mostrar, na Etapa 9, quais artigos do acervo já usaram cada obra. Exige ler a seção de Referências dos 158 PDFs do acervo, que estão no Google Drive pavimentandoocaminho@gmail.com, e montar um índice obra → artigos.
3. 15 referências da lista original ficaram de fora por estarem incompletas (sem ano ou sem cidade/editora); podem ser completadas e acrescentadas a `dados/referencias.js`.

## 7. Como pedir alterações ao assistente

O `index.html` é grande. Peça **mudanças pontuais**, por exemplo:
"No arquivo index.html do meu laboratório, dentro de `const ETAPAS`, na etapa `id:'tema'`, troque a orientação X por Y. Mostre apenas o trecho antigo e o trecho novo."

Depois, aplique a mudança no GitHub (veja o passo a passo enviado junto com este resumo).
