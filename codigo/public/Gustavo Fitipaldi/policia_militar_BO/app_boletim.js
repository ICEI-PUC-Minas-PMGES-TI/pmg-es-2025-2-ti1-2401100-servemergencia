document.addEventListener('DOMContentLoaded', () => {

    const apiURL = "http://localhost:3000/boletins";
    
    const boForm = document.getElementById('bo-form');

    boForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 

        const formData = new FormData(boForm);
        const novoBoletim = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(apiURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novoBoletim)
            });

            if (response.ok) {
                alert('Boletim de Ocorrência registrado com sucesso!');
                boForm.reset(); // Limpa o formulário
            } else {
                throw new Error(`Erro na API: ${response.statusText}`);
            }

        } catch (error) {
            console.error("❌ Erro ao registrar boletim:", error);
            alert("❌ Erro na comunicação com o servidor.\nVerifique se o JSON Server está rodando no terminal.");
        }
    });

});
