

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import { Quality } from "../../qualite_default.mjs";

export class nocActorSheetPersonnage extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor"],
      width: 850,
      height: 710,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
        { dragSelector: "img.quantarQty", dropSelector: "li.item" },
        { dragSelector: "img.quantarUsed", dropSelector: null },

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
    console.log(data)


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
      case "affectQuantar":
        return this._onDropQuantar(event, data)
      case "unaffectQuantar":
        return this._onUnaffectQuantar(event, data)

    }
  }
  async _onDropActor(ev, data) {
    console.log(ev, data);
    let dropActor = await Actor.implementation.fromDropData(data);
    if (!this.actor.isOwner || !dropActor.isOwner) return () => {
      ui.notifications.warn("Vous n'avez pas de droits sur l'acteur ; demandez à la Loi d'affecter le contact");
      return false
    };
    console.log(dropActor);
    switch (dropActor.type) {
      case "cabale":
        this.setCabale(dropActor)
        break;
      case "personnage", "rouage":
        this.setContact(dropActor);
        break;
      default:
        return false
    }
  }
  _onDropItem(ev, data) {
    super._onDropItem(ev, data);

    console.log(ev, data)
  }
  async _onDropQuantar(ev, data) {
    let item = await this.actor.getEmbeddedDocument('Item', ev.currentTarget.dataset.itemId);
    if (!item) { return false };
    await item.update({
      "system.quantar": true
    })
  } async _onUnaffectQuantar(ev, data) {
    let item = await this.actor.getEmbeddedDocument('Item', data.sourceItem);
    await item.update({
      "system.quantar": false
    })
  }
  /* -------------------------------------------- */
  _onDragStart(ev) {
    console.log(ev);
    if (ev.currentTarget.classList.contains('quantarQty')) {
      let dragData = {
        type: "affectQuantar"
      };
      ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
    if (ev.currentTarget.classList.contains('quantarUsed')) {
      let dragData = {
        type: "unaffectQuantar",
        sourceItem: ev.currentTarget.closest('li.item').dataset.itemId
      };
      ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }
    super._onDragStart(ev)

  }
  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();



    // Prepare character data and items.
    this._preparePersonnageItems(context);
    this._preparePersonnageData(context);



    return context;
  }


  _preparePersonnageData(context) {
  }
  _preparePersonnageItems(context) {
    console.log("prepareItems...............................", context);
    this.checkArchetype();
    this.checkTheme();
    this.listQuantar()


  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));
    // Delete Inventory Item
    html.find('.item-delete').click(async ev => {
      const item = await this.actor.getEmbeddedDocument("Item", ev.currentTarget.dataset.itemId);
      item.delete();
    });
    html.find('.item-open').click(async ev => {
      const item = await this.actor.getEmbeddedDocument("Item", ev.currentTarget.dataset.itemId);
      ev.preventDefault();
      item.sheet.render(true);
    });
    html.find('li.item').click(ev => {
      ev.currentTarget.classList.toggle('expanded')
    })
    // Talent manegement
    html.find('.roll-talent').click(ev => {
      let domaineId = $(ev.currentTarget).data("domaine-id");
      let talentId = $(ev.currentTarget).data("talent-id");
      this.actor.rollTalent(domaineId, talentId);
    })

    let checksReserve = html.find('.reserve input');
    for (let ch of checksReserve) {
      ch.addEventListener('click', this.changeReserve.bind(this))
    }
    let reserveSettingButtons = html.find(".reserve a.setMax");
    for (let but of reserveSettingButtons) {
      but.addEventListener('click', this.onClickMaxReserve.bind(this))
    }
    html.find('a.unassignCabale')[0]?.addEventListener('click', this.leaveCabale.bind(this));
    html.find('a.openCabale')[0]?.addEventListener('click', this.openCabale.bind(this));

    html.find(".addQuality").click(this.addQuality.bind(this))
    html.find(".deleteQuality").click(this.deleteQuality.bind(this))

  }
  async deleteQuality(ev) {
    let type = ev.currentTarget.dataset.type;
    let prop = this.actor.system.qualites
    if (type === "defaut") {
      prop = this.actor.system.defauts
    }
    let qual = await Quality.create(prop)
    await qual.reset()

  }

  checkArchetype() {
    if (this.actor.itemTypes.archetype.length > 1) {
      return ui.notifications.warn(`
      le personnage ${this.actor.name.toUpperCase()} possède plusieurs archetypes.... veuillez en supprimer
      `)
    }
  }
  checkTheme() {
    if (this.actor.itemTypes.thème.length > 1) {
      return ui.notifications.warn(`
      le personnage ${this.actor.name.toUpperCase()}} possède plusieurs thème.... veuillez en supprimer
      `)
    }
  }
  async addQuality(ev) {
    let quality = new Quality(this.actor.id, ev.currentTarget.dataset.type);
    await quality.creationDialog();

  }
  async onClickMaxReserve(ev) {
    let reserveName = ev.currentTarget.dataset.reserveName;
    let reserveProp = ev.currentTarget.dataset.reserveProperty;


    console.log(reserveName, reserveProp)
    new Dialog({
      title: `Ajustement de reserve`,
      content: `
        <h2>Ajuster la valeur max de : ${reserveName}</h2>
        <input type="number" id="newVal">
      `,
      buttons: {
        import: {
          icon: '<i class="fas fa-check"></i>',
          label: "Modifier",
          callback: html => {
            let updating = {};
            updating[reserveProp] = html.find('#newVal')[0].value;
            this.actor.update(updating)

          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "import"
    }, {

    }).render(true);
  }
  changeReserve(ev) {
    let value = parseInt(ev.currentTarget.dataset.reserveValue) + 1;
    let property = ev.currentTarget.dataset.reserveProperty;
    let lastProp = property.split('.')[2];
    console.log([lastProp])
    if ((this.actor.system.reserves[lastProp]?.value == value || this.actor.system.perditions[lastProp]?.value == value)) { value -= 1 };
    let updating = {};
    updating[property] = value;
    this.actor.update(updating)
  }
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.itemType;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    let newItem = await Item.create(itemData, { parent: this.actor });
    await newItem.sheet.render(true)
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[roll] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  async setCabale(cabale) {
    if (this.actor.system.cabale.uuid) { return ui.notifications.warn("Ce personnage est déjà affecté à une cabale") };
    let update = {
      nom: cabale.name,
      uuid: cabale._id,
      bloc: cabale.system.bloc,
      coordonnes: cabale.system.coordonnes,
      societe: cabale.system.societeEcran
    };
    await this.actor.update({
      "system.cabale": update
    })
  }
  async openCabale(ev) {
    let cabale = await Actor.get(ev.currentTarget.dataset.cabaleId)
    return await cabale.sheet.render(true)
  }
  async leaveCabale(ev) {
    let cabaleId = ev.currentTarget.dataset.cabaleId;
    let cabale = await game.actors.get(cabaleId);

    let dial = new Dialog({
      title: `Quitter la cabale : ${cabale.name}`,
      content: 'Voulez-vous vraiment quitter la cabale ?',
      buttons: {
        ok: {
          icon: '<i class="fas fa-check"></i>',
          label: "quitter",
          callback: async (html) => {

            await this.actor.update({
              "system.cabale": {
                nom: null,
                uuid: null
              }
            });

          }
        },
        no: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel"
        }
      },
      default: "ok"
    }, {

    }).render(true);
  }
  async listQuantar() {
    let quantarUsage = this.actor.collections.items.toObject().filter(it => it.system.quantar);
    let unused = this.actor.system.quantars - quantarUsage.length;
    if (unused < 0) { ui.notifications.error('vous ne possédez pas assez de quantar pour vos items') }
    for (let i = 0; i < unused; i++) {
      quantarUsage.splice(quantarUsage.length, 0, { unused: true });
      console.log(quantarUsage)
    }
    console.log(quantarUsage)
    await this.actor.setFlag("noc", "quantarUsage", quantarUsage)
  }

}
