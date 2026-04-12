/**
 * Item sheet for theme using ApplicationV2
 * @extends {foundry.applications.sheets.ItemSheetV2}
 */
export class nocItemSheetThemeV2 extends foundry.applications.sheets.ItemSheetV2 {

  /** @override */
  static DEFAULT_CONFIG = {
    classes: ["noc", "sheet", "item", "theme"],
    actions: {
      // Les actions seront définies ici
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
      template: "systems/noc/templates/item/sheet-theme.html",
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.systemTemplate = game.system.template;
    return context;
  }
}
