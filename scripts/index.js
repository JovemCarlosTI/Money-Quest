import { loadEventos, chooseRandomEvent } from './eventosRepository.js'

// Configurações inicias do jogo
const eventos = await loadEventos()
window.sessionStorage.setItem('saldo', 300)
window.sessionStorage.setItem('rodada', 0)
window.sessionStorage.setItem('efeitos', JSON.stringify([]))
window.sessionStorage.setItem('podeAvancar', JSON.stringify(false))

// Escolhe um evento da lista e o configura para uso
function startNewEvent() {
    const evento = chooseRandomEvent(eventos)
    // TODO: Checar se o evento já foi escolhido antes
    renderEvent(evento)
    window.sessionStorage.setItem('alternativas', JSON.stringify(evento.alternativas))
}

// Função auxiliar de RenderEvent, organiza visualmente o evento (útil para quando for adaptar pro visual novo)
function renderEvent(evento) {
    document.getElementById('problema-personagem').textContent = evento.personagem
    document.getElementById('problema-texto').textContent = evento.texto

    if(evento.tipo == 'problema') {
        window.sessionStorage.setItem('podeAvancar', JSON.stringify(false))
        evento.alternativas.forEach(alternativa => {
            const botao = document.querySelector(`[data-alternativa=${alternativa.letra}]`)
            botao.classList.remove('hidden')
            botao.textContent = `${alternativa.letra.toUpperCase()}) ${alternativa.texto}`
        })
    } else {
        window.sessionStorage.setItem('podeAvancar', JSON.stringify(true))
        const botoes = document.querySelectorAll('.alternativa')
        botoes.forEach(botao => botao.classList.add('hidden'))

        if (evento.feedback.efeito) startFeedbackEffect(evento.feedback.efeito)
        renderFeedback(evento.feedback)
    }
}

// Escolhe o feedback (reação) aleatório de acordo com a alternativa marcada
const chooseEventFeedback = (alternativaMarcada, alternativas) => {
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

    // Algumas consequências não mudam o saldo, nesse caso, não tem efeito
    if (feedbackEscolhido.efeito) startFeedbackEffect(feedbackEscolhido.efeito)
    renderFeedback(feedbackEscolhido)
    window.sessionStorage.setItem('podeAvancar', JSON.stringify(true))
}

function startFeedbackEffect(feedback) {
    const efeitosAtuais = JSON.parse(window.sessionStorage.getItem('efeitos'))
    efeitosAtuais.push(feedback)
    window.sessionStorage.setItem('efeitos', JSON.stringify(efeitosAtuais))
}

// Função auxiliar de chooseEventFeedback, organiza visualmente o feedback (útil para quando for adaptar pro visual novo)
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

// Avança o round, executando os efeitos pendentes e iniciando novo evento (ex: -100 por 2 rodadas, descontando o valor e diminuindo para 1 rodada pendente)
function startNextRound() {
    const rodadaAtual = Number(window.sessionStorage.getItem('rodada'))

    if (rodadaAtual == 0) {
        window.sessionStorage.setItem('rodada', rodadaAtual + 1)
        startNewEvent()
        return
    }

    if (!JSON.parse(window.sessionStorage.getItem('podeAvancar'))) return

    const saldo = Number(window.sessionStorage.getItem('saldo'))
    const efeitos = JSON.parse(window.sessionStorage.getItem('efeitos'))

    let saldoAtualizado = saldo

    // Executa eventos pendentes, salvando o índice daqueles que serão removidos por acabarem
    let indexEffectsToRemove = []
    for(let i = 0; i < efeitos.length; i++) {
        saldoAtualizado += efeitos[i].dinheiro
        efeitos[i].rodadas -= 1

        if(efeitos[i].rodadas === 0) indexEffectsToRemove.push(i)
    }
    indexEffectsToRemove.forEach(index => efeitos.splice(index, 1))

    window.sessionStorage.setItem('saldo', saldoAtualizado)
    window.sessionStorage.setItem('efeitos', JSON.stringify(efeitos))
    window.sessionStorage.setItem('rodada', rodadaAtual + 1)

    startNewEvent()
}

export {
    chooseEventFeedback,
    startNextRound
}