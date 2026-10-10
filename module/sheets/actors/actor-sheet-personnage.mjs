

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
import NOCContact from "../../ContactClass.js";
import { choisirTheme, libelleTalent } from "../../archetypes.mjs";
import { choisirQualite, descriptionQualite, enregistrerQualite } from "../../qualites.mjs";
import { nocPersonnalisation } from "../../dialogs/noc-personnalisation.js";
import { Quality } from "../../qualite_default.mjs";

export class nocActorSheetPersonnage extends foundry.appv1.sheets.ActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "personnage"],
      width: 850,
      height: 710,
      submitOnChange: true,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
        { dragSelector: "img.quantarQty", dropSelector: "li.item" },
        { dragSelector: "img.quantarUsed", dropSelector: null },
        { dragSelector: ".actor", dropSelector: ".cabale" },
        { dragSelector: ".faveur", dropSelector: null },

      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }

  /** @override */
  get template() {
    if (this.actor.permission == 1 || this.actor.permission == 2) {
      return `systems/noc/templates/actor/limitted.html`;
    }
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
    if (!dropActor) return false;
    if (!this.actor.isOwner) {
      ui.notifications.warn("Vous n'avez pas de droits sur ce personnage.");
      return false;
    }
    switch (dropActor.type) {
      case "cabale":
        if (!dropActor.isOwner) {
          ui.notifications.warn("Vous n'avez pas de droits sur cette cabale ; demandez à la Loi de l'affecter.");
          return false;
        }
        if (!ev.target.closest(".cabale")) { return }
        this.actor.setCabale(dropActor)
        break;
      case "personnage":
      case "rouage":
        // On accepte le dépôt n'importe où dans la zone des contacts
        if (!ev.target.closest(".contacts")) { return };
        this.setContact(dropActor);
        break;
      default:
        return false
    }
  }


  async _onDropItem(ev, data) {
    let dropItem = await Item.implementation.fromDropData(data);
    if (!dropItem) return false;
    if (dropItem.type == "thème") {
      return ui.notifications.warn("Les thèmes font maintenant partie des archétypes : glissez l'archétype sur la fiche, le thème sera proposé au choix.")
    }
    if (dropItem.type == "archetype") { return this._onDropArchetype(ev, dropItem) }

    return super._onDropItem(ev, data);

  }
  async _onDropArchetype(ev, item) {
    if (!this.actor.isOwner) return false;
    // Un archétype déjà présent sur ce personnage : on ne fait rien (tri dans la fiche)
    if (item.parent?.id === this.actor.id) return false;
    if (this.actor.itemTypes.archetype.length) {
      return ui.notifications.warn("Ce personnage a déjà un archétype. Supprimez-le d'abord si vous voulez en changer.");
    }
    const itemData = item.toObject();
    delete itemData._id;
    itemData.effects = [];

    const themeId = await choisirTheme(itemData);
    if (themeId === null) return false; // fenêtre annulée
    foundry.utils.setProperty(itemData, "system.themeChoisi", themeId);

    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  async _onClickQuantarObjet(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    const itemId = ev.currentTarget.closest("[data-item-id]")?.dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (!item) return;
    if (item.system.quantar) return item.update({ "system.quantar": false });
    const utilises = this.actor.items.filter(i => i.system.quantar).length;
    if (utilises >= (Number(this.actor.system.quantars) || 0)) {
      return ui.notifications.warn("Aucun quantar disponible : libérez-en un sur un autre objet ou augmentez le nombre de quantars possédés.");
    }
    return item.update({ "system.quantar": true });
  }
  async _onDropQuantar(ev, data) {
    let item = await this.actor.getEmbeddedDocument('Item', ev.currentTarget.dataset.itemId);
    if (!item) { return false };
    await item.update({
      "system.quantar": true
    })
  }
  async _onUnaffectQuantar(ev, data) {
    let item = await this.actor.getEmbeddedDocument('Item', data.sourceItem);
    await item.update({
      "system.quantar": false
    })
  }
  async affectFaveur(ev, data) {
    const contactEl = ev.target.closest(".contact[data-contact-index]");
    if (!contactEl) { return }
    let contactIndex = contactEl.dataset.contactIndex;
    let contactList = foundry.utils.deepClone(this.actor.system.contacts);
    if (!contactList[contactIndex]) { return };
    let sumFav = (acc, contact) => {
      let tot = acc + (contact.faveurs || 0);
      return tot;
    }

    // la réserve compte les jetons déjà distribués
    if ((this.actor.system.reserves.faveurs.value || 0) >= this.actor.system.reserves.faveurs.max) {
      return ui.notifications.warn(`${this.actor.name} n'a plus de faveur disponibles`)
    }
    let newFav = this.actor.system.reserves.faveurs.value + 1
    contactList[contactIndex].faveurs = (contactList[contactIndex].faveurs || 0) + 1;
    await this.actor.update({
      "system.contacts": contactList,
      "system.reserves.faveurs.value": newFav
    })
  }
  /* -------------------------------------------- */
  _onDragStart(ev) {
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
    this.prepareArchetype(context);
    context.cabales = this.actor.cabalesActeurs.map(c => ({
      id: c.id, nom: c.name, bloc: c.system.bloc, coordonnes: c.system.coordonnes, societe: c.system.societeEcran
    }));
    context.qualite = descriptionQualite(this.actor.system.qualites, "qualite");
    context.defaut = descriptionQualite(this.actor.system.defauts, "defaut");

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
    html.find('li.item .img').click(ev => {
      ev.currentTarget.closest('li.item').classList.toggle('expanded');
      ev.stopPropagation()
    })

    // Talent manegement
    html.find('.roll-talent').click(ev => {
      if (this.actor.type == "cabale") { return }
      let domaineId = $(ev.currentTarget).data("domaine-id");
      let talentId = $(ev.currentTarget).data("talent-id");
      this.actor.rollTalent(domaineId, talentId);
    })
    // ROll d'item
    // icône de quantar d'un objet : un clic l'équipe ou le libère
    html.find('img.needQuantar').click(this._onClickQuantarObjet.bind(this));
    html.find('.roll-item').click(ev => {
      let itemId = $(ev.currentTarget).data("item-id");
      const item = this.actor.items.get(itemId);
      // objet usuel, document administratif : le clic sur le nom ouvre sa fiche, comme le bouton d'édition
      if (["objetusuel", "document administratif"].includes(item?.type)) return item.sheet.render(true);
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
    html.find('a.unassignCabale').click(this.leaveCabale.bind(this));
    html.find('button.etape-jeu').click(ev => this.actor.etapeDeJeu(ev.currentTarget.dataset.etape));
    html.find('a.progression-plus').click(() => this.changerProgression(1));
    html.find('a.quantars-plus').click(() => this.changerQuantars(1));
    html.find('a.quantars-moins').click(() => this.changerQuantars(-1));
    html.find('a.progression-moins').click(() => this.changerProgression(-1));
    html.find('a.openCabale')?.click(this.openCabale.bind(this));

    html.find(".addQuality").click(this.addQuality.bind(this))
    html.find(".deleteQuality").click(this.deleteQuality.bind(this))

    html.find(".unassignContact").click(this.unassignContact.bind(this))
    html.find(".faveurContact").click(this._onClickFaveur.bind(this))
    html.find('#resetFaveurs').click(this._onResetFaveurs.bind(this));
    html.find(".contact i.createContact").click(this.createContact.bind(this))


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

    // valeur de base (sans les bonus d'archétype et de thème)
    let value = Number(this.actor._source.system.talents[dom][tal].niveau) || 0;



    if (ev.currentTarget.classList.contains('fa-add')) {
      update.system.talents[dom][tal].niveau = value + 1;

    } else {
      update.system.talents[dom][tal].niveau = value - 1;
    }
    await this.actor.update(update)

  }

  async updateDomaine(ev) {
    let key = ev.currentTarget.closest('.domaine-niveau').dataset.key;
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
    await this.actor.update(update)
  }
  async _onClickPerso(ev) {
    let talents = game.system.template.Actor.personnage.talents;
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
  async createContact(ev) {
    let dial = new Dialog({
      title: `nouveau contact`,
      content: `
          <h4>créer un :<select id="contactType">
            <option value="personnage">un personnage</option>
            <option value="rouage">un rouage</option>
          </select></h4>
          
          <div class="flexrow">
          <p>nommé :</p>
          <p><input id="contactName" type="text"></p>
          </div>
          <div class="flexrow">
          <p>décris comme :</p>
          <p><textarea id="contactDesc"></textarea></p>
          </div>

      `,
      buttons: {
        valid: {
          icon: '<i class="fas fa-check"></i>',
          label: "Valider",
          callback: async (html) => {
            let name = html.find("#contactName")[0].value;
            let type = html.find("#contactType")[0].options[html.find("#contactType")[0].selectedIndex].value;
            let desc = html.find("#contactDesc")[0].value

            let newContact = await Actor.create({
              name: name,
              type: type,
              system: {
                description: desc
              }
            });
            return this.setContact(newContact)

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
    });
    dial.render(true)

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
    let contactList = foundry.utils.deepClone(this.actor.system.contacts);
    let contact = contactList[contactIndex];
    if (!contact) return;
    // la valeur saisie arrive sous forme de texte : on la convertit en nombre
    let used = (Number(contact.usedFaveurs) || 0) + (Number(value) || 0);
    contact.usedFaveurs = Math.min(used, contact.faveurs || 0);

    await this.actor.update({
      "system.contacts": contactList,
    })
  }
  async deleteQuality(ev) {
    const type = ev.currentTarget.dataset.type === "defaut" ? "defaut" : "qualite";
    await enregistrerQualite(this.actor, type, "");
  }

  checkArchetype() {
    if (this.actor.itemTypes.archetype.length > 1) {
      return ui.notifications.warn(`
      le personnage ${this.actor.name.toUpperCase()} possède plusieurs archetypes.... veuillez en supprimer
      `)
    }
  }
  prepareArchetype(context) {
    const archetype = this.actor.itemTypes.archetype[0];
    const theme = archetype?.system.themes?.find(t => t.id === archetype.system.themeChoisi);
    context.themeChoisi = theme ? {
      nom: theme.nom,
      detail: theme.talents.map(t => `${libelleTalent(t.talent)} ${t.value > 0 ? "+" : ""}${t.value}`).join(", ")
    } : null;
  }
  async addQuality(ev) {
    const type = ev.currentTarget.dataset.type === "defaut" ? "defaut" : "qualite";
    await choisirQualite(this.actor, type);
  }
  async onClickMaxReserve(ev) {
    let reserveName = ev.currentTarget.dataset.reserveName;
    let reserveProp = ev.currentTarget.dataset.reserveProperty;


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
    const data = foundry.utils.duplicate(header.dataset);
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

  async changerQuantars(ecart) {
    const valeur = Math.max(0, (Number(this.actor._source.system.quantars) || 0) + ecart);
    return this.actor.update({ "system.quantars": valeur });
  }
  async changerProgression(ecart) {
    const valeur = Math.max(0, (Number(this.actor._source.system.progression) || 0) + ecart);
    return this.actor.update({ "system.progression": valeur });
  }
  async openCabale(ev) {
    const cabale = game.actors.get(ev.currentTarget.dataset.cabaleId);
    return cabale?.sheet.render(true);
  }
  async leaveCabale(ev) {
    const cabaleId = ev.currentTarget.dataset.cabaleId;
    const cabale = game.actors.get(cabaleId);
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: `Quitter la cabale : ${cabale?.name ?? "?"}` },
      content: "<p>Voulez-vous vraiment quitter cette cabale ?</p>"
    });
    if (ok) await this.actor.leaveCabale(cabaleId);
  };
  async setContact(actor) {
    if (!actor || !["personnage", "rouage"].includes(actor.type)) return;
    if (actor.id === this.actor.id) {
      return ui.notifications.warn("Un personnage ne peut pas être son propre contact.");
    }
    let contactList = foundry.utils.deepClone(this.actor.system.contacts);
    if (contactList.some(c => c.id === actor.id)) {
      return ui.notifications.info(`${actor.name} fait déjà partie des contacts.`);
    }
    contactList.push({
      id: actor.id,
      uuid: actor.uuid,
      nom: actor.name,
      img: actor.img,
      description: actor.system.description ?? "",
      faveurs: 0,
      usedFaveurs: 0
    });
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

  async unassignContact(ev) {
    let contactIndex = ev.currentTarget.closest('div.contact').dataset.contactIndex;
    let contactList = foundry.utils.deepClone(this.actor.system.contacts);
    let removed = contactList[contactIndex];
    if (!removed) return;
    // les jetons non encore utilisés retournent dans la réserve
    let rendus = (removed.faveurs || 0) - (removed.usedFaveurs || 0);
    let newFav = Math.max(0, this.actor.system.reserves.faveurs.value - rendus);
    contactList.splice(contactIndex, 1);
    await this.actor.update({
      "system.contacts": contactList,
      "system.reserves.faveurs.value": newFav
    })
  }
}
