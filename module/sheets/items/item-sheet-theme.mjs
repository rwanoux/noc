
export class nocItemSheetTheme extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 380,
      height: 380,
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
    console.log(context)
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let checks = html.find('input[type="checkbox"].talent-check');
    for (let check of checks) {
      let talent = check.dataset.domaine + "." + check.dataset.talent;
      if (this.item.system.talents.indexOf(talent) > -1) { check.checked = true }
      check.addEventListener('change', this.updateTalents.bind(this))
    }
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    this.form.ondrop = ev => this._onDrop(ev);
    // Roll handlers, click handlers, etc. would go here.
  }

  checkingTalentsMineurs(check) {
    console.log(this.item.system)
  }
  async updateTalents(ev) {
    let check = ev.currentTarget;
    let talent = ev.currentTarget.dataset.domaine + "." + ev.currentTarget.dataset.talent;
    let talentList = this.item.system.talents;
    if (check.checked) {
      talentList.push(talent)
    } else {
      if (talentList.indexOf(talent) >= 0) {
        talentList.splice(talentList.indexOf(talent), 1)
      }

    }
    await this.item.update({
      system: {
        talents: talentList
      }
    })


  }
}
