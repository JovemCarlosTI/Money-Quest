async function loadEventos() {
    let jsonPath;

    // Verifica se está no ambiente local ou no GitHub Pages
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Caminho local
        jsonPath = 'data/eventos.json';
    } else {
        // Caminho no GitHub Pages
        jsonPath = '/Money-Quest/data/eventos.json';
    }

    try {
        const response = await fetch(jsonPath)
        const eventos = await response.json()

        return eventos
    } catch (err) {
        console.error(err)
    }
}

function chooseRandomEvent(eventos) {
    const randomIndex = Math.floor(Math.random() * eventos.length)
    return eventos[randomIndex]
}

export {
    loadEventos,
    chooseRandomEvent
}