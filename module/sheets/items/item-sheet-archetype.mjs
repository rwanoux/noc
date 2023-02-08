
export class nocItemSheetArchetype extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 750,
      height: 500,
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
    console.log(this)
    // Retrieve base data structure.
    const context = super.getData();
    context.systemTemplate = game.system.template;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let checks = html.find('input[type="checkbox"].talent-mineur');
    for (let check of checks) {
      this.checkingTalentsMineurs(check);
      check.addEventListener('change', this.updateTalentsMineurs.bind(this))
    }
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
  }

  checkingTalentsMineurs(checkbox) {
    if (this.item.system.talentsMineurs.indexOf(check.dataset.talent) > -1) {
      check.setAttributes("checked", true)
    }
  }
  async updateTalentsMineurs(ev) {

    let check = ev.currentTarget;
    let talent = check.dataset.talent;
    let actualList = this.item.system.talentsMineurs

    if (actualList.indexOf(talent) > -1) {
      console.log(talent)
    }

  }

}
