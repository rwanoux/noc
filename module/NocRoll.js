export default class NocRoll extends Roll {

    constructor(dices, data = {}, options = {}) {
        let formula = `${dices}d10cs>7`;
        super(formula, data, options)
    }


    async toMessage(messageData = {}, { rollMode, create = true } = {}) {
        // Perform the roll, if it has not yet been rolled
        if (!this._evaluated) await this.evaluate({ async: true });
        console.log(this)
        let content = await renderTemplate(`systems/noc/templates/rollMessage.html`, this);
        // Prepare chat data
        messageData = foundry.utils.mergeObject({
            user: game.user.id,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            content: content,
            sound: CONFIG.sounds.dice
        }, messageData);
        messageData.rolls = [this];

        // Either create the message or just return the chat data
        const cls = getDocumentClass("ChatMessage");
        const msg = new cls(messageData);

        // Either create or return the data
        if (create) return cls.create(msg.toObject(), { rollMode });
        else {
            if (rollMode) msg.applyRollMode(rollMode);
            return msg.toObject();
        }
    }

}