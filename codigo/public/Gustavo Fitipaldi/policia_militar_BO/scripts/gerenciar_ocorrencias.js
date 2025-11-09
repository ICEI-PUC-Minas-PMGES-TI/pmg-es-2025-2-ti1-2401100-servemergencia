document.addEventListener('DOMContentLoaded', () => {

    const apiURL = "http://localhost:3000/boletins";
    const tableBody = document.getElementById('boletins-lista');

    const modal = document.getElementById('modal-confirmacao');
    const modalBtnConfirmar = document.getElementById('modal-btn-confirmar');
    const modalBtnCancelar = document.getElementById('modal-btn-cancelar');

    let idParaExcluir = null;

    function formatarData(dataHora) {
        const data = new Date(dataHora);
        return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    }

    function formatarTipo(tipo) {
        const tiposMap = {
            'furto': 'Furto',
            'roubo': 'Roubo',
            'acidente_transito': 'Acidente (sem vítima)',
            'perda_documentos': 'Perda de Documentos',
            'ameaca': 'Ameaça',
            'outro': 'Outro'
        };
        return tiposMap[tipo] || tipo;
    }

    function createStatusSelect(currentStatus, id) {
        const allStatus = ['Aberto', 'Pendente', 'Em Análise', 'Resolvido'];
        const optionsHTML = allStatus.map(status =>
            `<option value="${status}" ${status === currentStatus ? 'selected' : ''}>
                ${status}
            </option>`
        ).join('');

        return `<select class="status-select" data-id="${id}">${optionsHTML}</select>`;
    }

    async function loadBoletins() {
        try {
            const response = await fetch(apiURL);
            if (!response.ok) throw new Error('Falha ao buscar dados da API');

            const boletins = await response.json();
            tableBody.innerHTML = '';

            if (boletins.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="6">Nenhum boletim registrado.</td></tr>`;
                return;
            }

            boletins.forEach(bo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${bo.id}</td>
                    <td>${formatarTipo(bo['tipo-ocorrencia'])}</td>
                    <td>${formatarData(bo['data-hora'])}</td>
                    
                    <td>${bo['endereco-fato']}</td> 
                    
                    <td>${createStatusSelect(bo.status, bo.id)}</td>
                    
                    <td class="actions-cell">
                        <button class="btn-delete" data-id="${bo.id}">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

        } catch (error) {
            console.error("❌ Erro ao carregar boletins:", error);
            tableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar ocorrências.</td></tr>`;
        }
    }


    async function updateStatus(id, newStatus) {
        try {
            const response = await fetch(`${apiURL}/${id}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) throw new Error('Falha ao atualizar status');
            console.log(`Status do B.O. ${id} atualizado para ${newStatus}`);
        } catch (error) {
            console.error("❌ Erro ao atualizar status:", error);
            alert('❌ Erro ao salvar a alteração.');
        }
    }


    async function deleteBoletim(id) {
        try {
            const response = await fetch(`${apiURL}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Falha ao excluir boletim');

            console.log(`B.O. ${id} excluído com sucesso.`);

            loadBoletins();

        } catch (error) {
            console.error("❌ Erro ao excluir boletim:", error);
            alert('❌ Erro ao excluir o registro.');
        }
    }

    function showModal(id) {
        idParaExcluir = id;
        modal.classList.remove('hidden');
    }

    function hideModal() {
        idParaExcluir = null;
        modal.classList.add('hidden');
    }


    tableBody.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('btn-delete')) {
            const id = target.dataset.id;
            showModal(id);
        }

        if (target.classList.contains('btn-details')) {
            event.preventDefault(); 
            const id = target.dataset.id;
            alert(`Implementar "Ver Detalhes" para o ID: ${id}`);

        }
    });

    tableBody.addEventListener('change', (event) => {
        if (event.target.classList.contains('status-select')) {
            const id = event.target.dataset.id;
            const newStatus = event.target.value;
            updateStatus(id, newStatus);
        }
    });



    modalBtnConfirmar.addEventListener('click', () => {
        if (idParaExcluir) {
            deleteBoletim(idParaExcluir);
        }
        hideModal();
    });

    modalBtnCancelar.addEventListener('click', () => {
        hideModal();
    });

    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            hideModal();
        }
    });

    loadBoletins();

});