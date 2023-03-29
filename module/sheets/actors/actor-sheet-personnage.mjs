

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import NOCContact from "../../ContactClass.js";
import { nocPersonnalisation } from "../../dialogs/noc-personnalisation.js";
import { Quality } from "../../qualite_default.mjs";

export class nocActorSheetPersonnage extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "personnage"],
      width: 850,
      height: 710,
      submitOnChange: true,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
        { dragSelector: "img.quantarQty", dropSelector: "li.item" },
        { dragSelector: "img.quantarUsed", dropSelector: null },
        { dragSelector: ".actor", dropSelector: ".cabale" },
        { dragSelector: ".actor", dropSelector: ".contact" },
        { dragSelector: ".faveur", dropSelector: ".contact" },

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

      case "affectQuantar":
        return this._onDropQuantar(event, data)
      case "unaffectQuantar":
        return this._onUnaffectQuantar(event, data);
      case "affectFaveur":
        return this.affectFaveur(event, data);
      default:
        return;

    }
  }

  async _onDropActor(ev, data) {
    let dropActor = await Actor.implementation.fromDropData(data);
    if (!this.actor.isOwner || !dropActor.isOwner) return () => {
      ui.notifications.warn("Vous n'avez pas de droits sur l'acteur ; demandez à la Loi d'affecter le contact");
      return false
    };
    console.log(dropActor, ev);
    switch (dropActor.type) {
      case "cabale":
        console.log("DROPPED TO CABALE!:!!!")
        if (!ev.target.classList.contains("cabale")) { return }
        this.actor.setCabale(dropActor)
        break;
      case "personnage", "rouage":
        if (!ev.target.classList.contains("empty-contact")) { return };
        this.setContact(dropActor, ev.target.dataset.contactIndex);
        break;
      default:
        return false
    }
  }


  async _onDropItem(ev, data) {
    let dropItem = await Item.implementation.fromDropData(data);
    if (dropItem.type == "thème") { return ui.notifications.warn("Les items THEMES doivent être glisser sur les fiches d'items ARCHETYPES") }
    if (dropItem.type == "archetype") { this._onDropArchetype(ev, dropItem) }

    super._onDropItem(ev, data);

  }
  async _onDropArchetype(ev, item) {
    console.log(item);
    let linkedThemes = await item.getFlag("noc", "linkedThemes");
    if (linkedThemes) {
      let theme = linkedThemes.find(th => th.choosed)
      if (theme) {
        let choosedThemeId = theme.id;
        let themeItem = await Item.get(choosedThemeId);
        if (themeItem) {
          await this.actor.createEmbeddedDocuments("Item", [themeItem])
        } else {
          await this.actor.createEmbeddedDocuments("Item", [theme.itemData])
        }
      } else {
        ui.notifications.warn("Thème non trouvé")
      }
    }

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
  async affectFaveur(ev, data) {
    if (!ev.currentTarget.classList.contains("contact")) { return }
    let contactIndex = ev.currentTarget.dataset.contactIndex;
    let contactList = this.actor.system.contacts;
    if (contactList[contactIndex] == "vide") { return };
    let sumFav = (acc, contact) => {
      let tot = acc + (contact.faveurs || 0);
      return tot;
    }

    let totalFaveursContact = contactList.reduce(sumFav, 0);
    if (totalFaveursContact >= this.actor.system.reserves.faveurs.max) {
      return ui.notifications.warn(`${this.actor.name} n'a plus de faveur disponibles`)
    }
    let newFav = this.actor.system.reserves.faveurs.value + 1
    contactList[contactIndex].faveurs++;
    await this.actor.update({
      "system.contacts": contactList,
      "system.reserves.faveurs.value": newFav
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
    if (ev.currentTarget.classList.contains('faveur')) {
      let dragData = {
        type: "affectFaveur",
      };
      ev.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    }


    super._onDragStart(ev)

  }


  /** @override */
  getData() {

    const context = super.getData();
    context.personnalisations = this.actor.effects.filter(ef => ef.flags.noc?.personnalisation);
    context.perditionsEffects = this.actor.effects.filter(ef => ef.flags.noc?.perdition)

    // Prepare character data and items.
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
    this.prepareFavItems(context)

  }

  /* -------------------------------------------- */
  /* --------LISTENERS--------------------------- */
  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(' .item-create').click(this._onItemCreate.bind(this));
    // Delete Inventory Item
    html.find('.item-delete').click(async ev => {
      let item = await this.actor.getEmbeddedDocument("Item", ev.currentTarget.dataset.itemId);
      item.delete();
    });
    html.find('.item-open').click(async ev => {
      let item = await this.actor.getEmbeddedDocument("Item", ev.currentTarget.dataset.itemId);
      ev.preventDefault();
      item.sheet.render(true);
    });
    html.find('.item-fav').click(async ev => {

      let item = await this.actor.getEmbeddedDocument("Item", ev.currentTarget.dataset.itemId);
      ev.preventDefault();
      let isFav = await item.getFlag("noc", "favItem");
      await item.setFlag("noc", "favItem", !isFav);
      console.log(this.actor.items)
    })
    html.find('li.item .img').click(ev => {
      ev.currentTarget.closest('li.item').classList.toggle('expanded');
      ev.stopPropagation()
    })

    // Talent manegement
    html.find('.roll-talent').click(ev => {
      let domaineId = $(ev.currentTarget).data("domaine-id");
      let talentId = $(ev.currentTarget).data("talent-id");
      this.actor.rollTalent(domaineId, talentId);
    })
    // ROll d'item
    html.find('.roll-item').click(ev => {
      let itemId = $(ev.currentTarget).data("item-id");
      this.actor.rollItem(itemId);
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
    html.find('a.openCabale')?.click(this.openCabale.bind(this));

    html.find(".addQuality").click(this.addQuality.bind(this))
    html.find(".deleteQuality").click(this.deleteQuality.bind(this))

    html.find(".unassignContact").click(this.unassignContact.bind(this))
    html.find(".faveurContact").click(this._onClickFaveur.bind(this))
    html.find('#resetFaveurs').click(this._onResetFaveurs.bind(this));


    html.find('.addPersonnalisation').click(this._onClickPerso.bind(this));
    html.find('.deletePersonnalisation').click(this.deletePersonnalisation.bind(this));

    html.find('.delete-perdition-effect').click(this.deletePerditionEffect.bind(this));

    html.find(".talent-control a").click(this.updateTalent.bind(this));
    html.find(".domaine-control a").click(this.updateDomaine.bind(this));
    html.find(".delete-trait").click(this.deleteTrait.bind(this));

  }
  async deleteTrait(ev) {
    let traitLabel = ev.currentTarget.dataset.traitLabel;
    await this.actor.removeTrait(traitLabel)
  }
  async updateTalent(ev) {
    let key = ev.currentTarget.closest('.talent-niveau').dataset.key;
    let dom = key.split(".")[2];
    let tal = key.split('.')[3]

    let update = {
      system: {
        talents: {}
      }
    };
    update.system.talents[dom] = {};
    update.system.talents[dom][tal] = {};

    let value = this.actor._source.system.talents[dom][tal].niveau;



    if (ev.currentTarget.classList.contains('fa-add')) {
      update.system.talents[dom][tal].niveau = value + 1;

    } else {
      update.system.talents[dom][tal].niveau = value - 1;
    }
    console.log(update, this.actor)
    await this.actor.update(update)

  }

  async updateDomaine(ev) {
    let key = ev.currentTarget.closest('.domaine-niveau').dataset.key;
    console.log(key)
    let dom = key.split(".")[2];

    let update = {
      system: {
        domaines: {}
      }
    };
    update.system.domaines[dom] = {};

    let value = this.actor._source.system.domaines[dom].value;



    if (ev.currentTarget.classList.contains('fa-add')) {
      update.system.domaines[dom].value = value + 1;

    } else {
      update.system.domaines[dom].value = value - 1;
    }
    console.log(update, this.actor)
    await this.actor.update(update)
  }
  async _onClickPerso(ev) {
    let talents = game.system.template.Actor.templates.talents.talents;
    let actor = this.actor;
    let dial = await nocPersonnalisation.create(actor, talents);
    dial.render(true)
  };
  async deletePersonnalisation(ev) {
    let effectId = ev.currentTarget.dataset.effectId;
    let effect = await this.actor.effects.get(effectId);
    effect.delete()
  }

  async deletePerditionEffect(ev) {
    let efId = ev.currentTarget.dataset.effectId;
    let effect = await this.actor.effects.get(efId);
    effect.delete();
  }

  _onResetFaveurs(ev) {
    new Dialog({
      title: `ré-initialiser les faveurs`,
      content: "Etes-vous sûr de vouloir ré-initialiser les faveurs ?",
      buttons: {
        valid: {
          icon: '<i class="fas fa-check"></i>',
          label: "Valider",
          callback: html => {
            this.actor.resetContactFaveurs()

          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annuler"
        }
      },
      default: "cancel"
    }, {
      classes: ["nocDialog"]
    }).render(true);
  }
  async _onClickFaveur(ev) {
    //rendering dialog for faveur use
    let contactList = this.actor.system.contacts;
    let contactIndex = ev.currentTarget.closest('.contact').dataset.contactIndex;
    let contact = contactList[contactIndex];

    new Dialog({
      title: `demander une faveur à ${contact.nom}`,
      content: await renderTemplate(`systems/noc/templates/window_app/dialog-faveur.hbs`, contact),
      buttons: {
        valid: {
          icon: '<i class="fas fa-check"></i>',
          label: "Valider",
          callback: html => {
            console.log(this)
            let usedFaveurs = html.find(('input#faveursInUse'))[0].value;
            this.faveurToChat(contact, usedFaveurs);
            this.applyFaveurs(contactIndex, usedFaveurs)

          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annuler"
        }
      },
      default: "valid"
    }, {
      classes: ["nocDialog"]
    }).render(true);


  }
  async faveurToChat(contact, value) {
    let chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: `
      <h2>${this.actor.name} utilise des faveurs</h2>
      <p>${value} points dépensés auprès de ${contact.nom}</p>
      `
    };
    return ChatMessage.create(chatData);
  }
  async applyFaveurs(contactIndex, value) {
    let contactList = this.actor.system.contacts;
    let contact = contactList[contactIndex];

    contact.usedFaveurs += value;

    await this.actor.update({
      "system.contacts": contactList,
    })
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
      le personnage ${this.actor.name.toUpperCase()} possède plusieurs thème.... veuillez en supprimer
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
        <h2> Ajuster ${reserveName}</h2>
        <h4>Ajuster la valeur maximum</h4>
        <input type="number" id="newMax" value="10">
        <h4>Ajuster la valeur minimum </h4>
        <input type="number" id="newMin" value="0">
      `,
      buttons: {
        import: {
          icon: '<i class="fas fa-check"></i>',
          label: "Modifier",
          callback: html => {
            console.log(reserveProp)
            let updating = {};
            let max = reserveProp;
            let min = reserveProp.replace('max', 'min');
            updating[max] = parseInt(html.find('#newMax')[0].value);
            updating[min] = parseInt(html.find('#newMin')[0].value);
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
    if ((this.actor.system.energieNoire?.value == value || this.actor.system.reserves[lastProp]?.value == value || this.actor.system.perditions[lastProp]?.value == value)) { value -= 1 };
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
    const name = `${type.capitalize()} (indéfini)`;
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
            await this.actor.leaveCabale()
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
  };
  async setContact(actor, index) {
    let contactList = this.actor.system.contacts;
    contactList[index] = new NOCContact(actor.id);
    await this.actor.update({
      "system.contacts": contactList
    })

  }
  async listQuantar(context) {
    let quantarUsage = this.actor.collections.items.toObject().filter(it => it.system.quantar);
    let unused = this.actor.system.quantars - quantarUsage.length;
    if (unused < 0) { ui.notifications.error('vous ne possédez pas assez de quantar pour vos items') }
    for (let i = 0; i < unused; i++) {
      quantarUsage.splice(quantarUsage.length, 0, { unused: true });
    }
    context.quantarUsage = quantarUsage;
  }

  async prepareFavItems(context) {
    //console.log("preparing fav")
    let favItems = this.actor.collections.items.toObject().filter(it => it.flags.noc?.favItem);
    context.favItems = favItems;
  }

  async unassignContact(ev) {
    let contactIndex = ev.currentTarget.closest('div.contact').dataset.contactIndex;
    let contactList = this.actor.system.contacts;
    let newFav = this.actor.system.reserves.faveurs.value - contactList[contactIndex].faveurs
    contactList[contactIndex] = "vide";
    await this.actor.update({
      "system.contacts": contactList,
      "system.reserves.faveurs.value": newFav
    })
  }
}
