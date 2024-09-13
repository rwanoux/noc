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


  /* -------------------------------------------- */
  /*  Drag and Drop                               */
  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);
    html.find("a#surcharge").click(ev => this._onClickSurcharge())
  }

  async _onClickSurcharge() {
    let surcharge = await this.actor.getFlag("noc", "surcharge")
    if (!surcharge) {

      this.createEffectDial()
    } else {
      await this.actor.setFlag("noc", "surcharge", false);
      this.deleteSurchargeEffect()
    }
  }

  async createEffectDial() {
    let dialogData = {
      talents: game.system.template.Actor.personnage.talents,
      actor: this.actor
    };
    let content = await renderTemplate('systems/noc/templates/window_app/dialog-surcharge.hbs', dialogData)
    let buttons = {
      create: {
        icon: '<i class="fas fa-check"></i>',
        label: `Appliquer`,
        callback: async (html) => {
          let select = html.find('#talentPath')[0];
          let talentPath = select.options[select.selectedIndex].value;

          await this.actor.setFlag("noc", "surcharge", talentPath.split(".")[talentPath.split(".").length - 1]);
          await this.actor.update({
            "system.energieNoire.value": this.actor.system.energieNoire.value - 1
          })
          await this.createSurchargeEffect(talentPath)
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Annuler"
      }
    }

    let d = new Dialog({
      title: "Surcharge d'énergie noire",
      content: content,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }
  async createSurchargeEffect(talentPath) {
    let effectData = {
      label: `surcharge`,
      changes: [{
        "key": talentPath + '.niveau',
        "value": 2,
        "mode": 2
      }],
      disabled: false
    };
    await this.actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }
  async deleteSurchargeEffect() {
    let effect = this.actor.effects.find(ef => ef.label == "surcharge");
    this.actor.deleteEmbeddedDocuments('ActiveEffect', [effect.id])
  }
}
