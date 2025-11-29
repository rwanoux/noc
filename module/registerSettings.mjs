
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
    // setting pour Fiel et menace
    game.settings.register("noc", "displayMecanisme", {
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true,
        name: "afficher un effet de mécanisme ",
        hint: "Lorsque que l'utilisateur se connecte un effet de mecanisme est affiché avant que l'utilisateur ne puisse utiliser l'interface",
    })

}
