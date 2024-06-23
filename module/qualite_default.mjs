export class Quality {
    constructor(actorId, type) {
        this.targetTalent = "";
        this.talentPath = ""
        this.label = "";
        this.actorId = actorId;
        this.isDefault = (type == "defaut");
        this.effectData = {};
        this.effectId = "";
    }
    static async create(object) {
        let qual = new this(); {
            if (!object) {
                return qual
            } else {
                for (let prop in qual) {
                    qual[prop] = object[prop]
                } return qual
            }
        }

    }
    async getActor() {
        return await Actor.get(this.actorId)
    }

    async creationDialog() {

        let dialogData = {
            type: this.isDefault ? "défaut" : "qualité",
            talents: game.system.template.Actor.personnage.talents,
            actor: await this.getActor()
        };
        let content = await renderTemplate('systems/noc/templates/window_app/dialog-quality.hbs', dialogData)
        let buttons = {
            create: {
                icon: '<i class="fas fa-check"></i>',
                label: `ajouter la ${this.isDefault ? "défaut" : "qualité"}`,
                callback: async (html) => {
                    let select = html.find('#talentPath')[0];
                    this.talentPath = select.options[select.selectedIndex].value;
                    this.targetTalent = this.talentPath.split(".")[this.talentPath.split(".").length - 1]
                    let label = html.find('#qualityLabel')[0].value;
                    this.label = label;

                    await this.validForm()
                }
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: "Annuler"
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
    async validForm() {
        await this.clearEffect()
        await this.createEffect();
        await this.applyEffect();
    }
    async clearEffect() {
        let act = await this.getActor();
        if (this.effectId) {
            await act.deleteEmbeddedDocuments('ActiveEffect', [this.effectId])

        }
    }

    async reset() {

        await this.clearEffect();

        this.targetTalent = "";
        this.talentPath = ""
        this.label = "";
        this.effectData = {};
        this.effectId = "";

        await this.updateActor()
    }
    async createEffect() {
        console.log(this)
        this.effectData = {
            label: `qualité : ${this.label}`,
            changes: [{
                "key": this.talentPath + '.niveau',
                "value": this.isDefault ? '-1' : '1',
                "mode": 2
            }],
            disabled: false
        };
    }
    async applyEffect() {
        console.log(this)
        let act = await this.getActor();
        let eff = await act.createEmbeddedDocuments("ActiveEffect", [this.effectData]);
        this.effectId = eff[0]._id;
        console.log(eff, this)

        this.updateActor()
    }
    async updateActor() {
        let act = await this.getActor();
        if (this.isDefault) {
            await act.update({
                'system.defauts': this
            })
        } else {
            await act.update({
                'system.qualites': this
            })
        }
    }
}