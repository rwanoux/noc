
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
    // setting pour Fiel et menace
    game.settings.register("noc", "displayDroplet", {
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        name: "afficher l'effet goutte de Fiel",
        hint: "Lorsque qu'une goutte de Fiel est ajoutée au compteur de menace, un effet de goutte sera affiché.",
    })

}
