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

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
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
