
document.addEventListener("DOMContentLoaded", function() {

    

    // 1. PERSONA SAMU (Antônio)
    const dadosSamu = {
        "servico": "SAMU (192)",
        "tema": "theme-samu",
        "logo": "https://i.imgur.com/gAv942I.png",
        "titulo_sidebar": "Roteiro SAMU",
        "texto_sidebar": "Mantenha a calma. Leia as informações a seguir em voz alta para o atendente do SAMU (192).",
        "label_1": "Nome do Paciente:",
        "dado_1": "Antônio",
        "label_2": "Idade:",
        "dado_2": "81 anos",
        "label_3": "Sintoma Principal:",
        "dado_3": "Forte dor no peito.",
        "label_4": "Alergia a medicamentos? Qual(is)?",
        "dado_4": "Não.",
        "label_5": "Endereço Exato:",
        "dado_5": "Rua Rio de Janeiro, 1234 – Centro, Belo Horizonte – MG, 30160-042",
        "alerta_label": "Gravidade da Situação (Alto, Medio, Baixo):",
        "alerta_dado": "Alto."
    };

    // 2. PERSONA POLÍCIA MILITAR (Carla)
    const dadosPolicia = {
        "servico": "Polícia Militar (190)",
        "tema": "theme-policia",
        "logo": "https://i.imgur.com/gkqA2uU.png", // Ícone genérico de polícia
        "titulo_sidebar": "Roteiro Polícia",
        "texto_sidebar": "Mantenha a calma e relate os fatos de forma clara para o atendente da Polícia Militar (190).",
        "label_1": "Nome do Solicitante:",
        "dado_1": "Carla Mendes",
        "label_2": "Tipo de Ocorrência:",
        "dado_2": "Acidente de Carro.",
        "label_3": "Endereço Exato:",
        "dado_3": "Avenida do Contorno, 8561 – Savassi, Belo Horizonte – MG, 30110-017",
        "label_4": "Descrição do Ocorrido:",
        "dado_4": "Dois carros colidiram de frente, enquanto um estava na contra mão",
        "label_5": "Houve fuga ?",
        "dado_5": "Não.",
        "alerta_label": "Gravidade da Situação (Alto, Medio, Baixo):",
        "alerta_dado": "Medio."
    };

    // 3. PERSONA BOMBEIROS (Juliana)
    const dadosBombeiro = {
        "servico": "Bombeiros (193)",
        "tema": "theme-bombeiro",
        "logo": "https://i.imgur.com/GzB9oBw.png", // Ícone genérico de fogo
        "titulo_sidebar": "Roteiro Bombeiros",
        "texto_sidebar": "Sua segurança primeiro. Informe os fatos ao Corpo de Bombeiros (193).",
        "label_1": "Nome do Solicitante:",
        "dado_1": "Juliana Bonde",
        "label_2": "Tipo de Emergência:",
        "dado_2": "Incêndio (Cozinha).",
        "label_3": "Endereço Exato:",
        "dado_3": "Rua Padre Eustáquio, 975 – Padre Eustáquio, Belo Horizonte – MG, 30720-100",
        "label_4": "O que está queimando?",
        "dado_4": "Vazamento de gás no fogão. Chamas no botijão.",
        "label_5": "Há Pessoas no Local?",
        "dado_5": "Moro sozinha no apartamento 301.",
        "alerta_label": "Gravidade da Situação (Alto, Medio, Baixo):",
        "alerta_dado": "Alto."
    };

    // 4. PERSONA DEFESA CIVIL (Marcos)
    const dadosDefesaCivil = {
        "servico": "Defesa Civil (199)",
        "tema": "theme-defesa",
        "logo": "https://i.imgur.com/WvjLflB.png", 
        "titulo_sidebar": "Roteiro Defesa Civil",
        "texto_sidebar": "Priorize sua segurança e informe os detalhes ao atendente da Defesa Civil (199).",
        "label_1": "Nome do Solicitante:",
        "dado_1": "Marcos Oliveira",
        "label_2": "Tipo de Risco:",
        "dado_2": "Risco de Deslizamento / Desabamento.",
        "label_3": "Endereço do Risco:",
        "dado_3": "Rua Professor Moraes, 45 – Funcionários, Belo Horizonte – MG, 30150-370",
        "label_4": "Sinais Observados:",
        "dado_4": "Estalos na parede, grandes rachaduras. O barranco nos fundos está cedendo.",
        "label_5": "Pessoas no Local:",
        "dado_5": "3 pessoas (Eu, esposa e filho). Estamos saindo de casa agora.",
        "alerta_label": "Gravidade da Situação (Alto, Medio, Baixo):",
        "alerta_dado": "Médio."
    };

    

    
    const btnSamu = document.getElementById("btnSamu");
    const btnPolicia = document.getElementById("btnPolicia");
    const btnBombeiro = document.getElementById("btnBombeiro");
    const btnDefesaCivil = document.getElementById("btnDefesaCivil");
    const btnVoltar = document.getElementById("btnVoltar");

    
    const seletorServico = document.getElementById("seletorServico");
    const containerRoteiro = document.getElementById("containerRoteiro");

    
    const sidebarTitulo = document.getElementById("sidebar-titulo");
    const sidebarTexto = document.getElementById("sidebar-texto");
    const sidebarLogo = document.getElementById("sidebar-logo");

    const label1 = document.getElementById("label-1");
    const dado1 = document.getElementById("dado-1");
    const label2 = document.getElementById("label-2");
    const dado2 = document.getElementById("dado-2");
    const label3 = document.getElementById("label-3");
    const dado3 = document.getElementById("dado-3");
    const label4 = document.getElementById("label-4");
    const dado4 = document.getElementById("dado-4");
    const label5 = document.getElementById("label-5");
    const dado5 = document.getElementById("dado-5");

    const alertaLabel = document.getElementById("alerta-label");
    const alertaDado = document.getElementById("alerta-dado");


    

    /**
     *
     * @param {object} persona 
     */
    function exibirRoteiro(persona) {
       
        sidebarTitulo.textContent = persona.titulo_sidebar;
        sidebarTexto.textContent = persona.texto_sidebar;
        sidebarLogo.src = persona.logo;

        
        label1.textContent = persona.label_1;
        dado1.textContent = persona.dado_1;
        label2.textContent = persona.label_2;
        dado2.textContent = persona.dado_2;
        label3.textContent = persona.label_3;
        dado3.textContent = persona.dado_3;
        label4.textContent = persona.label_4;
        dado4.textContent = persona.dado_4;
        label5.textContent = persona.label_5;
        dado5.textContent = persona.dado_5;

        
        alertaLabel.textContent = persona.alerta_label;
        alertaDado.textContent = persona.alerta_dado;

        
        containerRoteiro.className = 'container-roteiro'; 
        containerRoteiro.classList.add(persona.tema);

       
        seletorServico.style.display = "none";
        containerRoteiro.style.display = "flex";
    }

    
    function voltarAoSeletor() {
        seletorServico.style.display = "block";
        containerRoteiro.style.display = "none";
    }

   

    
    btnSamu.addEventListener('click', () => exibirRoteiro(dadosSamu));
    btnPolicia.addEventListener('click', () => exibirRoteiro(dadosPolicia));
    btnBombeiro.addEventListener('click', () => exibirRoteiro(dadosBombeiro));
    btnDefesaCivil.addEventListener('click', () => exibirRoteiro(dadosDefesaCivil));

    btnVoltar.addEventListener('click', voltarAoSeletor);

});