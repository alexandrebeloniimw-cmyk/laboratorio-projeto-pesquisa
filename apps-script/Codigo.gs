/**
 * Laboratório de Projeto de Pesquisa — recebimento dos projetos no Google Drive
 * Prof. Alexandre Fonseca do Prado Beloni
 *
 * O que este script faz a cada envio de um aluno:
 *  1. Cria (se ainda não existir) a pasta "Laboratório de Projeto de Pesquisa – Envios" no seu Drive,
 *     com uma subpasta para cada curso/turma.
 *  2. Salva o projeto como Google Docs formatado (A4, Times New Roman 12, espaçamento 1,5, margens ABNT).
 *  3. Salva uma cópia em PDF e o arquivo do rascunho (.json), que o aluno ou você podem abrir no laboratório.
 *  4. Registra o envio na planilha "Registro de envios" (data, aluno, turma, tema e links).
 */

const PASTA_NOME = 'Laboratório de Projeto de Pesquisa – Envios';
const PLANILHA_NOME = 'Registro de envios';
const FUSO = 'America/Sao_Paulo';
const CM = 28.3465; // pontos por centímetro

function doPost(e) {
  try {
    const bruto = (e && e.postData && e.postData.contents) || '';
    if (bruto.length > 600000) return resposta({ ok: false, erro: 'O projeto enviado é grande demais.' });
    const d = JSON.parse(bruto);
    const aluno = limpar(d.aluno, 80);
    const tema = limpar(d.tema, 200);
    if (!aluno || !tema) return resposta({ ok: false, erro: 'Informe o nome do(a) aluno(a) e o tema.' });

    const pastaGeral = obterPasta(PASTA_NOME, DriveApp.getRootFolder());
    const pastaTurma = obterPasta(limpar(d.curso, 80) || 'Sem curso ou turma informados', pastaGeral);

    const agora = new Date();
    const dataNome = Utilities.formatDate(agora, FUSO, 'yyyy-MM-dd HH.mm');
    const nome = dataNome + ' – ' + aluno + ' – ' + tema.slice(0, 80);

    const doc = DocumentApp.create(nome);
    montarDocumento(doc, d.blocos || [], d.cabecalho, d.rodape);
    doc.saveAndClose();
    const arqDoc = DriveApp.getFileById(doc.getId());
    arqDoc.moveTo(pastaTurma);

    const pdf = pastaTurma.createFile(arqDoc.getAs('application/pdf')).setName(nome + '.pdf');
    pastaTurma.createFile(nome + ' (rascunho).json', JSON.stringify(d.dados || {}, null, 2), 'application/json');

    registrar(pastaGeral, [
      agora, aluno, limpar(d.curso, 80), limpar(d.instituicao, 120), limpar(d.orientador, 80),
      tema, d.situacao || '', arqDoc.getUrl(), pdf.getUrl()
    ]);

    return resposta({ ok: true, protocolo: Utilities.formatDate(agora, FUSO, 'dd/MM/yyyy HH:mm') });
  } catch (err) {
    return resposta({ ok: false, erro: 'Falha ao salvar o projeto: ' + err });
  }
}

function doGet() {
  return resposta({ ok: true, status: 'Recebimento de projetos do Laboratório ativo.' });
}

/* ---------- Funções auxiliares ---------- */

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function limpar(v, max) {
  return String(v || '').replace(/[\r\n\t]+/g, ' ').replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, max);
}

function obterPasta(nome, pai) {
  const it = pai.getFoldersByName(nome);
  return it.hasNext() ? it.next() : pai.createFolder(nome);
}

function registrar(pasta, linha) {
  let planilha;
  const it = pasta.getFilesByName(PLANILHA_NOME);
  if (it.hasNext()) {
    planilha = SpreadsheetApp.open(it.next());
  } else {
    planilha = SpreadsheetApp.create(PLANILHA_NOME);
    DriveApp.getFileById(planilha.getId()).moveTo(pasta);
    const aba = planilha.getSheets()[0];
    aba.appendRow(['Data do envio', 'Aluno(a)', 'Curso/turma', 'Instituição', 'Orientador(a)', 'Tema', 'Situação no laboratório', 'Documento', 'PDF']);
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, 9).setFontWeight('bold');
  }
  planilha.getSheets()[0].appendRow(linha);
}

/**
 * Monta o documento a partir dos blocos enviados pelo laboratório.
 * Tipos: cab (cabeçalho centralizado), titulo, autor (à direita), h1 (seção), h2 (subseção),
 *        p (parágrafo com recuo), item (sem recuo), ref (referência, espaçamento simples),
 *        falta (aviso de seção a ser desenvolvida com o professor), h1c (título centralizado sem número),
 *        rautor, natureza e local (folha de rosto, ABNT NBR 15287:2025), quebra (quebra de página).
 * O cabeçalho e o rodapé se repetem em todas as páginas.
 */
function montarDocumento(doc, blocos, cabecalho, rodape) {
  const AT = DocumentApp.Attribute, A = DocumentApp.HorizontalAlignment;
  const corpo = doc.getBody();
  corpo.setPageWidth(21 * CM).setPageHeight(29.7 * CM)
       .setMarginTop(3 * CM).setMarginLeft(3 * CM).setMarginBottom(2 * CM).setMarginRight(2 * CM);

  function estilo(p, extra) {
    const at = {};
    at[AT.FONT_FAMILY] = 'Times New Roman';
    at[AT.FONT_SIZE] = 12;
    at[AT.BOLD] = false;
    at[AT.ITALIC] = false;
    at[AT.FOREGROUND_COLOR] = '#000000';
    at[AT.LINE_SPACING] = 1.5;
    at[AT.SPACING_BEFORE] = 0;
    at[AT.SPACING_AFTER] = 0;
    at[AT.INDENT_FIRST_LINE] = 0;
    at[AT.HORIZONTAL_ALIGNMENT] = A.JUSTIFY;
    Object.keys(extra || {}).forEach(function (k) { at[k] = extra[k]; });
    p.setAttributes(at);
  }
  function E(pares) { const o = {}; pares.forEach(function (x) { o[x[0]] = x[1]; }); return o; }

  if (cabecalho) {
    const c = doc.addHeader().getParagraphs()[0];
    c.setText(String(cabecalho));
    estilo(c, E([[AT.FONT_SIZE, 9], [AT.FOREGROUND_COLOR, '#555555'], [AT.LINE_SPACING, 1], [AT.HORIZONTAL_ALIGNMENT, A.CENTER]]));
  }
  if (rodape) {
    const r = doc.addFooter().getParagraphs()[0];
    r.setText(String(rodape));
    estilo(r, E([[AT.FONT_SIZE, 8], [AT.FOREGROUND_COLOR, '#777777'], [AT.LINE_SPACING, 1], [AT.HORIZONTAL_ALIGNMENT, A.CENTER]]));
  }

  blocos.forEach(function (b) {
    const tipo = b[0], texto = String(b[1] || '');
    if (tipo === 'quebra') { corpo.appendPageBreak(); return; }
    const p = corpo.appendParagraph(texto);
    if (tipo === 'cab') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.CENTER], [AT.BOLD, true]]));
    else if (tipo === 'titulo') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.CENTER], [AT.BOLD, true], [AT.SPACING_BEFORE, 36], [AT.SPACING_AFTER, 24]]));
    else if (tipo === 'autor') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.RIGHT]]));
    else if (tipo === 'h1') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.LEFT], [AT.BOLD, true], [AT.SPACING_BEFORE, 18], [AT.SPACING_AFTER, 6]]));
    else if (tipo === 'h1c') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.CENTER], [AT.BOLD, true], [AT.SPACING_BEFORE, 18], [AT.SPACING_AFTER, 12]]));
    else if (tipo === 'rautor') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.CENTER], [AT.BOLD, true], [AT.SPACING_AFTER, 180]]));
    else if (tipo === 'natureza') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.JUSTIFY], [AT.LINE_SPACING, 1], [AT.INDENT_START, 8 * CM], [AT.INDENT_FIRST_LINE, 8 * CM], [AT.SPACING_BEFORE, 36], [AT.SPACING_AFTER, 200]]));
    else if (tipo === 'local') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.CENTER]]));
    else if (tipo === 'h2') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.LEFT], [AT.BOLD, true], [AT.SPACING_BEFORE, 12], [AT.SPACING_AFTER, 6]]));
    else if (tipo === 'p') estilo(p, E([[AT.INDENT_FIRST_LINE, 1.25 * CM]]));
    else if (tipo === 'ref') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.LEFT], [AT.LINE_SPACING, 1], [AT.SPACING_AFTER, 12]]));
    else if (tipo === 'falta') estilo(p, E([[AT.HORIZONTAL_ALIGNMENT, A.LEFT], [AT.ITALIC, true], [AT.FONT_SIZE, 11], [AT.FOREGROUND_COLOR, '#666666'], [AT.LINE_SPACING, 1.15], [AT.SPACING_BEFORE, 4], [AT.SPACING_AFTER, 8]]));
    else estilo(p);
  });

  // Remove o parágrafo vazio que todo documento novo traz no início.
  if (corpo.getNumChildren() > 1 && corpo.getChild(0).asParagraph().getText() === '') {
    corpo.getChild(0).removeFromParent();
  }
}

/**
 * Rode esta função uma vez pelo editor (Executar → autorizar) para conceder todas as
 * permissões necessárias (Drive, Documentos e Planilhas). Os arquivos de teste vão para a lixeira.
 */
function autorizar() {
  const doc = DocumentApp.create('Teste de autorização – pode apagar');
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  const plan = SpreadsheetApp.create('Teste de autorização – pode apagar');
  DriveApp.getFileById(plan.getId()).setTrashed(true);
  Logger.log('Autorização concluída.');
}
