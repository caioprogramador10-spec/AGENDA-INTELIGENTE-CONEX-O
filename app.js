// ================================================================
// CONFIGURAÇÃO SUPABASE
// ================================================================
const _supabaseUrl = 'https://jrmztxlwvwwqllgueblw.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybXp0eGx3dnd3cWxsZ3VlYmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjUyNTgsImV4cCI6MjA5MjMwMTI1OH0.hgI2QdCsnvbxTdGti94KqWT-SK1-77VSW3b5JBzvKnI';

const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);

let editandoId = null;

// ================================================================
// 1. NAVEGAÇÃO ENTRE ABAS
// ================================================================
window.showTab = function(tabName) {
    const sections = ['sec-agendamento', 'sec-roteirizacao', 'sec-controle'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    const tabs = ['tab-agendamento', 'tab-roteirizacao', 'tab-controle'];
    tabs.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('active-tab');
            btn.classList.add('text-slate-400');
        }
    });

    const targetSec = document.getElementById(`sec-${tabName}`);
    const targetBtn = document.getElementById(`tab-${tabName}`);
    
    if (targetSec) targetSec.classList.remove('hidden');
    if (targetBtn) {
        targetBtn.classList.add('active-tab');
        targetBtn.classList.remove('text-slate-400');
    }

    if (tabName === 'roteirizacao') carregarRoteirizacao();
    if (tabName === 'agendamento') carregarAgendamentos();
    if (tabName === 'controle') carregarControleFinanceiro(); 
};

// ================================================================
// 2. LÓGICA DE AGENDAMENTO (SALVAR / ATUALIZAR)
// ================================================================
const form = document.getElementById('form-agendamento');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const localidadeInformada = document.getElementById('localidade').value;
        const dataInformada = document.getElementById('data').value;
        
        let rotaAutomatica = document.getElementById('responsavel-agendamento').value || "Caio Pinheiro";
        let statusAutomatico = "Pendente";

        const { data: configsRegioes } = await supabaseClient.from('técnicos').select('nome, regioes_atendidas');

        if (configsRegioes) {
            for (const tec of configsRegioes) {
                const bairrosTexto = tec.regioes_atendidas || "";
                const listaBairros = bairrosTexto.split(',').map(b => b.trim().toLowerCase()).filter(b => b !== "");
                
                if (listaBairros.some(b => localidadeInformada.toLowerCase().includes(b))) {
                    const { count } = await supabaseClient
                        .from('agendamentos')
                        .select('*', { count: 'exact', head: true })
                        .eq('data_agendamento', dataInformada)
                        .eq('responsavel_agendamento', tec.nome);

                    if (count < 9) {
                        rotaAutomatica = tec.nome;
                        statusAutomatico = "Em Rota";
                    } else {
                        alert(`Limite de 9 serviços atingido para ${tec.nome}. O agendamento ficará como Pendente.`);
                    }
                    break; 
                }
            }
        }

        const dados = {
            data_agendamento: dataInformada,
            localidade: localidadeInformada,
            endereco: document.getElementById('endereco').value,
            servico: document.getElementById('servico').value,
            periodo: document.getElementById('periodo').value,
            placa_veiculo: document.getElementById('placa').value,
            observacao: document.getElementById('obs').value,
            associado: document.getElementById('associado')?.value || "Não informado",
            fipe: document.getElementById('fipe')?.value || "---",
            meio_atendimento: document.getElementById('meio-atendimento').value,
            uf: document.getElementById('uf-regiao').value,
            responsavel_agendamento: rotaAutomatica, 
            status: editandoId ? undefined : statusAutomatico
        };

        if (editandoId) { 
            delete dados.responsavel_agendamento; 
            delete dados.status; 
        }

        let resultado;
        if (editandoId) {
            resultado = await supabaseClient.from('agendamentos').update(dados).eq('id', editandoId);
        } else {
            resultado = await supabaseClient.from('agendamentos').insert([dados]);
        }

        if (resultado.error) {
            alert('Erro ao processar: ' + resultado.error.message);
        } else {
            const msg = statusAutomatico === "Em Rota" && !editandoId 
                ? `Despachado para ${rotaAutomatica}!` 
                : "Agendamento realizado com sucesso!";
            alert(editandoId ? 'Agendamento atualizado!' : msg);
            resetarFormulario();
            carregarAgendamentos();
        }
    });
}

function resetarFormulario() {
    if (form) form.reset();
    editandoId = null;
    const btn = document.getElementById('btn-submit');
    if (btn) {
        btn.innerText = "CONFIRMAR AGENDAMENTO";
        btn.classList.remove('bg-blue-600');
        btn.classList.add('bg-emerald-500');
    }
}

// ================================================================
// 3. CARREGAR E FILTRAR TABELA DE AGENDAMENTOS
// ================================================================
async function carregarAgendamentos() {
    const filtroData = document.getElementById('filtro-data-lista')?.value;
    const filtroMeio = document.getElementById('filtro-meio-lista')?.value; 
    
    let query = supabaseClient.from('agendamentos').select('*').order('data_agendamento', { ascending: true });

    if (filtroData) query = query.eq('data_agendamento', filtroData);
    if (filtroMeio) query = query.eq('meio_atendimento', filtroMeio);

    const { data, error } = await query;
    const lista = document.getElementById('lista-agendamentos');
    if (!lista || error) return;
    
    lista.innerHTML = data.map(item => {
        const dataFormatada = item.data_agendamento.split('-').reverse().join('/');
        return `
        <tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">
            <td class="p-5 text-sm">
                <div class="font-bold text-slate-800">${dataFormatada}</div>
                <div class="text-[10px] font-black text-emerald-600 uppercase mt-1">${item.responsavel_agendamento}</div>
                <div class="mt-1">
                    <span class="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200 uppercase tracking-tighter">
                        ${item.periodo}
                    </span>
                </div>
            </td>
            <td class="p-5 text-sm text-slate-600">
                <div class="font-black text-slate-800 uppercase text-[12px] mb-1">${item.associado || '---'}</div>
                <div class="text-[12px] text-slate-900 flex items-start gap-1 mb-2 leading-tight">
                    <span class="text-emerald-600 font-bold">📍</span> 
                    <span>${item.endereco} | <span class="font-black text-emerald-700">${item.localidade}</span></span>
                </div>
                <div class="flex gap-2 items-center">
                    <div class="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">${item.uf || 'RJ'}</div>
                    <div class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">${item.meio_atendimento || 'Moto'}</div>
                    <div class="inline-block bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600">🚘 FIPE: ${item.fipe || '---'}</div>
                    <div class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-widest border border-black shadow-sm">${item.placa_veiculo || '---'}</div>
                </div>
            </td>
            <td class="p-5 text-sm">
                <div class="font-bold text-emerald-600 uppercase italic">${item.servico}</div>
            </td>
            <td class="p-5 text-sm text-slate-600 font-medium">${item.responsavel_agendamento}</td>
            <td class="p-5 text-center">
                <div class="flex flex-col gap-2 items-center">
                    <span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-200">${item.status}</span>
                    <div class="flex gap-2">
                        <button onclick="verDetalhes('${item.id}')" class="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all border border-transparent hover:border-emerald-200" title="Ver Informações">👁️</button>
                        <button onclick="prepararEdicao('${item.id}')" class="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all border border-transparent hover:border-blue-200" title="Editar">✏️</button>
                        <button onclick="excluirAgendamento('${item.id}')" class="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all border border-transparent hover:border-red-200" title="Excluir">🗑️</button>
                    </div>
                </div>
            </td>
        </tr>`;
    }).join('');

    if (typeof filtrarAgendamentosPlaca === "function") filtrarAgendamentosPlaca();
}

// ================================================================
// 4. DETALHES, EDIÇÃO E EXCLUSÃO
// ================================================================
window.verDetalhes = async function(id) {
    const { data, error } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (error) return;
    Swal.fire({
        title: `<span class="text-emerald-600 font-black uppercase text-lg italic">Informações Técnicas</span>`,
        html: `
            <div class="text-left space-y-3">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veículo</p>
                    <p class="text-sm font-bold text-slate-800">${data.associado}</p>
                    <p class="text-xs text-slate-600">${data.fipe} | <b>${data.placa_veiculo}</b></p>
                </div>
                <div class="flex gap-2">
                    <div class="p-2 bg-slate-100 rounded flex-1 border border-slate-200">
                        <p class="text-[9px] font-black text-slate-400 uppercase">UF</p>
                        <p class="text-xs font-bold text-slate-700">${data.uf || '---'}</p>
                    </div>
                    <div class="p-2 bg-slate-100 rounded flex-1 border border-slate-200">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Meio</p>
                        <p class="text-xs font-bold text-slate-700">${data.meio_atendimento || '---'}</p>
                    </div>
                </div>
                <div class="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
                    <p class="text-[10px] font-black text-emerald-600 uppercase">Observações Importantes</p>
                    <p class="text-sm text-slate-700 mt-1 whitespace-pre-line">${data.observacao || 'Nenhuma observação cadastrada.'}</p>
                </div>
            </div>`,
        confirmButtonText: 'ENTENDIDO',
        confirmButtonColor: '#10b981'
    });
};

window.excluirAgendamento = async function(id) {
    if (confirm("Tem certeza que deseja excluir este agendamento?")) {
        const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
        if (error) alert("Erro ao excluir");
        else carregarAgendamentos();
    }
};

window.prepararEdicao = async function(id) {
    const { data } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (data) {
        editandoId = id;
        document.getElementById('associado').value = data.associado;
        document.getElementById('fipe').value = data.fipe;
        document.getElementById('data').value = data.data_agendamento;
        document.getElementById('localidade').value = data.localidade;
        document.getElementById('endereco').value = data.endereco;
        document.getElementById('servico').value = data.servico;
        document.getElementById('periodo').value = data.periodo;
        document.getElementById('placa').value = data.placa_veiculo;
        document.getElementById('obs').value = data.observacao;
        document.getElementById('responsavel-agendamento').value = data.responsavel_agendamento;
        if (data.meio_atendimento) document.getElementById('meio-atendimento').value = data.meio_atendimento;
        if (data.uf) document.getElementById('uf-regiao').value = data.uf;

        const btn = document.getElementById('btn-submit');
        if (btn) {
            btn.innerText = "ATUALIZAR AGENDAMENTO";
            btn.classList.remove('bg-emerald-500');
            btn.classList.add('bg-blue-600');
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// ================================================================
// 5. ROTEIRIZAÇÃO E DRAG & DROP
// ================================================================

window.exibirDadosCompletosRoteirizacao = function(dados) {
    Swal.fire({
        title: `<span class="text-emerald-600 font-black uppercase text-lg italic">Dados Completos do Serviço</span>`,
        html: `
            <div class="text-left space-y-3">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veículo</p>
                    <p class="text-sm font-bold text-slate-800">${dados.associado}</p>
                    <p class="text-xs text-slate-600">${dados.fipe} | PLACA: <b>${dados.placa_veiculo}</b></p>
                </div>
                <div class="p-3 bg-white border border-slate-200 rounded-lg">
                    <p class="text-[10px] font-black text-emerald-600 uppercase">Endereço de Atendimento</p>
                    <p class="text-xs font-bold text-slate-800">${dados.endereco}</p>
                    <p class="text-[11px] text-slate-600">${dados.localidade} - ${dados.uf || 'RJ'}</p>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div class="p-2 bg-slate-100 rounded border border-slate-200">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Serviço</p>
                        <p class="text-xs font-bold text-emerald-700">${dados.servico}</p>
                    </div>
                    <div class="p-2 bg-slate-100 rounded border border-slate-200">
                        <p class="text-[9px] font-black text-slate-400 uppercase">Período</p>
                        <p class="text-xs font-bold text-slate-700">${dados.periodo}</p>
                    </div>
                </div>
                <div class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                    <p class="text-[10px] font-black text-amber-600 uppercase italic">Agenda da Conexão / Obs</p>
                    <p class="text-xs text-slate-700 mt-1 whitespace-pre-line">${dados.observacao || 'Sem observações.'}</p>
                </div>
                <div class="text-center pt-2">
                    <span class="text-[10px] font-black text-slate-300 uppercase">Status: ${dados.status} | Resp: ${dados.responsavel_agendamento}</span>
                </div>
            </div>`,
        confirmButtonText: 'FECHAR',
        confirmButtonColor: '#10b981'
    });
};

window.abrirDetalhesCard = function(el) {
    try {
        const dados = JSON.parse(decodeURIComponent(el.getAttribute('data-dados')));
        window.exibirDadosCompletosRoteirizacao(dados);
    } catch(e) {}
};
// Usa o campo 'regioes_atendidas' como JSON { "2026-05-01": "bairros..." }
// Se o valor não for JSON válido, trata como string legada (compatibilidade).
// ================================================================
function lerBairrosParaData(tecBD, dataFiltro) {
    const raw = tecBD.regioes_atendidas || '';
    if (!raw) return '';
    try {
        const obj = JSON.parse(raw);
        if (typeof obj === 'object' && obj !== null) {
            // É o novo formato JSON por data
            return dataFiltro ? (obj[dataFiltro] || '') : '';
        }
    } catch (e) {
        // É o formato legado (string simples) — retorna direto
        return raw;
    }
    return raw;
}

// ================================================================
// HELPER: salva bairros do técnico para a data selecionada
// Lê o JSON atual, atualiza só a chave da data e salva de volta.
// ================================================================
window.salvarBairrosPorData = async function(nomeRota, dataFiltro, valor) {
    // Busca valor atual do campo
    const { data: tecnico } = await supabaseClient
        .from('técnicos')
        .select('regioes_atendidas')
        .eq('nome', nomeRota)
        .single();

    const raw = tecnico?.regioes_atendidas || '';
    let obj = {};

    // Tenta parsear como JSON; se falhar, migra o valor legado
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
            obj = parsed;
        } else {
            // Era JSON mas não é objeto — descarta
            obj = {};
        }
    } catch (e) {
        // Era string legada — migra para a data atual se existir
        if (raw && dataFiltro) {
            obj[dataFiltro] = raw;
        }
    }

    if (dataFiltro) {
        obj[dataFiltro] = valor;
    }

    await supabaseClient
        .from('técnicos')
        .update({ regioes_atendidas: JSON.stringify(obj) })
        .eq('nome', nomeRota);
};

async function carregarRoteirizacao() {
    const dataFiltro = document.getElementById('filtro-data-rota')?.value || '';

    const { data: técnicosRaw } = await supabaseClient.from('técnicos').select('*');
    const técnicos = (técnicosRaw || []).sort((a, b) => {
        const numA = parseInt(a.nome.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.nome.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    let queryAgend = supabaseClient.from('agendamentos').select('*');
    if (dataFiltro) queryAgend = queryAgend.eq('data_agendamento', dataFiltro);
    const { data: agendamentos } = await queryAgend;

    const containerMotos = document.getElementById('motos-container');
    const listaPendentes = document.getElementById('pendentes-lista');
    if (!containerMotos || !listaPendentes) return;

    containerMotos.innerHTML = '';
    listaPendentes.innerHTML = '';

    const pendentes = (agendamentos || []).filter(a => a && a.status === 'Pendente');
    const countEl = document.getElementById('count-pendentes');
    if (countEl) countEl.innerText = pendentes.length;

    // Monta cards de pendentes com data-responsavel preservado
    pendentes.forEach(item => {
        const card = document.createElement('div');
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-bairro', item.localidade);
        card.setAttribute('data-placa', item.placa_veiculo || '');
        card.setAttribute('data-responsavel', item.responsavel_agendamento || '');
        card.className = 'bg-white p-4 rounded-xl shadow-sm border-l-4 border-slate-400 cursor-grab mb-3 hover:shadow-md transition-shadow card-servico';
        card.innerHTML = `
            <p class="font-black text-[11px] uppercase">${item.associado}</p>
            <p class="text-[10px] text-emerald-600 mb-1">${item.localidade}</p>
            <button onclick="event.stopPropagation(); transferirServico('${item.id}')"
                title="Transferir para outra data/rota"
                class="bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all leading-none">
                MOVER
            </button>`;
        card.ondblclick = () => window.exibirDadosCompletosRoteirizacao(item);
        listaPendentes.appendChild(card);
    });

    // ----------------------------------------------------------------
    // Sortable da coluna de PENDENTES
    // FIX ARRASTO: NÃO chama carregarRoteirizacao() dentro do onAdd.
    // Apenas atualiza o banco e o contador — o card já está no DOM
    // pelo próprio SortableJS, não precisa recriar nada.
    // ----------------------------------------------------------------
    new Sortable(listaPendentes, {
        group: 'shared',
        animation: 150,
        onAdd: async function(evt) {
            const card = evt.item;
            const agendamentoId = card.getAttribute('data-id');
            // Preserva o responsavel original salvo no card
            const responsavelOriginal = card.getAttribute('data-responsavel') || 'Caio Pinheiro';

            await supabaseClient.from('agendamentos').update({
                status: 'Pendente',
                responsavel_agendamento: responsavelOriginal
            }).eq('id', agendamentoId);

            // Atualiza só o contador de pendentes sem recarregar tudo
            if (countEl) countEl.innerText = listaPendentes.querySelectorAll('[data-id]').length;

            // Mantém o filtro de técnico ativo se houver
            const termoFiltro = document.getElementById('busca-técnico')?.value || '';
            if (termoFiltro) filtrarColunastécnicos();
        }
    });

    // Monta colunas dos técnicos
    (técnicos || []).forEach(tecBD => {
        const nomeDaRota = tecBD.nome;
        const servicosNaRota = (agendamentos || []).filter(a => a && a.responsavel_agendamento === nomeDaRota);
        const corBorda = servicosNaRota.length >= 9 ? 'border-red-500' : 'border-emerald-400';

        // Lê os bairros corretos para a data filtrada
        const bairrosParaData = lerBairrosParaData(tecBD, dataFiltro);

        const col = document.createElement('div');
        col.className = `coluna-técnico bg-white p-5 rounded-2xl shadow-sm border-t-8 ${corBorda} min-h-[400px] flex flex-col relative`;
        col.setAttribute('data-nome', nomeDaRota);

        col.innerHTML = `
            <button onclick="excluirTecnico('${tecBD.id}', '${nomeDaRota}')" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 text-xs">✖</button>
            <div class="mb-4 border-b pb-2">
                <div class="flex justify-between items-center">
                    <h4 class="font-black text-[12px] uppercase text-slate-800">${nomeDaRota}</h4>
                    <span class="contador-rota text-[10px] font-bold ${servicosNaRota.length >= 9 ? 'text-red-500' : 'text-emerald-500'}">${servicosNaRota.length}/9</span>
                </div>
                <div class="mt-2 space-y-1">
                    <input type="text" placeholder="técnico do dia"
                        onblur="atualizarDadosRota('${nomeDaRota}', 'tecnico_dia', this.value)"
                        value="${tecBD.tecnico_dia || ''}"
                        class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">
                    <input type="text" placeholder="WhatsApp"
                        onblur="atualizarDadosRota('${nomeDaRota}', 'whatsapp', this.value)"
                        value="${tecBD.whatsapp || ''}"
                        class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">
                    <textarea placeholder="Bairros (Ex: Centro, Lapa)"
                        class="textarea-bairros w-full text-[9px] p-1 border rounded bg-emerald-50 h-10 resize-none outline-none focus:border-emerald-500"
                        onblur="salvarBairrosPorData('${nomeDaRota}', '${dataFiltro}', this.value)">${bairrosParaData}</textarea>
                </div>
                <button onclick="enviarRotaZap('${nomeDaRota}', '${tecBD.whatsapp}')" class="w-full mt-2 bg-emerald-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-600 transition-all shadow-sm">ENVIAR WHATSAPP (PDF)</button>
                ${renderizarBotaoExtra(nomeDaRota)}
            </div>
            <div id="moto-${nomeDaRota.replace(/\s/g, '-')}"
                class="space-y-3 min-h-[300px] flex-1 moto-dropzone rounded-xl bg-slate-50/50 p-2"
                data-rota="${nomeDaRota}">
                ${servicosNaRota.map(s => {
                    const dadosEncoded = encodeURIComponent(JSON.stringify(s));
                    return `
                    <div class="bg-white p-2 rounded shadow-sm text-[10px] font-bold border-l-2 border-emerald-500 cursor-grab card-servico"
                         data-id="${s.id}"
                         data-bairro="${s.localidade}"
                         data-placa="${s.placa_veiculo || ''}"
                         data-responsavel="${s.responsavel_agendamento || ''}"
                         data-dados="${dadosEncoded}"
                         onclick="window.abrirDetalhesCard(this)">
                        ${s.associado} <br>
                        <span class="font-normal text-slate-400">${s.localidade}</span><br>
                        <button onclick="event.stopPropagation(); transferirServico('${s.id}')"
                            title="Transferir para outra data/rota"
                            class="mt-1 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 transition-all leading-none">
                            MOVER
                        </button>
                    </div>`;
                }).join('')}
            </div>`;

        containerMotos.appendChild(col);

        // ----------------------------------------------------------------
        // Sortable de cada DROPZONE de técnico
        // FIX ARRASTO: Também NÃO chama carregarRoteirizacao() no onAdd.
        // Atualiza banco e contador localmente.
        // ----------------------------------------------------------------
        new Sortable(document.getElementById(`moto-${nomeDaRota.replace(/\s/g, '-')}`), {
            group: 'shared',
            animation: 150,
            onAdd: async function(evt) {
                const card = evt.item;
                const agendamentoId = card.getAttribute('data-id');
                const bairroAgendamento = card.getAttribute('data-bairro').trim().toLowerCase();

                const textareaBairros = evt.to.closest('.coluna-técnico').querySelector('.textarea-bairros');
                const listaBairrosTecnico = (textareaBairros?.value || '')
                    .replace(/\n/g, ',')
                    .split(',')
                    .map(b => b.trim().toLowerCase())
                    .filter(b => b !== '');

                if (listaBairrosTecnico.length > 0 &&
                    !listaBairrosTecnico.some(b => b === bairroAgendamento || bairroAgendamento.includes(b))) {
                    alert(`Atenção: O bairro "${bairroAgendamento.toUpperCase()}" não está na lista de atendimento de ${nomeDaRota}!`);
                }

                // Conta cards já na dropzone (exclui o que acabou de entrar)
                const totalAtual = evt.to.querySelectorAll('[data-id]').length;
                if (totalAtual > 9) {
                    alert('Limite de 9 serviços atingido para este técnico!');
                    // Devolve o card para a origem sem chamar o banco
                    evt.from.appendChild(card);
                    return;
                }

                await supabaseClient.from('agendamentos').update({
                    status: 'Em Rota',
                    responsavel_agendamento: nomeDaRota
                }).eq('id', agendamentoId);

                // Atualiza o data-responsavel do card para o novo técnico
                card.setAttribute('data-responsavel', nomeDaRota);

                // Atualiza contadores localmente
                const contadorEl = evt.to.closest('.coluna-técnico').querySelector('.contador-rota');
                if (contadorEl) {
                    const novoTotal = evt.to.querySelectorAll('[data-id]').length;
                    contadorEl.innerText = `${novoTotal}/9`;
                    contadorEl.className = `contador-rota text-[10px] font-bold ${novoTotal >= 9 ? 'text-red-500' : 'text-emerald-500'}`;
                }
                if (countEl) countEl.innerText = listaPendentes.querySelectorAll('[data-id]').length;

                // Mantém filtro ativo
                const termoFiltro = document.getElementById('busca-técnico')?.value || '';
                if (termoFiltro) filtrarColunastécnicos();
            }
        });
    });
}

// ================================================================
// FUNÇÕES DE SUPORTE À ROTEIRIZAÇÃO
// ================================================================
window.adicionarNovaMoto = async function() {
    const { value: nomeMoto } = await Swal.fire({
        title: 'Nome da Nova Moto / Técnico',
        input: 'text',
        inputPlaceholder: 'Ex: Moto 05 ou Nome do Prestador',
        showCancelButton: true,
        confirmButtonColor: '#10b981'
    });
    if (nomeMoto) {
        const { error } = await supabaseClient.from('técnicos').insert([{ nome: nomeMoto }]);
        if (error) alert('Erro ao adicionar: ' + error.message);
        else carregarRoteirizacao();
    }
};

window.excluirTecnico = async function(id, nome) {
    if (confirm(`Excluir a coluna "${nome}"? Agendamentos nela voltarão para pendentes.`)) {
        await supabaseClient.from('agendamentos')
            .update({ status: 'Pendente', responsavel_agendamento: 'Caio Pinheiro' })
            .eq('responsavel_agendamento', nome);
        const { error } = await supabaseClient.from('técnicos').delete().eq('id', id);
        if (error) alert('Erro ao excluir');
        else carregarRoteirizacao();
    }
};

window.enviarRotaZap = async function(nomeTecnico, whatsapp) {
    const dataFiltro = document.getElementById('filtro-data-rota')?.value;
    const { data: agendamentos } = await supabaseClient.from('agendamentos')
        .select('*')
        .eq('responsavel_agendamento', nomeTecnico)
        .eq('data_agendamento', dataFiltro);

    if (!agendamentos || agendamentos.length === 0)
        return alert('Não há agendamentos nesta rota para hoje.');

    let resumo = `*ROTA DO DIA - ${nomeTecnico}*\n*DATA: ${dataFiltro.split('-').reverse().join('/')}*\n\n`;
    agendamentos.slice(0, 9).forEach((a, index) => {
        resumo += `*${index + 1}. ASSOCIADO:* ${a.associado}\n📍 *END:* ${a.endereco} (${a.localidade})\n🛠 *SERV:* ${a.servico}\n⏰ *PERÍODO:* ${a.periodo}\n🚗 *PLACA:* ${a.placa_veiculo}\n`;
        if (a.observacao?.trim()) resumo += `📝 *OBS:* ${a.observacao}\n`;
        resumo += `---\n`;
    });

    window.open(`https://wa.me/55${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(resumo)}`, '_blank');
};

async function atualizarDadosRota(nomeRota, campo, valor) {
    const update = {};
    update[campo] = valor;
    await supabaseClient.from('técnicos').update(update).eq('nome', nomeRota);
}

// ================================================================
// LÓGICA DE FILTRAGEM
// ================================================================
window.filtrarAgendamentosPlaca = function() {
    const termo = document.getElementById('busca-placa-agendamento')?.value.toLowerCase() || '';
    document.querySelectorAll('#lista-agendamentos tr').forEach(linha => {
        const textoPlaca = linha.querySelector('.font-mono')?.innerText.toLowerCase() || '';
        const textoAssociado = linha.querySelector('.font-black')?.innerText.toLowerCase() || '';
        linha.style.display = (textoPlaca.includes(termo) || textoAssociado.includes(termo) || termo === '') ? '' : 'none';
    });
};

window.filtrarColunastécnicos = function() {
    const termo = document.getElementById('busca-técnico')?.value.toLowerCase() || '';
    document.querySelectorAll('.coluna-técnico').forEach(col => {
        const nomeTecnico = col.getAttribute('data-nome').toLowerCase();
        let encontrouNaColuna = false;

        col.querySelectorAll('.card-servico').forEach(card => {
            const placa = (card.getAttribute('data-placa') || '').toLowerCase();
            const associado = card.innerText.toLowerCase();
            const visivel = termo === '' || placa.includes(termo) || associado.includes(termo) || nomeTecnico.includes(termo);
            card.style.display = visivel ? 'block' : 'none';
            if (visivel && termo !== '') {
                encontrouNaColuna = true;
                card.classList.add('ring-2', 'ring-amber-500');
            } else {
                card.classList.remove('ring-2', 'ring-amber-500');
            }
        });

        col.style.display = (nomeTecnico.includes(termo) || encontrouNaColuna || termo === '') ? 'block' : 'none';
    });
};

async function carregarControleFinanceiro() {
    const { data } = await supabaseClient.from('agendamentos').select('servico, status');
    const statsContainer = document.getElementById('financeiro-stats');
    if (statsContainer && data) {
        const concluidos = data.filter(a => a.status === 'Concluído').length;
        statsContainer.innerHTML = `
            <div class="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p class="text-[10px] font-black text-emerald-600 uppercase">Serviços Concluídos</p>
                <p class="text-2xl font-bold text-emerald-700">${concluidos}</p>
            </div>
            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p class="text-[10px] font-black text-blue-600 uppercase">Total de Registros</p>
                <p class="text-2xl font-bold text-blue-700">${data.length}</p>
            </div>`;
    }
}

// ================================================================
// FUNÇÕES DE SERVIÇO EXTRA
// ================================================================
function renderizarBotaoExtra(tecnicoNome) {
    return `<button onclick="adicionarServicoExtra('${tecnicoNome}')" class="w-full mt-2 bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-amber-600 transition-all shadow-sm">+ ADICIONAR EXTRA</button>`;
}

async function adicionarServicoExtra(tecnicoNome) {
    const dataFiltro = document.getElementById('filtro-data-rota')?.value || new Date().toISOString().split('T')[0];
    const { value: formValues } = await Swal.fire({
        title: `SERVIÇO EXTRA: ${tecnicoNome}`,
        html: `
            <div class="text-left">
                <label class="text-[10px] font-bold">DATA</label>
                <input id="swal-data" type="date" class="swal2-input !mt-1" value="${dataFiltro}">
                <label class="text-[10px] font-bold">ASSOCIADO</label>
                <input id="swal-associado" placeholder="Nome do cliente" class="swal2-input !mt-1">
                <label class="text-[10px] font-bold">LOCALIDADE</label>
                <input id="swal-localidade" placeholder="Ex: Lapa" class="swal2-input !mt-1">
                <label class="text-[10px] font-bold">ENDEREÇO</label>
                <input id="swal-endereco" placeholder="Rua, número" class="swal2-input !mt-1">
                <label class="text-[10px] font-bold">PLACA</label>
                <input id="swal-placa" placeholder="Placa do veículo" class="swal2-input !mt-1">
                <label class="text-[10px] font-bold">SERVIÇO</label>
                <select id="swal-servico" class="swal2-input !mt-1">
                    <option value="Instalação">Instalação</option>
                    <option value="Manutenção">Manutenção</option>
                    <option value="Retirada">Retirada</option>
                </select>
            </div>`,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'SALVAR EXTRA',
        confirmButtonColor: '#f59e0b',
        preConfirm: () => ({
            data_agendamento: document.getElementById('swal-data').value,
            associado: document.getElementById('swal-associado').value,
            localidade: document.getElementById('swal-localidade').value,
            endereco: document.getElementById('swal-endereco').value,
            placa_veiculo: document.getElementById('swal-placa').value,
            servico: document.getElementById('swal-servico').value,
            responsavel_agendamento: tecnicoNome,
            status: 'Em Rota',
            periodo: 'Integral',
            meio_atendimento: 'Moto',
            uf: 'RJ'
        })
    });

    if (formValues) {
        const { error } = await supabaseClient.from('agendamentos').insert([formValues]);
        if (error) alert('Erro ao salvar serviço extra: ' + error.message);
        else carregarRoteirizacao();
    }
}

// ================================================================
// TRANSFERÊNCIA DE SERVIÇO PARA OUTRA DATA / ROTA
// ================================================================
window.transferirServico = async function(agendamentoId) {
    // Busca dados atuais do agendamento
    const { data: ag, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('id', agendamentoId)
        .single();

    if (error || !ag) return alert('Erro ao buscar dados do serviço.');

    // Busca lista de técnicos para popular o select
    const { data: tecnicos } = await supabaseClient.from('técnicos').select('nome').order('nome');
    const opcoesRotas = (tecnicos || [])
        .map(t => `<option value="${t.nome}" ${t.nome === ag.responsavel_agendamento ? 'selected' : ''}>${t.nome}</option>`)
        .join('');

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: `<span class="text-slate-700 font-black text-base">🔁 Transferir Serviço</span>`,
        html: `
            <div class="text-left space-y-3 mt-2">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p class="text-[10px] font-black text-slate-400 uppercase">Serviço</p>
                    <p class="text-sm font-bold text-slate-800">${ag.associado}</p>
                    <p class="text-[11px] text-slate-500">${ag.localidade} · ${ag.servico}</p>
                </div>

                <div>
                    <label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Data</label>
                    <input type="date" id="transf-data" value="${ag.data_agendamento}"
                        class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500">
                </div>

                <div>
                    <label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Rota / Técnico</label>
                    <select id="transf-rota"
                        class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 bg-white">
                        <option value="Pendente">⏳ Deixar como Pendente</option>
                        ${opcoesRotas}
                    </select>
                </div>

                <div>
                    <label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Período</label>
                    <select id="transf-periodo"
                        class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none focus:border-emerald-500 bg-white">
                        <option value="Manhã"   ${ag.periodo === 'Manhã'      ? 'selected' : ''}>☀️ Manhã</option>
                        <option value="Tarde"   ${ag.periodo === 'Tarde'      ? 'selected' : ''}>🌤️ Tarde</option>
                        <option value="Comercial" ${ag.periodo === 'Comercial' ? 'selected' : ''}>🏢 Comercial</option>
                        <option value="Integral" ${ag.periodo === 'Integral'  ? 'selected' : ''}>📅 Integral</option>
                    </select>
                </div>
            </div>`,
        showCancelButton: true,
        confirmButtonText: 'TRANSFERIR',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        focusConfirm: false,
        preConfirm: () => {
            const novaData  = document.getElementById('transf-data').value;
            const novaRota  = document.getElementById('transf-rota').value;
            const novoPeriodo = document.getElementById('transf-periodo').value;
            if (!novaData) {
                Swal.showValidationMessage('Informe a nova data.');
                return false;
            }
            return { novaData, novaRota, novoPeriodo };
        }
    });

    if (!isConfirmed || !formValues) return;

    const { novaData, novaRota, novoPeriodo } = formValues;
    const novoStatus = novaRota === 'Pendente' ? 'Pendente' : 'Em Rota';
    const novoResponsavel = novaRota === 'Pendente' ? ag.responsavel_agendamento : novaRota;

    // Se foi para uma rota real, verifica limite de 9
    if (novaRota !== 'Pendente') {
        const { count } = await supabaseClient
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('data_agendamento', novaData)
            .eq('responsavel_agendamento', novaRota);

        if (count >= 9) {
            return Swal.fire({
                icon: 'warning',
                title: 'Limite atingido',
                text: `${novaRota} já tem 9 serviços em ${novaData.split('-').reverse().join('/')}.`,
                confirmButtonColor: '#10b981'
            });
        }
    }

    const { error: updateError } = await supabaseClient
        .from('agendamentos')
        .update({
            data_agendamento: novaData,
            responsavel_agendamento: novoResponsavel,
            status: novoStatus,
            periodo: novoPeriodo
        })
        .eq('id', agendamentoId);

    if (updateError) {
        return alert('Erro ao transferir: ' + updateError.message);
    }

    await Swal.fire({
        icon: 'success',
        title: 'Transferido!',
        text: `Serviço movido para ${novaData.split('-').reverse().join('/')} → ${novaRota === 'Pendente' ? 'Pendentes' : novaRota}`,
        confirmButtonColor: '#10b981',
        timer: 2000,
        showConfirmButton: false
    });

    carregarRoteirizacao();
};
