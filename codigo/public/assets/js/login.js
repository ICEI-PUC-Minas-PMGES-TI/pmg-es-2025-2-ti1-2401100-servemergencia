
const LOGIN_URL = "/codigo/public/modulos/home_page/login.html";
var RETURN_URL = "/codigo/public/index.html";
const API_URL = 'http://localhost:3000/usuarios';

// Objeto para o banco de dados de usuários baseado em JSON
var db_usuarios = {};

// Objeto para o usuário corrente
var usuarioCorrente = {};

// Inicializa a aplicação de Login
function initLoginApp() {
    let pagina = window.location.pathname;

    // CORREÇÃO: Verifica se NÃO estamos na página de login usando includes
    // Isso evita erros se o caminho das pastas for diferente
    if (!pagina.includes('login.html')) {
        // Estamos em uma página interna, salva ela para voltar depois
        sessionStorage.setItem('returnURL', pagina);
        RETURN_URL = pagina;

        // Lógica de verificar usuário logado...
        var usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        } else {
            // Se não tem usuário, manda pro login
            window.location.href = LOGIN_URL;
        }

        document.addEventListener('DOMContentLoaded', function () {
            showUserInfo('userInfo');
            atualizarBotaoCabecalho();
        });
    } else {
        // Estamos na página de LOGIN

        // Tenta recuperar para onde ir, mas se for nulo OU se for a própria login, manda pra home
        let returnURL = sessionStorage.getItem('returnURL');

        // CORREÇÃO: Evita loop infinito se a returnURL for o próprio login
        if (!returnURL || returnURL.includes('login.html')) {
            RETURN_URL = "/codigo/public/index.html"; // Força a home page
        } else {
            RETURN_URL = returnURL;
        }

        // Inicializa banco de dados
        carregarUsuarios(() => {
            console.log('Usuários carregados...');
        });
    }
};


function carregarUsuarios(callback) {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            db_usuarios = data;
            callback()
        })
        .catch(error => {
            console.error('Erro ao ler usuários via API JSONServer:', error);
            displayMessage("Erro ao ler usuários");
        });
}

// Verifica se o login do usuário está ok e, se positivo, direciona para a página inicial
function loginUser(login, senha) {

    // Verifica todos os itens do banco de dados de usuarios 
    // para localizar o usuário informado no formulario de login
    for (var i = 0; i < db_usuarios.length; i++) {
        var usuario = db_usuarios[i];

        // Se encontrou login, carrega usuário corrente e salva no Session Storage
        if (login == usuario.login && senha == usuario.senha) {
            usuarioCorrente.id = usuario.id;
            usuarioCorrente.login = usuario.login;
            usuarioCorrente.email = usuario.email;
            usuarioCorrente.nome = usuario.nome;

            // Salva os dados do usuário corrente no Session Storage, mas antes converte para string
            sessionStorage.setItem('usuarioCorrente', JSON.stringify(usuarioCorrente));

            // Retorna true para usuário encontrado
            return true;
        }
    }

    // Se chegou até aqui é por que não encontrou o usuário e retorna falso
    return false;
}

// Apaga os dados do usuário corrente no sessionStorage
function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location = LOGIN_URL;
}

function addUser(nome, login, senha, email) {

    // Cria um objeto de usuario para o novo usuario 
    let usuario = { "login": login, "senha": senha, "nome": nome, "email": email };

    // Envia dados do novo usuário para ser inserido no JSON Server
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),
    })
        .then(response => response.json())
        .then(data => {
            // Adiciona o novo usuário na variável db_usuarios em memória
            db_usuarios.push(usuario);
            displayMessage("Usuário inserido com sucesso");
        })
        .catch(error => {
            console.error('Erro ao inserir usuário via API JSONServer:', error);
            displayMessage("Erro ao inserir usuário");
        });
}

function showUserInfo(element) {
    var elemUser = document.getElementById(element);
    if (elemUser) {
        elemUser.innerHTML = `${usuarioCorrente.nome} (${usuarioCorrente.login}) 
                    <a onclick="logoutUser()">❌</a>`;
    }
}

// Inicializa as estruturas utilizadas pelo LoginApp
initLoginApp();


// Declara uma função para processar o formulário de login
function processaFormLogin(event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    resultadoLogin = loginUser(username, password);

    if (resultadoLogin) {
        // LOG PARA DEBUG
        console.log("Login Sucesso! Redirecionando para:", RETURN_URL);

        window.location.href = RETURN_URL;
    } else {
        alert('Usuário ou senha incorretos');
    }
}

function salvaLogin(event) {
    // Cancela a submissão do formulário para tratar sem fazer refresh da tela
    event.preventDefault();

    // Obtem os dados do formulário
    let login = document.getElementById('txt_login').value;
    let nome = document.getElementById('txt_nome').value;
    let email = document.getElementById('txt_email').value;
    let senha = document.getElementById('txt_senha').value;
    let senha2 = document.getElementById('txt_senha2').value;
    if (senha != senha2) {
        alert('As senhas informadas não conferem.');
        return
    }

    // Adiciona o usuário no banco de dados
    addUser(nome, login, senha, email);
    alert('Usuário salvo com sucesso. Proceda com o login para ');

    // Oculta a div modal do login
    //document.getElementById ('loginModal').style.display = 'none';
    $('#loginModal').modal('hide');
}

// Associa a funçao processaFormLogin  formulário adicionado um manipulador do evento submit
document.getElementById('login-form').addEventListener('submit', processaFormLogin);


// Associar salvamento ao botao
document.getElementById('btn_salvar').addEventListener('click', salvaLogin);        

function atualizarBotaoCabecalho() {
    var usuarioLogado = sessionStorage.getItem('usuarioCorrente');
    var btnLogin = document.getElementById('btn-login-header');

    if (btnLogin && usuarioLogado) {
        var usuario = JSON.parse(usuarioLogado);

        btnLogin.innerHTML = `<span>👤</span> ${usuario.login}`; 
        
        btnLogin.href = "#"; 

        btnLogin.onclick = function (event) {
            event.preventDefault(); // Evita navegar
            
            if (confirm("Olá " + usuario.nome + ", deseja sair da sua conta?")) {
                logoutUser(); // Chama sua função de logout existente
            }
        };
        
        btnLogin.classList.add('usuario-logado');
    }
}