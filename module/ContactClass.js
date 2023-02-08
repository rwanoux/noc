export default class NOCContact {
    constructor(id) {
        this.nom = "";
        this.uuid = id;
        this.description = "";
        this.faveurs = 1;
        this.usedFaveurs = 0;

        this.checkExistingActor(id)
    }

    async checkExistingActor(id) {
        let act = await game.actors.get(id);
        if (act && (act.type == "personnage" || act.type == "rouage")) {
            this.nom = act.name;
            this.description = act.system.signalement;
            this.uuid = act._id;
        }
    }
}