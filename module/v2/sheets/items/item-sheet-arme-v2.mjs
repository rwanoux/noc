/**
 * Item sheet for Arme using ApplicationV2
 * @extends {foundry.applications.sheets.ItemSheetV2}
 */
export class nocItemSheetArmeV2 extends foundry.applications.sheets.ItemSheetV2 {

  /** @override */
  static DEFAULT_CONFIG = {
    classes: ["noc", "sheet", "item", "arme"],
    actions: {
      // Les actions seront définies ici (ex: click sur un bouton)
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    position: {
      width: 300,
      height: 580
    }
  };

  /** @override */
  static PARTS = {
    description: {
      template: "systems/noc/templates/item/sheet-arme.html",
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.systemTemplate = game.system.template;
    return context;
  }
}
