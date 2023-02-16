
export class nocItemSheetArchetype extends ItemSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 750,
      height: 500,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      dragdrop: [{
        dragSelector: ".item-list .item",
        dropSelector: ".dop-area"
      }]
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
    // Opportunistic init
    if (!this.item.system.talentsMineurs["erudition"]) {
      this.item.system.talentsMineurs = duplicate(context.systemTemplate.Actor.templates.talents.talents)
    }
    console.log("ITEM", this.item.system)
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let checks = html.find('input[type="checkbox"].talent-mineur');
    for (let check of checks) {
      check.addEventListener('change', this.updateTalentsMineurs.bind(this))
    }
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;
    console.log(this.item)

    // Roll handlers, click handlers, etc. would go here.
  }

  checkingTalentsMineurs(check) {
    //console.log("CHECL", this.item.system.talentsMineurs, check, check.dataset)
    this.item.system.talentsMineurs[check.dataset.domaine][check.dataset.talent] = true
    /*if (this.item.system.talentsMineurs.indexOf(check.dataset.talent) > -1) {
      check.setAttributes("checked", true)
    }*/
  }
  async updateTalentsMineurs(ev) {
    let check = ev.currentTarget;
    console.log("Toggle", check.checked)
    let domain = duplicate(this.item.system.talentsMineurs)
    domain[check.dataset.domaine][check.dataset.talent].checked = check.checked
    this.item.update({ 'system.talentsMineurs': domain })
  }
  async _onDrop(event) {
    event.preventDefault();
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) { return false; }
    if (!data) return false;
    if (data.type === "Item") return alert("dropped item");
    if (data.type === "Actor") return false;
  }


}
