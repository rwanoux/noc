export default class NOCContact {
    constructor(id) {
        this.nom = "";
        this.id = id;
        this.description = "";
        this.faveurs = 0;
        this.usedFaveurs = 0;

        this.checkExistingActor(id)
    }

    async checkExistingActor(id) {
        let act = await Actor.get(id);
        if (act && (act.type == "personnage" || act.type == "rouage")) {
            this.nom = act.name;
            this.description = act.system.description;
            this.id = act._id;
            this.img = act.img;
        }
    }

    async getActor() {
        return await Actor.get(this.id)
    }
}