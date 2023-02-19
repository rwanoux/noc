export class Quality {
    constructor(actorId) {
        this.targetTalent = "";
        this.talentPath = ""
        this.label = "";
        this.actorId = actorId;
        this.isDefault = false;
        this.effect;
    }

    async getActor() {
        return await Actor.get(this.actorId)
    }

    async creationDialog() {

        let creationData = {
            talents: game.system.Actor.templates.talents.talents,
            actor: await this.getActor()
        };
        let content = await renderTemplate('systems/noc/templates/window_app/dialog-quality.hbs', creationData)
        let buttons = {
            create: {
                icon: '<i class="fas fa-check"></i>',
                label: "ajouter la qualité/le défaut",
                callback: () => {
                    console.log(content)
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }
        }

        let d = new Dialog({
            title: "definir une qualité",
            content: content,
            buttons: buttons,
            default: "cancel"
        });
        d.render(true);
    }

    async createEffect() {
        this.effect = {
            label: `qualité : ${this.label}`,
            changes: [{
                "key": this.talentPath,
                "value": this.isDefaut ? -1 : 1,
                "priority": 20,
                "mode": 2
            }],
            disabled: false
        };
    }
    async applyEffect() {
        await this.getActor().createEmbeddedDocuments("ActiveEffect", [this.effect]);

    }
}