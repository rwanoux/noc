import { nocUtility } from "../noc-utility.js";

export class nocPersonnalisation extends Dialog {

    /* -------------------------------------------- */
    static async create(actor, talents) {

        let options = { classes: ["nocDialog"], width: 420, height: 'fit-content', 'z-index': 99999 };
        let html = await renderTemplate('systems/noc/templates/window_app/dialog-perso.hbs', { actor, talents });

        return new nocPersonnalisation(actor, html, talents, options);
    }

    /* -------------------------------------------- */

    /* -------------------------------------------- */
    constructor(actor, html, talents, options, close = undefined) {
        let conf = {
            title: "",
            content: html,
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Valider",
                    callback: () => { this.createEffect(html) }
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
        this.talents = talents;
    }


    async createEffect(html) {
        let label = this.element[0].querySelector('#effectLabel').value;
        let changes = [];
        let flag = {};
        for (let line of this.element[0].querySelectorAll('.bonus-group')) {
            let key = line.querySelector('.key').value;
            let val = line.querySelector('.val').value;
            let talent = key.split(".")[key.split(".").length - 1];
            changes.push({
                key: key + ".niveau",
                value: val,
                mode: 2
            })
            flag[talent] = val

        }

        let eff = await this.actor.createEmbeddedDocuments('ActiveEffect', [{ name: label, changes: changes }])
        await eff[0].setFlag('noc', 'personnalisation', flag);

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
        html.find('.addLine').click(this.addLine.bind(this))


    }
    addLine(ev) {
        let bonusContainer = this._element.find('.bonus')[0];
        let bonusLine = this._element.find('.bonus-group')[0].cloneNode(true);

        bonusContainer.append(bonusLine)
    }
}