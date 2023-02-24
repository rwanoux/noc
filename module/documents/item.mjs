/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class nocItem extends Item {
  constructor(...args) {
    let data = args[0];
    switch (data.type) {
      case "arme":
        data.img = 'systems/noc/asset/default_icons/arme.webp';
        break;
      case "document administratif":
        data.img = 'systems/noc/asset/default_icons/document_administratif.webp';
        break;
      case "outil":
        data.img = 'systems/noc/asset/default_icons/outil.webp';
        break;
      case "armure":
        data.img = 'systems/noc/asset/default_icons/armure.webp';
        break;
      default:
        data.img = 'systems/noc/asset/default_icons/question_mark.webp';
        break;



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
  }
  _onUpdate(update, options, userId) {
    super._onUpdate(update, options, userId)

    if (this.type == "archetype" || this.type == "thème") { this.prepareEffect(update) }
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
          transfer: true,
          disabled: false
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
    }]


    console.log(updatedChanges)
    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  async _onUpdatetalentsMineurs(update, effectId) {
    console.log(this.system.talentsMineurs)
    let updatedChanges = []
    for (let dom in this.system.talentsMineurs) {
      let key = "system.talents." + dom;
      for (let tal in this.system.talentsMineurs[dom]) {
        if (this.system.talentsMineurs[dom][tal].checked) {

          updatedChanges.push({
            key: key + "." + tal + ".niveau",
            mode: 2,
            value: 1
          })
        }
      }

    }

    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  async _onUpdatetalentsTheme(update, effectId) {
    let updatedChanges = []
    let key = "system.talents."
    for (let talent of this.system.talents) {
      updatedChanges.push({
        key: key + talent + ".niveau",
        mode: 2,
        value: 1
      })

    }


    console.log(updatedChanges, effectId)
    await this.updateEmbeddedDocuments('ActiveEffect', [{ _id: effectId, changes: updatedChanges }]);

  }
  getRollData() {
    // If present, return the actor's roll data.
    if (!this.actor) return null;
    const rollData = {
      value: 1
    };
    return rollData;
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
