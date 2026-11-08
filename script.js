let transacoes = JSON.parse(localStorage.getItem("minhas-financas")) || [];
let contasFixas = JSON.parse(localStorage.getItem("contas-fixas")) || [];
let investimentos = JSON.parse(localStorage.getItem("investimentos")) || [];
let gastosFixosRamo = JSON.parse(localStorage.getItem("gastos-fixos-ramo")) || [];
let meta = JSON.parse(localStorage.getItem("minha-meta")) || { nome: "", objetivo: 0, guardado: 0 };
let temaEscuro = localStorage.getItem("tema") === "dark";
let somLigado = localStorage.getItem("som") !== "off";
let streak = parseInt(localStorage.getItem("streak") || "0");
let ultimaDataGuardou = localStorage.getItem("ultima-data-guardou") || "";
let indiceEmEdicao = null;

const elementoSaldo = document.getElementById("saldo");
const elementoEntradas = document.getElementById("total-entradas");
const elementoSaidas = document.getElementById("total-saidas");
const previsaoMesEl = document.getElementById("previsao-mes");
const listaContasFixasEl = document.getElementById("lista-contas-fixas");
const semContasFixasEl = document.getElementById("sem-contas-fixas");
const descricaoContaFixaEl = document.getElementById("descricao-conta-fixa");
const valorContaFixaEl = document.getElementById("valor-conta-fixa");
const diaContaFixaEl = document.getElementById("dia-conta-fixa");
const categoriaContaFixaEl = document.getElementById("categoria-conta-fixa");
const listaInvestimentosEl = document.getElementById("lista-investimentos");
const resumoInvestimentosEl = document.getElementById("resumo-investimentos");
const nomeInvestimentoEl = document.getElementById("nome-investimento");
const tipoInvestimentoEl = document.getElementById("tipo-investimento");
const valorInvestidoEl = document.getElementById("valor-investido");
const valorAtualInvestimentoEl = document.getElementById("valor-atual-investimento");
const listaGastosRamoEl = document.getElementById("lista-gastos-ramo");
const totalGastosRamoEl = document.getElementById("total-gastos-ramo");
const nomeGastoRamoEl = document.getElementById("nome-gasto-ramo");
const valorGastoRamoEl = document.getElementById("valor-gasto-ramo");
const lista = document.getElementById("lista-transacoes");
const textoVazio = document.getElementById("vazio");
const campoDescricao = document.getElementById("descricao");
const campoValor = document.getElementById("valor");
const campoData = document.getElementById("data");
const campoCategoria = document.getElementById("categoria");
const campoBusca = document.getElementById("busca");
const filtroCategoria = document.getElementById("filtro-categoria");
const filtroTipo = document.getElementById("filtro-tipo");
const resultadoFiltro = document.getElementById("resultado-filtro");
const graficoEl = document.getElementById("grafico");
const semGraficoEl = document.getElementById("sem-grafico");
const graficoPizzaEl = document.getElementById("grafico-pizza");
const legendaGraficoMesEl = document.getElementById("legenda-grafico-mes");
const semGraficoMesEl = document.getElementById("sem-grafico-mes");
const btnTema = document.getElementById("btn-tema");
const streakEl = document.getElementById("streak");
const btnSom = document.getElementById("btn-som");

function dataLocalHoje() {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
}

campoData.value = dataLocalHoje();
const CORES = {
  "Alimentação": "#e74c3c",
  "Transporte": "#f39c12",
  "Moradia": "#3498db",
  "Lazer": "#9b59b6",
  "Salário": "#2ecc71",
  "Outros": "#95a5a6",
  "Saúde": "#1abc9c",
  "Educação": "#34495e",
  "Pets": "#d35400",
  "Beleza": "#e84393",
  "fatura": "#6c5ce7",
  "boletos": "#16a085",
  "emergencia": "#c0392b",
  "Investimento": "#27ae60",
  "Aluguel de ponto": "#8e44ad",
  "Internet": "#2980b9",
  "Cartão": "#d35400",
  "Luz": "#f1c40f",
  "Água": "#00a8ff",
  "Aluguel": "#7f8c8d",
  "Fatura": "#6c5ce7",
  "Boletos": "#16a085",
  "Emergência": "#c0392b"
};

function tocarMoeda() {
  if (!somLigado) return;
  try {
    let audio = new (window.AudioContext || window.webkitAudioContext)();
    let osc1 = audio.createOscillator();
    let osc2 = audio.createOscillator();
    let gain = audio.createGain();
    osc1.type = "sine"; osc1.frequency.value = 1318;
    osc2.type = "sine"; osc2.frequency.value = 1975;
    gain.gain.value = 0.15;
    osc1.connect(gain); gain.connect(audio.destination);
    osc1.start();
    setTimeout(() => { osc1.stop(); osc2.connect(gain); osc2.start(); setTimeout(() => osc2.stop(), 150); }, 90);
  } catch(e) {}
}
function tocarErro() {
  if (!somLigado) return;
  try {
    let audio = new (window.AudioContext || window.webkitAudioContext)();
    let osc = audio.createOscillator(); let gain = audio.createGain();
    osc.type = "sawtooth"; osc.frequency.value = 150; gain.gain.value = 0.08;
    osc.connect(gain); gain.connect(audio.destination); osc.start(); setTimeout(()=>osc.stop(), 150);
  } catch(e) {}
}
function atualizarBotaoSom() { btnSom.innerText = somLigado ? "🔊 Som: Ligado" : "🔇 Som: Desligado"; }
atualizarBotaoSom();
btnSom.addEventListener("click", () => { somLigado = !somLigado; localStorage.setItem("som", somLigado ? "on" : "off"); atualizarBotaoSom(); if(somLigado) tocarMoeda(); });

function aplicarTema() {
  document.body.classList.toggle("dark", temaEscuro);
  btnTema.innerText = temaEscuro ? "☀️" : "🌙";
  btnTema.setAttribute("aria-label", temaEscuro ? "Ativar tema claro" : "Ativar tema escuro");
  localStorage.setItem("tema", temaEscuro ? "dark" : "light");
}
aplicarTema();
btnTema.addEventListener("click", () => { temaEscuro = !temaEscuro; aplicarTema(); });

function salvar() { localStorage.setItem("minhas-financas", JSON.stringify(transacoes)); }
function salvarContasFixas() { localStorage.setItem("contas-fixas", JSON.stringify(contasFixas)); }
function salvarInvestimentos() { localStorage.setItem("investimentos", JSON.stringify(investimentos)); }
function salvarGastosFixosRamo() { localStorage.setItem("gastos-fixos-ramo", JSON.stringify(gastosFixosRamo)); }
function salvarMeta() { localStorage.setItem("minha-meta", JSON.stringify(meta)); }
function atualizarStreak() { streakEl.innerText = `🔥 Sequência: ${streak} dia${streak === 1 ? "" : "s"} guardando`; }

function atualizarCofrinho() {
  const nomeEl = document.getElementById("meta-nome");
  const textoEl = document.getElementById("meta-texto");
  const barraEl = document.getElementById("barra-meta");
  if (!meta.objetivo) { nomeEl.innerText = "Nenhuma meta ainda. Crie uma!"; textoEl.innerText = "R$ 0 de R$ 0"; barraEl.style.width = "0%"; return; }
  let pct = Math.min(100, Math.round((meta.guardado / meta.objetivo) * 100));
  nomeEl.innerText = `🎯 ${meta.nome}`;
  textoEl.innerText = `${formatarMoeda(meta.guardado)} de ${formatarMoeda(meta.objetivo)} - ${pct}%`;
  barraEl.style.width = pct + "%";
  if (pct >= 100) textoEl.innerText += " 🎉 META BATIDA!";
}

document.getElementById("btn-criar-meta").addEventListener("click", () => {
  let nome = document.getElementById("nome-meta").value.trim();
  let objetivo = Number(document.getElementById("valor-meta").value);
  if (!nome || !Number.isFinite(objetivo) || objetivo <= 0) { tocarErro(); alert("Preencha o nome e um valor da meta maior que zero!"); return; }
  meta = { nome, objetivo, guardado: 0 };
  salvarMeta(); atualizarCofrinho(); tocarMoeda();
  document.getElementById("nome-meta").value = ""; document.getElementById("valor-meta").value = "";
});

document.getElementById("btn-guardar").addEventListener("click", () => {
  if (!meta.objetivo) { tocarErro(); alert("Crie uma meta primeiro!"); return; }
  let hoje = new Date().toDateString();
  let ontem = new Date(Date.now() - 86400000).toDateString();
  if (ultimaDataGuardou !== hoje) {
    if (ultimaDataGuardou === ontem) streak++;
    else streak = 1;
    ultimaDataGuardou = hoje;
    localStorage.setItem("streak", streak);
    localStorage.setItem("ultima-data-guardou", hoje);
  }
  meta.guardado += 50;
  salvarMeta(); atualizarCofrinho(); atualizarStreak(); tocarMoeda();
  if (meta.guardado >= meta.objetivo) setTimeout(() => alert("🎉 META BATIDA! Você conseguiu!"), 300);
});

function atualizarRanking() {
  let rankingEl = document.getElementById("ranking");
  let semRankingEl = document.getElementById("sem-ranking");
  let saidas = transacoes.filter(t => t.tipo === "saida" && Number.isFinite(t.valor) && t.valor > 0).sort((a,b) => b.valor - a.valor).slice(0,3);
  rankingEl.innerHTML = "";
  if (saidas.length === 0) { semRankingEl.style.display = "block"; rankingEl.style.display = "none"; return; }
  semRankingEl.style.display = "none"; rankingEl.style.display = "block";
  let medalhas = ["🥇", "🥈", "🥉"];
  saidas.forEach((t, i) => {
    let li = document.createElement("li");
    const descricao = document.createElement("span");
    descricao.textContent = `${medalhas[i]} ${t.descricao} - ${t.categoria || "Outros"}`;
    const valor = document.createElement("strong");
    valor.textContent = formatarMoeda(t.valor);
    li.appendChild(descricao);
    li.appendChild(valor);
    rankingEl.appendChild(li);
  });
}

function atualizarPrevisaoMes() {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();
  const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
  const totalSaidasMes = transacoes.reduce((total, t) => {
    const [ano, mes, dia] = (t.data || "").split("-").map(Number);
    if (t.tipo === "saida" && ano === anoAtual && mes === mesAtual && dia >= 1 && dia <= diaAtual && Number.isFinite(t.valor) && t.valor > 0) {
      return total + t.valor;
    }
    return total;
  }, 0);
  const previsao = totalSaidasMes / diaAtual * diasNoMes;
  const valorFormatado = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(previsao);
  previsaoMesEl.innerText = `Nesse ritmo, você vai terminar o mês gastando ${valorFormatado}`;
}

function atualizarContasFixas() {
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  const pendentes = contasFixas.filter(conta => !conta.pagamentos?.includes(mesAtual));
  listaContasFixasEl.innerHTML = "";
  semContasFixasEl.style.display = pendentes.length ? "none" : "block";
  if (!contasFixas.length) semContasFixasEl.innerText = "Cadastre uma conta fixa para acompanhar os pagamentos.";
  else semContasFixasEl.innerText = "Todas as contas fixas deste mês foram pagas.";

  pendentes.forEach(conta => {
    const item = document.createElement("li");
    item.className = "conta-fixa-item";
    const detalhes = document.createElement("div");
    detalhes.className = "conta-fixa-detalhes";
    const nome = document.createElement("strong");
    nome.innerText = conta.descricao;
    const status = document.createElement("span");
    status.className = "conta-fixa-status";
    status.innerText = "Pendente";
    const info = document.createElement("span");
    info.innerText = `${conta.categoria} · vence dia ${conta.dia} · ${formatarMoeda(conta.valor)}`;
    const botoes = document.createElement("div");
    botoes.className = "conta-fixa-botoes";
    const btnPagar = document.createElement("button");
    btnPagar.type = "button";
    btnPagar.className = "btn-pagar-conta";
    btnPagar.innerText = "Pagar";
    btnPagar.addEventListener("click", () => pagarContaFixa(conta.id));
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-remover-conta";
    btnExcluir.setAttribute("aria-label", `Remover conta fixa ${conta.descricao}`);
    btnExcluir.innerText = "X";
    btnExcluir.addEventListener("click", () => {
      contasFixas = contasFixas.filter(c => c.id !== conta.id);
      salvarContasFixas();
      atualizarContasFixas();
      atualizarGastosFixosRamo();
    });
    detalhes.appendChild(nome);
    detalhes.appendChild(status);
    detalhes.appendChild(info);
    botoes.appendChild(btnPagar);
    botoes.appendChild(btnExcluir);
    item.appendChild(detalhes);
    item.appendChild(botoes);
    listaContasFixasEl.appendChild(item);
  });
}

function atualizarInvestimentos() {
  listaInvestimentosEl.innerHTML = "";
  const totalInvestido = investimentos.reduce((total, item) => total + item.valorInvestido, 0);
  const valorAtualTotal = investimentos.reduce((total, item) => total + item.valorAtual, 0);
  const rendimentoTotal = valorAtualTotal - totalInvestido;
  resumoInvestimentosEl.innerText = `Total investido: ${formatarMoeda(totalInvestido)} · Valor atual: ${formatarMoeda(valorAtualTotal)} · Rendimento: ${formatarMoeda(rendimentoTotal)}`;

  investimentos.forEach(investimento => {
    const item = document.createElement("li");
    item.className = "item-investimento";
    const detalhes = document.createElement("div");
    detalhes.className = "detalhes-investimento";
    const nome = document.createElement("strong");
    nome.innerText = `${investimento.nome} · ${investimento.tipo}`;
    const rendimento = investimento.valorAtual - investimento.valorInvestido;
    const resumo = document.createElement("span");
    resumo.innerText = `Investido: ${formatarMoeda(investimento.valorInvestido)} · Rendimento: ${formatarMoeda(rendimento)}`;
    const controles = document.createElement("div");
    controles.className = "controles-investimento";
    const valorAtual = document.createElement("input");
    valorAtual.type = "number";
    valorAtual.min = "0";
    valorAtual.step = "0.01";
    valorAtual.value = investimento.valorAtual;
    valorAtual.setAttribute("aria-label", `Valor atual de ${investimento.nome}`);
    const btnAtualizar = document.createElement("button");
    btnAtualizar.type = "button";
    btnAtualizar.className = "btn-atualizar-investimento";
    btnAtualizar.innerText = "Atualizar";
    btnAtualizar.addEventListener("click", () => {
      const novoValor = Number(valorAtual.value);
      if (!Number.isFinite(novoValor) || novoValor < 0) {
        tocarErro();
        alert("Informe um valor atual válido, igual ou maior que zero.");
        return;
      }
      investimento.valorAtual = novoValor;
      salvarInvestimentos();
      atualizarInvestimentos();
    });
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-remover-investimento";
    btnExcluir.innerText = "X";
    btnExcluir.setAttribute("aria-label", `Remover investimento ${investimento.nome}`);
    btnExcluir.addEventListener("click", () => {
      investimentos = investimentos.filter(itemInvestimento => itemInvestimento.id !== investimento.id);
      salvarInvestimentos();
      atualizarInvestimentos();
    });
    detalhes.appendChild(nome);
    detalhes.appendChild(resumo);
    controles.appendChild(valorAtual);
    controles.appendChild(btnAtualizar);
    controles.appendChild(btnExcluir);
    item.appendChild(detalhes);
    item.appendChild(controles);
    listaInvestimentosEl.appendChild(item);
  });
}

function atualizarGastosFixosRamo() {
  listaGastosRamoEl.innerHTML = "";
  const totalContasFixas = contasFixas.reduce((total, conta) => total + conta.valor, 0);
  const totalGastosNegocio = gastosFixosRamo.reduce((total, gasto) => total + gasto.valorMensal, 0);
  totalGastosRamoEl.innerText = `Total mensal de gastos fixos: ${formatarMoeda(totalContasFixas + totalGastosNegocio)}`;
  gastosFixosRamo.forEach(gasto => {
    const item = document.createElement("li");
    item.className = "item-gasto-ramo";
    const descricao = document.createElement("span");
    descricao.innerText = gasto.nome;
    const valor = document.createElement("strong");
    valor.innerText = `${formatarMoeda(gasto.valorMensal)} / mês`;
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "btn-remover-gasto-ramo";
    btnExcluir.innerText = "X";
    btnExcluir.setAttribute("aria-label", `Remover gasto ${gasto.nome}`);
    btnExcluir.addEventListener("click", () => {
      gastosFixosRamo = gastosFixosRamo.filter(itemGasto => itemGasto.id !== gasto.id);
      salvarGastosFixosRamo();
      atualizarGastosFixosRamo();
    });
    item.appendChild(descricao);
    item.appendChild(valor);
    item.appendChild(btnExcluir);
    listaGastosRamoEl.appendChild(item);
  });
}

function pagarContaFixa(id) {
  const conta = contasFixas.find(c => c.id === id);
  if (!conta) return;
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}`;
  if (conta.pagamentos?.includes(mesAtual)) return;

  transacoes.push({
    descricao: conta.descricao,
    valor: conta.valor,
    tipo: "saida",
    data: `${mesAtual}-${String(hoje.getDate()).padStart(2, "0")}`,
    categoria: conta.categoria
  });
  conta.pagamentos = [...(conta.pagamentos || []), mesAtual];
  salvar();
  salvarContasFixas();
  atualizarTela();
}

function formatarData(d) { if (!d) return ""; const [a,m,di] = d.split("-"); return `${di}/${m}/${a}`; }
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}
function getSaldosAposLancamento() {
  const cronologicas = transacoes
    .map((transacao, indiceOriginal) => ({ transacao, indiceOriginal }))
    .sort((a, b) => (a.transacao.data || "").localeCompare(b.transacao.data || "") || a.indiceOriginal - b.indiceOriginal);
  const saldos = new Map();
  let saldo = 0;
  cronologicas.forEach(({ transacao, indiceOriginal }) => {
    const valor = Number.isFinite(transacao.valor) ? transacao.valor : 0;
    saldo += transacao.tipo === "entrada" ? valor : -valor;
    saldos.set(indiceOriginal, saldo);
  });
  return saldos;
}
function getFiltradas(saldosAposLancamento) {
  let busca = campoBusca.value.toLowerCase();
  return transacoes.map((t,i) => ({...t, indiceOriginal: i, saldoAposLancamento: saldosAposLancamento.get(i)})).filter(t =>
    t.descricao.toLowerCase().includes(busca) &&
    (filtroCategoria.value === "todas" || t.categoria === filtroCategoria.value) &&
    (filtroTipo.value === "todos" || t.tipo === filtroTipo.value)
  );
}
function tituloDataExtrato(data) {
  if (!data) return "Data não informada";
  const [ano, mes, dia] = data.split("-").map(Number);
  const dataLancamento = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  const dataFormatada = `${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
  if (dataLancamento.getTime() === hoje.getTime()) return `Hoje - ${dataFormatada}`;
  if (dataLancamento.getTime() === ontem.getTime()) return `Ontem - ${dataFormatada}`;
  return ano === hoje.getFullYear() ? dataFormatada : `${dataFormatada}/${ano}`;
}
function atualizarGrafico() {
  let porCategoria = {}, total = 0;
  transacoes.forEach(t => {
    if (t.tipo === "saida" && Number.isFinite(t.valor) && t.valor > 0) {
      const categoria = t.categoria || "Outros";
      porCategoria[categoria] = (porCategoria[categoria] || 0) + t.valor;
      total += t.valor;
    }
  });
  graficoEl.innerHTML = "";
  if (total === 0) { semGraficoEl.style.display = "block"; return; }
  semGraficoEl.style.display = "none";
  Object.entries(porCategoria).sort((a,b)=>b[1]-a[1]).forEach(([cat, val]) => {
    let pct = Math.round((val/total)*100);
    const linha = document.createElement("div");
    linha.className = "barra-linha";
    const topo = document.createElement("div");
    topo.className = "barra-topo";
    const nomeCategoria = document.createElement("span");
    nomeCategoria.innerText = cat;
    const resumo = document.createElement("strong");
    resumo.innerText = `${formatarMoeda(val)} • ${pct}%`;
    const fundo = document.createElement("div");
    fundo.className = "barra-fundo";
    const preenchimento = document.createElement("div");
    preenchimento.className = "barra-preenchimento";
    preenchimento.style.width = `${pct}%`;
    preenchimento.style.background = CORES[cat] || "#333";
    topo.appendChild(nomeCategoria);
    topo.appendChild(resumo);
    fundo.appendChild(preenchimento);
    linha.appendChild(topo);
    linha.appendChild(fundo);
    graficoEl.appendChild(linha);
  });
}
function atualizarGraficoPizza() {
  const agora = new Date();
  const mesAtual = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
  const porCategoria = {};
  transacoes.forEach(t => {
    if (t.tipo === "saida" && t.data?.startsWith(mesAtual) && Number.isFinite(t.valor) && t.valor > 0) {
      const categoria = t.categoria || "Outros";
      porCategoria[categoria] = (porCategoria[categoria] || 0) + t.valor;
    }
  });
  const categorias = Object.entries(porCategoria).sort((a, b) => b[1] - a[1]);
  const total = categorias.reduce((soma, [, valor]) => soma + valor, 0);
  const contexto = graficoPizzaEl.getContext("2d");
  legendaGraficoMesEl.innerHTML = "";
  if (!total) {
    contexto.clearRect(0, 0, graficoPizzaEl.width, graficoPizzaEl.height);
    graficoPizzaEl.hidden = true;
    semGraficoMesEl.style.display = "block";
    return;
  }
  semGraficoMesEl.style.display = "none";
  graficoPizzaEl.hidden = false;
  const largura = graficoPizzaEl.clientWidth;
  const altura = graficoPizzaEl.clientHeight;
  if (largura <= 0 || altura <= 0) return;
  const escala = window.devicePixelRatio || 1;
  graficoPizzaEl.width = Math.round(largura * escala);
  graficoPizzaEl.height = Math.round(altura * escala);
  contexto.scale(escala, escala);
  const centroX = largura / 2;
  const centroY = altura / 2;
  const raio = Math.max(0, Math.min(largura, altura) / 2 - 4);
  let angulo = -Math.PI / 2;
  categorias.forEach(([categoria, valor]) => {
    const fatia = (valor / total) * Math.PI * 2;
    const cor = CORES[categoria] || "#34495e";
    contexto.beginPath();
    contexto.moveTo(centroX, centroY);
    contexto.arc(centroX, centroY, raio, angulo, angulo + fatia);
    contexto.closePath();
    contexto.fillStyle = cor;
    contexto.fill();

    const item = document.createElement("li");
    const marcador = document.createElement("span");
    marcador.className = "legenda-cor";
    marcador.style.backgroundColor = cor;
    const texto = document.createElement("span");
    texto.innerText = `${categoria} — ${formatarMoeda(valor)} (${Math.round((valor / total) * 100)}%)`;
    item.appendChild(marcador);
    item.appendChild(texto);
    legendaGraficoMesEl.appendChild(item);
    angulo += fatia;
  });
  graficoPizzaEl.setAttribute("aria-label", `Gastos deste mês: ${categorias.map(([categoria, valor]) => `${categoria}, ${formatarMoeda(valor)}`).join("; ")}`);
}
function atualizarTela() {
  lista.innerHTML = "";
  let saldo=0, e=0, s=0;
  transacoes.forEach(t => { if(t.tipo==="entrada"){saldo+=t.valor;e+=t.valor;} else {saldo-=t.valor;s+=t.valor;} });
  const saldosAposLancamento = getSaldosAposLancamento();
  let filtradas = getFiltradas(saldosAposLancamento);
  if (transacoes.length===0){ textoVazio.style.display="block"; textoVazio.innerText="Nenhuma transação ainda."; }
  else if (filtradas.length===0){ textoVazio.style.display="block"; textoVazio.innerText="Nenhuma transação encontrada."; }
  else textoVazio.style.display="none";
  resultadoFiltro.innerText = `Mostrando ${filtradas.length} de ${transacoes.length} transações`;
  const gruposPorData = new Map();
  filtradas
    .sort((a, b) => (b.data || "").localeCompare(a.data || "") || b.indiceOriginal - a.indiceOriginal)
    .forEach(t => {
      const chaveData = t.data || "";
      if (!gruposPorData.has(chaveData)) {
        const grupo = document.createElement("li");
        grupo.className = "grupo-dia-extrato";
        const cabecalho = document.createElement("h4");
        cabecalho.className = "titulo-dia-extrato";
        cabecalho.innerText = tituloDataExtrato(chaveData);
        const lancamentosDoDia = document.createElement("ul");
        lancamentosDoDia.className = "lancamentos-dia-extrato";
        grupo.appendChild(cabecalho);
        grupo.appendChild(lancamentosDoDia);
        lista.appendChild(grupo);
        gruposPorData.set(chaveData, lancamentosDoDia);
      }

      const item = document.createElement("li");
      item.className = "lancamento-extrato";
      const info = document.createElement("div");
      info.className = "info-transacao";
      const descricao = document.createElement("span");
      descricao.className = "descricao-lancamento";
      descricao.innerText = t.descricao;
      const cat = document.createElement("span");
      cat.className = "categoria";
      cat.innerText = t.categoria || "Outros";
      info.appendChild(descricao);
      info.appendChild(cat);

      const valor = document.createElement("strong");
      valor.className = `valor-lancamento ${t.tipo === "entrada" ? "entrada" : "saida"}`;
      valor.innerText = `${t.tipo === "entrada" ? "+" : "-"} ${formatarMoeda(t.valor)}`;

      const saldoLancamento = document.createElement("div");
      saldoLancamento.className = "saldo-lancamento";
      const rotuloSaldo = document.createElement("span");
      rotuloSaldo.innerText = "Saldo";
      const valorSaldo = document.createElement("strong");
      valorSaldo.innerText = formatarMoeda(t.saldoAposLancamento);
      saldoLancamento.appendChild(rotuloSaldo);
      saldoLancamento.appendChild(valorSaldo);

      const acoes = document.createElement("div");
      acoes.className = "acoes-lancamento";
      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.innerText = "✏️";
      btnEditar.className = "btn-editar";
      btnEditar.addEventListener("click", () => {
        campoDescricao.value = t.descricao;
        campoValor.value = t.valor;
        campoData.value = t.data;
        campoCategoria.value = t.categoria;
        indiceEmEdicao = t.indiceOriginal;
        document.getElementById("btn-entrada").innerText = "Salvar entrada";
        document.getElementById("btn-saida").innerText = "Salvar saída";
        window.scrollTo({ top: 0, behavior: "smooth" });
        campoDescricao.focus();
      });

      const btnExcluir = document.createElement("button");
      btnExcluir.type = "button";
      btnExcluir.innerText = "X";
      btnExcluir.className = "btn-excluir";
      btnExcluir.addEventListener("click", () => {
        if (indiceEmEdicao === t.indiceOriginal) {
          indiceEmEdicao = null;
          document.getElementById("btn-entrada").innerText = "+ Entrada";
          document.getElementById("btn-saida").innerText = "- Saída";
        } else if (indiceEmEdicao !== null && t.indiceOriginal < indiceEmEdicao) {
          indiceEmEdicao--;
        }
        transacoes.splice(t.indiceOriginal, 1);
        salvar();
        atualizarTela();
      });

      item.appendChild(info);
      item.appendChild(valor);
      item.appendChild(saldoLancamento);
      acoes.appendChild(btnEditar);
      acoes.appendChild(btnExcluir);
      item.appendChild(acoes);
      gruposPorData.get(chaveData).appendChild(item);
  });
  elementoSaldo.innerText = formatarMoeda(saldo);
  elementoSaldo.style.color = saldo>=0 ? "#2ecc71" : "#e74c3c";
  elementoEntradas.innerText = formatarMoeda(e);
  elementoSaidas.innerText = formatarMoeda(s);
  atualizarGrafico(); atualizarGraficoPizza(); atualizarPrevisaoMes(); atualizarContasFixas(); atualizarCofrinho(); atualizarRanking(); atualizarStreak();
}
function adicionarTransacao(tipo) {
  let descricao = campoDescricao.value.trim();
  let valor = Number(campoValor.value);
  let data = campoData.value;
  let categoria = campoCategoria.value;
  const categoriasPermitidas = Array.from(campoCategoria.options, option => option.value);
  if (!descricao || !Number.isFinite(valor) || valor <= 0 || !data || !categoriasPermitidas.includes(categoria)) {
    tocarErro();
    alert("Preencha a descrição, uma data válida, uma categoria válida e um valor maior que zero!");
    return;
  }
  if (tipo === "saida" && categoria === "Salário") {
    categoria = "Outros";
    campoCategoria.value = categoria;
  }
  const transacao = { descricao, valor, tipo, data, categoria };
  if (indiceEmEdicao === null) transacoes.push(transacao);
  else transacoes[indiceEmEdicao] = transacao;
  indiceEmEdicao = null;
  document.getElementById("btn-entrada").innerText = "+ Entrada";
  document.getElementById("btn-saida").innerText = "- Saída";
  salvar(); atualizarTela(); tocarMoeda();
  campoDescricao.value=""; campoValor.value=""; campoData.value=dataLocalHoje(); campoDescricao.focus();
}
function exportarCSV() {
  if (!transacoes.length) { alert("Nenhuma transação!"); return; }
  let csv = "Data;Descrição;Categoria;Tipo;Valor\n";
  transacoes.forEach(t => csv += `${formatarData(t.data)};${t.descricao};${t.categoria};${t.tipo};${t.valor}\n`);
  let blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
  let link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download="minhas-financas.csv"; link.click();
}
document.getElementById("btn-entrada").addEventListener("click", () => adicionarTransacao("entrada"));
document.getElementById("btn-saida").addEventListener("click", () => adicionarTransacao("saida"));
document.getElementById("btn-adicionar-conta-fixa").addEventListener("click", () => {
  const descricao = descricaoContaFixaEl.value.trim();
  const valor = parseFloat(valorContaFixaEl.value);
  const dia = parseInt(diaContaFixaEl.value, 10);
  if (!descricao || !Number.isFinite(valor) || valor <= 0 || !Number.isInteger(dia) || dia < 1 || dia > 31) {
    tocarErro();
    alert("Preencha a descrição, um valor maior que zero e o dia de vencimento entre 1 e 31!");
    return;
  }
  contasFixas.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    descricao,
    valor,
    dia,
    categoria: categoriaContaFixaEl.value,
    pagamentos: []
  });
  salvarContasFixas();
  atualizarContasFixas();
  atualizarGastosFixosRamo();
  descricaoContaFixaEl.value = "";
  valorContaFixaEl.value = "";
  diaContaFixaEl.value = "";
});
document.getElementById("btn-adicionar-investimento").addEventListener("click", () => {
  const nome = nomeInvestimentoEl.value.trim();
  const valorInvestido = Number(valorInvestidoEl.value);
  const valorAtualInformado = valorAtualInvestimentoEl.value.trim();
  const valorAtual = valorAtualInformado ? Number(valorAtualInformado) : valorInvestido;
  if (!nome || !Number.isFinite(valorInvestido) || valorInvestido <= 0 || !Number.isFinite(valorAtual) || valorAtual < 0) {
    tocarErro();
    alert("Informe o nome, um valor investido maior que zero e um valor atual válido.");
    return;
  }
  investimentos.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nome,
    tipo: tipoInvestimentoEl.value,
    valorInvestido,
    valorAtual
  });
  salvarInvestimentos();
  atualizarInvestimentos();
  nomeInvestimentoEl.value = "";
  valorInvestidoEl.value = "";
  valorAtualInvestimentoEl.value = "";
});
document.getElementById("btn-adicionar-gasto-ramo").addEventListener("click", () => {
  const nome = nomeGastoRamoEl.value.trim();
  const valorMensal = Number(valorGastoRamoEl.value);
  if (!nome || !Number.isFinite(valorMensal) || valorMensal <= 0) {
    tocarErro();
    alert("Informe a descrição do gasto e um valor mensal maior que zero.");
    return;
  }
  gastosFixosRamo.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    nome,
    valorMensal
  });
  salvarGastosFixosRamo();
  atualizarGastosFixosRamo();
  nomeGastoRamoEl.value = "";
  valorGastoRamoEl.value = "";
});
document.getElementById("btn-limpar").addEventListener("click", () => {
  if (confirm("Limpar todas?")) {
    transacoes = [];
    indiceEmEdicao = null;
    document.getElementById("btn-entrada").innerText = "+ Entrada";
    document.getElementById("btn-saida").innerText = "- Saída";
    salvar();
    atualizarTela();
  }
});
document.getElementById("btn-exportar").addEventListener("click", exportarCSV);
campoBusca.addEventListener("input", atualizarTela);
filtroCategoria.addEventListener("change", atualizarTela);
filtroTipo.addEventListener("change", atualizarTela);
window.addEventListener("resize", atualizarGraficoPizza);
atualizarInvestimentos();
atualizarGastosFixosRamo();
atualizarTela();

const botoesAbas = Array.from(document.querySelectorAll(".aba-botao"));
const conteudosAbas = Array.from(document.querySelectorAll(".conteudo-aba"));
function ativarAba(id, persistir = true) {
  const conteudoAtivo = conteudosAbas.find(conteudo => conteudo.id === id);
  if (!conteudoAtivo) return;

  conteudosAbas.forEach(conteudo => {
    const ativo = conteudo === conteudoAtivo;
    conteudo.hidden = !ativo;
    conteudo.classList.toggle("ativa", ativo);
  });
  botoesAbas.forEach(botao => {
    const ativo = botao.dataset.aba === id;
    botao.classList.toggle("ativa", ativo);
    botao.setAttribute("aria-selected", String(ativo));
    botao.tabIndex = ativo ? 0 : -1;
  });
  if (persistir) localStorage.setItem("aba-financas", id);
  if (id === "aba-visao") atualizarGraficoPizza();
}

botoesAbas.forEach(botao => {
  botao.addEventListener("click", () => ativarAba(botao.dataset.aba));
  botao.addEventListener("keydown", evento => {
    const indiceAtual = botoesAbas.indexOf(botao);
    let indiceNovo;
    if (evento.key === "ArrowRight") indiceNovo = (indiceAtual + 1) % botoesAbas.length;
    else if (evento.key === "ArrowLeft") indiceNovo = (indiceAtual - 1 + botoesAbas.length) % botoesAbas.length;
    else if (evento.key === "Home") indiceNovo = 0;
    else if (evento.key === "End") indiceNovo = botoesAbas.length - 1;
    else return;
    evento.preventDefault();
    const proximo = botoesAbas[indiceNovo];
    ativarAba(proximo.dataset.aba);
    proximo.focus();
  });
});
const abaSalva = localStorage.getItem("aba-financas");
ativarAba(conteudosAbas.some(conteudo => conteudo.id === abaSalva) ? abaSalva : "aba-visao", false);

const CHAVE_NOME_USUARIO = "nome-usuario";
const telaLoginEl = document.getElementById("tela-login");
const appContainerEl = document.getElementById("app-container");
const formLoginEl = document.getElementById("form-login");
const nomeUsuarioEl = document.getElementById("nome-usuario");
const mensagemBoasVindasEl = document.getElementById("mensagem-boas-vindas");
const feedbackPositivoEl = document.getElementById("feedback-positivo");
const feedbackMelhorarEl = document.getElementById("feedback-melhorar");
const statusFeedbackEl = document.getElementById("status-feedback");

function mostrarAplicativo(nome) {
  telaLoginEl.hidden = true;
  appContainerEl.hidden = false;
  document.body.classList.remove("login-active");
  mensagemBoasVindasEl.innerText = `Obrigado por acessar, ${nome}!`;
  atualizarTela();
}

formLoginEl.addEventListener("submit", evento => {
  evento.preventDefault();
  const nome = nomeUsuarioEl.value.trim();
  if (!nome) {
    nomeUsuarioEl.setCustomValidity("Informe seu nome para entrar.");
    nomeUsuarioEl.reportValidity();
    return;
  }
  nomeUsuarioEl.setCustomValidity("");
  localStorage.setItem(CHAVE_NOME_USUARIO, nome);
  mostrarAplicativo(nome);
});
nomeUsuarioEl.addEventListener("input", () => nomeUsuarioEl.setCustomValidity(""));

document.getElementById("btn-sair").addEventListener("click", () => {
  localStorage.removeItem(CHAVE_NOME_USUARIO);
  appContainerEl.hidden = true;
  telaLoginEl.hidden = false;
  nomeUsuarioEl.value = "";
  document.body.classList.add("login-active");
  nomeUsuarioEl.focus();
  window.scrollTo({ top: 0 });
});

function montarMensagemFeedback() {
  const achei = feedbackPositivoEl.value.trim() || "...";
  const melhorar = feedbackMelhorarEl.value.trim() || "...";
  return `Oi! Testei seu app Minhas Finanças. Achei: ${achei} Melhorar: ${melhorar}`;
}

async function copiarFeedback() {
  const mensagem = montarMensagemFeedback();
  try {
    await navigator.clipboard.writeText(mensagem);
    statusFeedbackEl.innerText = "Feedback copiado.";
  } catch {
    const temporario = document.createElement("textarea");
    temporario.value = mensagem;
    temporario.setAttribute("readonly", "");
    temporario.style.position = "fixed";
    temporario.style.opacity = "0";
    document.body.appendChild(temporario);
    let copiado = false;
    try {
      temporario.select();
      copiado = document.execCommand("copy");
    } catch {
      copiado = false;
    } finally {
      temporario.remove();
    }
    statusFeedbackEl.innerText = copiado
      ? "Feedback copiado."
      : "Não foi possível copiar. Selecione e copie o texto manualmente.";
  }
}

document.getElementById("btn-copiar-feedback").addEventListener("click", copiarFeedback);
document.getElementById("btn-whatsapp-feedback").addEventListener("click", () => {
  const url = `https://wa.me/?text=${encodeURIComponent(montarMensagemFeedback())}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

const nomeSalvo = localStorage.getItem(CHAVE_NOME_USUARIO)?.trim();
if (nomeSalvo) mostrarAplicativo(nomeSalvo);
else {
  telaLoginEl.hidden = false;
  appContainerEl.hidden = true;
  document.body.classList.add("login-active");
}