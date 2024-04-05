import { loadEventos, chooseRandomEvent } from './eventosRepository.js'

// Configurações inicias do jogo
const eventos = await loadEventos()
window.sessionStorage.setItem('saldo', 300)
window.sessionStorage.setItem('rodada', 0)
window.sessionStorage.setItem('mes', 0)
window.sessionStorage.setItem('efeitos', JSON.stringify([]))
window.sessionStorage.setItem('podeAvancar', JSON.stringify(false))
window.sessionStorage.setItem('eventosExecutados', JSON.stringify([]))

const PERSONAGENS_URL = {
    "pai": "./assets/images/characters/marcelo.png",
    "mae": "#",
    "filho": "./assets/images/characters/bruno.png",
    "filha": "./assets/images/characters/leticia.png"
}

// Escolhe um evento da lista e o configura para uso
function startNewEvent() {
    const evento = chooseRandomEvent(eventos)
    if (eventWasExecutedBefore(evento)) {
        if (!JSON.parse(window.sessionStorage.getItem('eventosExecutados')).length !== eventos.length) {
            startNewEvent()
            return
        } else {
            alert('Você já jogou todas as possibilidades! Recarregue a página para jogar novamente!')
            return
        }
    }

    addToExecutedEvents(evento)
    eraseFeedback()
    renderEvent(evento)
    window.sessionStorage.setItem('alternativas', JSON.stringify(evento.alternativas))


}

function addToExecutedEvents(evento) {
    const eventosExecutados = JSON.parse(window.sessionStorage.getItem('eventosExecutados'))
    eventosExecutados.push(evento.id)
    window.sessionStorage.setItem('eventosExecutados', JSON.stringify(eventosExecutados))
}

function eventWasExecutedBefore(evento) {
    const eventosExecutados = JSON.parse(window.sessionStorage.getItem('eventosExecutados'))
    return eventosExecutados.includes(evento.id)
}

function eraseRenderedEvent() {
    if (document.getElementsByClassName('box').length > 0) {
        document.getElementsByClassName('box')[0].style = "display: none"
        document.body.classList.remove('blur-background')
    } else {
        document.getElementById('problema').style = "display: none"
    }

    // Retirar no futuro, usando apenas para visualização em index.html
    document.getElementById('problema-personagem').textContent = ''
    eraseCharacter()

    document.getElementById('problema-texto').textContent = ''
    const botoes = document.querySelectorAll('.alternativa')
    botoes.forEach(botao => botao.style = "display: none")

}

// Função auxiliar de RenderEvent, organiza visualmente o evento (útil para quando for adaptar pro visual novo)
function renderEvent(evento) {
    if (document.getElementsByClassName('box').length > 0) document.body.classList.add('blur-background')

    document.getElementById('problema').style = "display: flex"
    document.getElementById('problema-personagem').textContent = evento.personagem
    document.getElementById('problema-texto').textContent = evento.texto
    
    if(evento.tipo == 'problema') {
        window.sessionStorage.setItem('podeAvancar', JSON.stringify(false))
        document.getElementById('btn-next-round').style = "display: none"
        renderCharacter(evento.personagem)
        evento.alternativas.forEach(alternativa => {
            const botao = document.querySelector(`[data-alternativa=${alternativa.letra}]`)
            botao.style = "display: flex"
            botao.textContent = `${alternativa.letra.toUpperCase()}) ${alternativa.texto}`
        })
    } else {
        window.sessionStorage.setItem('podeAvancar', JSON.stringify(true))
        document.getElementById('btn-next-round').style = "display: flex"
        const botoes = document.querySelectorAll('.alternativa')
        botoes.forEach(botao => botao.style = "display: none")

        if (evento.feedback.efeito) startFeedbackEffect(evento.feedback.efeito)
        renderFeedback(evento.feedback)
    }
}

function renderCharacter(personagem) {
    if(personagem == 'mae') return // Temporário, enquanto não temos imagem da mãe
    const personagemImg = document.getElementById('personagem_destaque')
    personagemImg.src = PERSONAGENS_URL[personagem]
    personagemImg.alt = `Imagem do(a) ${personagem}`
    personagemImg.style = "display: flex"
}

function eraseCharacter() {
    const personagemImg = document.getElementById('personagem_destaque')
    personagemImg.src = ''
    personagemImg.alt = ''
    personagemImg.style = "display: none"
}

// Escolhe o feedback (reação) aleatório de acordo com a alternativa marcada
const chooseEventFeedback = (alternativaMarcada, alternativas) => {
    if (JSON.parse(window.sessionStorage.getItem('podeAvancar'))) return
    const feedbacks = alternativas.find(alternativa => alternativa.letra === alternativaMarcada).feedbacks

    highlightBtnAlternativas(alternativaMarcada)

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
    document.getElementById('btn-next-round').style = "display: flex"
    window.sessionStorage.setItem('podeAvancar', JSON.stringify(true))
}

function highlightBtnAlternativas(alternativaMarcada) {
    document.querySelector(`[data-alternativa=${alternativaMarcada}]`).classList.add('marcada')

    const botoes = document.querySelectorAll('.alternativa')
    botoes.forEach(botao => {
        if (botao.dataset.alternativa !== alternativaMarcada) {
            botao.classList.add('desmarcada')
            botao.disabled = true
        }
    })
}

function resetBtnAlternativas() {
    const botoes = document.querySelectorAll('.alternativa')
    botoes.forEach(botao => {
        botao.classList.remove('marcada')
        botao.classList.remove('desmarcada')
        botao.disabled = false
    })
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

function renderGameVariables() {
    const mes = document.getElementById('mes')
    const rodada = document.getElementById('rodada')
    const saldo = document.getElementById('saldo')

    let mesHTML = 'Mês: ' + Number(window.sessionStorage.getItem('mes'))
    let rodadaHTML = 'Rodada: ' + Number(window.sessionStorage.getItem('rodada'))
    let saldoHTML = `R$ ${parseFloat(window.sessionStorage.getItem('saldo')).toFixed(2).replace('.', ',')}`

    mes.innerHTML = mesHTML
    saldo.innerHTML = saldoHTML
    rodada.innerHTML = rodadaHTML
}

// Avança o round, executando os efeitos pendentes e iniciando novo evento (ex: -100 por 2 rodadas, descontando o valor e diminuindo para 1 rodada pendente)
function startNextRound() {
    eraseRenderedEvent()
    resetBtnAlternativas()

    const rodadaAtual = Number(window.sessionStorage.getItem('rodada'))

    if (rodadaAtual == 0) {
        window.sessionStorage.setItem('rodada', rodadaAtual + 1)
        window.sessionStorage.setItem('mes', Math.trunc(rodadaAtual/10) + 1)
        renderGameVariables()
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
    window.sessionStorage.setItem('mes',  Math.trunc(rodadaAtual/10) + 1)

    renderGameVariables()

    setTimeout(() => {
        startNewEvent()
    }, Math.random() * 5000)

}

function eraseFeedback() {
    const feedbackView = document.getElementById('feedback')
    feedbackView.innerHTML = ''
}

export {
    chooseEventFeedback,
    startNextRound
}
