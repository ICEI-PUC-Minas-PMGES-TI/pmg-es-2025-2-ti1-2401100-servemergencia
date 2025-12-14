const perguntas = document.querySelectorAll(".faq-pergunta");

perguntas.forEach((pergunta) => {
    pergunta.addEventListener("click", () => {
        const item = pergunta.parentElement;

        item.classList.toggle("ativo");

        const resposta = item.querySelector(".faq-resposta");
        
        if (item.classList.contains("ativo")) {
            resposta.style.maxHeight = resposta.scrollHeight + "px";
        } else {
            resposta.style.maxHeight = 0;
        }

        perguntas.forEach((outraPergunta) => {
            const outroItem = outraPergunta.parentElement;
            if (outroItem !== item && outroItem.classList.contains("ativo")) {
                outroItem.classList.remove("ativo");
                outroItem.querySelector(".faq-resposta").style.maxHeight = 0;
            }
        });
    });
});