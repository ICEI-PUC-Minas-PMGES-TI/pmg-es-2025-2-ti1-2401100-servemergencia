const apiURL = "http://localhost:3000/contatos";
let contatoSelecionadoId = null;

// Carregar contatos na inicialização (sem termo, carrega tudo)
window.onload = carregarContatos;

async function carregarContatos(termoPesquisa = '') {
  try {
    let url = apiURL;
    
    // Filtra PARCIALMENTE se houver termo, usando o termo já em minúsculas
    if (termoPesquisa) {
        // Isso fará a busca relacionada (contém o termo)
        url = `${apiURL}?nome_like=${termoPesquisa}`; 
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contatos = await response.json();
    atualizarTabela(contatos);
  } catch (error) {
    console.error("❌ Erro ao carregar contatos:", error);
    alert("❌ Erro na comunicação com o servidor. Verifique se o JSON Server está rodando.");
  }
}

function atualizarTabela(contatos) {
  const tbody = document.querySelector("#tabelaContatos tbody");
  tbody.innerHTML = "";
  
  if (contatos.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="4" style="text-align: center;">Nenhum contato encontrado.</td>`;
      tbody.appendChild(tr);
      return;
  }
  
  contatos.forEach(contato => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${contato.nome}</td>
      <td>${contato.telefone}</td>
      <td>${contato.relacao}</td>
      <td>${contato.disponibilidade}</td>
    `;
    tr.onclick = (event) => selecionarContato(contato, event);
    tbody.appendChild(tr);
  });
}

function limparFormulario() {
  document.querySelector("#contatoForm").reset();
  contatoSelecionadoId = null;
  
  const campoPesquisa = document.querySelector("#campoPesquisa");
  if (campoPesquisa) { 
      campoPesquisa.value = '';
  }

  document.querySelectorAll("#tabelaContatos tbody tr").forEach(tr => {
      tr.classList.remove('selecionado');
  });
}

// --- Funções de CRUD ---

document.querySelector("#inserir").addEventListener("click", async (e) => {
  e.preventDefault(); 
  
  const contato = obterDadosFormulario();
  if (!contato.nome || !contato.telefone) {
    alert("⚠️ Preencha os campos obrigatórios!");
    return;
  }
  
  // Salva o nome em minúsculas
  contato.nome = contato.nome.toLowerCase();

  await fetch(apiURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contato)
  });
  
  limparFormulario();
  carregarContatos();
});

document.querySelector("#alterar").addEventListener("click", async (e) => {
  e.preventDefault(); 
  
  if (!contatoSelecionadoId) {
    alert("⚠️ Selecione um contato para alterar!");
    return;
  }
  
  const contato = obterDadosFormulario();

  // Salva o nome em minúsculas
  contato.nome = contato.nome.toLowerCase();
  
  if (!confirm(`Confirma a alteração dos dados do contato ID ${contatoSelecionadoId}?`)) {
      return;
  }

  await fetch(`${apiURL}/${contatoSelecionadoId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(contato)
  });
  
  limparFormulario();
  carregarContatos();
});

document.querySelector("#excluir").addEventListener("click", async (e) => {
  e.preventDefault(); 
  
  if (!contatoSelecionadoId) {
    alert("⚠️ Selecione um contato para excluir!");
    return;
  }
  
  if (!confirm("Tem certeza que deseja excluir este contato?")) {
      return;
  }
  
  await fetch(`${apiURL}/${contatoSelecionadoId}`, { method: "DELETE" });
  
  limparFormulario();
  carregarContatos();
});

document.querySelector("#limpar").addEventListener("click", () => {
    limparFormulario();
    carregarContatos(); 
});


// --- Lógica de Pesquisa ---

document.querySelector("#pesquisarBtn").addEventListener("click", (e) => {
    e.preventDefault();
    
    const termoDigitado = document.querySelector("#campoPesquisa").value.trim();
    
    if (termoDigitado) {
        // Converte o termo de busca para minúsculas antes de buscar
        const termoBuscaEmMinusculas = termoDigitado.toLowerCase(); 
        // AQUI: Chama a função para FILTRAR a tabela, mostrando SÓ os resultados
        carregarContatos(termoBuscaEmMinusculas);
    } else {
        // Se o campo de busca estiver vazio, recarrega a lista completa
        carregarContatos(); 
    }
});


// --- Funções Auxiliares ---

function selecionarContato(contato, event) {
  document.querySelectorAll("#tabelaContatos tbody tr").forEach(tr => {
      tr.classList.remove('selecionado');
  });
  const linhaClicada = event.currentTarget;
  linhaClicada.classList.add('selecionado');
  contatoSelecionadoId = contato.id;
  
  // Preenche os campos do formulário (o nome virá em minúsculas)
  document.querySelector("#nome").value = contato.nome; 
  document.querySelector("#telefone").value = contato.telefone;
  document.querySelector("#relacao").value = contato.relacao;
  document.querySelector("#endereco").value = contato.endereco;
  document.querySelector("#local").value = contato.local;
  document.querySelector("#disponibilidade").value = contato.disponibilidade;
}

function obterDadosFormulario() {
  return {
    nome: document.querySelector("#nome").value.trim(),
    telefone: document.querySelector("#telefone").value.trim(),
    relacao: document.querySelector("#relacao").value.trim(),
    endereco: document.querySelector("#endereco").value.trim(),
    local: document.querySelector("#local").value.trim(),
    disponibilidade: document.querySelector("#disponibilidade").value.trim()
  };
}