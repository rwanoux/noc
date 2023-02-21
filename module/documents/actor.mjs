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
        case "autre":
          data.img = 'systems/noc/asset/default_icons/autre.webp';
          break;
        default:
          data.img = 'systems/noc/asset/default_icons/question_mark.webp';
          break;

      }
    };
    super(...args);
    if (data.type == "cabale") { this.initCabale() }

  }

  initCabale() {
    this.update({
      "system.perditions": {
        "blessures": {
          "label": "dégradation",
          "value": 3,
          "min": 0,
          "max": 10
        },
        "traque": {
          "label": "traque",
          "value": 3,
          "min": 0,
          "max": 10
        },
        "noirceur": {
          "label": "noirceur",
          "value": 3,
          "min": 0,
          "max": 10
        },
        "trauma": {
          "label": "division",
          "value": 3,
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
    this._preparePersonnageData();
    this._prepareRouageData();

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

    // preparing contacts
    this.prepareContacts();

  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareRouageData(actorData) {
    if (this.type !== 'rouage') return;
  }
  async prepareContacts() {
    /*
        let contacts, faveur;
        switch (this.system.talents.statut.contact.niveau) {
          case 1:
            contacts = new Array(2);
            faveur = 2
            break;
          case 2:
            contacts = new Array(3);
            faveur = 4
            break;
          case 3:
            contacts = new Array(4);
            faveur = 6
            break;
          case 4:
            contacts = new Array(5)
            faveur = 8
            break;
          case 5:
            contacts = new Array(5);
            faveur = 10
            break;
    
          default:
            break;
        }
    
        for (let i = 0; i < contacts.length; i++) {
          contacts[i] = new NOCContact(randomID());
          console.log(contacts[i])
        };
    
    
    */
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
    rollData.mode = "talent"
    rollData.domaine = duplicate(this.system.domaines[domaineId]),
      rollData.talent = duplicate(this.system.talents[domaineId][talentId]),
      this.startRoll(rollData)
  }


  /* -------------------------------------------- */
  async startRoll(rollData) {
    let rollDialog = await nocRollDialog.create(this, rollData)
    rollDialog.render(true)
  }

}