import effetFielCreator from "./effetFielCreator.mjs";

export default class CompteurFiel extends FormApplication {
    constructor(settings) {
        super();
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/systems/noc/templates/window_app/compteurFiel.hbs";
        options.title = "compteur de Fiel"
        options.submitOnChange = true;
        options.closeOnSubmit = false;
        options.editable = true;
        options.id = "CompteurFiel";
        options.popOut = false;
        return options;
    }

    async getData() {
        let data = super.getData()
        data.object = await game.settings.get("noc", "compteurFiel");
        data.isGM = game.user.isGM;
        data.effets = CONFIG.NOC.effetsFiel;

        this.object = data.object;

        return data
    }

    async activateListeners(html) {
        let rotate = (this.object.gouttes) * (-10.285);
        let aiguilleEl = html.find('#aiguille')[0];
        aiguilleEl.style.transform = `rotate(${rotate}deg)`;

        if (game.user.isGM) {
            html.find('#gouttePlus')[0].addEventListener('click', () => { this.gouttePlus(1) });
            html.find('#goutteMoins')[0].addEventListener('click', () => { this.goutteMoins(1) });
            html.find('#addEffect')[0].addEventListener('click', this.openEffectCreator.bind(this));
            for (let deleteButton of html.find('.deleteEffect')) {
                deleteButton.addEventListener('click', this.deleteEffect.bind(this))
            }

        }
        super.activateListeners(html);


    }
    async deleteEffect(ev) {
        let effectId = ev.currentTarget.closest('.effect').dataset.effectId;
        delete this.object.effetActif[effectId];
        await this.updateFiel(this.object);


    }
    async _updateObject(event, formData) {

        const data = expandObject(formData);
        await game.settings.set('noc', 'compteurFiel', data);
        await game.socket.emit({ type: "renderCompteur" })
    }
    async updateFiel(fiel) {
        await game.settings.set('noc', 'compteurFiel', fiel);
        this.render(true)
        game.socketManager.launchSocket("renderCompteur", {});
        Hooks.callAll("updatedFiel", this, fiel)

    }
    _injectHTML(html) {
        html.insertAfter('#controls');
        this._element = html;
        html.hide().fadeIn(200);
    }
    caclculMenace() {
        let oldValue = this.object.menace
        this.object.menace = Math.trunc(this.object.gouttes / 5);
        this.object.gouttes = Math.max(0, Math.min(35, this.object.gouttes));
        if (oldValue < this.object.menace) {
            new effetFielCreator().render(true)
        }

    }
    async goutteMoins(qt) {
        this.object.gouttes = this.object.gouttes - qt;
        this.caclculMenace(this.object.gouttes);
        this.updateFiel(this.object);


    }
    async gouttePlus(qt) {
        this.object.gouttes = this.object.gouttes + qt;
        this.caclculMenace(this.object.gouttes);
        this.updateFiel(this.object)

    }
    async openEffectCreator(ev) {
        new effetFielCreator().render(true)
    }

}