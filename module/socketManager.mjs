import { objetDieu } from "./objectDieu.mjs";


export class SocketManager {
    constructor() {
        this.userId = "";
        this.scope = "system.noc"

    };
    init() {
        this.userId = game.userId;
        this.initReceiver
    }

    createMessage(type, data, isGM = false) {
        return {
            isGMAction: isGM,
            userId: game.user._id,
            type: type,
            data: data,
            actionLabel: ""
        }
    }
    async launchSocket(type, data) {
        let msg = this.createMessage(type, data, game.user.isGM);
        game.socket.emit(this.scope, msg);


    }
    async manageReceived(socketMsg) {
        switch (socketMsg.type) {
            case "renderCompteur":
                ui.compteur.render(true);
                break;
            case "displayMecanisme":
                objetDieu.produceMecanisme();
                break
            case "displayFiel":
                objetDieu.displayFiel();
                break
            case "displayFaisceau":
                objetDieu.displayFaisceau();
                break
            case "displayDroplet":
                objetDieu.displayDroplet();
                break
            default: return;
        }
    }

}

