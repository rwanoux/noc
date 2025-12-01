import NOCContact from "../ContactClass.js";
import { nocRollDialog } from "../dialogs/roll-dialog.js";
import { NOC } from "../helpers/config.mjs";
import { Quality } from "../qualite_default.mjs";
import { nocNoirceurTraits } from '../dialogs/noc-noirceurTrait.js';
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

  async _onUpdate(update, options, user) {
    console.log('onupdate', user)
    if (user == game.user._id && this.type == "personnage" && update.system?.perditions) {
      await this.checkPerditions(update)
    }

    super._onUpdate(update, options, user);

  }
  async initRouage(data) {

    for (let perd in this.system.perditions) {
      this.system.perditions[perd].max = 5;
      this.system.perditions[perd].value = 0;
    }
    this.system.reserves.vecu.max = 5;
    this.system.reserves.vecu.value = 1;
    this.system.reserves.espoir.max = 5;
    this.system.reserves.espoir.value = 1;



  }
  async initCabale() {
    if (this.id) {
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

    this._preparePersonnageData();
    this._prepareRouageData();
    this._prepareAutreData();

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
    if (this.type !== 'rouage') return;


  }
  _prepareAutreData() {
    if (this.type !== 'autre') return;

    this.system.energieNoire.max = 8 - this.system.classeExo.value;

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
    this.system.contacts = contacts;

  };
  async checkPerditions(update) {
    for (let perd in update.system.perditions) {

      if (update.system.perditions[perd].value) {

        let perdition = Object.getOwnPropertyNames(update.system.perditions)[0]
        let newVal = update.system.perditions[perd].value
        let relevantStep = NOC.compteur2Step[newVal] // Get the relevant step value
        let perditionStep = NOC.effetsPerditions[perd][relevantStep] // Get the perdition data
        // clearing effects
        if (perditionStep) {
          if (perditionStep.deleteEffects) {
            let toDelete = []
            for (let flag of perditionStep.deleteEffects) {
              let effect = this.effects.find(effect => effect.getFlag("world", flag))
              if (effect) {
                toDelete.push(effect.id)
              }
            }
            await this.deleteEmbeddedDocuments("ActiveEffect", toDelete)
          };

          // Update status
          this.update({ [`system.perditions.${perdition}.statut`]: { label: perditionStep.label, description: perditionStep.description } })

          // Effect ?
          let effect = this.effects.find(effect => effect.getFlag("world", perditionStep.flag))
          if (!effect && perditionStep.effect) {  // Effet absent, à ajouter
            let effectData = {
              name: perditionStep.label,
              label: perditionStep.label,
              changes: [],
              disabled: false
            }
            if (perditionStep.effect == "malusDomaine") { // Specific logic for effect type
              for (let key in this.system.domaines) {
                effectData.changes.push({ key: `system.domaines.${key}.value`, value: -1, mode: 2 })
              }
            }
            if (perditionStep.effect == "malusTalent") { // Specific logic for effect type
              for (let keyDomaine in this.system.talents) {
                for (let key in this.system.talents[keyDomaine]) {
                  effectData.changes.push({ key: `system.talents.${keyDomaine}.${key}.niveau`, value: -1, mode: 2 })
                }
              }
            }
            let newEffect = await this.createEmbeddedDocuments("ActiveEffect", [effectData])
            newEffect[0].setFlag("world", perditionStep.flag, true)

          }
          if (perditionStep.sequelle) {
            this.addSequelle(perdition)
          };
          if (perditionStep.trait) {
            ui.notifications.warn("add trait");
            this.addTrait(perdition)
          }
        }
      }
    }
  }
  async addTrait(perdition) {
    let traits = this.system.traits || [];

    if (perdition == "noirceur") {
      this.noirceurTraitDialog()
    }
    if (perdition == "traque") {
      if (this.system.perditions.traque.value < 10) {
        if (!this.system.traits.find(t => t.label == "criminel")) {
          traits.push(NOC.traitsPerditions.traque.criminel)
        }

      }
      if (this.system.perditions.traque.value >= 10) {
        let traits = this.system.traits || [];
        if (!this.system.traits.find(t => t.label == "ennemi public")) {
          traits.push(NOC.traitsPerditions.traque.ennemi_public)
        }
      }

    }
    await this.update({
      'system.traits': traits
    })
  }
  async addSequelle(perdition) {
    let updateMin = {
      system: {
        perditions: {
        }
      }
    };
    updateMin.system.perditions[perdition] = { min: this.system.perditions[perdition].min + 1 }
    await this.update(updateMin)
  }

  async allTalentsMinus(label) {
    let effData = {
      label: label,
      changes: []
    }
    for (let dom in this.system.talents) {
      for (let tal in this.system.talents[dom]) {
        let key = "system.talents." + dom + "." + tal + ".niveau"
        effData.changes.push({
          key: key,
          mode: 2,
          value: "-1"
        })
      }

    }
    let newEff = await this.createEmbeddedDocuments("ActiveEffect", [effData]);
    newEff[0].setFlag("noc", "perdition", {
      label: label
    })
  }
  async allDomainesMinus(label) {
    let effData = {
      label: label,
      changes: []
    }
    for (let dom in this.system.domaines) {
      let key = "system.domaines." + dom + ".value"
      effData.changes.push({
        key: key,
        mode: 2,
        value: "-1"
      })
    }
    let newEff = await this.createEmbeddedDocuments("ActiveEffect", [effData]);
    newEff[0].setFlag("noc", "perdition", {
      label: label
    })
  }


  async removeTrait(label) {
    let traits = this.system.traits;
    let targetTrait = traits.find(t => t.label == label);
    traits.splice(traits.indexOf(targetTrait), 1);
    await this.update({
      'system.traits': traits
    })


  }
  async noirceurTraitDialog() {
    let dial = await nocNoirceurTraits.create(this);
    dial.render(true)

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
    let update = {
      nom: cabale.name,
      uuid: cabale._id,
      bloc: cabale.system.bloc,
      coordonnes: cabale.system.coordonnes,
      societe: cabale.system.societeEcran
    };
    await this.update({
      "system.cabale": update
    });
    let cabaleActor = await Actor.get(cabale._id)
    if (cabaleActor.sheet.rendered) { cabaleActor.sheet.render(true) }
  }
  async leaveCabale() {
    let oldCabale = this.system.cabale;
    let cabaleActor = await Actor.get(oldCabale._id);
    await this.update({
      "system.cabale": {
        nom: "",
        uuid: "",
        bloc: "",
        coordonnes: "",
        societe: ""
      }
    })
    if (cabaleActor.sheet.rendered) { cabaleActor.sheet.render(true) }

  }

  /* -------------------------------------------- */
  incDecReserve(reserveKey, value) {
    let reserve = foundry.utils.duplicate(this.system.reserves[reserveKey])
    reserve.value += value
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
  clearInitiative() {
    this.setFlag("world", "noc-last-initiative", -1)
  }
  /* -------------------------------------------- */
  getInitiativeScore(combatId, combatantId) {
    let init = this.getFlag("world", "noc-last-initiative") || -1
    if (init == -1) {
      ui.notifications.info("Vous n'avez pas enregistré d'Initiative pour ce combat, jet d'Instinct à faire.")
      this.rollTalent("action", "instinct", { isInit: true, combatId: combatId, combatantId: combatantId })
    }
    return init
  }

  /* -------------------------------------------- */
  rollTalent(domaineId, talentId, combatData = undefined) {
    let rollData = this.buildGenericRollData()

    // Specific stuff
    rollData.title = "Talent"
    rollData.mode = "talent"
    rollData.combatData = combatData
    rollData.domaine = foundry.utils.duplicate(this.system.domaines[domaineId])
    rollData.talent = foundry.utils.duplicate(this.system.talents[domaineId][talentId])
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
      rollData.arme = foundry.utils.duplicate(item)
      rollData.domaine = foundry.utils.duplicate(this.system.domaines['action'])
      rollData.talent = foundry.utils.duplicate(this.system.talents['action']['combat'])
      rollData.niveauRequis = (item.system.adistance) ? 0 : 1
      rollData.niveauFinalRequis = rollData.niveauRequis
      rollData.modCouvert = 0
      rollData.cibleAuSol = false
      rollData.modSupplement = 0
      this.startRoll(rollData)
    } else {
      const speaker = ChatMessage.getSpeaker({ user: game.user });
      // a simple chat message for now
      ChatMessage.create({
        whisper: game.user.id,
        speaker: speaker,
        content: `
      <h3>${item.name} </h3>
      <p>${item.system.description}</p>
      <img src="${item.img}" width="100%" height="auto">
      `
      });
    }
  }

  /* -------------------------------------------- */
  async startRoll(rollData) {
    let rollDialog = await nocRollDialog.create(this, rollData)
    rollDialog.render(true)
  }
  async creatureAttaque() {
    if (this.type != "creature") { return }
    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this });
    const rollMode = game.settings.get('core', 'rollMode');
    // a simple chat message for now
    ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      content: `
      <h3>${this.name} attaque !  ${this.system.attaque.label}</h3>
      <p>[[${this.system.attaque.degats}]] dégats</p>
      `
    });
  }

  /* -------------------------------------------- */
  getRollData() {
    const data = { ...super.getRollData() };

    // Copy the actor's system data for easy access
    data.talents = this.system.talents;
    data.domaines = this.system.domaines;
    data.reserves = this.system.reserves;
    data.perditions = this.system.perditions;
    console.log("getrolldata actor", data);
    return data;
  }

}
