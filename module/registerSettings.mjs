import { Calendar } from "./calendar/time.mjs";

export function registerNocSettings() {
    // calendrier par defaut
    let cal = new Calendar().setCurrentDate(1, 1, 1).toObject();
    
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
    });
    game.settings.register("noc", "calendar", {
        scope: 'world',
        config: false,
        type: Object,
        default: cal
    })

}
