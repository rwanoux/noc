import CompteurFiel from "../compteursFiel/compteurFiel.mjs";
import { nocUtility } from "../noc-utility.js";

export class nocRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(actor, rollData) {

    let options = { classes: ["nocDialog"], width: 420, height: 'fit-content', 'z-index': 99999 };
    let html = await renderTemplate('systems/noc/templates/window_app/dialog-roll-generic.hbs', rollData);

    return new nocRollDialog(actor, rollData, html, options);
  }

  /* -------------------------------------------- */
  constructor(actor, rollData, html, options, close = undefined) {
    let conf = {
      title: "",
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: "Lancer !",
          callback: () => { this.roll() }
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
    this.rollData = rollData;
  }

  /* -------------------------------------------- */
  roll() {
    nocUtility.roll(this.rollData)
  }

  /* -------------------------------------------- */
  async refreshDialog() {
    const content = await renderTemplate("systems/noc/templates/dialog-roll-generic.hbs", this.rollData)
    this.data.content = content
    this.render(true)
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#useEspoir').change((event) => {
      this.rollData.useEspoir = event.currentTarget.checked
    })
    html.find('#useVecu').change((event) => {
      this.rollData.useVecu = event.currentTarget.checked
    })
    html.find('#nbDesDomaine').change((event) => {
      this.rollData.nbDesDomaine = Number(event.currentTarget.value)
    })
    html.find('#nbBonusCollaboratif').change((event) => {
      this.rollData.nbBonusCollaboratif = Number(event.currentTarget.value)
    })
    

  }
}