import { nocActorSheetPersonnage } from "./actor-sheet-personnage.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class nocActorSheetRouage extends nocActorSheetPersonnage {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "rouage"],
      width: 600,
      height: 780,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }


  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */


}
