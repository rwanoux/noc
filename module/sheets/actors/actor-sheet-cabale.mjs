import { nocActorSheetPersonnage } from "./actor-sheet-personnage.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class nocActorSheetCabale extends nocActorSheetPersonnage {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "cabale"],
      width: 900,
      height: 700,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }

  /** @override */
  get template() {
    return `systems/noc/templates/actor/actor-${this.actor.type}-sheet.html`;
  }
  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */

  /** @inheritdoc */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _canDragDrop(selector) {
    return this.isEditable;
  }
  async _onDrop(event) {
    const data = TextEditor.getDragEventData(event);
    const actor = this.actor;

    /**
     * A hook event that fires when some useful data is dropped onto an ActorSheet.
     * @function dropActorSheetData
     * @memberof hookEvents
     * @param {Actor} actor      The Actor
     * @param {ActorSheet} sheet The ActorSheet application
     * @param {object} data      The data that has been dropped onto the sheet
     */
    const allowed = Hooks.call("dropActorSheetData", actor, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {

      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);

    }
  }
  async _onDropActor(ev, data) {
    console.log(ev, data);
    let dropActor = await Actor.implementation.fromDropData(data);
    if (!this.actor.isOwner || !dropActor.isOwner) return () => {
      ui.notifications.warn("Vous n'avez pas de droits sur l'acteur ; demandez à la Loi d'affecter le contact");
      return false
    };
    // Activer la cabale chez cet acteur
    dropActor.setCabale(foundry.utils.duplicate(this.object))
    console.log(dropActor)
  }
  _onDropItem(ev, data) {
    console.log(ev, data)
  }
  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Prepare character data and items.
    this._preparePersonnageData(context);

    return context;
  }

  /* -------------------------------------------- */
  _preparePersonnageData(context) {
    context.members = game.actors.filter(act => act.type == "personnage" && act.system.cabale && act.system.cabale.uuid == this.actor.id)
    console.log("Found members", context.members, this.actor.id)
  }
  /* -------------------------------------------- */

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.display-actor').click(ev => {
      const actorId = $(ev.currentTarget).data("actor-id")
      let actor = game.actors.get(actorId);
      actor.sheet.render(true);
    })
    let membersImages = html.find('div.img');
    for (let el of membersImages) { this.randomRotate(el) }
    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

  }
  randomRotate(element) {
    console.log(element)
    let rdm = () => { return Math.floor(Math.random() * 10) - 5 };
    element.style.transform = `rotate(${rdm()}deg)`;
    element.style.top = `${rdm() * 2}%`;
    element.style.right = `${rdm() * 2}%`

  }
}
