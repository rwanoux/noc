import { nocUtility } from "../noc-utility.js";

/* -------------------------------------------- */
export class nocCombat extends Combat {

  /* -------------------------------------------- */
  async rollInitiative(ids, formula = undefined, messageOptions = {}) {
    ids = typeof ids === "string" ? [ids] : ids;
    for (let cId = 0; cId < ids.length; cId++) {
      const c = this.combatants.get(ids[cId]);
      let id = c._id || c.id;
      let initBonus = c.actor ? await c.actor.getInitiativeScore(this.id, id) : -1;
      await this.updateEmbeddedDocuments("Combatant", [{ _id: id, initiative: initBonus }]);
    }

    return this;
  }

  /************************************************************************************/
  _onDelete() {
    let combatants = this.combatants.contents
    for (let c of combatants) {
      let actor = game.actors.get(c.actorId)
      actor.clearInitiative()
    }
    super._onDelete()
  }
  async resetAll() {
    let combatants = this.combatants.contents
    for (let c of combatants) {
      let actor = game.actors.get(c.actorId)
      actor.clearInitiative()
    }
    super.resetAll()
  }

}

/**
 * Une nouvelle rencontre reçoit d'office tous les jetons de sa scène
 * (seulement chez l'utilisateur qui l'a créée, pour ne pas les ajouter plusieurs fois).
 */
export function enregistrerAjoutJetonsCombat() {
  Hooks.on("createCombat", async (combat, options, userId) => {
    if (userId !== game.user.id) return;
    const scene = combat.scene ?? canvas.scene;
    if (!scene) return;
    const presents = new Set(combat.combatants.map(c => c.tokenId));
    const donnees = scene.tokens
      .filter(t => t.actor && !presents.has(t.id))
      .map(t => ({ tokenId: t.id, sceneId: scene.id, actorId: t.actorId, hidden: t.hidden }));
    if (donnees.length) await combat.createEmbeddedDocuments("Combatant", donnees);
  });
}
