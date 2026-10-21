import { TRAITS_ARMES } from "../../armes.mjs";
import { activerCompteurs } from "../../armures.mjs";

export class nocItemSheetArme extends foundry.appv1.sheets.ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 440,
      height: 760,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/noc/templates/item";
    return `${path}/sheet-${this.document.type}.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();
    context.systemTemplate = game.system.template;
    const traits = this.item.system.traitsArme ?? {};
    context.traitsSimples = [];
    context.traitsChiffres = [];
    for (const [cle, def] of Object.entries(TRAITS_ARMES)) {
      const t = traits[cle];
      const ligne = { cle, label: def.label, description: def.description };
      if (def.chiffre) context.traitsChiffres.push({ ...ligne, actif: !!t?.actif, valeur: Number(t?.valeur) || 0 });
      else context.traitsSimples.push({ ...ligne, actif: !!t });
    }
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    activerCompteurs(html, this.item);
    // Contact / Distance
    html.find("select.type-arme").change(ev => {
      ev.stopPropagation();
      return this.item.update({ "system.adistance": ev.currentTarget.value === "distance" });
    });
  }
}
