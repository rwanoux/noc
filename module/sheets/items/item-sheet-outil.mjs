
export class nocItemSheetOutil extends foundry.appv1.sheets.ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 300,
      height: 580,
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
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    html.find("a.limite-plus").click(() => this.changerLimite(1));
    html.find("a.limite-moins").click(() => this.changerLimite(-1));
  }

  async changerLimite(ecart) {
    const valeur = Math.max(0, (Number(this.item._source.system.limite) || 0) + ecart);
    return this.item.update({ "system.limite": valeur });
  }
}
