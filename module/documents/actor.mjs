import NOCContact from "../ContactClass.js";
import { nocRollDialog } from "../dialogs/roll-dialog.js";
import { Quality } from "../qualite_default.mjs";
/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class nocActor extends Actor {

  constructor(...args) {
    let data = args[0];


    if (!data.img) {
      switch (data.type) {
        case "personnage":
        case "rouage":
          data.img = 'systems/noc/asset/default_icons/personnage.webp';
          break;
        case "cabale":
          data.img = 'systems/noc/asset/default_icons/cabale.webp';
          break;
        case "autre":
          data.img = 'systems/noc/asset/default_icons/autre.webp';
          break;
        default:
          data.img = 'systems/noc/asset/default_icons/question_mark.webp';
          break;

      }
    };

    super(...args);

    if (data.type == "cabale") { this.initCabale(data) }
    if (data.type == "rouage") { this.initRouage(data) }

  }

  _preUpdate(...args) {
    console.log("preupdate..........", ...args)
  }
  async initRouage(data) {
    let system = this.system
    for (let perd in system.perditions) {
      system.perditions[perd].max = 5;
      system.perditions[perd].value = 0;
    }
    system.reserves.vecu.max = 5;
    system.reserves.vecu.value = 1;
    system.reserves.espoir.max = 5;
    system.reserves.espoir.value = 1;
    await this.update({
      _id: this.id,
      system: system
    });


  }
  async initCabale() {
    await this.update({
      "system.perditions": {
        "blessures": {
          "label": "dégradation",
          "value": 0,
          "min": 0,
          "max": 10
        },
        "traque": {
          "label": "traque",
          "value": 0,
          "min": 0,
          "max": 10
        },
        "noirceur": {
          "label": "noirceur",
          "value": 0,
          "min": 0,
          "max": 10
        },
        "trauma": {
          "label": "division",
          "value": 0,
          "min": 0,
          "max": 10
        }
      }
    })
  }

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().

    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
    this._preparePersonnageData();
    this._prepareRouageData();
    this._prepareAutreData();
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {


    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.


  }
  getQuality() {
    return Quality.create(this.system.qualites)
  }
  getDefault() {
    return Quality.create(this.system.defauts)
  }
  /**
   * Prepare Character type specific data
   */
  async _preparePersonnageData() {
    if (this.type !== 'personnage') return;

    switch (this.system.talents.technique.artefact.niveau) {
      case -1:
      case 0:
        this.system.reserves.singularite.max = 0;
        break;
      case 1:
        this.system.reserves.singularite.max = 2;
        break;
      case 2:
        this.system.reserves.singularite.max = 3;
        break;
      case 3:
        this.system.reserves.singularite.max = 4;
        break;
      case 4:
        this.system.reserves.singularite.max = 5;
        break;
    }
    switch (this.system.talents.statut.contact.niveau) {
      case -1:
      case 0:
        this.system.reserves.faveurs.max = 0;
        break;
      case 1:
        this.system.reserves.faveurs.max = 2;
        break;
      case 2:
        this.system.reserves.faveurs.max = 4;
        break;
      case 3:
        this.system.reserves.faveurs.max = 6;
        break;
      case 4:
        this.system.reserves.faveurs.max = 8;
        break;
    }
    switch (this.system.talents.vie.ferveur.niveau) {
      case -1:
        this.system.reserves.espoir.max = 1;
        break;
      case 0:
        this.system.reserves.espoir.max = 3;
        break;
      case 1:
        this.system.reserves.espoir.max = 5;
        break;
      case 2:
        this.system.reserves.espoir.max = 7;
        break;
      case 3:
        this.system.reserves.espoir.max = 9;
        break;
      case 4:
        this.system.reserves.espoir.max = 10;
        break;
    }
    // preparing contacts
    this.prepareContacts();

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareRouageData(actorData) {


  }
  _prepareAutreData() {
    if (this.type !== 'autre') return;

    this.system.energieNoire.max = 8 - this.system.classeExo.value;
    for (let dom in this.system.domaines) {
      this.system.domaines[dom].value = 2 + this.system.energieNoire.max
    }
    for (let dom in this.system.talents) {
      for (let tal in this.system.talents[dom]) {
        this.system.talents[dom][tal].niveau = 0 + this.system.energieNoire.max
      }
    }
  }
  async prepareContacts() {
    let length = 0;
    let faveur = 0;
    let contacts = this.system.contacts || [];
    switch (this.system.talents.statut.contact.niveau) {
      case 0:
      case -1:
        length = 0;
        faveur = 0
        break;

      case 1:
        length = 2;
        faveur = 2
        break;
      case 2:
        length = 3;
        faveur = 4
        break;
      case 3:
        length = 4
        faveur = 6
        break;
      case 4:
        length = 5
        faveur = 8
        break;
      case 5:
        length = 5
        faveur = 10
        break;

      default:
        break;
    }
    if (length > contacts.length) {
      for (let i = contacts.length; i < length; i++) {
        contacts[i] = "vide";
      };
    } else {
      contacts.splice(length, contacts.length - length + 1)
    }

    this.system.contacts = contacts;
    this.system.reserves.faveurs.max = faveur;
    await this.update({ 'system.contacts': contacts })

  }
  resetContactFaveurs() {
    if (this.type != "personnage") { return false }
    let contactList = this.system.contacts;
    for (let contact of contactList) {
      if (contact != "vide") {
        contact.faveurs = 0;
        contact.usedFaveurs = 0;
      }
    }
    return this.update({
      "system.reserves.faveurs.value": 0,
      "system.contacts": contactList

    })
  }

  /* -------------------------------------------- */
  async setCabale(cabale) {
    if (this.system.cabale.uuid) {
      return ui.notifications.warn("Ce personnage est déjà affecté à une cabale")
    }
    console.log("Adding cabale", cabale)
    let update = {
      nom: cabale.name,
      uuid: cabale._id,
      bloc: cabale.system.bloc,
      coordonnes: cabale.system.coordonnes,
      societe: cabale.system.societeEcran
    };
    await this.update({
      "system.cabale": update
    })
  }

  /* -------------------------------------------- */
  incDecReserve(reserveKey, value) {
    let reserve = duplicate(this.system.reserves[reserveKey])
    reserve.value += value
    console.log("Updating: ", reserve)
    this.update({ [`system.reserves.${reserveKey}`]: reserve })
  }

  /* -------------------------------------------- */
  buildGenericRollData() {
    return {
      actorId: this.id,
      img: this.img,
      name: this.name,
      espoir: this.system.reserves.espoir.value,
      vecu: this.system.reserves.vecu.value,
      useEspoir: false,
      useVecu: false,
      nbBonusCollaboratif: 0,
      nbDesDomaine: 0,
    }
  }

  /* -------------------------------------------- */
  rollTalent(domaineId, talentId) {
    let rollData = this.buildGenericRollData()

    // Specific stuff
    rollData.title = "Talent"
    rollData.mode = "talent"
    rollData.domaine = duplicate(this.system.domaines[domaineId])
    rollData.talent = duplicate(this.system.talents[domaineId][talentId])
    this.startRoll(rollData)
  }

  /* -------------------------------------------- */
  rollItem(itemId) {
    let item = this.items.get(itemId)
    if (item && item.type == "arme") {
      let rollData = this.buildGenericRollData()
      // Specific stuff
      rollData.title = "Arme"
      rollData.mode = "arme"
      rollData.arme = duplicate(item)
      rollData.domaine = duplicate(this.system.domaines['action'])
      rollData.talent = duplicate(this.system.talents['action']['combat'])
      rollData.niveauRequis = (item.system.adistance) ? 0 : 1
      rollData.niveauFinalRequis = rollData.niveauRequis
      rollData.modCouvert = 0
      rollData.cibleAuSol = false
      rollData.modSupplement = 0
      this.startRoll(rollData)
    } else {
      ui.notifications.warn("Cet item n'a pas de jet associé.")
    }
  }

  /* -------------------------------------------- */
  async startRoll(rollData) {
    let rollDialog = await nocRollDialog.create(this, rollData)
    rollDialog.render(true)
  }

}