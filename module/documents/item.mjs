import { conversionArme, deriverArme } from "../armes.mjs";
import { conversionArchetype } from "../archetypes.mjs";
/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class nocItem extends Item {
  constructor(...args) {
    const data = args[0];
    // Icône par défaut seulement pour un objet sans image (ou avec l'icône générique de Foundry) :
    // une image choisie par l'utilisateur n'est plus jamais remplacée.
    if (data && (!data.img || data.img === "icons/svg/item-bag.svg")) {
      const icones = {
        "arme": "arme.webp",
        "document administratif": "document_administratif.webp",
        "outil": "outil.webp",
        "armure": "armure.webp"
      };
      data.img = `systems/noc/asset/default_icons/${icones[data.type] ?? "question_mark.webp"}`;
    }
    super(...args);
  }

  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
    if (this.type == "arme") {
      this.prepareArmeData();
    }
  }
  async _onUpdate(update, options, userId) {

    // Les archétypes et thèmes n'utilisent plus d'effets actifs :
    // leurs bonus sont calculés directement par le personnage (module/archetypes.mjs).
    super._onUpdate(update, options, userId)

  }
  /** Un archétype ne transporte plus d'effets actifs ; ancien format converti à la volée */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;
    // Arme d'une créature : attaque naturelle, maîtrisée d'office
    if (this.type === "arme" && this.parent?.type === "creature"
      && foundry.utils.getProperty(data, "system.maitrise") === undefined) {
      this.updateSource({ "system.maitrise": true });
    }
    // Arme à l'ancien format (formule et traits en texte) : convertie à la création
    if (this.type === "arme" && !this._source.system.formatV2) {
      const constitution = this.parent?.type === "creature"
        ? this.parent._source.system?.talents?.action?.constitution?.niveau ?? 0 : null;
      this.updateSource(conversionArme(this._source, constitution));
    }
    if (this.type === "archetype") {
      const conv = conversionArchetype(this.toObject()) ?? {};
      this.updateSource({ ...conv, effects: [] });
    }
  }

  prepareArmeData() {
    // formule de dégâts et texte des traits recalculés (voir module/armes.mjs)
    deriverArme(this);
  }
  async prepareEffect(update) {
    if (!update.system) { return }
    //getting  effect from the updated data
    let effectName = this.type + "_" + this.name + "_" + Object.getOwnPropertyNames(update.system)[0]
    let effect = this.collections.effects.find(eff => eff.label === effectName);
    //if no effect creating one
    if (!effect) {
      effect = await this.createEmbeddedDocuments('ActiveEffect', [
        {
          label: effectName,
          name: effectName,
          icon: this.img,
          origin: this.uuid,
          disabled: false,
          changes: [],
          transfer: true,
        }

      ])
    }
    //switching logic depending on updated data
    switch (Object.getOwnPropertyNames(update.system)[0]) {

      case "talentMajeur":
        this._onUpdateTalentMajeur(update, effect.id);
        break;
      case "affinite":
        this._onUpdateAffinite(update, effect.id);
        break;
      case "talentsMineurs":
        this._onUpdatetalentsMineurs(update, effect.id);
        break;
      case "talents":
        this._onUpdatetalentsTheme(update, effect.id);
        break;
      default:
        return;
    }
  }
  async _onUpdateAffinite(update, effectId) {

    let updatedChanges = []
    for (let dom in this.system.affinite) {
      let domaineName = "";
      if (this.system.affinite[dom].active) {
        domaineName = "system.domaines." + dom;
        let value = this.system.affinite[dom].value
        updatedChanges.push({
          key: domaineName + ".value",
          mode: 2,
          value: value
        })
      } else {
        domaineName = "system.domaines." + dom;
        updatedChanges.push({
          key: domaineName + ".value",
          mode: 2,
          value: 2
        })
      }
    }

    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  async _onUpdateTalentMajeur(update, effectId) {
    let key = "system.talents." + this.system.talentMajeur + ".niveau"
    let updatedChanges = [{
      key: key,
      mode: 2,
      value: 2
    }];
    if (this.system.talentMajeur == "null") { updatedChanges.value = 0 }

    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  async _onUpdatetalentsMineurs(update, effectId) {
    let updatedChanges = []
    for (let dom in this.system.talentsMineurs) {
      let key = "system.talents." + dom;
      for (let tal in this.system.talentsMineurs[dom]) {

        updatedChanges.push({
          key: key + "." + tal + ".niveau",
          mode: 2,
          value: this.system.talentsMineurs[dom][tal].niveau
        })

      }

    }
    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  async _onUpdatetalentsTheme(update, effectId) {
    let updatedChanges = []
    let key = "system.talents."
    for (let talent of this.system.talents) {
      updatedChanges.push({
        key: key + talent.talent + ".niveau",
        mode: 2,
        value: talent.value
      })

    }
    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {


    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    // a simple chat message for now
    ChatMessage.create({
      speaker: speaker,
      rollMode: rollMode,
      flavor: label,
      content: this.system.description ?? ''
    });

  }
}
