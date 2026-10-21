import { creerTheme, libelleTalent, talentsDuSysteme, themeDepuisItem } from "../../archetypes.mjs";

export class nocItemSheetArchetype extends foundry.appv1.sheets.ItemSheet {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "item"],
      width: 750,
      height: 650,
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
    const context = super.getData();
    context.systemTemplate = game.system.template;
    // Initialisation des talents mineurs si besoin
    if (!this.item.system.talentsMineurs["erudition"]) {
      this.item.system.talentsMineurs = foundry.utils.deepClone(context.systemTemplate.Actor.rouage.talents)
    }
    // Un archétype déjà posé sur un personnage n'est plus modifiable
    this.options.editable = (context.document.parent) ? false : true;
    context.editable = this.isEditable;

    context.themes = (this.item.system.themes ?? []).map(t => ({
      ...t,
      choisi: t.id === this.item.system.themeChoisi,
      talents: t.talents.map(x => ({
        ...x,
        label: libelleTalent(x.talent),
        signe: x.value > 0 ? `+${x.value}` : `${x.value}`
      }))
    }));
    context.listeTalents = Object.entries(talentsDuSysteme()).map(([dom, talents]) => ({
      domaine: dom,
      talents: Object.entries(talents).map(([tal, t]) => ({ cle: `${dom}.${tal}`, label: t.label }))
    }));
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    let checks = html.find('a.talent-check');
    for (let check of checks) {
      let talObject = this.item.system.talentsMineurs[check.dataset.domaine]?.[check.dataset.talent];
      if (!talObject) continue;
      check.dataset.value = talObject.niveau;
      switch (Number(talObject.niveau)) {
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

    // Tout ce qui suit n'est utile que si la fiche est modifiable
    if (!this.isEditable) return;

    checks.click(this.cycleTalent.bind(this));
    this.form.ondrop = ev => this._onDrop(ev);

    // Thèmes
    html.find('[data-action="add-theme"]').click(this.ajouterTheme.bind(this));
    html.find('[data-action="delete-theme"]').click(this.supprimerTheme.bind(this));
    html.find('[data-action="remove-theme-talent"]').click(this.retirerTalentTheme.bind(this));
    html.find('[data-action="cycle-theme-talent"]').click(this.cyclerTalentTheme.bind(this));
    html.find('input.theme-nom').change(ev => this.modifierTheme(ev, t => { t.nom = ev.currentTarget.value.trim() || t.nom }));
    html.find('textarea.theme-description').change(ev => this.modifierTheme(ev, t => { t.description = ev.currentTarget.value }));
    html.find('select.theme-ajout-talent').change(ev => this.modifierTheme(ev, t => {
      const cle = ev.currentTarget.value;
      if (!cle || t.talents.some(x => x.talent === cle)) return;
      t.talents.push({ talent: cle, value: 1 });
    }));
  }

  async cycleTalent(ev) {
    let val = ev.currentTarget.dataset.value;
    val++;
    if (val > 1) { val = -1 };
    ev.currentTarget.dataset.value = val;

    let talentsMineurs = foundry.utils.deepClone(this.item.system.talentsMineurs)
    let dom = ev.currentTarget.dataset.domaine
    let tal = ev.currentTarget.dataset.talent

    talentsMineurs[dom][tal].niveau = val

    await this.item.update({
      "system.talentsMineurs": talentsMineurs
    });
  }

  /* -------------------------------------------- */
  /*  Gestion des thèmes                          */
  /* -------------------------------------------- */

  _themes() {
    return foundry.utils.deepClone(this.item.system.themes ?? []);
  }

  async _enregistrerThemes(themes) {
    return this.item.update({ "system.themes": themes });
  }

  async modifierTheme(ev, modification) {
    ev.preventDefault();
    ev.stopPropagation();
    const id = ev.currentTarget.closest("[data-theme-id]")?.dataset.themeId;
    const themes = this._themes();
    const theme = themes.find(t => t.id === id);
    if (!theme) return;
    modification(theme);
    return this._enregistrerThemes(themes);
  }

  async ajouterTheme(ev) {
    ev.preventDefault();
    const themes = this._themes();
    themes.push(creerTheme({ nom: "Nouveau thème" }));
    return this._enregistrerThemes(themes);
  }

  async supprimerTheme(ev) {
    ev.preventDefault();
    const id = ev.currentTarget.closest("[data-theme-id]")?.dataset.themeId;
    const themes = this._themes();
    const theme = themes.find(t => t.id === id);
    if (!theme) return;
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: "Supprimer un thème" },
      content: `<p>Supprimer le thème « ${theme.nom} » de cet archétype ?</p>`
    });
    if (!ok) return;
    return this._enregistrerThemes(themes.filter(t => t.id !== id));
  }

  async retirerTalentTheme(ev) {
    const cle = ev.currentTarget.dataset.talent;
    return this.modifierTheme(ev, t => { t.talents = t.talents.filter(x => x.talent !== cle) });
  }

  /** Clic sur la valeur d'un talent : +1 → +2 → -1 → +1 */
  async cyclerTalentTheme(ev) {
    const cle = ev.currentTarget.dataset.talent;
    return this.modifierTheme(ev, t => {
      const x = t.talents.find(x => x.talent === cle);
      if (x) x.value = x.value === 1 ? 2 : (x.value === 2 ? -1 : 1);
    });
  }

  /* -------------------------------------------- */
  /*  Glisser un ancien objet « thème »            */
  /* -------------------------------------------- */

  async _onDrop(event) {
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData('text/plain'));
    } catch (err) { return false; }
    if (data?.type !== "Item") return false;
    const droppedItem = await fromUuid(data.uuid);
    if (droppedItem?.type !== "thème") return false;
    const themes = this._themes();
    themes.push(themeDepuisItem(droppedItem));
    return this._enregistrerThemes(themes);
  }
}
