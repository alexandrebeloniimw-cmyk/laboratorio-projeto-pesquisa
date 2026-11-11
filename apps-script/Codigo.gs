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
    montarDocumento(doc, d.blocos || []);
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
 *        p (parágrafo com recuo), item (sem recuo), ref (referência, espaçamento simples).
 */
function montarDocumento(doc, blocos) {
  const corpo = doc.getBody();
  corpo.setPageWidth(21 * CM).setPageHeight(29.7 * CM)
       .setMarginTop(3 * CM).setMarginLeft(3 * CM).setMarginBottom(2 * CM).setMarginRight(2 * CM);

  const A = DocumentApp.HorizontalAlignment;
  blocos.forEach(function (b) {
    const tipo = b[0], texto = String(b[1] || '');
    const p = corpo.appendParagraph(texto);
    p.setFontFamily('Times New Roman').setFontSize(12).setLineSpacing(1.5)
     .setSpacingBefore(0).setSpacingAfter(0).setIndentFirstLine(0).setBold(false)
     .setAlignment(A.JUSTIFY);
    if (tipo === 'cab') { p.setAlignment(A.CENTER).setBold(true); }
    else if (tipo === 'titulo') { p.setAlignment(A.CENTER).setBold(true).setSpacingBefore(36).setSpacingAfter(24); }
    else if (tipo === 'autor') { p.setAlignment(A.RIGHT); }
    else if (tipo === 'h1') { p.setAlignment(A.LEFT).setBold(true).setSpacingBefore(18).setSpacingAfter(6); }
    else if (tipo === 'h2') { p.setAlignment(A.LEFT).setBold(true).setSpacingBefore(12).setSpacingAfter(6); }
    else if (tipo === 'p') { p.setIndentFirstLine(1.25 * CM); }
    else if (tipo === 'ref') { p.setAlignment(A.LEFT).setLineSpacing(1).setSpacingAfter(12); }
  });

  // Remove o parágrafo vazio que todo documento novo traz no início.
  if (corpo.getNumChildren() > 1 && corpo.getChild(0).asParagraph().getText() === '') {
    corpo.getChild(0).removeFromParent();
  }
}
