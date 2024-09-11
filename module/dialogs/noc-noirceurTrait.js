import { nocUtility } from "../noc-utility.js";
import { NOC } from "../helpers/config.mjs";

export class nocNoirceurTraits extends Dialog {

    /* -------------------------------------------- */
    static async create(actor) {
        let traits = NOC.traitsPerditions.noirceur;

        let options = { classes: ["nocDialog"], width: 420, height: 'fit-content', 'z-index': 99999 };
        let html = await renderTemplate('systems/noc/templates/window_app/noirceurTraits.hbs', { actor, traits });

        return new nocNoirceurTraits(actor, html, options);
    }

    /* -------------------------------------------- */

    /* -------------------------------------------- */
    constructor(actor, html, talents, options, close = undefined) {
        let conf = {
            title: "",
            content: html,
            buttons: {
                valid: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Valider",
                    callback: () => { this.addTraits(html) }
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Annuler",
                    callback: () => { this.close() }
                }
            },
            close: close
        }

        super(conf, options);

        this.actor = actor;
        this.traits = NOC.traitsPerditions.noirceur;
    }


    async addTraits(html) {
        let selectedTraits = [];
        let inputs = this.element[0].querySelectorAll('input');
        for (let input of inputs) {
            if (input.checked) {
                selectedTraits.push(NOC.traitsPerditions.noirceur[input.dataset.traitId])
            }
        }

        let traits = this.actor.system.traits.concat(selectedTraits);
        await this.actor.update({
            'system.traits': traits
        })


    }
    /* -------------------------------------------- */
    async refreshDialog() {
        const content = await renderTemplate("systems/noc/templates/dialog-roll-generic.hbs", this.rollData)
        this.data.content = content
        this.render(true)
    }

    /* -------------------------------------------- */

    /* -------------------------------------------- */
    activateListeners(html) {
        super.activateListeners(html);


    }

}