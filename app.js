// ================================================================
// CONFIGURAÇÃO SUPABASE
// ================================================================
const _supabaseUrl = 'https://jrmztxlwvwwqllgueblw.supabase.co';
const _supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpybXp0eGx3dnd3cWxsZ3VlYmx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MjUyNTgsImV4cCI6MjA5MjMwMTI1OH0.hgI2QdCsnvbxTdGti94KqWT-SK1-77VSW3b5JBzvKnI';
const supabaseClient = supabase.createClient(_supabaseUrl, _supabaseKey);
let editandoId = null;

// ================================================================
// SESSÃO — empresa logada
// ================================================================
function getEmpresaId() {
    var id = sessionStorage.getItem('empresa_id');
    if (!id) { window.location.href = 'login.html'; return null; }
    return id;
}

// ================================================================
// MAPA DE BAIRROS POR ZONA - Sistema de sugestão de rota
// ================================================================
var MAPA_ZONAS = {
    "Zona Norte": {
        cor: "#3b82f6", emoji: "🔵",
        bairros: [
            // Tijuca e adjacentes
            "Tijuca","Vila Isabel","Maracanã","Grajaú","Andaraí","Alto da Boa Vista","Usina",
            // Méier e adjacentes
            "Méier","Engenho Novo","Riachuelo","Rocha","Sampaio","Lins de Vasconcelos","Todos os Santos","Cachambi","Encantado","Engenho de Dentro","Água Santa","Maria da Graça","Del Castilho","Inhaúma","Higienópolis","Abolição",
            // Madureira e adjacentes
            "Madureira","Cascadura","Vaz Lobo","Irajá","Vista Alegre","Vicente de Carvalho","Vila Kosmos","Campinho","Turiaçu","Rocha Miranda","Honório Gurgel","Oswaldo Cruz","Bento Ribeiro","Cavalcante","Engenheiro Leal","Piedade","Quintino Bocaiúva","Ramos","Cordovil","Penha","Penha Circular","Olaria","Brás de Pina","Parada de Lucas","Vigário Geral","Jardim América","Coelho Neto","Acari","Anchieta","Guadalupe","Parque Anchieta","Ricardo de Albuquerque","Costa Barros","Pavuna",
            // Bonsucesso e adjacentes
            "Bonsucesso","Ramos","Manguinhos","Benfica","Higienópolis","Jardim Carioca","Ilha do Governador",
            // Ilha do Governador (bairros internos)
            "Galeão","Cacuia","Bancários","Pitangueiras","Cocotá","Ribeira","Zumbi","Praia da Bandeira","Portuguesa","Jardim Guanabara","Jardim Carioca","Moneró","Tauá","Freguesia (Ilha)","Galeão","Jardim Guanabara","Zumbi",
            // São Cristóvão
            "São Cristóvão","Fundão","Caju","Benfica","Manguinhos",
            // Norte geral
            "Engenho da Rainha","Tomás Coelho","Complexo do Alemão","Jacaré","Bairro de Fátima","Jacarezinho"
        ]
    },
    "Zona Sul": {
        cor: "#ec4899", emoji: "🔴",
        bairros: [
            "Copacabana","Ipanema","Leblon","Botafogo","Flamengo","Catete","Glória","Urca","Leme","Lagoa",
            "Jardim Botânico","Gávea","São Conrado","Vidigal","Rocinha","Humaitá","Cosme Velho",
            "Laranjeiras","Catete","Flamengo","Aterro do Flamengo","Marina da Glória","Parque do Flamengo",
            "Alto Leblon","Alto Ipanema","Arpoador","Posto 6","Posto 9","Posto 10","Posto 11","Posto 12",
            "Jardim Botânico","Horto Florestal","Alto Gávea","Mirante da Floresta"
        ]
    },
    "Zona Oeste": {
        cor: "#f59e0b", emoji: "🟡",
        bairros: [
            // Barra e Recreio
            "Barra da Tijuca","Recreio dos Bandeirantes","Camorim","Vargem Grande","Vargem Pequena",
            "Joá","Grumari","Prainha","Barra de Guaratiba","Pedra de Guaratiba","Guaratiba",
            "Itanhangá","Barra Olímpica","Ilha Pura","Riocentro","Jacarepaguá",
            // Jacarepaguá
            "Taquara","Tanque","Pechincha","Freguesia","Anil","Gardênia Azul","Curicica",
            "Praça Seca","Vila Valqueire","Sulacap","Magalhães Bastos","Vila Militar",
            "Deodoro","Padre Miguel","Realengo","Bangu","Santíssimo","Senador Camará",
            // Campo Grande e Santa Cruz
            "Campo Grande","Inhoaíba","Cosmos","Paciência","Santa Cruz","Sepetiba",
            "Ilha de Guaratiba","Barra de Guaratiba","Pedra de Guaratiba","Guaratiba",
            // Bairros menores
            "Vila Kennedy","Vila Aliança","Vila Cosmos","Senador Vasconcelos","Inhoaíba",
            "Santíssimo","Cosmos","Paciência","Santa Cruz","Sepetiba",
            "Rio das Pedras","Muzema","Cidade de Deus","Triagem"
        ]
    },
    "Centro / Zona Central": {
        cor: "#8b5cf6", emoji: "🟣",
        bairros: [
            "Centro","Lapa","Santa Teresa","Estácio","Rio Comprido","Cidade Nova","Gamboa",
            "Saúde","Santo Cristo","Caju","Catumbi","Paquetá","Praça Mauá","Porto Maravilha",
            "Praça XV","Campo de Santana","Fátima","Praça da República","Cinelândia","Glória",
            "Méier","Rocha","Sampaio","Encantado","Todos os Santos","Engenho Novo","Riachuelo",
            "Praça da Bandeira","Mangue"
        ]
    },
    "Baixada Fluminense": {
        cor: "#10b981", emoji: "🟢",
        bairros: [
            // Nova Iguaçu
            "Nova Iguaçu","Mesquita","Comendador Soares","Austin","Cabuçu","Cacuia","Califórnia","Cerâmica",
            "Jardim Alvorada","Jardim Iguaçu","Jardim Nova Era","Kennedy","Luz","Moquetá","Palhada",
            "Posse","Rancho Novo","Rodilândia","Rose Garden","Santa Rita","Tinguá","Vilar dos Teles",
            // Duque de Caxias
            "Duque de Caxias","Campos Elíseos","Centenário","Doutor Laureano","Figueira","Gramacho",
            "Jardim Gramacho","Jardim Primavera","Merity","Parque Duque","Parque Paulista",
            "Periquitos","Saracuruna","Xerém","Imbariê","Taquara (Caxias)","Jardim Anhangá",
            // São João de Meriti
            "São João de Meriti","Jardim Metrópole","Coelho da Rocha","Jardim Sumaré",
            "Parque Analândia","Parque Novo Rio","Vilar dos Teles","São Mateus",
            // Nilópolis
            "Nilópolis","Frigorífico","Novo Horizonte","Olinda","Paiol","Manoel Reis",
            // Belford Roxo
            "Belford Roxo","Areia Branca","Heliópolis","Jardim Redentor","Piam","Santo Antônio da Prata",
            "São Bernardo","Shangri-lá","Vila Pauline","Werneck","Lote XV","Nova Aurora",
            // Queimados e outros
            "Queimados","Japeri","Seropédica","Itaguaí","Paracambi","Engenheiro Pedreira",
            "Jesuítas","Queimados","Jacutinga","São João","Santana",
            // Magé e entorno
            "Magé","Guapimirim","Suruí","Fragoso","Mauá","Bongaba","Santo Aleixo","Raiz da Serra",
            "Piabetá","Governador Portela",
            // Petrópolis e Serra
            "Petrópolis","Teresópolis","Miguel Pereira","Paty do Alferes","Vassouras","Paraíba do Sul",
            "Três Rios","Sapucaia","Areal","Comendador Levy Gasparian","Mendes","Engenheiro Paulo de Frontin",
            // Itatiaia / Sul Fluminense
            "Volta Redonda","Barra Mansa","Resende","Itatiaia","Porto Real","Pinheiral","Valença",
            "Rio Claro","Barra do Piraí","Piraí","Rio das Flores","Vassouras"
        ]
    },
    "Niterói / São Gonçalo": {
        cor: "#f97316", emoji: "🟠",
        bairros: [
            // Niterói bairros
            "Niterói","Icaraí","Ingá","Fonseca","Barreto","Cubango","Santa Rosa","São Francisco",
            "Jurujuba","Itaipu","Pendotiba","Rio do Ouro","Alcântara","Arsenal","Ponta d'Areia",
            "São Domingos","Charitas","Camboinhas","Maravista","Maria Paula","Região Oceânica",
            "Piratininga","Itacoatiara","Várzea das Moças","Cafubá","Engenho do Mato","Serra Grande",
            "Badu","Sapê","Maceió","Cantagalo (Niterói)","Muriqui (Niterói)",
            // São Gonçalo bairros
            "São Gonçalo","Alcântara","Arsenal","Barro Vermelho","Boa Vista","Boaçu","Colubandê",
            "Coelho","Covanca","Gradim","Ipiíba","Itaoca","Laranjal","Lindo Parque","Marambaia",
            "Monjolos","Mutuaguaçu","Mutundo","Neves","Pacheco","Patronato","Porto Novo",
            "Porto Velho","Rocha","Santa Catarina","Santa Izabel","Trindade","Tribobó","Venda da Cruz",
            "Vista Alegre (SG)","Zé Garoto",
            // Itaboraí e entorno
            "Itaboraí","Tanguá","Rio Bonito","Silva Jardim","Maricá","Saquarema",
            "Cachoeiras de Macacu","Casimiro de Abreu"
        ]
    },
    "Região dos Lagos": {
        cor: "#06b6d4", emoji: "🩵",
        bairros: [
            "Cabo Frio","Búzios","Armação dos Búzios","Arraial do Cabo","São Pedro da Aldeia",
            "Araruama","Iguaba Grande","Saquarema","Bacaxá","Sampaio Corrêa","Jaconé",
            "Casimiro de Abreu","Barra de São João","Rio das Ostras","Carapebus",
            "Macaé","Conceição de Macabu","Quissamã","Campos dos Goytacazes","São Fidélis",
            "São Francisco do Itabapoana","São João da Barra"
        ]
    },
    "Interior RJ / Norte Fluminense": {
        cor: "#84cc16", emoji: "🍏",
        bairros: [
            "Campos dos Goytacazes","São Fidélis","Itaperuna","Bom Jesus do Itabapoana",
            "Santo Antônio de Pádua","Miracema","Porciúncula","Cordeiro","Cantagalo",
            "Nova Friburgo","Bom Jardim","Duas Barras","Carmo","Além Paraíba",
            "Cambuci","Itaocara","Aperibé","São José de Ubá","Natividade","Varre-Sai",
            "Laje do Muriaé","Italva","Bom Jesus do Itabapoana","São Francisco de Itabapoana",
            "Cardoso Moreira","Trajano de Moraes","Nova Friburgo","Macuco","Santa Maria Madalena",
            "Sumidouro","São Sebastião do Alto","Bom Jardim","Cachoeiras de Macacu",
            "Rio Bonito","Silva Jardim","Araruama"
        ]
    }
};

// Detecta a zona de um bairro/localidade
function detectarZona(texto) {
    if (!texto) return null;
    var textoNorm = texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    var melhorMatch = null;
    var melhorScore = 0;
    for (var zona in MAPA_ZONAS) {
        var bairros = MAPA_ZONAS[zona].bairros;
        for (var i = 0; i < bairros.length; i++) {
            var bairroNorm = bairros[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
            if (textoNorm.includes(bairroNorm) || bairroNorm.includes(textoNorm)) {
                var score = bairroNorm.length;
                if (score > melhorScore) {
                    melhorScore = score;
                    melhorMatch = zona;
                }
            }
        }
    }
    return melhorMatch;
}

// Verifica conflito de zonas em uma rota (retorna aviso se tiver zonas muito distantes)
function verificarConflitosRota(agendamentos) {
    var zonaCount = {};
    agendamentos.forEach(function(a) {
        var local = (a.localidade || '') + ' ' + (a.endereco || '');
        var zona = detectarZona(local);
        if (zona) zonaCount[zona] = (zonaCount[zona] || 0) + 1;
    });
    var zonas = Object.keys(zonaCount);
    // Zonas que NÃO devem ser misturadas
    var gruposConflito = [
        ['Zona Norte', 'Baixada Fluminense', 'Niterói / São Gonçalo'],
        ['Zona Sul', 'Zona Oeste', 'Interior RJ'],
        ['Região dos Lagos', 'Baixada Fluminense']
    ];
    var conflitos = [];
    for (var i = 0; i < zonas.length; i++) {
        for (var j = i + 1; j < zonas.length; j++) {
            var z1 = zonas[i], z2 = zonas[j];
            for (var k = 0; k < gruposConflito.length; k++) {
                var g = gruposConflito[k];
                if (g.indexOf(z1) !== -1 && g.indexOf(z2) !== -1) {
                    // São conflitantes mas não são do mesmo grupo aceitável
                }
            }
            // Zonas que definitivamente conflitam
            var pares = [
                ['Ilha do Governador', 'Baixada Fluminense'],
                ['Zona Sul', 'Baixada Fluminense'],
                ['Zona Sul', 'Interior RJ'],
                ['Zona Sul', 'Niterói / São Gonçalo'],
                ['Zona Norte', 'Zona Oeste'],
                ['Zona Norte', 'Interior RJ'],
                ['Zona Norte', 'Região dos Lagos'],
                ['Baixada Fluminense', 'Região dos Lagos'],
                ['Interior RJ', 'Zona Sul'],
            ];
            for (var p = 0; p < pares.length; p++) {
                if ((pares[p][0] === z1 && pares[p][1] === z2) || (pares[p][1] === z1 && pares[p][0] === z2)) {
                    conflitos.push(z1 + ' + ' + z2);
                }
            }
        }
    }
    return { zonas: zonaCount, conflitos: conflitos };
}


// ================================================================
// 1. NAVEGAÇÃO
// ================================================================
window.showTab = function(tabName) {
    ['sec-agendamento','sec-roteirizacao','sec-frustrados'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    ['tab-agendamento','tab-roteirizacao','tab-frustrados'].forEach(function(id) {
        var btn = document.getElementById(id);
        if (btn) { btn.classList.remove('active-tab'); btn.classList.add('text-slate-400'); }
    });
    var sec = document.getElementById('sec-' + tabName);
    var btn = document.getElementById('tab-' + tabName);
    if (sec) sec.classList.remove('hidden');
    if (btn) { btn.classList.add('active-tab'); btn.classList.remove('text-slate-400'); }
    if (tabName === 'roteirizacao') carregarRoteirizacao();
    if (tabName === 'agendamento')  carregarAgendamentos();
    if (tabName === 'frustrados')   carregarFrustrados();
};

// ================================================================
// 2. AGENDAMENTO — SALVAR / ATUALIZAR
// ================================================================
var form = document.getElementById('form-agendamento');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var localidadeInformada = document.getElementById('localidade').value;
        var dataInformada       = document.getElementById('data').value;
        var meioSelecionado     = document.getElementById('meio-atendimento').value;
        var responsavelDigitado = document.getElementById('responsavel-agendamento').value || 'Caio Pinheiro';
        var rotaAutomatica      = responsavelDigitado;
        var statusAutomatico    = 'Pendente';

        // Só tenta despacho automático para Moto
        if (meioSelecionado === 'Moto') {
            var { data: configsRegioes } = await supabaseClient.from('técnicos')
                .select('nome, regioes_atendidas')
                .or('tipo_meio.is.null,tipo_meio.eq.Moto');
            if (configsRegioes) {
                for (var tec of configsRegioes) {
                    var bairrosTexto = lerCampoPorChave(tec.regioes_atendidas || '', chaveDataMeio(dataInformada, 'Moto'));
                    // fallback para formato legado
                    if (!bairrosTexto) bairrosTexto = lerCampoPorLegado(tec.regioes_atendidas || '');
                    var listaBairros = bairrosTexto.split(',').map(function(b){ return b.trim().toLowerCase(); }).filter(Boolean);
                    if (listaBairros.some(function(b){ return localidadeInformada.toLowerCase().includes(b); })) {
                        var { count } = await supabaseClient.from('agendamentos')
                            .select('*', { count: 'exact', head: true })
                            .eq('data_agendamento', dataInformada)
                            .eq('responsavel_agendamento', tec.nome);
                        if (count < 9) { rotaAutomatica = tec.nome; statusAutomatico = 'Em Rota'; }
                        else alert('Limite de 9 serviços atingido para ' + tec.nome + '. Ficará como Pendente.');
                        break;
                    }
                }
            }
        }

        var dados = {
            data_agendamento:        dataInformada,
            localidade:              localidadeInformada,
            endereco:                document.getElementById('endereco').value,
            servico:                 document.getElementById('servico').value,
            periodo:                 document.getElementById('periodo').value,
            placa_veiculo:           document.getElementById('placa').value,
            observacao:              document.getElementById('obs').value,
            associado:               document.getElementById('associado').value || 'Não informado',
            contato_associado:       document.getElementById('contato-associado').value || '',
            fipe:                    document.getElementById('fipe').value || '---',
            meio_atendimento:        meioSelecionado,
            uf:                      document.getElementById('uf-regiao').value,
            empresa_id:              getEmpresaId(),
            responsavel_agendamento: rotaAutomatica,
            status:                  editandoId ? undefined : statusAutomatico
        };
        if (editandoId) { delete dados.responsavel_agendamento; delete dados.status; }

        var resultado = editandoId
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
    var btn = document.getElementById('btn-submit');
    if (btn) { btn.innerText = 'CONFIRMAR AGENDAMENTO'; btn.classList.remove('bg-blue-600'); btn.classList.add('bg-emerald-500'); }
}

// ================================================================
// 3. TABELA DE AGENDAMENTOS
// ================================================================
async function carregarAgendamentos() {
    var filtroData   = document.getElementById('filtro-data-lista')?.value;
    var filtroMeio   = document.getElementById('filtro-meio-lista')?.value;
    var filtroStatus = document.getElementById('filtro-status-lista')?.value;

    var empresaId = getEmpresaId(); if (!empresaId) return;
    var query = supabaseClient.from('agendamentos').select('*').eq('empresa_id', empresaId).order('data_agendamento', { ascending: true });
    if (filtroData)   query = query.eq('data_agendamento', filtroData);
    if (filtroMeio)   query = query.eq('meio_atendimento', filtroMeio);
    if (filtroStatus) query = query.eq('status', filtroStatus);

    var { data, error } = await query;
    var lista = document.getElementById('lista-agendamentos');
    if (!lista || error) return;

    lista.innerHTML = (data || []).map(function(item) {
        var dataFormatada = item.data_agendamento.split('-').reverse().join('/');
        var statusClass = 'bg-amber-100 text-amber-700 border-amber-200';
        if (item.status === 'Em Rota')   statusClass = 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (item.status === 'Frustrado') statusClass = 'bg-red-100 text-red-700 border-red-200';

        return '<tr class="border-b border-slate-50 hover:bg-slate-50 transition-colors">' +
            '<td class="p-4 text-sm">' +
                '<div class="font-bold text-slate-800">' + dataFormatada + '</div>' +
                '<div class="text-[10px] font-black text-emerald-600 uppercase mt-1">' + item.responsavel_agendamento + '</div>' +
                '<span class="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200 uppercase">' + item.periodo + '</span>' +
            '</td>' +
            '<td class="p-4 text-sm text-slate-600">' +
                '<div class="font-black text-slate-800 uppercase text-[12px] mb-1">' + (item.associado || '---') + '</div>' +
                (item.contato_associado ? '<div class="text-[11px] text-blue-600 font-bold mb-1">📞 ' + item.contato_associado + '</div>' : '') +
                '<div class="text-[11px] text-slate-900 mb-1">📍 ' + item.endereco + ' | <span class="font-black text-emerald-700">' + item.localidade + '</span></div>' +
                '<div class="flex gap-1 flex-wrap">' +
                    '<span class="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold">' + (item.uf || 'RJ') + '</span>' +
                    '<span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold">' + (item.meio_atendimento || 'Moto') + '</span>' +
                    '<span class="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[9px] font-bold text-slate-600">FIPE: ' + (item.fipe || '---') + '</span>' +
                    '<span class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black tracking-widest">' + (item.placa_veiculo || '---') + '</span>' +
                '</div>' +
            '</td>' +
            '<td class="p-4 text-sm"><div class="font-bold text-emerald-600 uppercase italic">' + item.servico + '</div></td>' +
            '<td class="p-4 text-sm text-slate-600 font-medium">' + item.responsavel_agendamento + '</td>' +
            '<td class="p-4 text-center">' +
                '<div class="flex flex-col gap-2 items-center">' +
                    '<span class="px-3 py-1 rounded-full text-[10px] font-black uppercase border ' + statusClass + '">' + item.status + '</span>' +
                    '<div class="flex gap-1">' +
                        '<button onclick="verDetalhes(\'' + item.id + '\')" class="p-2 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-all" title="Ver">👁️</button>' +
                        '<button onclick="prepararEdicao(\'' + item.id + '\')" class="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-all" title="Editar">✏️</button>' +
                        '<button onclick="excluirAgendamento(\'' + item.id + '\')" class="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-all" title="Excluir">🗑️</button>' +
                    '</div>' +
                '</div>' +
            '</td>' +
        '</tr>';
    }).join('');

    filtrarAgendamentosPlaca();
}

// ================================================================
// 4. DETALHES, EDIÇÃO E EXCLUSÃO
// ================================================================
window.verDetalhes = async function(id) {
    var { data } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (!data) return;
    Swal.fire({
        title: '<span class="text-emerald-600 font-black uppercase text-lg">Informações Técnicas</span>',
        html: '<div class="text-left space-y-3">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-100">' +
                '<p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veículo</p>' +
                '<p class="text-sm font-bold text-slate-800">' + (data.associado || '---') + '</p>' +
                (data.contato_associado ? '<p class="text-xs text-blue-600 font-bold">📞 ' + data.contato_associado + '</p>' : '') +
                '<p class="text-xs text-slate-600">' + (data.fipe || '---') + ' | <b>' + (data.placa_veiculo || '---') + '</b></p>' +
            '</div>' +
            '<div class="flex gap-2">' +
                '<div class="p-2 bg-slate-100 rounded flex-1 border border-slate-200"><p class="text-[9px] font-black text-slate-400 uppercase">UF</p><p class="text-xs font-bold">' + (data.uf || '---') + '</p></div>' +
                '<div class="p-2 bg-slate-100 rounded flex-1 border border-slate-200"><p class="text-[9px] font-black text-slate-400 uppercase">Meio</p><p class="text-xs font-bold">' + (data.meio_atendimento || '---') + '</p></div>' +
            '</div>' +
            '<div class="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">' +
                '<div class="flex justify-between items-center mb-1">' +
                    '<p class="text-[10px] font-black text-emerald-600 uppercase">Observações</p>' +
                    '<button onclick="editarObservacao(\'' + id + '\')" class="bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black px-2 py-1 rounded-lg transition-all">✏️ EDITAR</button>' +
                '</div>' +
                '<p id="obs-modal-' + id + '" class="text-sm text-slate-700 mt-1 whitespace-pre-line">' + (data.observacao || 'Nenhuma observação.') + '</p>' +
            '</div>' +
        '</div>',
        confirmButtonText: 'FECHAR',
        confirmButtonColor: '#10b981'
    });
};

window.editarObservacao = async function(id) {
    try {
        var { data, error } = await supabaseClient.from('agendamentos').select('observacao').eq('id', id).single();
        if (error) throw error;
        var obsAtual = (data && data.observacao) ? String(data.observacao) : '';
        var resultado = await Swal.fire({
            title: '<span style="color:#10b981;font-weight:900;">✏️ Editar Observação</span>',
            html: '<textarea id="swal-obs-input" rows="5" placeholder="Digite as observações..." ' +
                  'style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:10px;font-size:14px;resize:vertical;outline:none;" ' +
                  '>' + obsAtual.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</textarea>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '💾 SALVAR',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#94a3b8',
            didOpen: function() {
                var ta = document.getElementById('swal-obs-input');
                if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
            },
            preConfirm: function() {
                var ta = document.getElementById('swal-obs-input');
                return ta ? ta.value : '';
            }
        });
        if (!resultado.isConfirmed) return;
        var novaObs = resultado.value || '';
        var { error: errUpdate } = await supabaseClient.from('agendamentos').update({ observacao: novaObs }).eq('id', id);
        if (errUpdate) throw errUpdate;
        // Atualiza na tela sem recarregar tudo
        var el = document.getElementById('obs-modal-' + id);
        if (el) el.innerText = novaObs || 'Nenhuma observação.';
        // Atualiza card na roteirização se existir
        var cardObs = document.querySelector('[data-id="' + id + '"] .card-obs-text');
        if (cardObs) cardObs.innerText = novaObs;
        await Swal.fire({ icon: 'success', title: 'Salvo!', timer: 1200, showConfirmButton: false });
        carregarAgendamentos();
    } catch(e) {
        console.error('Erro editarObservacao:', e);
        Swal.fire({ icon: 'error', title: 'Erro ao salvar', text: String(e.message || e) });
    }
};

window.excluirAgendamento = async function(id) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
        var { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
        if (error) alert('Erro ao excluir'); else carregarAgendamentos();
    }
};

window.prepararEdicao = async function(id) {
    var { data } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
    if (!data) return;
    editandoId = id;
    document.getElementById('associado').value  = data.associado || '';
    document.getElementById('contato-associado').value = data.contato_associado || '';
    document.getElementById('fipe').value       = data.fipe || '';
    document.getElementById('data').value       = data.data_agendamento;
    document.getElementById('localidade').value = data.localidade;
    document.getElementById('endereco').value   = data.endereco;
    document.getElementById('servico').value    = data.servico;
    document.getElementById('periodo').value    = data.periodo;
    document.getElementById('placa').value      = data.placa_veiculo || '';
    document.getElementById('obs').value        = data.observacao || '';
    document.getElementById('responsavel-agendamento').value = data.responsavel_agendamento;
    if (data.meio_atendimento) document.getElementById('meio-atendimento').value = data.meio_atendimento;
    if (data.uf) document.getElementById('uf-regiao').value = data.uf;
    var btn = document.getElementById('btn-submit');
    if (btn) { btn.innerText = 'ATUALIZAR AGENDAMENTO'; btn.classList.remove('bg-emerald-500'); btn.classList.add('bg-blue-600'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ================================================================
// 5. HELPERS — campos salvos por chave "data|meio"
// ================================================================
function chaveDataMeio(dataFiltro, meioFiltro) {
    return (dataFiltro || 'geral') + '|' + (meioFiltro || 'Moto');
}

// Lê campo pelo novo formato JSON chave "data|meio"
function lerCampoPorChave(raw, chave) {
    if (!raw) return '';
    try {
        var obj = JSON.parse(raw);
        if (typeof obj === 'object' && obj !== null) return obj[chave] || '';
    } catch (e) {}
    return '';
}

// Lê campo no formato legado (string simples ou JSON por data apenas)
function lerCampoPorLegado(raw) {
    if (!raw) return '';
    try {
        var obj = JSON.parse(raw);
        // Se for objeto, retorna vazio (formato novo — não é legado)
        if (typeof obj === 'object') return '';
    } catch (e) {
        return raw; // string simples = legado
    }
    return '';
}

function lerBairrosParaData(tecBD, df, mf) {
    var chave = chaveDataMeio(df, mf);
    return lerCampoPorChave(tecBD.regioes_atendidas || '', chave) ||
           lerCampoPorLegado(tecBD.regioes_atendidas || '');
}
function lerTecnicoDia(tecBD, df, mf) {
    var chave = chaveDataMeio(df, mf);
    return lerCampoPorChave(tecBD.tecnico_dia || '', chave) ||
           lerCampoPorLegado(tecBD.tecnico_dia || '');
}
function lerWhatsapp(tecBD, df, mf) {
    var chave = chaveDataMeio(df, mf);
    return lerCampoPorChave(tecBD.whatsapp || '', chave) ||
           lerCampoPorLegado(tecBD.whatsapp || '');
}

async function salvarCampoPorChave(nomeRota, campoDb, chave, valor) {
    var { data: tec } = await supabaseClient.from('técnicos').select(campoDb).eq('nome', nomeRota).single();
    var raw = tec ? (tec[campoDb] || '') : '';
    var obj = {};
    try {
        var p = JSON.parse(raw);
        if (typeof p === 'object' && p !== null) obj = p;
    } catch (e) {
        // Era string legada — migra para o novo formato
        if (raw) obj['legado'] = raw;
    }
    obj[chave] = valor;
    var upd = {}; upd[campoDb] = JSON.stringify(obj);
    await supabaseClient.from('técnicos').update(upd).eq('nome', nomeRota);
}

window.salvarBairrosPorData = function(r, d, m, v) { return salvarCampoPorChave(r, 'regioes_atendidas', chaveDataMeio(d,m), v); };
window.salvarTecnicoDia     = function(r, d, m, v) { return salvarCampoPorChave(r, 'tecnico_dia',       chaveDataMeio(d,m), v); };
window.salvarWhatsapp       = function(r, d, m, v) { return salvarCampoPorChave(r, 'whatsapp',          chaveDataMeio(d,m), v); };

// ================================================================
// 6. ROTEIRIZAÇÃO
// ================================================================
window.exibirDadosCompletosRoteirizacao = function(dados) {
    Swal.fire({
        title: '<span class="text-emerald-600 font-black uppercase text-base">Dados do Serviço</span>',
        html: '<div class="text-left space-y-3">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-100">' +
                '<p class="text-[10px] font-black text-slate-400 uppercase">Associado / Veículo</p>' +
                '<p class="text-sm font-bold text-slate-800">' + (dados.associado || '---') + '</p>' +
                (dados.contato_associado ? '<p class="text-xs text-blue-600 font-bold">📞 ' + dados.contato_associado + '</p>' : '') +
                '<p class="text-xs text-slate-600">' + (dados.fipe || '---') + ' | PLACA: <b>' + (dados.placa_veiculo || '---') + '</b></p>' +
            '</div>' +
            '<div class="p-3 bg-white border border-slate-200 rounded-lg">' +
                '<p class="text-[10px] font-black text-emerald-600 uppercase">Endereço</p>' +
                '<p class="text-xs font-bold text-slate-800">' + (dados.endereco || '---') + '</p>' +
                '<p class="text-[11px] text-slate-600">' + (dados.localidade || '') + ' - ' + (dados.uf || 'RJ') + '</p>' +
            '</div>' +
            '<div class="grid grid-cols-2 gap-2">' +
                '<div class="p-2 bg-slate-100 rounded border border-slate-200"><p class="text-[9px] font-black text-slate-400 uppercase">Serviço</p><p class="text-xs font-bold text-emerald-700">' + (dados.servico || '---') + '</p></div>' +
                '<div class="p-2 bg-slate-100 rounded border border-slate-200"><p class="text-[9px] font-black text-slate-400 uppercase">Período</p><p class="text-xs font-bold text-slate-700">' + (dados.periodo || '---') + '</p></div>' +
            '</div>' +
            '<div class="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">' +
                '<div class="flex justify-between items-center mb-1">' +
                    '<p class="text-[10px] font-black text-amber-600 uppercase">Observações</p>' +
                    '<button onclick="editarObservacao(\'' + dados.id + '\')" class="bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-black px-2 py-1 rounded-lg transition-all">✏️ EDITAR</button>' +
                '</div>' +
                '<p id="obs-modal-' + dados.id + '" class="text-xs text-slate-700 mt-1 whitespace-pre-line">' + (dados.observacao || 'Sem observações.') + '</p>' +
            '</div>' +
        '</div>',
        confirmButtonText: 'FECHAR',
        confirmButtonColor: '#10b981'
    });
};

window.abrirDetalhesCard = function(el) {
    try { var d = JSON.parse(decodeURIComponent(el.getAttribute('data-dados'))); window.exibirDadosCompletosRoteirizacao(d); } catch(e) {}
};

async function carregarRoteirizacao() {
    var dataFiltro = document.getElementById('filtro-data-rota')?.value || '';
    var meioFiltro = document.getElementById('filtro-meio-rota')?.value || 'Moto';

    // ================================================================
    // BUSCA TÉCNICOS FILTRADOS PELO MEIO SELECIONADO
    // Moto        → tipo_meio IS NULL ou 'Moto'
    // Externo     → tipo_meio = 'Externo'  (garante Externo 01-05)
    // Posto Fixo  → tipo_meio = 'Posto Fixo'
    // ================================================================
    var empresaId = getEmpresaId(); if (!empresaId) return;
    var { data: todosOsTecnicos } = await supabaseClient.from('técnicos').select('*').eq('empresa_id', empresaId);
    todosOsTecnicos = todosOsTecnicos || [];

    var técnicos;
    if (meioFiltro === 'Externo') {
        // Garante que Externo 01-05 existam no banco
        var nomesExterno = ['Externo 01','Externo 02','Externo 03','Externo 04','Externo 05'];
        var existentes   = todosOsTecnicos.map(function(t){ return t.nome; });
        for (var i = 0; i < nomesExterno.length; i++) {
            if (!existentes.includes(nomesExterno[i])) {
                await supabaseClient.from('técnicos').insert([{ nome: nomesExterno[i], tipo_meio: 'Externo', empresa_id: empresaId }]);
            }
        }
        // Rebusca após criação
        var { data: rebusca } = await supabaseClient.from('técnicos').select('*').eq('empresa_id', empresaId);
        todosOsTecnicos = rebusca || [];
        técnicos = todosOsTecnicos
            .filter(function(t){ return t.tipo_meio === 'Externo'; })
            .sort(function(a,b){ return a.nome.localeCompare(b.nome); });

    } else if (meioFiltro === 'Posto Fixo') {
        técnicos = todosOsTecnicos
            .filter(function(t){ return t.tipo_meio === 'Posto Fixo'; })
            .sort(function(a,b){ return a.nome.localeCompare(b.nome); });

    } else {
        // Moto: tipo_meio null ou 'Moto'
        técnicos = todosOsTecnicos
            .filter(function(t){ return !t.tipo_meio || t.tipo_meio === 'Moto'; })
            .sort(function(a,b){
                return (parseInt(a.nome.replace(/\D/g,''),10)||0) - (parseInt(b.nome.replace(/\D/g,''),10)||0);
            });
    }

    // Busca agendamentos filtrados pelo meio selecionado
    var queryAgend = supabaseClient.from('agendamentos').select('*').eq('empresa_id', empresaId);
    if (dataFiltro) queryAgend = queryAgend.eq('data_agendamento', dataFiltro);
    queryAgend = queryAgend.eq('meio_atendimento', meioFiltro);
    var { data: agendamentos } = await queryAgend;
    agendamentos = agendamentos || [];

    var containerMotos = document.getElementById('motos-container');
    var listaPendentes  = document.getElementById('pendentes-lista');
    if (!containerMotos || !listaPendentes) return;
    containerMotos.innerHTML = '';
    listaPendentes.innerHTML = '';

    var pendentes = agendamentos.filter(function(a){ return a && a.status === 'Pendente'; });
    var countEl   = document.getElementById('count-pendentes');
    if (countEl) countEl.innerText = pendentes.length;

    // ── Cards de pendentes ──
    pendentes.forEach(function(item) {
        var card = document.createElement('div');
        card.setAttribute('data-id', item.id);
        card.setAttribute('data-bairro', item.localidade);
        card.setAttribute('data-placa', item.placa_veiculo || '');
        card.setAttribute('data-responsavel', item.responsavel_agendamento || '');
        card.className = 'card-servico bg-white rounded-xl shadow-sm border-l-4 border-slate-400 cursor-grab';
        var _zona = detectarZona((item.localidade || '') + ' ' + (item.endereco || ''));
        var _zonaInfo = _zona ? MAPA_ZONAS[_zona] : null;
        card.setAttribute('data-zona', _zona || '');
        var _badgeZona = _zonaInfo
            ? '<span style="background:' + _zonaInfo.cor + '20;color:' + _zonaInfo.cor + ';border:1px solid ' + _zonaInfo.cor + ';font-size:8px;font-weight:900;padding:1px 5px;border-radius:20px;display:inline-block;margin-bottom:3px;">' + _zonaInfo.emoji + ' ' + _zona + '</span>'
            : '';
        card.innerHTML =
            _badgeZona +
            '<p class="font-black text-[11px] uppercase">' + item.associado + '</p>' +
            '<p class="text-[10px] text-emerald-600 mb-2">' + item.localidade + '</p>' +
            '<button onclick="event.stopPropagation(); transferirServico(\'' + item.id + '\')" ' +
                'class="bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 transition-all">MOVER</button>';
        card.ondblclick = function(){ window.exibirDadosCompletosRoteirizacao(item); };
        listaPendentes.appendChild(card);
    });

    // Sortable pendentes — NÃO recarrega ao soltar, só atualiza banco
    new Sortable(listaPendentes, {
        group: 'shared', animation: 150,
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

    // ── Colunas dos técnicos ──
    técnicos.forEach(function(tecBD) {
        var nomeDaRota     = tecBD.nome;
        var servicosNaRota = agendamentos.filter(function(a){ return a && a.responsavel_agendamento === nomeDaRota; });
        var corBorda       = servicosNaRota.length >= 9 ? 'border-red-500' : 'border-emerald-400';

        // Lê campos com a chave data+meio correta
        var bairrosParaData    = lerBairrosParaData(tecBD, dataFiltro, meioFiltro);
        var tecnicoDiaParaData = lerTecnicoDia(tecBD, dataFiltro, meioFiltro);
        var whatsappParaData   = lerWhatsapp(tecBD, dataFiltro, meioFiltro);

        var cardsHTML = servicosNaRota.map(function(s) {
            var enc       = encodeURIComponent(JSON.stringify(s));
            var bordaCard = s.status === 'Frustrado' ? 'border-red-500 bg-red-50' : 'border-emerald-500';
            var _zonaCard = detectarZona((s.localidade || '') + ' ' + (s.endereco || ''));
        var _zonaCardInfo = _zonaCard ? MAPA_ZONAS[_zonaCard] : null;
        var _badgeZonaCard = _zonaCardInfo
            ? '<span style=\'background:' + _zonaCardInfo.cor + '20;color:' + _zonaCardInfo.cor + ';border:1px solid ' + _zonaCardInfo.cor + ';font-size:8px;font-weight:900;padding:1px 5px;border-radius:20px;display:inline-block;margin-bottom:2px;\'>' + _zonaCardInfo.emoji + ' ' + _zonaCard + '</span>'
            : '';
        return '<div class="card-servico bg-white rounded shadow-sm border-l-4 ' + bordaCard + ' cursor-grab" data-zona="' + (_zonaCard||'') + '"' +
                ' data-id="' + s.id + '" data-bairro="' + s.localidade + '"' +
                ' data-placa="' + (s.placa_veiculo || '') + '" data-responsavel="' + (s.responsavel_agendamento || '') + '"' +
                ' data-dados="' + enc + '" onclick="window.abrirDetalhesCard(this)">' +
                _badgeZonaCard +
                '<span class="font-bold text-[10px] uppercase">' + s.associado + '</span><br>' +
                '<span class="font-normal text-[10px] text-slate-400">' + s.localidade + '</span><br>' +
                '<div class="flex gap-1 mt-1 flex-wrap">' +
                    '<button onclick="event.stopPropagation(); marcarFrustrado(\'' + s.id + '\')" ' +
                        'class="bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-black px-2 py-1 rounded-lg border border-red-200 transition-all">NÃO FEITO</button>' +
                    '<button onclick="event.stopPropagation(); transferirServico(\'' + s.id + '\')" ' +
                        'class="bg-slate-100 hover:bg-emerald-100 text-slate-500 text-[9px] font-black px-2 py-1 rounded-lg border border-slate-200 transition-all">MOVER</button>' +
                '</div>' +
            '</div>';
        }).join('');

        var col = document.createElement('div');
        col.className = 'coluna-técnico coluna-rota bg-white p-4 rounded-2xl shadow-sm border-t-8 ' + corBorda + ' min-h-[300px] flex flex-col relative';
        col.setAttribute('data-nome', nomeDaRota);

        col.innerHTML =
            '<button onclick="excluirTecnico(\'' + tecBD.id + '\', \'' + nomeDaRota + '\')" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 text-xs">✖</button>' +
            '<div class="mb-3 border-b pb-2">' +
                '<div class="flex justify-between items-center">' +
                    '<h4 class="font-black text-[12px] uppercase text-slate-800">' + nomeDaRota + '</h4>' +
                    '<span class="contador-rota text-[10px] font-bold ' + (servicosNaRota.length >= 9 ? 'text-red-500' : 'text-emerald-500') + '">' + servicosNaRota.length + '/9</span>' +
                '</div>' +
                '<div class="mt-2 space-y-1">' +
                    '<input type="text" placeholder="Técnico do dia" value="' + tecnicoDiaParaData + '"' +
                        ' onblur="salvarTecnicoDia(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', \'' + meioFiltro + '\', this.value)"' +
                        ' class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">' +
                    '<input type="text" placeholder="WhatsApp" value="' + whatsappParaData + '"' +
                        ' onblur="salvarWhatsapp(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', \'' + meioFiltro + '\', this.value)"' +
                        ' class="w-full text-[10px] p-1 border rounded bg-slate-50 outline-none focus:border-emerald-500">' +
                    '<textarea placeholder="Bairros / Região de Atendimento"' +
                        ' onblur="salvarBairrosPorData(\'' + nomeDaRota + '\', \'' + dataFiltro + '\', \'' + meioFiltro + '\', this.value)"' +
                        ' class="textarea-bairros w-full text-[9px] p-1 border rounded bg-emerald-50 h-10 resize-none outline-none focus:border-emerald-500">' + bairrosParaData + '</textarea>' +
                '</div>' +
                '<button onclick="enviarRotaZap(\'' + nomeDaRota + '\', \'' + whatsappParaData + '\')" ' +
                    'class="w-full mt-2 bg-emerald-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-emerald-600 transition-all">ENVIAR WHATSAPP</button>' +
                renderizarBotaoExtra(nomeDaRota, meioFiltro) +
            '</div>' +
            '<div id="moto-' + nomeDaRota.replace(/\s/g, '-') + '" ' +
                'class="space-y-2 min-h-[200px] flex-1 moto-dropzone rounded-xl bg-slate-50/50 p-2" ' +
                'data-rota="' + nomeDaRota + '">' +
                cardsHTML +
            '</div>';

        containerMotos.appendChild(col);

        new Sortable(document.getElementById('moto-' + nomeDaRota.replace(/\s/g, '-')), {
            group: 'shared', animation: 150,
            onAdd: async function(evt) {
                var card          = evt.item;
                var agendamentoId = card.getAttribute('data-id');
                var bairroAgend   = card.getAttribute('data-bairro').trim().toLowerCase();
                var textareaBairros = evt.to.closest('.coluna-técnico').querySelector('.textarea-bairros');
                var listaBairros    = (textareaBairros ? textareaBairros.value : '')
                    .replace(/\n/g,',').split(',').map(function(b){ return b.trim().toLowerCase(); }).filter(Boolean);

                // Verificar conflito de zona
                var zonaCardArrastar = card.getAttribute('data-zona');
                var cardsNaRota      = evt.to.querySelectorAll('[data-id]');
                var zonasDaRota      = [];
                cardsNaRota.forEach(function(c){
                    var z = c.getAttribute('data-zona');
                    if (z && z !== zonaCardArrastar && zonasDaRota.indexOf(z) === -1) zonasDaRota.push(z);
                });
                var conflitos = [];
                if (zonaCardArrastar) {
                    var paresConflito = [
                        ['Zona Norte','Zona Sul'],['Zona Norte','Zona Oeste'],['Zona Norte','Interior RJ'],['Zona Norte','Região dos Lagos'],
                        ['Zona Sul','Baixada Fluminense'],['Zona Sul','Interior RJ'],['Zona Sul','Niterói / São Gonçalo'],
                        ['Zona Oeste','Zona Norte'],['Zona Oeste','Niterói / São Gonçalo'],['Zona Oeste','Interior RJ'],
                        ['Baixada Fluminense','Região dos Lagos'],['Baixada Fluminense','Zona Sul'],
                        ['Niterói / São Gonçalo','Zona Oeste'],['Niterói / São Gonçalo','Zona Sul']
                    ];
                    zonasDaRota.forEach(function(z){
                        paresConflito.forEach(function(par){
                            if ((par[0]===zonaCardArrastar&&par[1]===z)||(par[1]===zonaCardArrastar&&par[0]===z))
                                if (conflitos.indexOf(z) === -1) conflitos.push(z);
                        });
                    });
                }
                if (conflitos.length > 0) {
                    var zonaCardInfo = zonaCardArrastar ? MAPA_ZONAS[zonaCardArrastar] : null;
                    var res = await Swal.fire({
                        icon: 'warning',
                        title: '⚠️ Conflito de Rota!',
                        html: '<div style="font-size:14px;line-height:1.6;">' +
                              '<b>' + bairroAgend.toUpperCase() + '</b> é da <b style="color:' + (zonaCardInfo?zonaCardInfo.cor:'#333') + '">' + zonaCardArrastar + '</b><br>' +
                              'Esta rota já tem serviços da zona: <b style="color:#dc2626">' + conflitos.join(', ') + '</b><br><br>' +
                              '<small style="color:#64748b;">Misturar essas regiões pode gerar rotas muito longas. Deseja continuar mesmo assim?</small>' +
                              '</div>',
                        showCancelButton: true,
                        confirmButtonText: '✅ Sim, alocar mesmo assim',
                        cancelButtonText: '❌ Não, cancelar',
                        confirmButtonColor: '#f59e0b',
                        cancelButtonColor: '#94a3b8'
                    });
                    if (!res.isConfirmed) { evt.from.appendChild(card); return; }
                } else if (listaBairros.length > 0 && !listaBairros.some(function(b){ return b===bairroAgend||bairroAgend.includes(b); })) {
                    var res2 = await Swal.fire({
                        icon: 'info', title: 'Bairro fora da lista',
                        html: '<b>' + bairroAgend.toUpperCase() + '</b> não está nos bairros definidos para <b>' + nomeDaRota + '</b>.<br>Deseja alocar mesmo assim?',
                        showCancelButton: true, confirmButtonText: 'Sim', cancelButtonText: 'Não',
                        confirmButtonColor: '#10b981', cancelButtonColor: '#94a3b8'
                    });
                    if (!res2.isConfirmed) { evt.from.appendChild(card); return; }
                }

                var total = evt.to.querySelectorAll('[data-id]').length;
                if (total > 9) { alert('Limite de 9 serviços atingido!'); evt.from.appendChild(card); return; }

                await supabaseClient.from('agendamentos').update({
                    status: 'Em Rota',
                    responsavel_agendamento: nomeDaRota
                }).eq('id', agendamentoId);

                card.setAttribute('data-responsavel', nomeDaRota);
                var contEl = evt.to.closest('.coluna-técnico').querySelector('.contador-rota');
                if (contEl) {
                    var nt = evt.to.querySelectorAll('[data-id]').length;
                    contEl.innerText  = nt + '/9';
                    contEl.className  = 'contador-rota text-[10px] font-bold ' + (nt >= 9 ? 'text-red-500' : 'text-emerald-500');
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
    var meioAtual = document.getElementById('filtro-meio-rota')?.value || 'Moto';
    var label = meioAtual === 'Externo' ? 'Nome do Novo Prestador Externo'
              : meioAtual === 'Posto Fixo' ? 'Nome do Novo Posto Fixo'
              : 'Nome da Nova Moto / Técnico';
    var placeholder = meioAtual === 'Externo' ? 'Ex: Externo 06'
                    : meioAtual === 'Posto Fixo' ? 'Ex: Posto Fixo 01'
                    : 'Ex: Moto 05';
    var { value: nomeMoto } = await Swal.fire({
        title: label, input: 'text', inputPlaceholder: placeholder,
        showCancelButton: true, confirmButtonColor: '#10b981'
    });
    if (nomeMoto) {
        var { error } = await supabaseClient.from('técnicos').insert([{ nome: nomeMoto, tipo_meio: meioAtual, empresa_id: getEmpresaId() }]);
        if (error) alert('Erro: ' + error.message); else carregarRoteirizacao();
    }
};

window.excluirTecnico = async function(id, nome) {
    if (confirm('Excluir "' + nome + '"? Agendamentos voltarão para pendentes.')) {
        await supabaseClient.from('agendamentos')
            .update({ status: 'Pendente', responsavel_agendamento: 'Caio Pinheiro' })
            .eq('responsavel_agendamento', nome);
        var { error } = await supabaseClient.from('técnicos').delete().eq('id', id);
        if (error) alert('Erro ao excluir'); else carregarRoteirizacao();
    }
};

window.enviarRotaZap = async function(nomeTecnico, whatsapp) {
    var dataFiltro = document.getElementById('filtro-data-rota')?.value;
    var { data: ag } = await supabaseClient.from('agendamentos').select('*')
        .eq('responsavel_agendamento', nomeTecnico).eq('data_agendamento', dataFiltro);
    if (!ag || ag.length === 0) return alert('Não há agendamentos nesta rota.');
    var resumo = '*ROTA DO DIA - ' + nomeTecnico + '*\n*DATA: ' + dataFiltro.split('-').reverse().join('/') + '*\n\n';
    ag.slice(0,9).forEach(function(a,i) {
        resumo += '*'+(i+1)+'. ASSOCIADO:* '+a.associado+'\n📍 *END:* '+a.endereco+' ('+a.localidade+')\n🛠 *SERV:* '+a.servico+'\n⏰ *PERÍODO:* '+a.periodo+'\n🚗 *PLACA:* '+(a.placa_veiculo||'---')+'\n';
        if (a.contato_associado) resumo += '📞 *CONTATO:* '+a.contato_associado+'\n';
        if (a.observacao?.trim()) resumo += '📝 *OBS:* '+a.observacao+'\n';
        resumo += '---\n';
    });
    window.open('https://wa.me/55'+whatsapp.replace(/\D/g,'')+'\?text='+encodeURIComponent(resumo), '_blank');
};

// ================================================================
// 8. TRANSFERIR SERVIÇO
// ================================================================
window.transferirServico = async function(agendamentoId) {
    var { data: ag } = await supabaseClient.from('agendamentos').select('*').eq('id', agendamentoId).single();
    if (!ag) return alert('Erro ao buscar dados.');
    var { data: tecnicos } = await supabaseClient.from('técnicos').select('nome').order('nome');
    var opcoesRotas = (tecnicos || []).map(function(t) {
        return '<option value="' + t.nome + '" ' + (t.nome === ag.responsavel_agendamento ? 'selected' : '') + '>' + t.nome + '</option>';
    }).join('');

    var { value: fv, isConfirmed } = await Swal.fire({
        title: '<span class="text-slate-700 font-black text-base">Transferir Serviço</span>',
        html: '<div class="text-left space-y-3 mt-2">' +
            '<div class="p-3 bg-slate-50 rounded-lg border border-slate-200"><p class="text-sm font-bold">' + ag.associado + '</p><p class="text-[11px] text-slate-500">' + ag.localidade + ' · ' + ag.servico + '</p></div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Data</label><input type="date" id="transf-data" value="' + ag.data_agendamento + '" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm outline-none"></div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Nova Rota</label><select id="transf-rota" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none bg-white"><option value="Pendente">⏳ Deixar como Pendente</option>' + opcoesRotas + '</select></div>' +
            '<div><label class="text-[11px] font-black text-slate-500 uppercase block mb-1">Período</label><select id="transf-periodo" class="w-full border-2 border-slate-200 rounded-lg p-2 text-sm font-semibold text-slate-700 outline-none bg-white"><option value="Manhã" '+(ag.periodo==='Manhã'?'selected':'')+'>Manhã</option><option value="Tarde" '+(ag.periodo==='Tarde'?'selected':'')+'>Tarde</option><option value="Comercial" '+(ag.periodo==='Comercial'?'selected':'')+'>Comercial</option><option value="Integral" '+(ag.periodo==='Integral'?'selected':'')+'>Integral</option></select></div>' +
        '</div>',
        showCancelButton: true, confirmButtonText: 'TRANSFERIR', cancelButtonText: 'Cancelar', confirmButtonColor: '#10b981',
        focusConfirm: false,
        preConfirm: function() {
            var nd = document.getElementById('transf-data').value;
            if (!nd) { Swal.showValidationMessage('Informe a nova data.'); return false; }
            return { novaData: nd, novaRota: document.getElementById('transf-rota').value, novoPeriodo: document.getElementById('transf-periodo').value };
        }
    });

    if (!isConfirmed || !fv) return;
    if (fv.novaRota !== 'Pendente') {
        var { count } = await supabaseClient.from('agendamentos')
            .select('*',{count:'exact',head:true})
            .eq('data_agendamento',fv.novaData).eq('responsavel_agendamento',fv.novaRota);
        if (count >= 9) return Swal.fire({ icon:'warning', title:'Limite atingido', text: fv.novaRota+' já tem 9 serviços nessa data.', confirmButtonColor:'#10b981' });
    }
    await supabaseClient.from('agendamentos').update({
        data_agendamento: fv.novaData,
        responsavel_agendamento: fv.novaRota === 'Pendente' ? ag.responsavel_agendamento : fv.novaRota,
        status: fv.novaRota === 'Pendente' ? 'Pendente' : 'Em Rota',
        periodo: fv.novoPeriodo
    }).eq('id', agendamentoId);
    await Swal.fire({ icon:'success', title:'Transferido!', confirmButtonColor:'#10b981', timer:1500, showConfirmButton:false });
    carregarRoteirizacao();
};

// ================================================================
// 9. SERVIÇOS FRUSTRADOS
// ================================================================
async function carregarFrustrados() {
    var filtroData  = document.getElementById('filtro-data-frustrado')?.value || '';
    var filtroPlaca = (document.getElementById('filtro-placa-frustrado')?.value || '').toLowerCase();
    var empresaId = getEmpresaId(); if (!empresaId) return;
    var query = supabaseClient.from('agendamentos').select('*')
        .eq('empresa_id', empresaId).eq('status', 'Frustrado').order('data_agendamento', { ascending: false });
    if (filtroData) query = query.eq('data_agendamento', filtroData);
    var { data, error } = await query;
    var lista = document.getElementById('lista-frustrados');
    if (!lista || error) return;
    var filtrados = filtroPlaca
        ? (data||[]).filter(function(i){ return (i.placa_veiculo||'').toLowerCase().includes(filtroPlaca)||(i.associado||'').toLowerCase().includes(filtroPlaca); })
        : (data||[]);
    if (filtrados.length === 0) {
        lista.innerHTML = '<tr><td colspan="5" class="p-10 text-center text-slate-400 font-bold">Nenhum serviço não realizado encontrado.</td></tr>';
        return;
    }
    lista.innerHTML = filtrados.map(function(item) {
        var df     = item.data_agendamento.split('-').reverse().join('/');
        var motivo = (item.motivo_frustrado || '').replace(/"/g,'&quot;');
        return '<tr class="border-b border-slate-100 hover:bg-red-50 transition-colors">' +
            '<td class="p-4 text-sm"><div class="font-bold text-slate-800">' + df + '</div>' +
                '<div class="text-[10px] font-black text-red-500 uppercase mt-1">' + item.responsavel_agendamento + '</div>' +
                '<span class="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200 uppercase">' + item.periodo + '</span></td>' +
            '<td class="p-4 text-sm"><div class="font-black text-slate-800 uppercase text-[12px] mb-1">' + (item.associado||'---') + '</div>' +
                (item.contato_associado ? '<div class="text-[11px] text-blue-600 font-bold mb-1">📞 '+item.contato_associado+'</div>' : '') +
                '<div class="text-[11px] text-slate-600">📍 ' + item.endereco + ' | <span class="font-black">' + item.localidade + '</span></div>' +
                '<div class="flex gap-1 mt-1">' +
                    '<span class="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold">' + (item.uf||'RJ') + '</span>' +
                    '<span class="bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono font-black">' + (item.placa_veiculo||'---') + '</span>' +
                '</div></td>' +
            '<td class="p-4 text-sm"><div class="font-bold text-red-600 uppercase italic">' + item.servico + '</div></td>' +
            '<td class="p-4 text-sm max-w-xs"><div class="text-[11px] text-slate-600 whitespace-pre-line bg-red-50 p-2 rounded border border-red-100 min-h-[36px]">' +
                (item.motivo_frustrado || '<span class="text-slate-400 italic">Sem motivo registrado</span>') + '</div></td>' +
            '<td class="p-4 text-center"><div class="flex flex-col gap-2 items-center">' +
                '<button onclick="editarMotivoFrustrado(\'' + item.id + '\', this)" data-motivo="' + motivo + '" ' +
                    'class="bg-amber-100 hover:bg-amber-200 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-200 transition-all">✏️ MOTIVO</button>' +
                '<button onclick="reativarServico(\'' + item.id + '\', \'' + (item.responsavel_agendamento||'').replace(/'/g,"\\'") + '\')" ' +
                    'class="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-200 transition-all">↩️ REATIVAR</button>' +
            '</div></td>' +
        '</tr>';
    }).join('');
}

window.editarMotivoFrustrado = async function(id, btn) {
    var motivoAtual = btn.getAttribute('data-motivo') || '';
    var { value: motivo, isConfirmed } = await Swal.fire({
        title: '<span class="text-red-600 font-black text-base">Motivo do Não Atendimento</span>',
        input: 'textarea', inputValue: motivoAtual, inputPlaceholder: 'Descreva o motivo...',
        inputAttributes: { rows: 4 }, showCancelButton: true,
        confirmButtonText: 'SALVAR', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    await supabaseClient.from('agendamentos').update({ motivo_frustrado: motivo }).eq('id', id);
    carregarFrustrados();
};

window.reativarServico = async function(id, responsavelOriginal) {
    if (!confirm('Reativar este serviço? Ele voltará como Pendente.')) return;
    var resp = responsavelOriginal && responsavelOriginal !== 'null' ? responsavelOriginal : 'Caio Pinheiro';
    await supabaseClient.from('agendamentos').update({
        status: 'Pendente', motivo_frustrado: null, responsavel_agendamento: resp
    }).eq('id', id);
    var cardNaRota = document.querySelector('[data-id="' + id + '"]');
    if (cardNaRota) cardNaRota.remove();
    carregarFrustrados();
    carregarRoteirizacao();
};

window.marcarFrustrado = async function(id) {
    var { value: motivo, isConfirmed } = await Swal.fire({
        title: '<span class="text-red-600 font-black text-base">Marcar como Não Realizado</span>',
        input: 'textarea', inputPlaceholder: 'Informe o motivo (ex: cliente ausente, endereço errado...)',
        inputAttributes: { rows: 3 }, showCancelButton: true,
        confirmButtonText: 'CONFIRMAR', cancelButtonText: 'Cancelar', confirmButtonColor: '#ef4444',
    });
    if (!isConfirmed) return;
    await supabaseClient.from('agendamentos').update({ status: 'Frustrado', motivo_frustrado: motivo || '' }).eq('id', id);
    var card = document.querySelector('[data-id="' + id + '"]');
    if (card) { card.classList.remove('border-emerald-500'); card.classList.add('border-red-500','bg-red-50'); }
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
    // Limpa busca por placa ao usar filtro de moto
    var inputPlaca = document.getElementById('busca-placa-rota');
    if (inputPlaca) inputPlaca.value = '';
    limparDestaquePlaca();

    var termo = (document.getElementById('busca-técnico')?.value || '').toLowerCase().trim();
    document.querySelectorAll('.coluna-técnico').forEach(function(col) {
        var nomeTec   = col.getAttribute('data-nome').toLowerCase();
        var encontrou = false;
        col.querySelectorAll('.card-servico').forEach(function(card) {
            var placa     = (card.getAttribute('data-placa') || '').toLowerCase();
            var associado = card.innerText.toLowerCase();
            var visivel   = termo === '' || placa.includes(termo) || associado.includes(termo) || nomeTec.includes(termo);
            card.style.display = visivel ? '' : 'none';
            if (visivel && termo !== '') { encontrou = true; card.classList.add('ring-2','ring-amber-500'); }
            else card.classList.remove('ring-2','ring-amber-500');
        });
        col.style.display = (nomeTec.includes(termo) || encontrou || termo === '') ? '' : 'none';
    });
};

function limparDestaquePlaca() {
    document.querySelectorAll('.card-servico').forEach(function(card) {
        card.classList.remove('ring-4','ring-amber-400','ring-2','ring-amber-500','bg-amber-50');
        card.style.display = '';
    });
    document.querySelectorAll('.coluna-técnico').forEach(function(col) {
        col.style.display = '';
        // Remove banner de resultado
        var banner = col.querySelector('.banner-placa');
        if (banner) banner.remove();
    });
    // Remove painel de resultado global
    var painel = document.getElementById('painel-resultado-placa');
    if (painel) painel.remove();
}

window.filtrarPorPlaca = function() {
    // Limpa filtro de moto
    var inputMoto = document.getElementById('busca-técnico');
    if (inputMoto) inputMoto.value = '';

    var inputPlaca = document.getElementById('busca-placa-rota');
    var placa = (inputPlaca ? inputPlaca.value : '').toUpperCase().replace(/[^A-Z0-9]/g,'').trim();
    inputPlaca.value = placa;

    // Limpa destaques anteriores
    limparDestaquePlaca();

    if (placa.length < 3) return; // espera ao menos 3 chars

    var encontrados = [];
    var colunasComMatch = new Set();

    document.querySelectorAll('.card-servico').forEach(function(card) {
        var cardPlaca = (card.getAttribute('data-placa') || '').toUpperCase().replace(/[^A-Z0-9]/g,'');
        if (cardPlaca.includes(placa)) {
            encontrados.push(card);
            var col = card.closest('.coluna-técnico');
            if (col) colunasComMatch.add(col);
        }
    });

    if (encontrados.length === 0) {
        // Nenhum resultado — mostra aviso
        var aviso = document.createElement('div');
        aviso.id = 'painel-resultado-placa';
        aviso.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);z-index:9999;' +
            'background:#fff1f2;border:2px solid #fecdd3;border-radius:14px;padding:16px 28px;' +
            'font-weight:900;color:#dc2626;font-size:14px;box-shadow:0 8px 32px rgba(0,0,0,0.15);text-align:center;';
        aviso.innerHTML = '🔍 Placa <b>' + placa + '</b> não encontrada em nenhuma rota do dia.';
        document.body.appendChild(aviso);
        setTimeout(function(){ if(aviso.parentNode) aviso.remove(); }, 3000);
        return;
    }

    // Oculta colunas sem match
    document.querySelectorAll('.coluna-técnico').forEach(function(col) {
        if (!colunasComMatch.has(col)) {
            col.style.display = 'none';
        }
    });

    // Destaca os cards encontrados e mostra banner na coluna
    colunasComMatch.forEach(function(col) {
        var nomeMoto = col.getAttribute('data-nome') || '';
        // Banner no topo da coluna
        var banner = document.createElement('div');
        banner.className = 'banner-placa';
        banner.style.cssText = 'background:#f59e0b;color:white;font-weight:900;font-size:11px;' +
            'padding:5px 10px;border-radius:8px;margin-bottom:8px;text-align:center;letter-spacing:1px;';
        banner.innerHTML = '🚗 PLACA ' + placa + ' ENCONTRADA AQUI';
        var body = col.querySelector('.cards-container') || col.querySelector('[id^="cards-"]') || col;
        col.insertBefore(banner, col.querySelector('.card-servico'));
    });

    encontrados.forEach(function(card) {
        card.classList.add('ring-4','ring-amber-400','bg-amber-50');
        // Scroll suave até o primeiro card
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Painel de resultado flutuante
    var rotasEncontradas = Array.from(colunasComMatch).map(function(col){
        return col.getAttribute('data-nome') || '?';
    });
    var painel = document.createElement('div');
    painel.id = 'painel-resultado-placa';
    painel.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;' +
        'background:white;border:3px solid #f59e0b;border-radius:16px;padding:14px 20px;' +
        'box-shadow:0 8px 32px rgba(0,0,0,0.18);min-width:220px;';
    painel.innerHTML =
        '<div style="font-size:12px;font-weight:900;color:#92400e;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">🚗 Resultado da Busca</div>' +
        '<div style="font-size:20px;font-weight:900;color:#0f172a;font-family:monospace;letter-spacing:3px;margin-bottom:8px;">' + placa + '</div>' +
        '<div style="font-size:11px;color:#64748b;font-weight:700;margin-bottom:6px;">Encontrada em ' + encontrados.length + ' serviço(s):</div>' +
        rotasEncontradas.map(function(r){
            return '<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:5px 10px;font-size:12px;font-weight:900;color:#92400e;margin-top:4px;">🏍️ ' + r + '</div>';
        }).join('') +
        '<button onclick="limparDestaquePlaca();document.getElementById(\'busca-placa-rota\').value=\'\';this.parentNode.remove();" ' +
        'style="margin-top:10px;width:100%;background:#e2e8f0;border:none;border-radius:8px;padding:6px;font-weight:900;font-size:11px;cursor:pointer;color:#475569;">✖ LIMPAR BUSCA</button>';
    document.body.appendChild(painel);
};

// ================================================================
// 11. SERVIÇO EXTRA
// ================================================================
function renderizarBotaoExtra(tecnicoNome, meioAtual) {
    return '<button onclick="adicionarServicoExtra(\'' + tecnicoNome + '\', \'' + (meioAtual||'Moto') + '\')" ' +
        'class="w-full mt-2 bg-amber-500 text-white text-[10px] font-bold py-1.5 rounded-lg hover:bg-amber-600 transition-all">+ ADICIONAR EXTRA</button>';
}

async function adicionarServicoExtra(tecnicoNome, meioAtual) {
    var dataFiltro = document.getElementById('filtro-data-rota')?.value || new Date().toISOString().split('T')[0];
    var meio       = meioAtual || 'Moto';
    var { value: fv } = await Swal.fire({
        title: 'SERVIÇO EXTRA: ' + tecnicoNome,
        html: '<div class="text-left">' +
            '<label class="text-[10px] font-bold">DATA</label><input id="swal-data" type="date" class="swal2-input !mt-1" value="' + dataFiltro + '">' +
            '<label class="text-[10px] font-bold">ASSOCIADO</label><input id="swal-associado" placeholder="Nome do cliente" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">CONTATO</label><input id="swal-contato" placeholder="(21) 99999-9999" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">LOCALIDADE</label><input id="swal-localidade" placeholder="Ex: Lapa" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">ENDEREÇO</label><input id="swal-endereco" placeholder="Rua, número" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">PLACA</label><input id="swal-placa" placeholder="Placa do veículo" class="swal2-input !mt-1">' +
            '<label class="text-[10px] font-bold">SERVIÇO</label>' +
            '<select id="swal-servico" class="swal2-input !mt-1">' +
                '<option value="Instalação">Instalação</option>' +
                '<option value="Manutenção">Manutenção</option>' +
                '<option value="Retirada">Retirada</option>' +
            '</select>' +
        '</div>',
        focusConfirm: false, showCancelButton: true,
        confirmButtonText: 'SALVAR EXTRA', confirmButtonColor: '#f59e0b',
        preConfirm: function() {
            return {
                data_agendamento:        document.getElementById('swal-data').value,
                associado:               document.getElementById('swal-associado').value,
                contato_associado:       document.getElementById('swal-contato').value,
                localidade:              document.getElementById('swal-localidade').value,
                endereco:                document.getElementById('swal-endereco').value,
                placa_veiculo:           document.getElementById('swal-placa').value,
                servico:                 document.getElementById('swal-servico').value,
                responsavel_agendamento: tecnicoNome,
                meio_atendimento:        meio,
                empresa_id:              getEmpresaId(),
                status: 'Em Rota', periodo: 'Integral', uf: 'RJ'
            };
        }
    });
    if (fv) {
        var { error } = await supabaseClient.from('agendamentos').insert([fv]);
        if (error) alert('Erro: ' + error.message); else carregarRoteirizacao();
    }
}

// ================================================================
// RELATÓRIO PDF COMPLETO DO DIA
// ================================================================
window.gerarRelatorioPDF = async function() {
    var dataEscolhida = document.getElementById('data-relatorio')?.value;
    if (!dataEscolhida) {
        Swal.fire({ icon:'warning', title:'Selecione a data', text:'Escolha a data antes de gerar.', confirmButtonColor:'#7c3aed' });
        return;
    }

    var empresaId   = getEmpresaId();
    var empresaNome = sessionStorage.getItem('empresa_nome') || 'Empresa';
    var dataFmt     = dataEscolhida.split('-').reverse().join('/');

    Swal.fire({ title:'Gerando Relatório...', text:'Buscando dados de ' + dataFmt, allowOutsideClick:false, didOpen:function(){ Swal.showLoading(); } });

    // 1. Busca TODOS agendamentos do dia (sem filtro de status ou meio)
    var { data: ags } = await supabaseClient.from('agendamentos').select('*')
        .eq('empresa_id', empresaId)
        .eq('data_agendamento', dataEscolhida)
        .order('responsavel_agendamento', { ascending: true });
    ags = ags || [];

    // 2. Busca técnicos para saber quem é rota real
    var { data: tecs } = await supabaseClient.from('técnicos').select('nome')
        .eq('empresa_id', empresaId);
    var nomesTecs = new Set((tecs || []).map(function(t){ return t.nome; }));

    // 3. Classificação correta:
    // - Em Rota: status='Em Rota' OU (responsavel é técnico real e status≠Frustrado)
    // - Pendente: status='Pendente' E responsavel NÃO é técnico real
    // - Frustrado: status='Frustrado'
    var emRota     = [];
    var pendentes  = [];
    var frustrados = [];

    ags.forEach(function(a) {
        if (a.status === 'Frustrado') {
            frustrados.push(a);
        } else if (a.status === 'Em Rota' || (nomesTecs.has(a.responsavel_agendamento) && a.status !== 'Frustrado')) {
            emRota.push(a);
        } else {
            pendentes.push(a);
        }
    });

    var total = ags.length;

    // 4. Agrupa Em Rota por técnico
    var porTecnico = {};
    emRota.forEach(function(a) {
        var tec = a.responsavel_agendamento || 'Sem responsável';
        if (!porTecnico[tec]) porTecnico[tec] = [];
        porTecnico[tec].push(a);
    });

    var agora       = new Date();
    var horaGeracao = agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });

    // ── Helpers ──
    function linhaDados(a, i, tipo) {
        var corServico = a.status === 'Frustrado' ? '#dc2626' : '#059669';
        var html = '<tr style="border-bottom:1px solid #f1f5f9;page-break-inside:avoid;">';
        html += '<td style="padding:8px 10px;font-size:11px;font-weight:900;color:#94a3b8;width:20px;">' + (i+1) + '</td>';
        html += '<td style="padding:8px 10px;">' +
            '<div style="font-size:11px;font-weight:900;color:#1e293b;text-transform:uppercase;">' + (a.associado||'---') + '</div>' +
            (a.contato_associado ? '<div style="font-size:10px;color:#2563eb;font-weight:700;">📞 '+a.contato_associado+'</div>' : '') +
            '<div style="font-size:10px;color:#475569;margin:2px 0;">📍 '+(a.endereco||'')+ ' | <b>'+(a.localidade||'')+'</b></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:3px;">' +
                '<span style="background:#0f172a;color:#fff;padding:1px 6px;border-radius:4px;font-size:9px;font-weight:700;">'+(a.uf||'RJ')+'</span>' +
                '<span style="background:#ecfdf5;color:#065f46;border:1px solid #bbf7d0;padding:1px 6px;border-radius:4px;font-size:9px;font-weight:700;">'+(a.meio_atendimento||'Moto')+'</span>' +
                '<span style="background:#0f172a;color:#fff;padding:1px 6px;border-radius:4px;font-size:9px;font-family:monospace;font-weight:900;letter-spacing:2px;">'+(a.placa_veiculo||'---')+'</span>' +
            '</div>' +
            (a.observacao ? '<div style="font-size:10px;color:#92400e;background:#fffbeb;border-left:3px solid #f59e0b;padding:3px 6px;margin-top:4px;border-radius:0 4px 4px 0;">📝 '+a.observacao+'</div>' : '') +
        '</td>';
        html += '<td style="padding:8px 10px;font-size:11px;color:'+corServico+';font-weight:900;font-style:italic;white-space:nowrap;">'+(a.servico||'---')+'</td>';
        html += '<td style="padding:8px 10px;font-size:10px;color:#64748b;white-space:nowrap;">'+(a.periodo||'---')+'</td>';
        if (tipo === 'pendente') {
            html += '<td style="padding:8px 10px;font-size:10px;font-weight:700;color:#0f172a;">'+(a.responsavel_agendamento||'---')+'</td>';
        }
        if (tipo === 'frustrado') {
            html += '<td style="padding:8px 10px;font-size:10px;font-weight:700;color:#0f172a;">'+(a.responsavel_agendamento||'---')+'</td>';
            html += '<td style="padding:8px 10px;font-size:10px;color:#dc2626;font-style:italic;">'+(a.motivo_frustrado||'Sem motivo informado')+'</td>';
        }
        html += '</tr>';
        return html;
    }

    function thead(tipo) {
        var h = '<tr style="background:#f8fafc;">' +
            '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;width:20px;">#</th>' +
            '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Cliente / Endereço</th>' +
            '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Serviço</th>' +
            '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Período</th>';
        if (tipo === 'pendente')  h += '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Responsável</th>';
        if (tipo === 'frustrado') h += '<th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Técnico</th><th style="padding:6px 10px;font-size:9px;color:#94a3b8;text-transform:uppercase;text-align:left;">Motivo</th>';
        return h + '</tr>';
    }

    function tabelaSimples(lista, tipo) {
        return '<div style="overflow:hidden;border-radius:10px;border:1px solid #e2e8f0;">' +
            '<table style="width:100%;border-collapse:collapse;background:white;">' +
            '<thead>' + thead(tipo) + '</thead>' +
            '<tbody>' + lista.map(function(a,i){ return linhaDados(a,i,tipo); }).join('') + '</tbody>' +
            '</table></div>';
    }

    function secaoTecnico(nome, lista) {
        // Badge do meio de atendimento
        var meioLabel = lista[0] ? (lista[0].meio_atendimento || 'Moto') : 'Moto';
        var icone = meioLabel === 'Externo' ? '🤝' : meioLabel === 'Posto Fixo' ? '📍' : '🏍️';
        return '<div style="margin-bottom:14px;break-inside:avoid;">' +
            '<div style="background:#0f172a;color:white;padding:9px 14px;border-radius:10px 10px 0 0;display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:12px;font-weight:900;letter-spacing:1px;text-transform:uppercase;">' + icone + ' ' + nome + '</span>' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                    '<span style="background:#1e293b;color:#94a3b8;font-size:9px;font-weight:700;padding:2px 8px;border-radius:20px;">' + meioLabel + '</span>' +
                    '<span style="font-size:11px;font-weight:700;color:#34d399;">' + lista.length + ' serviço(s)</span>' +
                '</div>' +
            '</div>' +
            '<div style="overflow:hidden;border-radius:0 0 10px 10px;border:1px solid #e2e8f0;border-top:none;">' +
            '<table style="width:100%;border-collapse:collapse;background:white;">' +
            '<thead>' + thead('rota') + '</thead>' +
            '<tbody>' + lista.map(function(a,i){ return linhaDados(a,i,'rota'); }).join('') + '</tbody>' +
            '</table></div></div>';
    }

    // ── Monta HTML do relatório ──
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
        '<title>Relatório '+dataFmt+' — '+empresaNome+'</title>' +
        '<style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#f8fafc;color:#1e293b;}' +
        '@media print{body{padding:8px;background:white;}.no-print{display:none!important;}@page{margin:12mm;size:A4;}}' +
        'table{border-collapse:collapse;width:100%;}*{box-sizing:border-box;}h2{margin:0;}</style>' +
        '</head><body>' +

        // Cabeçalho
        '<div style="background:linear-gradient(135deg,#0f172a,#1e293b);color:white;padding:20px 24px;border-radius:16px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div>' +
                '<div style="font-size:22px;font-weight:900;letter-spacing:-1px;">CONEXÃO <span style="color:#34d399;">AGENDA</span></div>' +
                '<div style="font-size:12px;color:#94a3b8;margin-top:4px;font-weight:700;">' + empresaNome + '</div>' +
            '</div>' +
            '<div style="text-align:right;">' +
                '<div style="font-size:28px;font-weight:900;color:#34d399;">' + dataFmt + '</div>' +
                '<div style="font-size:10px;color:#64748b;margin-top:4px;">Gerado às ' + horaGeracao + '</div>' +
            '</div>' +
        '</div>' +

        // Cards de resumo
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;">' +
        [['TOTAL DO DIA', total, '#7c3aed'],
         ['EM ROTA', emRota.length, '#059669'],
         ['PENDENTES', pendentes.length, '#d97706'],
         ['NÃO REALIZADOS', frustrados.length, '#dc2626']].map(function(c){
            return '<div style="background:white;border-radius:12px;padding:14px;border-left:5px solid '+c[2]+';box-shadow:0 1px 4px rgba(0,0,0,0.08);">' +
                '<div style="font-size:10px;font-weight:900;color:'+c[2]+';text-transform:uppercase;letter-spacing:1px;">'+c[0]+'</div>' +
                '<div style="font-size:30px;font-weight:900;color:#1e293b;margin-top:4px;">'+c[1]+'</div>' +
            '</div>';
         }).join('') +
        '</div>' +

        // Em Rota
        (Object.keys(porTecnico).length > 0 ?
            '<div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:14px;padding:16px;margin-bottom:14px;">' +
                '<h2 style="font-size:14px;font-weight:900;color:#065f46;margin:0 0 14px 0;text-transform:uppercase;letter-spacing:1px;">🗺️ Roteirização do Dia ('+emRota.length+' serviços)</h2>' +
                Object.keys(porTecnico).map(function(t){ return secaoTecnico(t, porTecnico[t]); }).join('') +
            '</div>'
        : '<div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:14px;padding:16px;margin-bottom:14px;text-align:center;color:#94a3b8;font-weight:700;">Nenhum serviço em rota neste dia.</div>') +

        // Pendentes
        (pendentes.length > 0 ?
            '<div style="background:#fffbeb;border:2px solid #fde68a;border-radius:14px;padding:16px;margin-bottom:14px;break-inside:avoid;">' +
                '<h2 style="font-size:14px;font-weight:900;color:#92400e;margin:0 0 14px 0;text-transform:uppercase;letter-spacing:1px;">⏳ Pendentes ('+pendentes.length+')</h2>' +
                tabelaSimples(pendentes, 'pendente') +
            '</div>'
        : '') +

        // Frustrados
        (frustrados.length > 0 ?
            '<div style="background:#fff1f2;border:2px solid #fecdd3;border-radius:14px;padding:16px;margin-bottom:14px;break-inside:avoid;">' +
                '<h2 style="font-size:14px;font-weight:900;color:#9f1239;margin:0 0 14px 0;text-transform:uppercase;letter-spacing:1px;">❌ Não Realizados ('+frustrados.length+')</h2>' +
                tabelaSimples(frustrados, 'frustrado') +
            '</div>'
        : '') +

        // Rodapé
        '<div style="text-align:center;padding:14px;color:#94a3b8;font-size:10px;font-weight:700;border-top:1px solid #e2e8f0;margin-top:10px;">' +
            'CaioSystem · Relatório gerado em '+dataFmt+' às '+horaGeracao +
        '</div>' +
        '<div class="no-print" style="text-align:center;margin:20px 0;">' +
            '<button onclick="window.print()" style="background:#7c3aed;color:white;font-weight:900;padding:14px 36px;border:none;border-radius:12px;font-size:14px;cursor:pointer;box-shadow:0 4px 12px rgba(124,58,237,0.4);">🖨️ IMPRIMIR / SALVAR PDF</button>' +
        '</div></body></html>';

    Swal.close();
    var win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.onload = function(){ win.focus(); win.print(); };
};
// ================================================================
// MODAL MAPA DE ZONAS - consulta rápida de bairros
// ================================================================
window.abrirMapaZonas = function(termoBusca) {
    var termo = (termoBusca || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    
    var html = '<div style="text-align:left;">';
    
    // Barra de busca
    html += '<div style="margin-bottom:16px;">' +
        '<input id="busca-mapa-zonas" type="text" placeholder="🔍 Buscar bairro ou cidade..." value="' + (termoBusca||'') + '" ' +
        'onkeyup="filtrarMapaZonas()" ' +
        'style="width:100%;padding:10px 14px;border:2px solid #e2e8f0;border-radius:12px;font-size:14px;outline:none;font-weight:700;" />' +
    '</div>';
    
    html += '<div id="resultado-mapa-zonas">';
    
    for (var zona in MAPA_ZONAS) {
        var info = MAPA_ZONAS[zona];
        var bairrosFiltrados = termo 
            ? info.bairros.filter(function(b){ return b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(termo); })
            : info.bairros;
        
        if (bairrosFiltrados.length === 0) continue;
        
        html += '<div class="zona-bloco" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:2px solid ' + info.cor + '20;">' +
            '<div style="background:' + info.cor + ';color:white;padding:8px 14px;font-weight:900;font-size:13px;letter-spacing:1px;">' +
                info.emoji + ' ' + zona + ' <span style="opacity:0.8;font-size:11px;font-weight:700;">(' + info.bairros.length + ' regiões)</span>' +
            '</div>' +
            '<div style="padding:10px 12px;background:white;display:flex;flex-wrap:wrap;gap:5px;">' +
            bairrosFiltrados.map(function(b){
                var destaque = termo && b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(termo);
                return '<span style="background:' + (destaque ? info.cor : info.cor+'15') + ';color:' + (destaque ? 'white' : info.cor) + ';' +
                       'border:1px solid ' + info.cor + '40;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:' + (destaque?'900':'700') + ';">' +
                       b + '</span>';
            }).join('') +
            '</div></div>';
    }
    
    html += '</div></div>';
    
    Swal.fire({
        title: '<span style="color:#0f172a;font-weight:900;font-size:16px;">🗺️ Mapa de Zonas — Bairros por Região</span>',
        html: html,
        width: '800px',
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: function() {
            var inp = document.getElementById('busca-mapa-zonas');
            if (inp) inp.focus();
        }
    });
};

window.filtrarMapaZonas = function() {
    var inp = document.getElementById('busca-mapa-zonas');
    var termo = inp ? inp.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'') : '';
    var resultado = document.getElementById('resultado-mapa-zonas');
    if (!resultado) return;
    
    var html = '';
    for (var zona in MAPA_ZONAS) {
        var info = MAPA_ZONAS[zona];
        var bairrosFiltrados = termo 
            ? info.bairros.filter(function(b){ return b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(termo); })
            : info.bairros;
        if (bairrosFiltrados.length === 0) continue;
        html += '<div class="zona-bloco" style="margin-bottom:12px;border-radius:12px;overflow:hidden;border:2px solid ' + info.cor + '20;">' +
            '<div style="background:' + info.cor + ';color:white;padding:8px 14px;font-weight:900;font-size:13px;">' +
                info.emoji + ' ' + zona +
            '</div>' +
            '<div style="padding:10px 12px;background:white;display:flex;flex-wrap:wrap;gap:5px;">' +
            bairrosFiltrados.map(function(b){
                var destaque = termo && b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').includes(termo);
                return '<span style="background:' + (destaque ? info.cor : info.cor+'15') + ';color:' + (destaque ? 'white' : info.cor) + ';' +
                       'border:1px solid ' + info.cor + '40;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:' + (destaque?'900':'700') + ';">' + b + '</span>';
            }).join('') +
            '</div></div>';
    }
    resultado.innerHTML = html || '<p style="color:#94a3b8;text-align:center;padding:20px;">Nenhum bairro encontrado para "' + inp.value + '"</p>';
};
