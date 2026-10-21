import { classeExo, energieNoireDeduite } from "../../autres.mjs";
import { nocActorSheetPersonnage } from "./actor-sheet-personnage.mjs";


/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class nocActorSheetAutre extends nocActorSheetPersonnage {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["noc", "sheet", "actor", "autre"],
      width: 600,
      height: 780,
      dragDrop: [
        { dragSelector: ".item-list .item", dropSelector: null },
      ],

      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "principal" }]
    });
  }

  /** @override */
  get template() {
    return `systems/noc/templates/actor/actor-${this.actor.type}-sheet.html`;
  }
  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    html.find("a.classe-exo-plus").click(() => this.changerClasseExo(1));
    html.find("a.classe-exo-moins").click(() => this.changerClasseExo(-1));
    html.find("a.energie-plus").click(() => this.forcerEnergieNoire(1));
    html.find("a.energie-moins").click(() => this.forcerEnergieNoire(-1));
    html.find("a.energie-auto").click(() => this.actor.update({ "system.energieNoire.forcee": null }));
  }

  /** Classe Exo entre 1 et 7 ; l'Énergie Noire déduite suit automatiquement */
  async changerClasseExo(ecart) {
    const valeur = classeExo((Number(this.actor._source.system.classeExo?.value) || 7) + ecart);
    return this.actor.update({ "system.classeExo.value": valeur });
  }

  /** Force l'Énergie Noire ; revient en automatique si elle rejoint la valeur déduite */
  async forcerEnergieNoire(ecart) {
    const valeur = Math.max(0, (Number(this.actor.system.energieNoire.value) || 0) + ecart);
    const deduite = energieNoireDeduite(this.actor._source.system.classeExo?.value);
    return this.actor.update({ "system.energieNoire.forcee": valeur === deduite ? null : valeur });
  }
}
