
import { nocItem } from "../../documents/item.mjs";
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
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /** @override */
  getData() {
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

    let checks = html.find('a.talent-check');
    for (let check of checks) {
      let talObject = this.item.system.talentsMineurs[check.dataset.domaine][check.dataset.talent]
      check.dataset.value = talObject.niveau;
      console.log(talObject)
      switch (talObject.niveau) {
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

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    checks.click(this.cycleTalent.bind(this));

    this.form.ondrop = ev => this._onDrop(ev);
    let checksTheme = html.find('[data-action="addTheme"]');
    if (checksTheme) {
      for (let ch of checksTheme) {
        ch.addEventListener("click", this.changeThemes.bind(this))
      }

    }
    let deleteThemes = html.find('[data-action="delete-theme"]');
    if (deleteThemes) {
      for (let but of deleteThemes) {

        but.addEventListener("click", this.deleteThemes.bind(this))
      }
    }
    let openThemes = html.find('[data-action="open-theme"]');
    if (openThemes) {
      for (let but of openThemes) {
        but.addEventListener("click", this.openThemes.bind(this))
      }
    }
    let chooseThemes = html.find('[data-action="choose-theme"]');
    if (chooseThemes) {
      for (let ck of chooseThemes) {

        ck.addEventListener("click", this.chooseThemes.bind(this))
      }
    }

    // Roll handlers, click handlers, etc. would go here.
  }
  async cycleTalent(ev) {
    let val = ev.currentTarget.dataset.value;
    val++;
    if (val > 1) { val = -1 };
    ev.currentTarget.dataset.value = val;

    let talentsMineurs = this.item.system.talentsMineurs
    let dom = ev.currentTarget.dataset.domaine
    let tal = ev.currentTarget.dataset.talent

    talentsMineurs[dom][tal].niveau = val


    await this.item.update([{
      "system.talentsMineurs": talentsMineurs
    }]);
    this.render(true);

  }


  checkingTalentsMineurs(check) {
    //console.log("CHECL", this.item.system.talentsMineurs, check, check.dataset)
    this.item.system.talentsMineurs[check.dataset.domaine][check.dataset.talent] = true
    /*if (this.item.system.talentsMineurs.indexOf(check.dataset.talent) > -1) {
      check.setAttributes("checked", true)
    }*/
  }
  async chooseThemes(ev) {
    let themes = await this.item.getFlag("noc", "linkedThemes");
    let targetThemeId = ev.target.dataset.themeId;
    if (ev.currentTarget.checked) {
      for (let th of themes) {
        th.choosed = false
      }
    }

    let targetTheme = themes.find(th => th.id == targetThemeId);
    targetTheme.choosed = ev.currentTarget.checked
    await this.item.setFlag("noc", "linkedThemes", themes);
    this.render(true)
  }
  async openThemes(ev) {
    let id = ev.currentTarget.dataset.themeId;
    let item = await Item.get(id);
    if (!item) return ui.notifications.error(`l'item "thème" recherché n'existe pas !`)
    return item.sheet.render(true)
  }
  async deleteThemes(ev) {
    let themes = await this.item.getFlag("noc", "linkedThemes");
    let targetThemeId = ev.target.dataset.themeId;
    let targetTheme = themes.find(th => th.id == targetThemeId);
    themes.splice(themes.indexOf(targetTheme), 1);
    await this.item.setFlag("noc", "linkedThemes", themes);
    this.render(true)
  }

  async changeThemes(ev) {
    let themes = await this.item.getFlag("noc", "linkedThemes");
    let targetThemeId = ev.target.dataset.themeId;
    let targetTheme = themes.find(th => th.id == targetThemeId);
    targetTheme.choosed = true;
    await this.item.setFlag("noc", "linkedThemes", themes)

  }
  async updateTalentsMineurs(ev) {
    let check = ev.currentTarget;
    let domain = duplicate(this.item.system.talentsMineurs);
    domain[check.dataset.domaine][check.dataset.talent].checked = check.checked
    await this.item.update({ 'system.talentsMineurs': domain });
    console.log(domain)

  }
  async _onDrop(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) { return false; }
    if (!data) return false;
    if (data.type === "Item") return this.onDropItem(data.uuid);
    if (data.type === "Actor") return false;
  }

  async onDropItem(id) {
    let droppedItem = await fromUuid(id);
    if (droppedItem.type != "thème") {
      return false
    }
    else { this.addTheme(droppedItem) }
  }

  async addTheme(item) {
    let linkedThemes = await this.item.getFlag("noc", "linkedThemes") || [];
    linkedThemes.push(
      {
        id: item._id,
        name: item.name,
        talents: item.system.talents,
        choosed: false
      }
    );
    await this.item.setFlag("noc", "linkedThemes", linkedThemes);
    this.render(true)
  }
}
