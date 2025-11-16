document.addEventListener("DOMContentLoaded", function() {

    const API_URL = "http://localhost:3000";
    let servicoSelecionado = null;

   
    const seletorServico = document.getElementById("seletorServico");
    const verificarEndereco = document.getElementById("verificarEndereco");
    const containerRoteiro = document.getElementById("containerRoteiro");

    // --- Botões ---
    const btnSamu = document.getElementById("btnSamu");
    const btnPolicia = document.getElementById("btnPolicia");
    const btnBombeiro = document.getElementById("btnBombeiro");
    const btnDefesaCivil = document.getElementById("btnDefesaCivil");
    const btnEnderecoSim = document.getElementById("btnEnderecoSim");
    const btnEnderecoNao = document.getElementById("btnEnderecoNao");
    const btnVoltar = document.getElementById("btnVoltar");
    const btnAcionarEmergencia = document.getElementById("btnAcionarEmergencia");

    // --- Elementos do Roteiro ---
    const sidebarTitulo = document.getElementById("sidebar-titulo");
    const sidebarTexto = document.getElementById("sidebar-texto");
    const sidebarLogo = document.getElementById("sidebar-logo");
    const alertaLabel = document.getElementById("alerta-label");
    const inputAlerta = document.getElementById("input-alerta");

    
    const labels = {
        1: document.getElementById("label-1"), 2: document.getElementById("label-2"),
        3: document.getElementById("label-3"), 4: document.getElementById("label-4"),
        5: document.getElementById("label-5")
    };
    const spans = {
        1: document.getElementById("span-1"), 2: document.getElementById("span-2"),
        3: document.getElementById("span-3"), 4: document.getElementById("span-4"),
        5: document.getElementById("span-5")
    };
    const inputs = {
        1: document.getElementById("input-1"), 2: document.getElementById("input-2"),
        3: document.getElementById("input-3"), 4: document.getElementById("input-4"),
        5: document.getElementById("input-5")
    };


    /**
     * 
     * @param {string} servico - O nome do serviço 
     * @param {boolean} estaNoEnderecoCadastrado 
     */
    async function exibirRoteiro(servico, estaNoEnderecoCadastrado) {
        try {
            const response = await fetch(`${API_URL}/${servico}`);
            if (!response.ok) throw new Error(`Erro ao buscar dados: ${response.statusText}`);
            const persona = await response.json();

            
            sidebarTitulo.textContent = persona.titulo_sidebar;
            sidebarTexto.textContent = persona.texto_sidebar;
            sidebarLogo.src = persona.logo;
            alertaLabel.textContent = persona.alerta_label;
            
            
            inputAlerta.value = persona.alerta_dado.charAt(0).toUpperCase() + persona.alerta_dado.slice(1).toLowerCase();


            
            let camposPerfil = [1]; 
            if (servico === 'samu') {
                camposPerfil.push(2); 
            }
            
            const indiceEndereco = (servico === 'samu') ? 5 : 3; 

            
            for (let i = 1; i <= 5; i++) {
                const label = labels[i];
                const span = spans[i];
                const input = inputs[i];
                const dado = persona['dado_' + i];
                const labelTexto = persona['label_' + i];

                label.textContent = labelTexto;
                label.classList.remove('label-alerta'); 
                
                let mostrarFixo = false; 

                
                if (camposPerfil.includes(i)) {
                    
                    mostrarFixo = true;
                } else if (i === indiceEndereco && estaNoEnderecoCadastrado) {
                    
                    mostrarFixo = true;
                }
                
                if (mostrarFixo) {
                   
                    span.textContent = dado;
                    span.style.display = "block";
                    input.style.display = "none";
                    label.htmlFor = ""; 
                } else {
                    
                    input.placeholder = dado;
                    input.value = ""; 
                    input.style.display = "block";
                    span.style.display = "none";
                    label.htmlFor = "input-" + i; 

                    
                    if (i === indiceEndereco && !estaNoEnderecoCadastrado) {
                        input.placeholder = "[INFORME O ENDEREÇO ATUAL]";
                        input.value = ""; 
                        label.classList.add('label-alerta'); 
                    }
                }
            }

            
            containerRoteiro.className = 'container-roteiro'; 
            containerRoteiro.classList.add(persona.tema);

            
            verificarEndereco.style.display = "none";
            containerRoteiro.style.display = "flex";

        } catch (error) {
            console.error("Falha ao carregar roteiro:", error);
            alert("Não foi possível carregar os dados do roteiro. Verifique se o JSON Server está rodando.");
        }
    }

    
    function voltarAoSeletor() {
        seletorServico.style.display = "block";
        containerRoteiro.style.display = "none";
        verificarEndereco.style.display = "none";
        servicoSelecionado = null; 
    }

    /**
     * 
     * @param {string} servico 
     */
    function irParaVerificacao(servico) {
        servicoSelecionado = servico;
        seletorServico.style.display = "none";
        verificarEndereco.style.display = "block";
    }

    

    // Botões de Serviço
    btnSamu.addEventListener('click', () => irParaVerificacao('samu'));
    btnPolicia.addEventListener('click', () => irParaVerificacao('policia'));
    btnBombeiro.addEventListener('click', () => irParaVerificacao('bombeiro'));
    btnDefesaCivil.addEventListener('click', () => irParaVerificacao('defesa'));

    // Botões de Endereço
    btnEnderecoSim.addEventListener('click', () => exibirRoteiro(servicoSelecionado, true));
    btnEnderecoNao.addEventListener('click', () => exibirRoteiro(servicoSelecionado, false));

    // Botão Voltar
    btnVoltar.addEventListener('click', voltarAoSeletor);

    // --- Função para salvar dados da emergência ---
    async function salvarEmergencia() {
        const dados = {
            servico: servicoSelecionado,
            timestamp: new Date().toISOString(),
            informacoes: {}
        };

        // Coleta os dados dos inputs
        for (let i = 1; i <= 5; i++) {
            const input = inputs[i];
            const label = labels[i];
            
            if (input.style.display !== "none") {
                dados.informacoes['campo_' + i] = {
                    label: label.textContent,
                    valor: input.value
                };
            } else {
                dados.informacoes['campo_' + i] = {
                    label: label.textContent,
                    valor: spans[i].textContent
                };
            }
        }

        // Coleta o nível de alerta
        dados.informacoes['alerta'] = {
            label: alertaLabel.textContent,
            valor: inputAlerta.value
        };

        // Salva no localStorage (mais organizado e rápido)
        try {
            let emergencias = JSON.parse(localStorage.getItem('emergencias')) || [];
            emergencias.push(dados);
            localStorage.setItem('emergencias', JSON.stringify(emergencias));
            
            alert('✓ Emergência registrada com sucesso!');
            voltarAoSeletor();
        } catch (error) {
            console.error('Erro ao salvar emergência:', error);
            alert('Erro ao registrar a emergência. Tente novamente.');
        }
    }

    // Botão Acionar Emergência
    btnAcionarEmergencia.addEventListener('click', salvarEmergencia);

});