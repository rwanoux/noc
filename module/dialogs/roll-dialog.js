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
    if (this.rollData.arme) {
      const r = this.rollData;
      const distance = r.arme.system.adistance;
      r.niveauFinalRequis = (Number(r.niveauBase) || 0) + (Number(r.modMaitrise) || 0)
        + (distance ? (Number(r.modDistance) || 0) + (Number(r.modCouvert) || 0) : 0)
        + (Number(r.modVisibilite) || 0)
        + (r.cibleAuSol ? (distance ? 1 : -1) : 0)
        + (Number(r.modSupplement) || 0);
    } else if (this.rollData.niveauRequis !== undefined) {
      this.rollData.niveauFinalRequis = (Number(this.rollData.niveauRequis) || 0) + (Number(this.rollData.modCouvert) || 0) + (Number(this.rollData.modSupplement) || 0)
    }
    this._element.find('#niveauFinalRequis').html(this.rollData.niveauFinalRequis);
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
    html.find('#nbDesCabale').change((event) => {
      this.rollData.nbDesCabale = Number(event.currentTarget.value)
    })
    // Choix de la cabale qui fournit les dés (personnage membre de plusieurs cabales)
    html.find('#cabaleChoice').change((event) => {
      const cabale = (this.rollData.cabales ?? []).find(c => c.id === event.currentTarget.value);
      const domaine = cabale?.domaines?.[this.rollData.domaineId];
      if (!cabale || !domaine) return;
      this.rollData.cabaleData = cabale;
      this.rollData.cabaleDomaine = foundry.utils.duplicate(domaine);
      this.rollData.nbDesCabale = 0;
      const max = Math.max(0, Number(domaine.value) || 0);
      const slider = html.find('#nbDesCabale')[0];
      if (slider) { slider.max = max; slider.value = 0; }
      html.find('#nbDesCabaleList').html(Array.from({ length: max + 1 }, (_, i) => `<option value="${i}">${i}</option>`).join(""));
      html.find('[data-display-range="nbDesCabale"]').html("0");
      html.find('.cabale-domaine-texte').html(`${domaine.label} (${domaine.value})`);
    })
    html.find('#nbBonusCollaboratif').change((event) => {
      this.rollData.nbBonusCollaboratif = Number(event.currentTarget.value)
    })
    html.find('#modDistance, #modVisibilite').change(() => this.updateNiveauFinal())
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