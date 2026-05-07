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
    ['sec-agendamento','sec-roteirizacao','sec-frustrados'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    ['tab-agendamento','tab-roteirizacao','tab-frustrados'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) { btn.classList.remove('active-tab'); btn.classList.add('text-slate-400'); }
    });
    const targetSec = document.getElementById('sec-' + tabName);
    const targetBtn = document.getElementById('tab-' + tabName);
    if (targetSec) targetSec.classList.remove('hidden');
    if (targetBtn) { targetBtn.classList.add('active-tab'); targetBtn.classList.remove('text-slate-400'); }

    if (tabName === 'roteirizacao') carregarRoteirizacao();
    if (tabName === 'agendamento')  carregarAgendamentos();
    if (tabName === 'frustrados')   carregarFrustrados();
};

// ================================================================
// 2. AGENDAMENTO
// ================================================================
const form = document.getElementById('form-agendamento');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const localidadeInformada = document.getElementById('localidade').value;
        const dataInformada       = document.getElementById('data').value;
        let rotaAutomatica   = document.getElementById('responsavel-agendamento').value || 'Caio Pinheiro';
        let statusAutomatico = 'Pendente';

        const { data: configsRegioes } = await supabaseClient.from('técnicos').select('nome, regioes_atendidas');
        if (configsRegioes) {
            for (const tec of configsRegioes) {
                const bairrosTexto = lerCampoPorData(tec.regioes_atendidas || '', dataInformada);
                const listaBairros = bairrosTexto.split(',').map(b => b.trim().toLowerCase()).filter(Boolean);
                if (listaBairros.some(b => localidadeInformada.toLowerCase().includes(b))) {
                    const { count } = await supabaseClient.from('agendamentos')
                        .select('*', { count: 'exact', head: true })
                        .eq('data_agendamento', dataInformada)
                        .eq('responsavel_agendamento', tec.nome);
                    if (count < 9) { rotaAutomatica = tec.nome; statusAutomatico = 'Em Rota'; }
                    else alert('Limite de 9 servicos atingido para ' + tec.nome + '. Ficara como Pendente.');
                    break;
                }
            }
        }

        const dados = {
            data_agendamento: dataInformada,
            localidade:   localidadeInformada,
            endereco:     document.getElementById('endereco').value,
            servico:      document.getElementById('servico').value,
            periodo:      document.getElementById('periodo').value,
            placa_veiculo: document.getElementById('placa').value,
            observacao:   document.getElementById('obs').value,
            associado:    document.getElementById('associado').value || 'Nao informado',
            fipe:         document.getElementById('fipe').value || '---',
            meio_atendimento: document.getElementById('meio-atendimento').value,
            uf:           document.getElementById('uf-regiao').value,
            responsavel_agendamento: rotaAutomatica,
            status: editandoId ? undefined : statusAutomatico
        };
        if (editandoId) { delete dados.responsavel_agendamento; delete dados.status; }

        const resultado = editandoId
            ? await supabaseClient.from('agendamentos').update(dados).eq('id', editandoId)
            : await supabaseClient.from('agendamentos').insert([dados]);

        if (resultado.error) {
            alert('Erro: ' + resultado.error.message);
        } else {
            alert(editandoId ? 'Agendamento atualizado!' : 'Agendamento realizado com sucesso!');
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
        btn.innerText = 'CONFIRMAR AGENDAMENTO';
        btn.classList.remove('bg-blue-600');
        btn.classList.add('bg-emerald-500');
    }
}

// ================================================================
// 3. TABELA DE AGENDAMENTOS
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
    lista.innerHTML = data.map(function(item) {
        const dataFormatada = item.data_agendamento.split('-').reverse().join('/');
        return '<tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">' +
            '<td class="p-5 text-sm">' +
                '<div class="font-bold text-slate-800">' + dataFormatada + '</div>' +
                '<div class="text-[10px] font-black text-emerald-600 uppercase mt-1">' + item.responsavel_agendamento + '</div>' +
                '<div class="mt-1"><span class="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200 uppercase">' + item.periodo + '</span></div>' +
            '</td>' +
            '<td class="p-5 text-sm text-slate-600">' +
                '<div class="font-black text-slate-800 uppercase text-[12px] mb-1">' + (item.associado || '---') + '</div>' +
                '<div class="text-[12px] text-slate-900 flex items-start gap-1 mb-2 leading-tight">' +
                    '<span class="text-emerald-600 font-bold">📍</span>' +
                    '<span>' + item.endereco + ' | <span class="font-black text-emerald-700">' + item.localidade + '</span></span>' +
                '</div>' +
                '<div class="flex gap-2 items-center flex-wrap">' +
                    '<div class="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">' + (item.uf || 'RJ') + '</div>' +
                    '<div class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase">' + (item.meio_atendimento || 'Moto') + '</div>' +
                    '<div class="inline-block bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px] font-bold text-slate-600">🚘 FIPE: ' + (item.fipe || '---') + '</div>' +
                    '<div class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-widest border border-black shadow-sm">' + (item.placa_veiculo || '---') + '</div>' +
                '</div>' +
            '</td>' +
            '<td class="p-5 text-sm"><div class="font-bold text-emerald-600 uppercase italic">' + item.servico + '</div></td>' +
            '<td class="p-5 text-sm text-slate-600 font-medium">' + item.responsavel_agendamento + '</td>' +
            '<td class="p-5 text-center">' +
                '<div class="flex flex-col gap-2 items-center">' +
                    '<span class="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase border border-amber-200">' + item.status + '</span>' +
                    '<div class="flex gap-2">' +
                        '<button onclick="verDetalhes(\'' + item.id + '\')" class="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all border border-transparent hover:border-emerald-200" title="Ver">👁️</button>' +
                        '<button onclick="prepararEdicao(\'' + item.id + '\')" class="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all border border-transparent hover:border-blue-200" title="Editar">✏️</button>' +
                        '<button onclick="excluirAgendamento(\'' + item.id + '\')" class="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all border border-transparent hover:border-red-200" title="Excluir">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');
    if (typeof filtrarAgendamentosPlaca === 'function') filtrarAgendamentosPlaca();
}

// ================================================================
// 4. DETALHES, EDIÇÃO E EXCLUSÃO
// ================================================================
window.verDetalhes = async function(id) {
    const { data } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (!data) return;
    Swal.fire({
        title: '<span class="text-emerald-600 font-black uppercase text-lg italic">Informações Técnicas</span>',
        html: '<div class="text-left space-y-3">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-100">' +
                '<p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veiculo</p>' +
                '<p class="text-sm font-bold text-slate-800">' + data.associado + '</p>' +
                '<p class="text-xs text-slate-600">' + data.fipe + ' | <b>' + data.placa_veiculo + '</b></p>' +
            '</div>' +
            '<div class="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">' +
                '<p class="text-[10px] font-black text-emerald-600 uppercase">Observações</p>' +
                '<p class="text-sm text-slate-700 mt-1 whitespace-pre-line">' + (data.observacao || 'Nenhuma observação.') + '</p>' +
            '</div>' +
        '</div>',
        confirmButtonText: 'ENTENDIDO',
        confirmButtonColor: '#10b981'
    });
};

window.excluirAgendamento = async function(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
        if (error) alert('Erro ao excluir');
        else carregarAgendamentos();
    }
};

window.prepararEdicao = async function(id) {
    const { data } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (!data) return;
    editandoId = id;
    document.getElementById('associado').value  = data.associado;
    document.getElementById('fipe').value       = data.fipe;
    document.getElementById('data').value       = data.data_agendamento;
    document.getElementById('localidade').value = data.localidade;
    document.getElementById('endereco').value   = data.endereco;
    document.getElementById('servico').value    = data.servico;
    document.getElementById('periodo').value    = data.periodo;
    document.getElementById('placa').value      = data.placa_veiculo;
    document.getElementById('obs').value        = data.observacao;
    document.getElementById('responsavel-agendamento').value = data.responsavel_agendamento;
    if (data.meio_atendimento) document.getElementById('meio-atendimento').value = data.meio_atendimento;
    if (data.uf) document.getElementById('uf-regiao').value = data.uf;
    const btn = document.getElementById('btn-submit');
    if (btn) { btn.innerText = 'ATUALIZAR AGENDAMENTO'; btn.classList.remove('bg-emerald-500'); btn.classList.add('bg-blue-600'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ================================================================
// 5. HELPERS — campos salvos por data no Supabase
// ================================================================
function lerCampoPorData(raw, dataFiltro) {
    if (!raw) return '';
    try {
        const obj = JSON.parse(raw);
        if (typeof obj === 'object' && obj !== null)
            return dataFiltro ? (obj[dataFiltro] || '') : '';
    } catch (e) { return raw; }
    return raw;
}

function lerBairrosParaData(tecBD, dataFiltro) { return lerCampoPorData(tecBD.regioes_atendidas || '', dataFiltro); }
function lerTecnicoDia(tecBD, dataFiltro)       { return lerCampoPorData(tecBD.tecnico_dia       || '', dataFiltro); }
function lerWhatsapp(tecBD, dataFiltro)         { return lerCampoPorData(tecBD.whatsapp          || '', dataFiltro); }

async function salvarCampoPorData(nomeRota, campoDb, dataFiltro, valor) {
    const { data: tecnico } = await supabaseClient.from('técnicos').select(campoDb).eq('nome', nomeRota).single();
    const raw = tecnico ? tecnico[campoDb] || '' : '';
    let obj = {};
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) obj = parsed;
    } catch (e) { if (raw && dataFiltro) obj[dataFiltro] = raw; }
    if (dataFiltro) obj[dataFiltro] = valor;
    const update = {};
    update[campoDb] = JSON.stringify(obj);
    await supabaseClient.from('técnicos').update(update).eq('nome', nomeRota);
}

window.salvarBairrosPorData = function(rota, data, val) { return salvarCampoPorData(rota, 'regioes_atendidas', data, val); };
window.salvarTecnicoDia     = function(rota, data, val) { return salvarCampoPorData(rota, 'tecnico_dia',       data, val); };
window.salvarWhatsapp       = function(rota, data, val) { return salvarCampoPorData(rota, 'whatsapp',          data, val); };

// ================================================================
// 6. ROTEIRIZAÇÃO
// ================================================================
window.exibirDadosCompletosRoteirizacao = function(dados) {
    Swal.fire({
        title: '<span class="text-emerald-600 font-black uppercase text-lg italic">Dados do Servico</span>',
        html: '<div class="text-left space-y-3">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-100">' +
                '<p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veiculo</p>' +
                '<p class="text-sm font-bold text-slate-800">' + dados.associado + '</p>' +
                '<p class="text-xs text-slate-600">' + dados.fipe + ' | PLACA: <b>' + dados.placa_veiculo + '</b></p>' +
            '</div>' +
            '<div class="p-3 bg-white border border-slate-200 rounded-lg">' +
                '<p class="text-[10px] font-black text-emerald-600 uppercase">Endereço</p>' +
                '<p class="text-xs font-bold text-slate-800">' + dados.endereco + '</p>' +
                '<p class="text-[11px] text-slate-600">' + dados.localidade + ' - ' + (dados.uf || 'RJ') + '</p>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2">' +
                '<div class="p-2 bg-slate-100 rounded border border-slate-200">' +
                    '<p class="text-[9px] font-black text-slate-400 uppercase">Servico</p>' +
                    '<p class="text-xs font-bold text-emerald-700">' + dados.servico + '</p>' +
                '</div>' +
                '<div class="p-2 bg-slate-100 rounded border border-slate-200">' +
                    '<p class="text-[9px] font-black text-slate-400 uppercase">Periodo</p>' +
                    '<p class="text-xs font-bold text-slate-700">' + dados.periodo + '</p>' +
                '</div>' +
            '</div>' +
            '<div class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">' +
                '<p class="text-[10px] font-black text-amber-600 uppercase">Obs</p>' +
                '<p class="text-xs text-slate-700 mt-1 whitespace-pre-line">' + (dados.observacao || 'Sem observacoes.') + '</p>' +
            '</div>' +
        '</div>',
        confirmButtonText: 'FECHAR',
        confirmButtonColor: '#10b981'
    });
};

window.abrirDetalhesCard = function(el) {
    try {
        var dados = JSON.parse(decodeURIComponent(el.getAttribute('data-dados')));
        window.exibirDadosCompletosRoteirizacao(dados);
    } catch(e) {}
};

async function carregarRoteirizacao() {
    var dataFiltro = document.getElementById('filtro-data-rota')?.value || '';

    const { data: técnicosRaw } = await supabaseClient.from('técnicos').select('*');
    const técnicos = (técnicosRaw || []).sort(function(a, b) {
        var numA = parseInt(a.nome.replace(/\D/g, ''), 10) || 0;
        var numB = parseInt(b.nome.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
    });

    var queryAgend = supabaseClient.from('agendamentos').select('*');
    if (dataFiltro) queryAgend = queryAgend.eq('data_agendamento', dataFiltro);
    const { data: agendamentos } = await queryAgend;

    const containerMotos = document.getElementById('motos-container');
    const listaPendentes  = document.getElementById('pendentes-lista');
    if (!containerMotos || !listaPendentes) return;

    containerMotos.innerHTML = '';
    listaPendentes.innerHTML = '';

    var pendentes = (agendamentos || []).filter(function(a) { return a && a.status === 'Pendente'; });
    const countEl = document.getElementById('count-pendentes');
    if (countEl) countEl.innerText = pendentes.length;

    pendentes.forEach(function(item) {
        var card = document.createElement('div');
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-bairro', item.localidade);
        card.setAttribute('data-placa', item.placa_veiculo || '');
        card.setAttribute('data-responsavel', item.responsavel_agendamento || '');
        card.className = 'card-servico bg-white rounded-xl shadow-sm border-l-4 border-slate-400 cursor-grab';
        card.innerHTML =
            '<p class="font-black text-[11px] uppercase">' + item.associado + '</p>' +
            '<p class="text-[10px] text-emerald-600 mb-2">' + item.localidade + '</p>' +
            '<button onclick="event.stopPropagation(); transferirServico(\'' + item.id + '\')" ' +
                'class="bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 transition-all">' +
                'MOVER' +
            '</button>';
        card.ondblclick = function() { window.exibirDadosCompletosRoteirizacao(item); };
        listaPendentes.appendChild(card);
    });

    new Sortable(listaPendentes, {
        group: 'shared',
        animation: 150,
        onAdd: async function(evt) {
            var card = evt.item;
            var responsavelOriginal = card.getAttribute('data-responsavel') || 'Caio Pinheiro';
            await supabaseClient.from('agendamentos').update({
                status: 'Pendente',
                responsavel_agendamento: responsavelOriginal
            }).eq('id', card.getAttribute('data-id'));
            if (countEl) countEl.innerText = listaPendentes.querySelectorAll('[data-id]').length;
            var termo = document.getElementById('busca-técnico')?.value || '';
            if (termo) filtrarColunastécnicos();
        }
    });

    (técnicos || []).forEach(function(tecBD) {
        var nomeDaRota     = tecBD.nome;
        var servicosNaRota = (agendamentos || []).filter(function(a) { return a && a.responsavel_agendamento === nomeDaRota; });
        var corBorda       = servicosNaRota.length >= 9 ? 'border-red-500' : 'border-emerald-400';

        var bairrosParaData    = lerBairrosParaData(tecBD, dataFiltro);
        var tecnicoDiaParaData = lerTecnicoDia(tecBD, dataFiltro);
        var whatsappParaData   = lerWhatsapp(tecBD, dataFiltro);

        var col = document.createElement('div');
        col.className = 'coluna-técnico bg-white p-5 rounded-2xl shadow-sm border-t-8 ' + corBorda + ' min-h-[400px] flex flex-col relative';
        col.setAttribute('data-nome', nomeDaRota);

        var cardsHTML = servicosNaRota.map(function(s) {
            var dadosEncoded = encodeURIComponent(JSON.stringify(s));
            var bordaCard = s.status === 'Frustrado' ? 'border-red-500 bg-red-50' : 'border-emerald-500';
            return '<div class="card-servico bg-white rounded shadow-sm border-l-4 ' + bordaCard + ' cursor-grab"' +
                ' data-id="' + s.id + '"' +
                ' data-bairro="' + s.localidade + '"' +
                ' data-placa="' + (s.placa_veiculo || '') + '"' +
                ' data-responsavel="' + (s.responsavel_agendamento || '') + '"' +
                ' data-dados="' + dadosEncoded + '"' +
                ' onclick="window.abrirDetalhesCard(this)">' +
                '<span class="font-bold text-[10px] uppercase">' + s.associado + '</span><br>' +
                '<span class="font-normal text-[10px] text-slate-400">' + s.localidade + '</span><br>' +
                '<button onclick="event.stopPropagation(); marcarFrustrado(\'' + s.id + '\')"' +
                    ' class="mt-1 mr-1 bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-black px-2 py-1 rounded-lg border border-red-200 transition-all leading-none">NAO FEITO</button>' +
                '<button onclick="event.stopPropagation(); transferirServico(\'' + s.id + '\')"' +
                    ' class="mt-1 bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 transition-all leading-none">MOVER</button>' +
            '</div>';
        }).join('');

        col.innerHTML =
            '<button onclick="excluirTecnico(\'' + tecBD.id + '\', \'' + nomeDaRota + '\')" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 text-xs">✖</button>' +
            '<div class="mb-4 border-b pb-2">' +
                '<div class="flex justify-between items-center">' +
                    '<h4 class="font-black text-[12px] uppercase text-slate-800">' + nomeDaRota + '</h4>' +
                    '<span class="contador-rota text-[10px] font-bold ' + (servicosNaRota.length >= 9 ? 'text-red-500' : 'text-emerald-500') + '">' + servicosNaRota.length + '/9</span>' +
                '</div>' +
                '<div class="mt-2 space-y-1">' +
                    '<input type="text" placeholder="tecnico do dia" value="' + tecnicoDiaParaData + '"' +
                        ' onblur="salvarTecnicoDia(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', this.value)"' +
                        ' class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">' +
                    '<input type="text" placeholder="WhatsApp" value="' + whatsappParaData + '"' +
                        ' onblur="salvarWhatsapp(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', this.value)"' +
                        ' class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">' +
                    '<textarea placeholder="Bairros (Ex: Centro, Lapa)"' +
                        ' onblur="salvarBairrosPorData(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', this.value)"' +
                        ' class="textarea-bairros w-full text-[9px] p-1 border rounded bg-emerald-50 h-10 resize-none outline-none focus:border-emerald-500">' + bairrosParaData + '</textarea>' +
                '</div>' +
                '<button onclick="enviarRotaZap(\'' + nomeDaRota + '\', \'' + whatsappParaData + '\')" class="w-full mt-2 bg-emerald-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-600 transition-all shadow-sm">ENVIAR WHATSAPP (PDF)</button>' +
                renderizarBotaoExtra(nomeDaRota) +
            '</div>' +
            '<div id="moto-' + nomeDaRota.replace(/\s/g, '-') + '" class="space-y-2 min-h-[300px] flex-1 moto-dropzone rounded-xl bg-slate-50/50 p-2" data-rota="' + nomeDaRota + '">' +
                cardsHTML +
            '</div>';

        containerMotos.appendChild(col);

        new Sortable(document.getElementById('moto-' + nomeDaRota.replace(/\s/g, '-')), {
            group: 'shared',
            animation: 150,
            onAdd: async function(evt) {
                var card = evt.item;
                var agendamentoId     = card.getAttribute('data-id');
                var bairroAgendamento = card.getAttribute('data-bairro').trim().toLowerCase();
                var textareaBairros   = evt.to.closest('.coluna-técnico').querySelector('.textarea-bairros');
                var listaBairros      = (textareaBairros ? textareaBairros.value : '').replace(/\n/g, ',').split(',').map(function(b){ return b.trim().toLowerCase(); }).filter(Boolean);

                if (listaBairros.length > 0 && !listaBairros.some(function(b){ return b === bairroAgendamento || bairroAgendamento.includes(b); }))
                    alert('Atencao: "' + bairroAgendamento.toUpperCase() + '" nao esta na lista de ' + nomeDaRota + '!');

                var totalAtual = evt.to.querySelectorAll('[data-id]').length;
                if (totalAtual > 9) { alert('Limite de 9 servicos atingido!'); evt.from.appendChild(card); return; }

                await supabaseClient.from('agendamentos').update({ status: 'Em Rota', responsavel_agendamento: nomeDaRota }).eq('id', agendamentoId);
                card.setAttribute('data-responsavel', nomeDaRota);

                var contEl = evt.to.closest('.coluna-técnico').querySelector('.contador-rota');
                if (contEl) {
                    var novoTotal = evt.to.querySelectorAll('[data-id]').length;
                    contEl.innerText = novoTotal + '/9';
                    contEl.className = 'contador-rota text-[10px] font-bold ' + (novoTotal >= 9 ? 'text-red-500' : 'text-emerald-500');
                }
                if (countEl) countEl.innerText = listaPendentes.querySelectorAll('[data-id]').length;
                var termo = document.getElementById('busca-técnico')?.value || '';
                if (termo) filtrarColunastécnicos();
            }
        });
    });
}

// ================================================================
// 7. SUPORTE À ROTEIRIZAÇÃO
// ================================================================
window.adicionarNovaMoto = async function() {
    const { value: nomeMoto } = await Swal.fire({ title: 'Nome da Nova Moto / Tecnico', input: 'text', inputPlaceholder: 'Ex: Moto 05', showCancelButton: true, confirmButtonColor: '#10b981' });
    if (nomeMoto) {
        const { error } = await supabaseClient.from('técnicos').insert([{ nome: nomeMoto }]);
        if (error) alert('Erro: ' + error.message);
        else carregarRoteirizacao();
    }
};

window.excluirTecnico = async function(id, nome) {
    if (confirm('Excluir "' + nome + '"? Agendamentos voltarao para pendentes.')) {
        await supabaseClient.from('agendamentos').update({ status: 'Pendente', responsavel_agendamento: 'Caio Pinheiro' }).eq('responsavel_agendamento', nome);
        const { error } = await supabaseClient.from('técnicos').delete().eq('id', id);
        if (error) alert('Erro ao excluir');
        else carregarRoteirizacao();
    }
};

window.enviarRotaZap = async function(nomeTecnico, whatsapp) {
    const dataFiltro = document.getElementById('filtro-data-rota')?.value;
    const { data: agendamentos } = await supabaseClient.from('agendamentos').select('*').eq('responsavel_agendamento', nomeTecnico).eq('data_agendamento', dataFiltro);
    if (!agendamentos || agendamentos.length === 0) return alert('Nao ha agendamentos nesta rota.');
    var resumo = '*ROTA DO DIA - ' + nomeTecnico + '*\n*DATA: ' + dataFiltro.split('-').reverse().join('/') + '*\n\n';
    agendamentos.slice(0, 9).forEach(function(a, i) {
        resumo += '*' + (i+1) + '. ASSOCIADO:* ' + a.associado + '\n📍 *END:* ' + a.endereco + ' (' + a.localidade + ')\n🛠 *SERV:* ' + a.servico + '\n⏰ *PERIODO:* ' + a.periodo + '\n🚗 *PLACA:* ' + a.placa_veiculo + '\n';
        if (a.observacao && a.observacao.trim()) resumo += '📝 *OBS:* ' + a.observacao + '\n';
        resumo += '---\n';
    });
    window.open('https://wa.me/55' + whatsapp.replace(/\D/g, '') + '?text=' + encodeURIComponent(resumo), '_blank');
};

// ================================================================
// 8. TRANSFERIR SERVIÇO
// ================================================================
window.transferirServico = async function(agendamentoId) {
    const { data: ag } = await supabaseClient.from('agendamentos').select('*').eq('id', agendamentoId).single();
    if (!ag) return alert('Erro ao buscar dados.');
    const { data: tecnicos } = await supabaseClient.from('técnicos').select('nome').order('nome');
    var opcoesRotas = (tecnicos || []).map(function(t) {
        return '<option value="' + t.nome + '" ' + (t.nome === ag.responsavel_agendamento ? 'selected' : '') + '>' + t.nome + '</option>';
    }).join('');

    const { value: formValues, isConfirmed } = await Swal.fire({
        title: '<span class="text-slate-700 font-black text-base">Transferir Servico</span>',
        html: '<div class="text-left space-y-3 mt-2">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-200">' +
                '<p class="text-[10px] font-black text-slate-400 uppercase">Servico</p>' +
                '<p class="text-sm font-bold text-slate-800">' + ag.associado + '</p>' +
                '<p class="text-[11px] text-slate-500">' + ag.localidade + ' · ' + ag.servico + '</p>' +
            '</div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Data</label>' +
            '<input type="date" id="transf-data" value="' + ag.data_agendamento + '" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm outline-none"></div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Rota</label>' +
            '<select id="transf-rota" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none bg-white">' +
            '<option value="Pendente">Deixar como Pendente</option>' + opcoesRotas + '</select></div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Periodo</label>' +
            '<select id="transf-periodo" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none bg-white">' +
            '<option value="Manha" ' + (ag.periodo === 'Manha' ? 'selected' : '') + '>Manha</option>' +
            '<option value="Tarde" ' + (ag.periodo === 'Tarde' ? 'selected' : '') + '>Tarde</option>' +
            '<option value="Comercial" ' + (ag.periodo === 'Comercial' ? 'selected' : '') + '>Comercial</option>' +
            '<option value="Integral" ' + (ag.periodo === 'Integral' ? 'selected' : '') + '>Integral</option>' +
            '</select></div>' +
        '</div>',
        showCancelButton: true, confirmButtonText: 'TRANSFERIR', cancelButtonText: 'Cancelar', confirmButtonColor: '#10b981',
        focusConfirm: false,
        preConfirm: function() {
            var novaData = document.getElementById('transf-data').value;
            if (!novaData) { Swal.showValidationMessage('Informe a nova data.'); return false; }
            return { novaData: novaData, novaRota: document.getElementById('transf-rota').value, novoPeriodo: document.getElementById('transf-periodo').value };
        }
    });

    if (!isConfirmed || !formValues) return;
    var novaData = formValues.novaData, novaRota = formValues.novaRota, novoPeriodo = formValues.novoPeriodo;

    if (novaRota !== 'Pendente') {
        const { count } = await supabaseClient.from('agendamentos').select('*', { count: 'exact', head: true }).eq('data_agendamento', novaData).eq('responsavel_agendamento', novaRota);
        if (count >= 9) return Swal.fire({ icon: 'warning', title: 'Limite atingido', text: novaRota + ' ja tem 9 servicos nessa data.', confirmButtonColor: '#10b981' });
    }

    await supabaseClient.from('agendamentos').update({
        data_agendamento: novaData,
        responsavel_agendamento: novaRota === 'Pendente' ? ag.responsavel_agendamento : novaRota,
        status: novaRota === 'Pendente' ? 'Pendente' : 'Em Rota',
        periodo: novoPeriodo
    }).eq('id', agendamentoId);

    await Swal.fire({ icon: 'success', title: 'Transferido!', confirmButtonColor: '#10b981', timer: 1800, showConfirmButton: false });
    carregarRoteirizacao();
};

// ================================================================
// 9. SERVIÇOS FRUSTRADOS (NAO REALIZADOS)
// ================================================================
async function carregarFrustrados() {
    var filtroData  = document.getElementById('filtro-data-frustrado')?.value || '';
    var filtroPlaca = (document.getElementById('filtro-placa-frustrado')?.value || '').toLowerCase();

    var query = supabaseClient.from('agendamentos').select('*').eq('status', 'Frustrado').order('data_agendamento', { ascending: false });
    if (filtroData) query = query.eq('data_agendamento', filtroData);
    const { data, error } = await query;
    const lista = document.getElementById('lista-frustrados');
    if (!lista || error) return;

    var filtrados = filtroPlaca
        ? (data || []).filter(function(i) { return (i.placa_veiculo || '').toLowerCase().includes(filtroPlaca) || (i.associado || '').toLowerCase().includes(filtroPlaca); })
        : (data || []);

    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-slate-400 font-bold">Nenhum servico nao realizado encontrado.</td></tr>';
        return;
    }

    lista.innerHTML = filtrados.map(function(item) {
        var dataFormatada = item.data_agendamento.split('-').reverse().join('/');
        var motivo = item.motivo_frustrado || '';
        return '<tr class="border-b border-slate-100 hover:bg-red-50 transition-colors">' +
            '<td class="p-4 text-sm">' +
                '<div class="font-bold text-slate-800">' + dataFormatada + '</div>' +
                '<div class="text-[10px] font-black text-red-500 uppercase mt-1">' + item.responsavel_agendamento + '</div>' +
                '<span class="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200 uppercase">' + item.periodo + '</span>' +
            '</td>' +
            '<td class="p-4 text-sm">' +
                '<div class="font-black text-slate-800 uppercase text-[12px] mb-1">' + (item.associado || '---') + '</div>' +
                '<div class="text-[11px] text-slate-600">📍 ' + item.endereco + ' | <span class="font-black">' + item.localidade + '</span></div>' +
                '<div class="flex gap-2 mt-1 flex-wrap">' +
                    '<div class="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold">' + (item.uf || 'RJ') + '</div>' +
                    '<div class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-widest">' + (item.placa_veiculo || '---') + '</div>' +
                '</div>' +
            '</td>' +
            '<td class="p-4 text-sm"><div class="font-bold text-red-600 uppercase italic">' + item.servico + '</div></td>' +
            '<td class="p-4 text-sm max-w-xs">' +
                '<div class="text-[11px] text-slate-600 whitespace-pre-line bg-red-50 p-2 rounded border border-red-100 min-h-[36px]">' +
                    (motivo || '<span class="text-slate-400 italic">Sem motivo registrado</span>') +
                '</div>' +
            '</td>' +
            '<td class="p-4 text-center">' +
                '<div class="flex flex-col gap-2 items-center">' +
                    '<button onclick="editarMotivoFrustrado(\'' + item.id + '\', this)"' +
                        ' data-motivo="' + motivo.replace(/"/g, '&quot;') + '"' +
                        ' class="bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-200 transition-all">MOTIVO</button>' +
                    '<button onclick="reativarServico(\'' + item.id + '\')"' +
                        ' class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-200 transition-all">REATIVAR</button>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');
}

window.editarMotivoFrustrado = async function(id, btn) {
    var motivoAtual = btn.getAttribute('data-motivo') || '';
    const { value: motivo, isConfirmed } = await Swal.fire({
        title: '<span class="text-red-600 font-black text-base">Motivo do Nao Atendimento</span>',
        input: 'textarea', inputValue: motivoAtual,
        inputPlaceholder: 'Descreva o motivo...', inputAttributes: { rows: 4 },
        showCancelButton: true, confirmButtonText: 'SALVAR', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    await supabaseClient.from('agendamentos').update({ motivo_frustrado: motivo }).eq('id', id);
    carregarFrustrados();
};

window.reativarServico = async function(id) {
    if (!confirm('Reativar este servico? Ele voltara como Pendente.')) return;

    // Remove o responsavel_agendamento para garantir que sai da rota
    await supabaseClient.from('agendamentos').update({
        status: 'Pendente',
        motivo_frustrado: null,
        responsavel_agendamento: 'Caio Pinheiro'
    }).eq('id', id);

    // Remove o card da rota no DOM imediatamente
    var cardNaRota = document.querySelector('[data-id="' + id + '"]');
    if (cardNaRota) cardNaRota.remove();

    // Atualiza a aba de frustrados e recarrega a roteirização
    carregarFrustrados();
    carregarRoteirizacao();
};

window.marcarFrustrado = async function(id) {
    const { value: motivo, isConfirmed } = await Swal.fire({
        title: '<span class="text-red-600 font-black text-base">Marcar como Nao Realizado</span>',
        input: 'textarea', inputPlaceholder: 'Informe o motivo (ex: cliente ausente, endereco errado...)',
        inputAttributes: { rows: 3 }, showCancelButton: true,
        confirmButtonText: 'CONFIRMAR', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    await supabaseClient.from('agendamentos').update({ status: 'Frustrado', motivo_frustrado: motivo || '' }).eq('id', id);

    // Muda a borda do card para vermelho imediatamente, sem recarregar tudo
    var card = document.querySelector('[data-id="' + id + '"]');
    if (card) {
        card.classList.remove('border-emerald-500');
        card.classList.add('border-red-500', 'bg-red-50');
    }
};

// ================================================================
// 10. FILTROS
// ================================================================
window.filtrarAgendamentosPlaca = function() {
    var termo = (document.getElementById('busca-placa-agendamento')?.value || '').toLowerCase();
    document.querySelectorAll('#lista-agendamentos tr').forEach(function(linha) {
        var placa     = (linha.querySelector('.font-mono')?.innerText || '').toLowerCase();
        var associado = (linha.querySelector('.font-black')?.innerText || '').toLowerCase();
        linha.style.display = (placa.includes(termo) || associado.includes(termo) || termo === '') ? '' : 'none';
    });
};

window.filtrarColunastécnicos = function() {
    var termo = (document.getElementById('busca-técnico')?.value || '').toLowerCase();
    document.querySelectorAll('.coluna-técnico').forEach(function(col) {
        var nomeTecnico = col.getAttribute('data-nome').toLowerCase();
        var encontrou = false;
        col.querySelectorAll('.card-servico').forEach(function(card) {
            var placa     = (card.getAttribute('data-placa') || '').toLowerCase();
            var associado = card.innerText.toLowerCase();
            var visivel   = termo === '' || placa.includes(termo) || associado.includes(termo) || nomeTecnico.includes(termo);
            card.style.display = visivel ? 'block' : 'none';
            if (visivel && termo !== '') { encontrou = true; card.classList.add('ring-2', 'ring-amber-500'); }
            else card.classList.remove('ring-2', 'ring-amber-500');
        });
        col.style.display = (nomeTecnico.includes(termo) || encontrou || termo === '') ? 'block' : 'none';
    });
};

// ================================================================
// 11. SERVIÇO EXTRA
// ================================================================
function renderizarBotaoExtra(tecnicoNome) {
    return '<button onclick="adicionarServicoExtra(\'' + tecnicoNome + '\')" class="w-full mt-2 bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-amber-600 transition-all shadow-sm">+ ADICIONAR EXTRA</button>';
}

async function adicionarServicoExtra(tecnicoNome) {
    var dataFiltro = document.getElementById('filtro-data-rota')?.value || new Date().toISOString().split('T')[0];
    const { value: formValues } = await Swal.fire({
        title: 'SERVICO EXTRA: ' + tecnicoNome,
        html: '<div class="text-left">' +
            '<label class="text-[10px] font-bold">DATA</label><input id="swal-data" type="date" class="swal2-input !mt-1" value="' + dataFiltro + '">' +
            '<label class="text-[10px] font-bold">ASSOCIADO</label><input id="swal-associado" placeholder="Nome do cliente" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">LOCALIDADE</label><input id="swal-localidade" placeholder="Ex: Lapa" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">ENDERECO</label><input id="swal-endereco" placeholder="Rua, numero" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">PLACA</label><input id="swal-placa" placeholder="Placa do veiculo" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">SERVICO</label>' +
            '<select id="swal-servico" class="swal2-input !mt-1"><option value="Instalacao">Instalacao</option><option value="Manutencao">Manutencao</option><option value="Retirada">Retirada</option></select>' +
        '</div>',
        focusConfirm: false, showCancelButton: true, confirmButtonText: 'SALVAR EXTRA', confirmButtonColor: '#f59e0b',
        preConfirm: function() {
            return {
                data_agendamento: document.getElementById('swal-data').value,
                associado:  document.getElementById('swal-associado').value,
                localidade: document.getElementById('swal-localidade').value,
                endereco:   document.getElementById('swal-endereco').value,
                placa_veiculo: document.getElementById('swal-placa').value,
                servico:    document.getElementById('swal-servico').value,
                responsavel_agendamento: tecnicoNome,
                status: 'Em Rota', periodo: 'Integral', meio_atendimento: 'Moto', uf: 'RJ'
            };
        }
    });
    if (formValues) {
        const { error } = await supabaseClient.from('agendamentos').insert([formValues]);
        if (error) alert('Erro: ' + error.message);
        else carregarRoteirizacao();
    }
}
