
export function registerNocSettings() {

    // version de la conversion des archétypes et thèmes déjà appliquée au monde
    game.settings.register("noc", "migrationJetons", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationArmes", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationArmures", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationAutres", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationCreatures", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationQualites", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })
    game.settings.register("noc", "migrationArchetypes", {
        scope: 'world',
        config: false,
        type: Number,
        default: 0
    })


    // setting pour Fiel et menace
    // bibliothèque des effets de Fiel (vide = liste par défaut)
    game.settings.register("noc", "bibliothequeFiel", {
        scope: 'world',
        config: false,
        type: Array,
        default: []
    })
    game.settings.register("noc", "compteurFiel", {
        scope: 'world',
        config: false,
        type: Object,
        // les effets de Fiel actifs modifient les talents : on recalcule les acteurs
        onChange: () => {
            for (const actor of game.actors ?? []) {
                actor.reset();
                if (actor.sheet?.rendered) actor.sheet.render(false);
            }
        },
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
