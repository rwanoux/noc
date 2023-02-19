import CompteurFiel from "../compteursFiel/compteurFiel.mjs";

export class nocRollDialog extends Dialog {

  /* -------------------------------------------- */
  static async create(actor, rollData) {

    let options = { classes: ["nocDialog"], width: 420, height: 'fit-content', 'z-index': 99999 };
    let html = await renderTemplate('systems/noc/templates/window_app/dialog-roll-generic.hbs', rollData);

    return new nocRollDialog(actor, rollData, html, options);
  }

  /* -------------------------------------------- */
  constructor(actor, rollData, html, options, close = undefined) {
    let conf = {
      title: "",
      content: html,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: "Lancer !",
          callback: () => { this.roll() }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Annuler",
          callback: () => { this.close() }
        }
      },
      close: close
    }

    super(conf, options);

    this.actor = actor;
    this.rollData = rollData;
  }

  /* -------------------------------------------- */
  async showDiceSoNice(roll, rollMode) {
    if (game.modules.get("dice-so-nice")?.active) {
      if (game.dice3d) {
        let whisper = null;
        let blind = false;
        rollMode = rollMode ?? game.settings.get("core", "rollMode");
        switch (rollMode) {
          case "blindroll": //GM only
            blind = true;
          case "gmroll": //GM + rolling player
            whisper = this.getUsers(user => user.isGM);
            break;
          case "roll": //everybody
            whisper = this.getUsers(user => user.active);
            break;
          case "selfroll":
            whisper = [game.user.id];
            break;
        }
        await game.dice3d.showForRoll(roll, game.user, true, whisper, blind);
      }
    }
  }

  /* -------------------------------------------- */
  getUsers(filter) {
    return game.users.filter(filter).map(user => user.id);
  }
  /* -------------------------------------------- */
  getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs(name);
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  getWhisperRecipientsAndGMs(name) {
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  blindMessageToGM(chatOptions) {
    let chatGM = duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blinde message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.fvtt-warhero", { msg: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  createChatMessage(name, rollMode, chatOptions) {
    switch (rollMode) {
      case "blindroll": // GM only
        if (!game.user.isGM) {
          this.blindMessageToGM(chatOptions);

          chatOptions.whisper = [game.user.id];
          chatOptions.content = "Message only to the GM";
        }
        else {
          chatOptions.whisper = this.getUsers(user => user.isGM);
        }
        break;
      default:
        chatOptions.whisper = this.getWhisperRecipients(rollMode, name);
        break;
    }
    chatOptions.alias = chatOptions.alias || name;
    return ChatMessage.create(chatOptions);
  }

  /* -------------------------------------------- */
  async createChatWithRollMode(name, chatOptions) {
    return this.createChatMessage(name, game.settings.get("core", "rollMode"), chatOptions)
  }

  /* -------------------------------------------- */
  async roll() {
    let rollData = this.rollData
    let actor = game.actors.get(rollData.actorId)

    // Jetde base
    rollData.nbDesTotal = rollData.nbDesDomaine + ((rollData.useEspoir) ? 3 : 0);
    rollData.formula = `${rollData.nbDesTotal}d10cs>=8`
    let myRoll = new Roll(rollData.formula, actor.system).roll({ async: false })
    await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))
    // Dés additionnels
    let nbAddDice = 0
    let nbFiel = 0
    for (let result of myRoll.terms[0].results) {
      if (result.result == 10) {
        nbAddDice++
      }
      if (result.result == 1) {
        ui.compteur.gouttePlus(1)
        nbFiel++
      }
    }
    let myRollBonus
    if (nbAddDice) {
      rollData.formulaBonus = `${nbAddDice}d10cs>=8`
      myRollBonus = new Roll(rollData.formulaBonus, actor.system).roll({ async: false })
      await this.showDiceSoNice(myRollBonus, game.settings.get("core", "rollMode"))
      for (let result of myRollBonus.terms[0].results) {
        if (result.result == 1) {
          ui.compteur.gouttePlus(1)
          nbFiel++
        }
      }
    }
    // Stockage résultats
    rollData.roll = myRoll
    rollData.rollBonus = myRollBonus
    rollData.nbSuccess = myRoll.total + (myRollBonus?.total ?? 0)
    rollData.niveauFinal = rollData.talent.niveau + rollData.nbSuccess + ((rollData.useVecu) ? 1 : 0)
    rollData.nbFiel = nbFiel

    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/noc/templates/chat/chat-generic-result.hbs`, rollData)
    })
    msg.setFlag("world", "rolldata", rollData)

    if (rollData.useEspoir) {
      actor.incDecReserve("espoir", -1)
    }
    if (rollData.useVecu) {
      actor.incDecReserve("vecu", -1)
    }

    console.log("rollTalent", rollData)
  }

  /* -------------------------------------------- */
  async refreshDialog() {
    const content = await renderTemplate("systems/noc/templates/dialog-roll-generic.hbs", this.rollData)
    this.data.content = content
    this.render(true)
  }

  /* -------------------------------------------- */
  activateListeners(html) {
    super.activateListeners(html);

    var dialog = this;
    function onLoad() {
    }
    $(function () { onLoad(); });

    html.find('#useEspoir').change((event) => {
      this.rollData.useEspoir = event.currentTarget.checked
    })
    html.find('#useVecu').change((event) => {
      this.rollData.useVecu = event.currentTarget.checked
    })
    html.find('#nbDesDomaine').change((event) => {
      this.rollData.nbDesDomaine = Number(event.currentTarget.value)
    })


  }
}