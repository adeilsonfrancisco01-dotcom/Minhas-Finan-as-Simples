let transacoes = JSON.parse(localStorage.getItem("minhas-financas")) || [];
let meta = JSON.parse(localStorage.getItem("minha-meta")) || { nome: "", objetivo: 0, guardado: 0 };
let temaEscuro = localStorage.getItem("tema") === "dark";
let somLigado = localStorage.getItem("som") !== "off";
let streak = parseInt(localStorage.getItem("streak") || "0");
let ultimaDataGuardou = localStorage.getItem("ultima-data-guardou") || "";

const elementoSaldo = document.getElementById("saldo");
const elementoEntradas = document.getElementById("total-entradas");
const elementoSaidas = document.getElementById("total-saidas");
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
const btnTema = document.getElementById("btn-tema");
const streakEl = document.getElementById("streak");
const btnSom = document.getElementById("btn-som");

campoData.valueAsDate = new Date();
const CORES = { "Alimentação": "#e74c3c", "Transporte": "#f39c12", "Moradia": "#3498db", "Lazer": "#9b59b6", "Salário": "#2ecc71", "Outros": "#95a5a6" };

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
  localStorage.setItem("tema", temaEscuro ? "dark" : "light");
}
aplicarTema();
btnTema.addEventListener("click", () => { temaEscuro = !temaEscuro; aplicarTema(); });

function salvar() { localStorage.setItem("minhas-financas", JSON.stringify(transacoes)); }
function salvarMeta() { localStorage.setItem("minha-meta", JSON.stringify(meta)); }
function atualizarStreak() { streakEl.innerText = `🔥 Sequência: ${streak} dia${streak === 1 ? "" : "s"} guardando`; }

function atualizarCofrinho() {
  const nomeEl = document.getElementById("meta-nome");
  const textoEl = document.getElementById("meta-texto");
  const barraEl = document.getElementById("barra-meta");
  if (!meta.objetivo) { nomeEl.innerText = "Nenhuma meta ainda. Crie uma!"; textoEl.innerText = "R$ 0 de R$ 0"; barraEl.style.width = "0%"; return; }
  let pct = Math.min(100, Math.round((meta.guardado / meta.objetivo) * 100));
  nomeEl.innerText = `🎯 ${meta.nome}`;
  textoEl.innerText = `R$ ${meta.guardado.toFixed(2)} de R$ ${meta.objetivo.toFixed(2)} - ${pct}%`;
  barraEl.style.width = pct + "%";
  if (pct >= 100) textoEl.innerText += " 🎉 META BATIDA!";
}

document.getElementById("btn-criar-meta").addEventListener("click", () => {
  let nome = document.getElementById("nome-meta").value;
  let objetivo = parseFloat(document.getElementById("valor-meta").value);
  if (!nome || isNaN(objetivo)) { tocarErro(); alert("Preencha nome e valor da meta!"); return; }
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
  let saidas = transacoes.filter(t => t.tipo === "saida").sort((a,b) => b.valor - a.valor).slice(0,3);
  rankingEl.innerHTML = "";
  if (saidas.length === 0) { semRankingEl.style.display = "block"; rankingEl.style.display = "none"; return; }
  semRankingEl.style.display = "none"; rankingEl.style.display = "block";
  let medalhas = ["🥇", "🥈", "🥉"];
  saidas.forEach((t, i) => {
    let li = document.createElement("li");
    li.innerHTML = `<span>${medalhas[i]} ${t.descricao} - ${t.categoria}</span><strong>R$ ${t.valor.toFixed(2)}</strong>`;
    rankingEl.appendChild(li);
  });
}

function formatarData(d) { if (!d) return ""; const [a,m,di] = d.split("-"); return `${di}/${m}/${a}`; }
function getFiltradas() {
  let busca = campoBusca.value.toLowerCase();
  return transacoes.map((t,i) => ({...t, indiceOriginal: i})).filter(t =>
    t.descricao.toLowerCase().includes(busca) &&
    (filtroCategoria.value === "todas" || t.categoria === filtroCategoria.value) &&
    (filtroTipo.value === "todos" || t.tipo === filtroTipo.value)
  );
}
function atualizarGrafico() {
  let porCategoria = {}, total = 0;
  transacoes.forEach(t => { if (t.tipo === "saida") { porCategoria[t.categoria] = (porCategoria[t.categoria]||0)+t.valor; total+=t.valor; } });
  graficoEl.innerHTML = "";
  if (total === 0) { semGraficoEl.style.display = "block"; return; }
  semGraficoEl.style.display = "none";
  Object.entries(porCategoria).sort((a,b)=>b[1]-a[1]).forEach(([cat, val]) => {
    let pct = Math.round((val/total)*100);
    let linha = document.createElement("div"); linha.className = "barra-linha";
    linha.innerHTML = `<div class="barra-topo"><span>${cat}</span><strong>R$ ${val.toFixed(2)} • ${pct}%</strong></div><div class="barra-fundo"><div class="barra-preenchimento" style="width:${pct}%;background:${CORES[cat]||'#333'}"></div></div>`;
    graficoEl.appendChild(linha);
  });
}
function atualizarTela() {
  lista.innerHTML = "";
  let saldo=0, e=0, s=0;
  transacoes.forEach(t => { if(t.tipo==="entrada"){saldo+=t.valor;e+=t.valor;} else {saldo-=t.valor;s+=t.valor;} });
  let filtradas = getFiltradas();
  if (transacoes.length===0){ textoVazio.style.display="block"; textoVazio.innerText="Nenhuma transação ainda."; }
  else if (filtradas.length===0){ textoVazio.style.display="block"; textoVazio.innerText="Nenhuma transação encontrada."; }
  else textoVazio.style.display="none";
  resultadoFiltro.innerText = `Mostrando ${filtradas.length} de ${transacoes.length} transações`;
  filtradas.forEach(t => {
    let item = document.createElement("li");
    let info = document.createElement("div"); info.className="info-transacao";
    let texto = document.createElement("span");
    texto.innerText = `${t.tipo==="entrada"?"+":"-"} R$ ${t.valor.toFixed(2)} - ${t.descricao} • ${formatarData(t.data)}`;
    let cat = document.createElement("span"); cat.className="categoria"; cat.innerText = t.categoria||"Outros";
    info.appendChild(texto); info.appendChild(cat);
    let btnEditar = document.createElement("button"); btnEditar.innerText="✏️"; btnEditar.className="btn-editar";
    btnEditar.addEventListener("click", () => {
      campoDescricao.value = t.descricao;
      campoValor.value = t.valor;
      campoData.value = t.data;
      campoCategoria.value = t.categoria;
      transacoes.splice(t.indiceOriginal, 1);
      salvar(); atualizarTela();
      window.scrollTo({ top: 0, behavior: "smooth" });
      campoDescricao.focus();
      alert("Agora edita ali em cima e clica em Entrada ou Saída de novo!");
    });
    let btnExcluir = document.createElement("button"); btnExcluir.innerText="X"; btnExcluir.className="btn-excluir";
    btnExcluir.addEventListener("click", () => { transacoes.splice(t.indiceOriginal,1); salvar(); atualizarTela(); });
    item.appendChild(info); item.appendChild(btnEditar); item.appendChild(btnExcluir);
    lista.appendChild(item);
  });
  elementoSaldo.innerText = `R$ ${saldo.toFixed(2)}`;
  elementoSaldo.style.color = saldo>=0 ? "#2ecc71" : "#e74c3c";
  elementoEntradas.innerText = `R$ ${e.toFixed(2)}`;
  elementoSaidas.innerText = `R$ ${s.toFixed(2)}`;
  atualizarGrafico(); atualizarCofrinho(); atualizarRanking(); atualizarStreak();
}
function adicionarTransacao(tipo) {
  let descricao = campoDescricao.value;
  let valor = parseFloat(campoValor.value);
  let data = campoData.value;
  let categoria = campoCategoria.value;
  if (!descricao || isNaN(valor) || !data) { tocarErro(); alert("Preencha descrição, valor e data!"); return; }
  transacoes.push({ descricao, valor, tipo, data, categoria });
  salvar(); atualizarTela(); tocarMoeda();
  campoDescricao.value=""; campoValor.value=""; campoData.valueAsDate=new Date(); campoDescricao.focus();
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
document.getElementById("btn-limpar").addEventListener("click", () => { if(confirm("Limpar todas?")){ transacoes=[]; salvar(); atualizarTela(); } });
document.getElementById("btn-exportar").addEventListener("click", exportarCSV);
campoBusca.addEventListener("input", atualizarTela);
filtroCategoria.addEventListener("change", atualizarTela);
filtroTipo.addEventListener("change", atualizarTela);
atualizarTela();