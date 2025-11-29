import { nocActorSheetRouage } from "./actor-sheet-rouage.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class nocActorSheetCreature extends nocActorSheetRouage {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "creature"],
      width: 600,
      height: 780,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find('a#roll-creature-attaque').click(this.rollAttaque.bind(this))
  }
  async rollAttaque(ev) {
    this.actor.creatureAttaque()
  }
}