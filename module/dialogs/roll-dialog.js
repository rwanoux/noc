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
  updateNiveauFinal() {
    let inputs = this._element.find('input');
    for (let input of inputs) {
      if (input.type === "range") {
        this.rollData[input.id] = Number(input.value)
      } if (input.type === "checkbox") {
        this.rollData[input.id] = input.checked

      }
    }
    this.rollData.niveauFinalRequis = this.rollData.niveauRequis + this.rollData.modCouvert + this.rollData.modSupplement
    if (this.rollData.arme) {
      if (this.rollData.arme.system.traits.toLowerCase().includes('complexe') && this.rollData.arme.system.maitrise) {
        this.rollData.niveauFinalRequis += 2
      } else {
        this.rollData.niveauFinalRequis += (this.rollData.arme.system.maitrise) ? 0 : 1
      }
      if (this.rollData.cibleAuSol) {
        if (this.rollData.arme.system.adistance) {
          this.rollData.niveauFinalRequis += 1
        } else {
          this.rollData.niveauFinalRequis -= 1
        }
      }
    }
    $('#niveauFinalRequis').html(this.rollData.niveauFinalRequis);
  }
  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
      dialog.updateNiveauFinal()
    }
    $(function () { onLoad(); });

    html.find('#useEspoir').change((event) => {
      this.rollData.useEspoir = event.currentTarget.checked
    })
    html.find('#useVecu').change((event) => {
      this.rollData.useVecu = event.currentTarget.checked
    })
    html.find('#cibleAuSol').change((event) => {
      this.rollData.cibleAuSol = event.currentTarget.checked
      this.updateNiveauFinal()
    })
    html.find('#nbDesDomaine').change((event) => {
      this.rollData.nbDesDomaine = Number(event.currentTarget.value)
    })
    html.find('#nbBonusCollaboratif').change((event) => {
      this.rollData.nbBonusCollaboratif = Number(event.currentTarget.value)
    })
    html.find('#niveauRequis').change((event) => {
      this.rollData.niveauRequis = Number(event.currentTarget.value)
      this.updateNiveauFinal()
    })
    html.find('#modCouvert').change((event) => {
      this.rollData.modCouvert = Number(event.currentTarget.value)
      this.updateNiveauFinal()
    })
    html.find('#modSupplement').change((event) => {
      this.rollData.modSupplement = Number(event.currentTarget.value)
      this.updateNiveauFinal()
    })
    html.find('input[type="range"]').change((ev) => {
      this.displayRange(ev)
    })

  }
  displayRange(ev) {
    let displayTarget = this._element.find(`[data-display-range=${ev.currentTarget.id}]`)[0];
    let option = this._element.find(`#${ev.currentTarget.list.id} option[value="${ev.currentTarget.value}"]`)[0];
    displayTarget.innerHTML = option.innerHTML
  }
}