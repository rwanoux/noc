import { socketManager } from "../socketManager.mjs";
export default class effetFielCreator extends FormApplication {
    constructor(settings) {
        super();
        this.settings = game.settings.get("noc", "compteurFiel")
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/systems/noc/templates/window_app/effetFiel.hbs";
        options.title = "effets de fiel"
        options.submitOnChange = true;
        options.closeOnSubmit = false;
        options.editable = true;
        options.width = 600;
        options.height = 400;
        options.id = "effetFiel";
        options.popOut = true;
        options.resizable = true;
        return options;
    }

    async getData() {
        let fielSettings = await game.settings.get('noc', 'compteurFiel')
        let data = {
            isGM: game.user.isGM,
            effets: CONFIG.NOC.effetsFiel,
            menace: fielSettings.menace,
            actualEffects: fielSettings.effetActif
        };
        return mergeObject(super.getData(), data);
    }
    activateListeners(html) {
        html.find('a#cancelEffects')[0].addEventListener("click", () => { this.close() })
        html.find('a#validEffects')[0].addEventListener("click", this.validEffects.bind(this))
    }
    _updateObject() {

    }
    async validEffects(ev) {
        let form = ev.currentTarget.closest('form')
        let allChecks = form.querySelectorAll('input[data-effect-name]');
        let choosedEffects = {};
        allChecks.forEach(c => {
            if (c.checked) {
                let effect = CONFIG.NOC.effetsFiel.find(ef => ef.name == c.dataset.effectName);
                let notes = c.closest('.flexrow').getElementsByClassName('gmNotes')[0].value
                effect.gmNotes = notes;
                effect.id = randomID();
                choosedEffects[effect.id] = effect
            }
        })
        this.storeEffectsSettings(choosedEffects);
        this.messageEffect(choosedEffects);
        this.close();

    }
    async messageEffect(effects) {

        let content = await renderTemplate('./systems/noc/templates/chat/effetFiel.hbs', { effects: effects });
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content
        }

        // Send the chat
        return ChatMessage.create(chatData);
    }
    async storeEffectsSettings(newEffects) {

        let fielSettings = await game.settings.get('noc', 'compteurFiel')
        if (!fielSettings.effetActif) {
            fielSettings.effetActif = newEffects

        } else {
            fielSettings.effetActif = mergeObject(fielSettings.effetActif, newEffects);
        };
        await game.settings.set("noc", "compteurFiel", fielSettings);
        ui.compteur.render(true)
        await socketManager.launchSocket("renderCompteur", {})

    }
}