/* -------------------------------------------- */

/* -------------------------------------------- */
export class nocUtility {


  /* -------------------------------------------- */
  static async init() {
    Hooks.on('renderChatLog', (log, html, data) => nocUtility.chatListeners(html))
  }

  /*-------------------------------------------- */
  static upperFirst(text) {
    if (typeof text !== 'string') return text
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  /* -------------------------------------------- */
  static async ready() {
  }

  /* -------------------------------------------- */
  static async loadCompendiumData(compendium) {
    const pack = game.packs.get(compendium)
    return await pack?.getDocuments() ?? []
  }

  /* -------------------------------------------- */
  static async loadCompendium(compendium, filter = item => true) {
    let compendiumData = await nocUtility.loadCompendiumData(compendium)
    return compendiumData.filter(filter)
  }

  /* -------------------------------------------- */
  static getRollDataFromMessage(event) {
    let messageId = nocUtility.findChatMessageId(event.currentTarget)
    let message = game.messages.get(messageId)
    return message.getFlag("world", "rolldata")
  }

  /* -------------------------------------------- */
  static async chatListeners(html) {

    html.on("click", '.roll-dice-bonus', event => {
      let rollData = this.getRollDataFromMessage(event)

      let msgId = nocUtility.findChatMessageId(event.currentTarget)
      nocUtility.removeChatMessageId(msgId)

      let nbDice = $(event.target).data('nb-dice')
      console.log(">>>>>", nbDice)
      this.rollBonus(rollData, nbDice)
    })

  }

  /* -------------------------------------------- */
  static removeChatMessageId(messageId) {
    if (messageId) {
      game.messages.get(messageId)?.delete();
    }
  }

  static findChatMessageId(current) {
    return nocUtility.getChatMessageId(nocUtility.findChatMessage(current));
  }

  static getChatMessageId(node) {
    return node?.attributes.getNamedItem('data-message-id')?.value;
  }

  static findChatMessage(current) {
    return nocUtility.findNodeMatching(current, it => it.classList.contains('chat-message') && it.attributes.getNamedItem('data-message-id'));
  }

  static findNodeMatching(current, predicate) {
    if (current) {
      if (predicate(current)) {
        return current;
      }
      return nocUtility.findNodeMatching(current.parentElement, predicate);
    }
    return undefined;
  }


  /* -------------------------------------------- */
  static createDirectOptionList(min, max) {
    let options = {};
    for (let i = min; i <= max; i++) {
      options[`${i}`] = `${i}`;
    }
    return options;
  }

  /* -------------------------------------------- */
  static buildListOptions(min, max) {
    let options = ""
    for (let i = min; i <= max; i++) {
      options += `<option value="${i}">${i}</option>`
    }
    return options;
  }

  /* -------------------------------------------- */
  static getTarget() {
    if (game.user.targets) {
      for (let target of game.user.targets) {
        return target
      }
    }
    return undefined
  }

  /* -------------------------------------------- */
  static chatDataSetup(content, modeOverride, isRoll = false, forceWhisper) {
    let chatData = {
      user: game.user.id,
      rollMode: modeOverride || game.settings.get("core", "rollMode"),
      content: content
    };

    if (["gmroll", "blindroll"].includes(chatData.rollMode)) chatData["whisper"] = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    if (chatData.rollMode === "blindroll") chatData["blind"] = true;
    else if (chatData.rollMode === "selfroll") chatData["whisper"] = [game.user];

    if (forceWhisper) { // Final force !
      chatData["speaker"] = ChatMessage.getSpeaker();
      chatData["whisper"] = ChatMessage.getWhisperRecipients(forceWhisper);
    }

    return chatData;
  }

  /* -------------------------------------------- */
  static async showDiceSoNice(roll, rollMode) {
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
  static async computeFinalResult(rollData) {
    let actor = game.actors.get(rollData.actorId)

    rollData.niveauFinal = rollData.talent.niveau + rollData.nbSuccess + ((rollData.useVecu) ? 1 : 0) + rollData.nbBonusCollaboratif
    if (rollData.niveauFinalRequis) {
      rollData.margin = Number(rollData.niveauFinal) - Number(rollData.niveauFinalRequis)
      rollData.isReussite = (rollData.margin >= 0)
    }
    let msg = await this.createChatWithRollMode(rollData.alias, {
      content: await renderTemplate(`systems/noc/templates/chat/chat-generic-result.hbs`, rollData)
    });
    rollData.roll = foundry.utils.duplicate(rollData.roll);
    if (rollData.rollBonus) {
      rollData.rollBonus = foundry.utils.duplicate(rollData.rollBonus);
    }
    msg.setFlag("world", "rolldata", rollData)

    if (rollData.useEspoir && !rollData.espoirApplied) {
      rollData.espoirApplied = true
      actor.incDecReserve("espoir", -1)
    }
    if (rollData.useVecu && !rollData.vecuApplied) {
      rollData.vecuApplied = true
      actor.incDecReserve("vecu", -1)
    }

    console.log("rollTalent", rollData)

  }
  /* -------------------------------------------- */
  static async rollBonus(rollData, nbBonusDice) {
    let actor = game.actors.get(rollData.actorId)
    if (!actor.isOwner) {
      ui.notifications.warn("Vous n'avez pas les droits pour relancer les jets de cet Acteur")
      return
    }

    rollData.formulaBonus = `${nbBonusDice}d10cs>=8`
    let myRollBonus = await new Roll(rollData.formulaBonus, actor.system).roll()
    await this.showDiceSoNice(myRollBonus, game.settings.get("core", "rollMode"))
    for (let result of myRollBonus.terms[0].results) {
      if (result.result == 1) {
        ui.compteur.gouttePlus(1)
        rollData.nbFiel++
      }
    }
    rollData.nbBonusDice = nbBonusDice
    rollData.rollBonus = myRollBonus
    // Update du nombre de réussites
    rollData.nbSuccess += rollData.rollBonus.total
    rollData.nbAddDice = 0 // To disable buttons
    await this.computeFinalResult(rollData)
  }

  /* -------------------------------------------- */
  static async roll(rollData) {
    let actor = game.actors.get(rollData.actorId)
    if (!actor.isOwner) {
      ui.notifications.warn("Vous n'avez pas les droits pour lancer les jets de cet Acteur")
      return
    }

    // Jetde base
    rollData.nbDesTotal = rollData.nbDesDomaine + ((rollData.useEspoir) ? 3 : 0);
    rollData.formula = `${rollData.nbDesTotal}d10cs>=8`
    let myRoll = await new Roll(rollData.formula, actor.system).roll()
    await this.showDiceSoNice(myRoll, game.settings.get("core", "rollMode"))

    // Dés additionnels
    rollData.nbAddDice = 0
    rollData.nbFiel = 0
    let maxDiceValue = -1 // Used by Initiative
    for (let result of myRoll.terms[0].results) {
      maxDiceValue = Math.max(maxDiceValue, result.result)
      if (result.result == 10) {
        rollData.nbAddDice++
      }
      if (result.result == 1) {
        ui.compteur.gouttePlus(1)
        rollData.nbFiel++
      }
    }
    rollData.roll = myRoll
    rollData.nbSuccess = rollData.roll.total

    await this.computeFinalResult(rollData)

    // Init management
    if (rollData.combatData) {
      // Init management
      if (rollData.combatData.isInit) {
        let initValue = rollData.niveauFinal + (maxDiceValue / 10)
        actor.setFlag("world", "noc-last-initiative", initValue)
        let combat = game.combats.get(rollData.combatData.combatId)
        combat.setInitiative(rollData.combatData.combatantId, initValue)
      }
    }
  }

  /* -------------------------------------------- */
  static sortArrayObjectsByName(myArray) {
    myArray.sort((a, b) => {
      let fa = a.name.toLowerCase();
      let fb = b.name.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    })
  }
  static sortArrayObjectsByNameAndLevel(myArray) {
    myArray.sort((a, b) => {
      let fa = a.system.level + a.name.toLowerCase();
      let fb = b.system.level + b.name.toLowerCase();
      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    })
  }
  /* -------------------------------------------- */
  static getUsers(filter) {
    return game.users.filter(filter).map(user => user.id);
  }
  /* -------------------------------------------- */
  static getWhisperRecipients(rollMode, name) {
    switch (rollMode) {
      case "blindroll": return this.getUsers(user => user.isGM);
      case "gmroll": return this.getWhisperRecipientsAndGMs("GM");
      case "selfroll": return [game.user.id];
    }
    return undefined;
  }
  /* -------------------------------------------- */
  static getWhisperRecipientsAndGMs(name) {
    console.log("NAME", name)
    let recep1 = ChatMessage.getWhisperRecipients(name) || [];
    return recep1.concat(ChatMessage.getWhisperRecipients('GM'));
  }

  /* -------------------------------------------- */
  static blindMessageToGM(chatOptions) {
    let chatGM = foundry.utils.duplicate(chatOptions);
    chatGM.whisper = this.getUsers(user => user.isGM);
    chatGM.content = "Blinde message of " + game.user.name + "<br>" + chatOptions.content;
    console.log("blindMessageToGM", chatGM);
    game.socket.emit("system.fvtt-warhero", { msg: "msg_gm_chat_message", data: chatGM });
  }

  /* -------------------------------------------- */
  static async searchItem(dataItem) {
    let item
    if (dataItem.pack) {
      item = await fromUuid("Compendium." + dataItem.pack + "." + dataItem.id)
    } else {
      item = game.items.get(dataItem.id)
    }
    return item
  }

  /* -------------------------------------------- */
  static split3Columns(data) {

    let array = [[], [], []];
    if (data == undefined) return array;

    let col = 0;
    for (let key in data) {
      let keyword = data[key];
      keyword.key = key; // Self-reference
      array[col].push(keyword);
      col++;
      if (col == 3) col = 0;
    }
    return array;
  }

  /* -------------------------------------------- */
  static createChatMessage(name, rollMode, chatOptions) {
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
  static async createChatWithRollMode(name, chatOptions) {
    return this.createChatMessage(name, game.settings.get("core", "rollMode"), chatOptions)
  }

  /* -------------------------------------------- */
  static async confirmDelete(actorSheet, li) {
    let itemId = li.data("item-id");
    let msgTxt = "<p>Are you sure to remove this Item ?";
    let buttons = {
      delete: {
        icon: '<i class="fas fa-check"></i>',
        label: "Yes, remove it",
        callback: () => {
          actorSheet.actor.deleteEmbeddedDocuments("Item", [itemId]);
          li.slideUp(200, () => actorSheet.render(false));
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    }
    msgTxt += "</p>";
    let d = new Dialog({
      title: "Confirm removal",
      content: msgTxt,
      buttons: buttons,
      default: "cancel"
    });
    d.render(true);
  }

}