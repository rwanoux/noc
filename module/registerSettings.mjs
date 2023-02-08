
export function registerNocSettings() {


    // setting pour Fiel et menace
    game.settings.register("noc", "compteurFiel", {
        scope: 'world',
        config: false,
        type: Object,
        default: {
            gouttes: 0,
            menace: 0,
            effetActif: {}

        }
    })
}
