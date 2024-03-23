import { loadEventos, chooseRandomEvent } from './eventosRepository.js'

const eventos = await loadEventos()

function startNewEvent() {
    const evento = chooseRandomEvent(eventos)
    // Checar se o evento já foi escolhido antes
    renderEvent(evento)
    window.sessionStorage.setItem('alternativas', JSON.stringify(evento.alternativas))
}

function renderEvent(evento) {
    document.getElementById('problema-personagem').textContent = evento.personagem
    document.getElementById('problema-texto').textContent = evento.problema

    evento.alternativas.forEach(alternativa => {
        const botao = document.querySelector(`[data-alternativa=${alternativa.letra}]`)
        botao.textContent = `${alternativa.letra.toUpperCase()}) ${alternativa.texto}`
    })
}

const runEventFeedback = (alternativaMarcada, alternativas) => {
    console.log(alternativaMarcada)
    const feedbacks = alternativas.find(alternativa => alternativa.letra === alternativaMarcada).feedbacks

    let probabilidadeAcumulada = 0
    const probabilidadeSorteada = Math.random()
    let feedbackEscolhido

    for (let i = 0; i < feedbacks.length; i++) {
        probabilidadeAcumulada += feedbacks[i].probabilidade
        if (probabilidadeSorteada <= probabilidadeAcumulada) {
            feedbackEscolhido = feedbacks[i]
            break
        }
    }

    renderFeedback(feedbackEscolhido)
}

function renderFeedback(feedback) {
    const feedbackView = document.getElementById('feedback')
    let feedbackHTML = `<div>
        <p>${feedback.texto}</p>
        ${feedback.efeito ? (
            feedback.efeito.dinheiro > 0
                ? `Você ganhou R$ ${feedback.efeito.dinheiro} por ${feedback.efeito.rodadas > 1 ? feedback.efeito.rodadas + ' rodadas' : '1 rodada'}`
                : `Você perdeu R$ ${Math.abs(feedback.efeito.dinheiro)}  por ${feedback.efeito.rodadas > 1 ? feedback.efeito.rodadas + ' rodadas' : '1 rodada'}`
        ) : 'Nem perdeu, nem ganhou!'}`

    feedbackView.innerHTML = feedbackHTML
}

export {
    runEventFeedback
}

startNewEvent()