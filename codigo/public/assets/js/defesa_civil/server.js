const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Caminho absoluto do arquivo JSON
const DENUNCIAS_FILE = path.join(__dirname, 'denuncias.json');

// ----------------------
// CONFIGURAÇÃO DO CORS
// ----------------------
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:5501',
    'http://localhost:5501'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Origem não autorizada pelo CORS.'), false);
    },
    methods: 'GET,POST',
    credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.static(__dirname));

// -------------------------
// ROTA PRINCIPAL (formulário)
// -------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'segundapag.html'));
});

// ---------------------------
// ROTA PARA LISTAR DENÚNCIAS
// ---------------------------
app.get('/api/denuncias', (req, res) => {

    // Se o arquivo não existir → retorna lista vazia
    if (!fs.existsSync(DENUNCIAS_FILE)) {
        return res.json([]);
    }

    try {
        const data = fs.readFileSync(DENUNCIAS_FILE, 'utf8');

        if (!data.trim()) {
            return res.json([]); // JSON vazio
        }

        const denuncias = JSON.parse(data);

        if (!Array.isArray(denuncias)) {
            console.warn("Arquivo não contém um array. Retornando vazio.");
            return res.json([]);
        }

        return res.json(denuncias);

    } catch (error) {
        console.error("Erro ao ler denuncias.json:", error);
        return res.status(500).json({ error: "Erro ao processar dados." });
    }
});

// ---------------------------
// FUNÇÃO PARA SALVAR DENÚNCIA
// ---------------------------
function salvarDenuncia(nova) {

    let denuncias = [];

    // Lê o arquivo se existir
    if (fs.existsSync(DENUNCIAS_FILE)) {
        try {
            const data = fs.readFileSync(DENUNCIAS_FILE, 'utf8');

            if (data.trim().length > 0) {
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    denuncias = parsed;
                } else {
                    console.warn("denuncias.json não era um array. Será recriado.");
                }
            }

        } catch (error) {
            console.error("Erro ao ler / parsear JSON:", error.message);
        }
    }

    // Gera ID único
    const id = `DEN-${Date.now()}`;

    // Cria o objeto final
    const novaDenuncia = {
        id_denuncia: id,
        data_hora_recebimento: new Date().toISOString(),
        ...nova,
        status: "Recebida"
    };

    denuncias.push(novaDenuncia);

    // Salva no arquivo
    try {
        fs.writeFileSync(DENUNCIAS_FILE, JSON.stringify(denuncias, null, 2));
        console.log(`Denúncia salva com sucesso: ${id}`);
        return id;
    } catch (error) {
        console.error("Erro ao salvar JSON:", error);
        return null;
    }
}

// ---------------------------
// ROTA PARA CADASTRAR DENÚNCIA
// ---------------------------
app.post('/api/denunciar', (req, res) => {
    const dados = req.body;

    if (!dados || !dados.tipo_denuncia) {
        return res.status(400).json({
            success: false,
            message: "Tipo de denúncia é obrigatório."
        });
    }

    const id = salvarDenuncia(dados);

    if (!id) {
        return res.status(500).json({
            success: false,
            message: "Erro ao salvar denúncia."
        });
    }

    return res.status(201).json({
        success: true,
        message: "Denúncia cadastrada com sucesso!",
        id
    });
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
