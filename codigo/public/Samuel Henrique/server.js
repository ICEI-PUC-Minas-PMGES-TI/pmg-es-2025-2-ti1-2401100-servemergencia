const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); 

const app = express();
const PORT = 5000; 
const DENUNCIAS_FILE = path.join(__dirname, 'denuncias.json');

// --- HABILITAÇÃO DO CORS ---
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5501', 
    'http://localhost:5501'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    const msg = 'A política CORS para este site não permite acesso da Origem especificada.';
    return callback(new Error(msg), false);
  },
  methods: 'GET,POST',
  credentials: true
};

app.use(cors(corsOptions)); 

// --- Configurações do Middleware ---

app.use(express.static(__dirname)); 
app.use(bodyParser.json());

// Rota para redirecionar a raiz (/) para o arquivo segundapag.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'segundapag.html'));
});

// --- ROTA ADICIONADA: Busca Todas as Denúncias (para visualizar.html) ---

app.get('/api/denuncias', (req, res) => {
    if (!fs.existsSync(DENUNCIAS_FILE)) {
        return res.status(200).json([]); // Retorna array vazio
    }

    try {
        const data = fs.readFileSync(DENUNCIAS_FILE, 'utf8');
        
        if (data.trim().length > 0) {
            const denuncias = JSON.parse(data);
            if (Array.isArray(denuncias)) {
                return res.json(denuncias);
            } else {
                return res.json([]);
            }
        } else {
            return res.json([]); 
        }
    } catch (error) {
        console.error('Erro ao ler/enviar denuncias.json:', error);
        return res.status(500).json({ error: 'Erro interno ao processar dados.' });
    }
});

// --- Função Auxiliar para Manipulação de Arquivo ---

function salvarDenuncia(novaDenuncia) {
    let denuncias = []; 
    
    // 1. Tenta ler o arquivo de denúncias existente
    if (fs.existsSync(DENUNCIAS_FILE)) {
        try {
            const data = fs.readFileSync(DENUNCIAS_FILE, 'utf8');
            
            if (data.trim().length > 0) {
                 const parsedData = JSON.parse(data);
                 if (Array.isArray(parsedData)) {
                     denuncias = parsedData;
                 } else {
                     console.warn('Conteúdo de denuncias.json não é um Array. Reconstruindo array.');
                 }
            }
        } catch (error) {
            console.error('Erro de JSON.parse ou leitura do arquivo. Iniciando array vazio.', error.message);
        }
    }

    // 2. Cria um ID e adiciona timestamps
    const id = `DEN-${Date.now()}`;
    
    // 3. Adiciona a nova denúncia ao array
    denuncias.push({ 
        id_denuncia: id,
        data_hora_recebimento: new Date().toISOString(),
        ...novaDenuncia, 
        status: "Recebida"
    });

    // 4. Salva o array atualizado de volta no arquivo
    try {
        fs.writeFileSync(DENUNCIAS_FILE, JSON.stringify(denuncias, null, 2));
        console.log(`Denúncia ${id} salva com sucesso em ${DENUNCIAS_FILE}`);
        return id;
    } catch (error) {
        console.error('Erro ao salvar a denúncia no arquivo (Permissão/Escrita):', error);
        return null;
    }
}

// --- Rota de API para Receber a Denúncia (SALVAMENTO) ---

app.post('/api/denunciar', (req, res) => {
    const dadosDenuncia = req.body;

    if (!dadosDenuncia || !dadosDenuncia.tipo_denuncia) {
        return res.status(400).json({ success: false, message: 'Dados da denúncia inválidos (Tipo de Denúncia é obrigatório).' });
    }

    const idGerado = salvarDenuncia(dadosDenuncia);

    if (idGerado) {
        res.status(201).json({ 
            success: true, 
            message: 'Denúncia cadastrada com sucesso!',
            id: idGerado
        });
    } else {
        res.status(500).json({ success: false, message: 'Erro interno ao salvar a denúncia no arquivo.' });
    }
});

// --- Iniciar o Servidor ---

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse o formulário em: http://localhost:${PORT}/`); 
});