/**
 * Actor sheet for Personnage using ApplicationV2
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class nocActorSheetPersonnageV2 extends foundry.applications.sheets.ActorSheetV2 {

  /** @override */
  static DEFAULT_CONFIG = {
    classes: ["noc", "sheet", "actor", "personnage"],
    actions: {
      rollTalent: this._onRollTalent,
      rollItem: this._onRollItem,
      itemCreate: this._onItemCreate,
      itemDelete: this._onItemDelete,
      itemOpen: this._onItemOpen,
      itemFav: this._onItemFav,
      addQuality: this._onAddQuality,
      deleteQuality: this._onDeleteQuality,
      unassignContact: this._onUnassignContact,
      faveurContact: this._onFaveurContact,
      resetFaveurs: this._onResetFaveurs,
      createContact: this._onCreateContact,
      addPersonnalisation: this._onAddPersonnalisation,
      deletePersonnalisation: this._onDeletePersonnalisation,
      deletePerditionEffect: this._onDeletePerditionEffect,
      updateTalent: this._onUpdateTalent,
      updateDomaine: this._onUpdateDomaine,
      deleteTrait: this._onDeleteTrait,
      unassignCabale: this._onUnassignCabale,
      openCabale: this._onOpenCabale
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    position: {
      width: 850,
      height: 710
    },
    dragDrop: [
      { dragSelector: ".item-list .item", dropSelector: null },
      { dragSelector: "img.quantarQty", dropSelector: "li.item" },
      { dragSelector: "img.quantarUsed", dropSelector: null },
      { dragSelector: ".actor", dropSelector: ".cabale" },
      { dragSelector: ".actor", dropSelector: ".contact" },
      { dragSelector: ".faveur", dropSelector: ".contact" }
    ]
  };

  /** @override */
  static PARTS = {
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    principal: {
      template: "systems/noc/templates/actor/actor-personnage-sheet.html"
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.personnalisations = this.document.effects.filter(ef => ef.flags.noc?.personnalisation);
    context.perditionsEffects = this.document.effects.filter(ef => ef.flags.noc?.perdition);
    
    // Appel des méthodes de préparation héritées de la logique existante
    this._preparePersonnageItems(context);
    this._preparePersonnageData(context);
    
    return context;
  }

  _preparePersonnageData(context) {
    this.listQuantar(context);
  }

  _preparePersonnageItems(context) {
    this.checkArchetype();
    this.checkTheme();
    this.prepareFavItems(context);
  }

  // Ici on devra porter les méthodes auxiliaires (listQuantar, checkArchetype, etc.) 
  // car elles ne sont pas dans le prototype de base de ActorSheetV2.
  // Pour gagner du temps, on peut envisager de les mettre dans la classe ou un helper.

  /* -------------------------------------------- */
  /*  Actions                                     */
  /* -------------------------------------------- */

  static async _onRollTalent(event, target) {
    const domaineId = target.dataset.domaineId;
    const talentId = target.dataset.talentId;
    return this.document.rollTalent(domaineId, talentId);
  }

  static async _onRollItem(event, target) {
    const itemId = target.dataset.itemId;
    return this.document.rollItem(itemId);
  }

  static async _onItemCreate(event, target) {
     const header = target.closest(".item-list-header");
     const type = header.dataset.type;
     const itemData = {
       name: game.i18n.format("NOC.ItemNew", {type: type.capitalize()}),
       type: type,
       system: {}
     };
     return this.document.createEmbeddedDocuments("Item", [itemData]);
  }

  static async _onItemDelete(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    return this.document.items.get(itemId)?.delete();
  }

  static async _onItemOpen(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    return this.document.items.get(itemId)?.sheet.render(true);
  }

  static async _onItemFav(event, target) {
    const itemId = target.closest("[data-item-id]").dataset.itemId;
    const item = this.document.items.get(itemId);
    if (!item) return;
    const isFav = item.getFlag("noc", "favItem");
    return item.setFlag("noc", "favItem", !isFav);
  }

  // Autres actions à porter...
  static async _onUnassignContact(event, target) {
      const contactIndex = target.dataset.contactIndex;
      // Logique de unassignContact
  }
}
