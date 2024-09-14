import { Calendar } from "./time.mjs";

export class CalendarApp extends FormApplication {
    constructor(settings) {
        super();
    }
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "/systems/noc/templates/window_app/calendar.hbs";
        options.title = "calendar"
        options.submitOnChange = true;
        options.closeOnSubmit = false;
        options.editable = true;
        options.id = "calendar";
        options.popOut = true;
        options.resizable = true;
        return options;
    }

    async getData() {
        let data = super.getData();
        //let setting = await game.settings.get("noc", "calendar");
        // data.object = foundry.utils.mergeObject(new Calendar(), setting);
        data.object = new Calendar();

        return data
    }

    async activateListeners(html) {

        super.activateListeners(html);


    }
    async _updateObject(event, formData) {


    }

}