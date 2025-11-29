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
