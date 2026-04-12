/**
 * Compteur de Fiel using ApplicationV2
 * @extends {foundry.applications.api.ApplicationV2}
 */
export default class CompteurFielV2 extends foundry.applications.api.ApplicationV2 {

  /** @override */
  static DEFAULT_CONFIG = {
    id: "CompteurFiel",
    classes: ["noc", "compteur-fiel"],
    tag: "div",
    window: {
      frame: false,
      title: "compteur de Fiel",
    },
    position: {
      width: "auto",
      height: "auto"
    },
    actions: {
      gouttePlus: (event) => this.gouttePlus(1),
      goutteMoins: (event) => this.goutteMoins(1),
      addEffect: this.openEffectCreator,
      deleteEffect: this.deleteEffect
    }
  };

  /** @override */
  static PARTS = {
    compteur: {
      template: "systems/noc/templates/window_app/compteurFiel.hbs",
    }
  };

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.object = await game.settings.get("noc", "compteurFiel");
    context.isGM = game.user.isGM;
    context.effets = CONFIG.NOC.effetsFiel;
    this.object = context.object;
    return context;
  }

  /** @override */
  _onRender(context, options) {
    const rotate = (this.object.gouttes) * (-10.285);
    const aiguilleEl = this.element.querySelector('#aiguille');
    if (aiguilleEl) {
      aiguilleEl.style.transform = `rotate(${rotate}deg)`;
    }
  }

  // Logique métier (identique à l'originale mais adaptée à ApplicationV2)
  async gouttePlus(qt) {
    Hooks.callAll("preAddFiel", this, qt);
    this.object.gouttes += qt;
    this.caclculMenace();
    await this.updateFiel(this.object);
  }

  async goutteMoins(qt) {
    Hooks.callAll("preMinusFiel", this, qt);
    this.object.gouttes -= qt;
    this.caclculMenace();
    await this.updateFiel(this.object);
  }

  caclculMenace() {
    this.object.menace = Math.trunc(this.object.gouttes / 5);
    this.object.gouttes = Math.max(0, Math.min(35, this.object.gouttes));
    // Logique d'effetFielCreator à porter...
  }

  async updateFiel(fiel) {
    await game.settings.set('noc', 'compteurFiel', fiel);
    this.render(true);
    game.socketManager.launchSocket("renderCompteur", {});
    Hooks.callAll("updatedFiel", this, fiel);
  }

  async deleteEffect(event, target) {
    const effectId = target.closest('.effect').dataset.effectId;
    delete this.object.effetActif[effectId];
    await this.updateFiel(this.object);
  }

  async openEffectCreator() {
    // new effetFielCreator().render(true);
  }
}
