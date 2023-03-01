import { nocActorSheetRouage } from "./actor-sheet-rouage.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class nocActorSheetCreature extends nocActorSheetRouage {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "creature"],
      width: 900,
      height: 700,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }

}
