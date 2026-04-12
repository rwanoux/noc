/**
 * Actor sheet for creature using ApplicationV2
 * @extends {foundry.applications.sheets.ActorSheetV2}
 */
export class nocActorSheetCreatureV2 extends foundry.applications.sheets.ActorSheetV2 {

  /** @override */
  static DEFAULT_CONFIG = {
    classes: ["noc", "sheet", "actor", "creature"],
    actions: {
      // Les actions seront définies ici
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    position: {
      width: 850,
      height: 710
    }
  };

  /** @override */
  static PARTS = {
    principal: {
      template: "systems/noc/templates/actor/actor-creature-sheet.html",
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.systemTemplate = game.system.template;
    return context;
  }
}
