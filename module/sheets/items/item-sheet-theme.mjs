
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
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let checks = html.find('a.talent-check');
    for (let check of checks) {
      let talent = check.dataset.domaine + "." + check.dataset.talent;
      let talObject = this.item.system.talents.find(t => t.talent == talent)
      if (talObject) {
        check.dataset.value = talObject.value;
        switch (talObject.value) {
          case -1:
            check.innerHTML = `<i class="fa-regular fa-square-minus"></i>`;
            check.dataset.tooltip = "-1"
            break;
          case 0:
            check.innerHTML = `<i class="fa-solid fa-square"></i>`;
            break;
          case 1:
            check.innerHTML = `<i class="fa-regular fa-square-plus"></i>`;
            check.dataset.tooltip = "+1"

            break;


        }

      }
    }
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    checks.click(this.cycleTalent.bind(this));


  }


  async cycleTalent(ev) {
    let val = ev.currentTarget.dataset.value;
    val++;
    if (val > 1) { val = -1 };
    ev.currentTarget.dataset.value = val;
    let tal = ev.currentTarget.dataset.domaine + "." + ev.currentTarget.dataset.talent;
    let talArray = this.item.system.talents;

    let obj = talArray.find(t => t.talent == tal)
    obj ? obj.value = val : talArray.push({ talent: tal, value: val })
    console.log(talArray);
    await this.item._preUpdate({
      _id: this.item.id,
      "system.talents": talArray
    });
    this.render(true);

  }

}
