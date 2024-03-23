async function loadEventos() {
    const response = await fetch('../data/eventos.json')
    const eventos = await response.json()

    return eventos
}

function chooseRandomEvent(eventos) {
    const randomIndex = Math.floor(Math.random() * eventos.length)
    return eventos[randomIndex]
}

export {
    loadEventos,
    chooseRandomEvent
}