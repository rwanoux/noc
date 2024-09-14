// Classe représentant un quart
export class Quarter {
    constructor(yearPosition) {
        this.duration = 7; // Durée d'un quart en heures;
        this.cyclePosition = (yearPosition % 7) || 7;
        this.isContemplation = (yearPosition % 7 == 0);
        this.yearPosition = yearPosition;
        this.monthPosition = (yearPosition % 98) || 98;
        this.monthNumber = Math.ceil(yearPosition / 98);
        this.cycleNumber = Math.ceil(Math.ceil(yearPosition / 7))
        this.type = "";
        this.initType();

    }
    initType() {
        switch (this.yearPosition % 4) {
            case (1):
            case (2):
                this.type = "travail";
                break;
            default:
                this.type = "repos";
                break;

        }
    }
    // Vérifier si le quart est de travail
    isWorkQuarter() {
        return this.type === "travail";
    }

    // Vérifier si le quart est de repos
    isRestQuarter() {
        return this.type === "repos";
    }

    // Vérifier si le quart est de contemplation
    isContemplationQuarter() {
        return this.isContemplation;
    }
}

// Classe représentant un cycle
export class Cycle {
    constructor(number) {
        this.yearPosition = number;
        this.quarters = [];
        this.monthPosition = Math.ceil(number / 14);


    }

    // Obtenir un quart spécifique du cycle
    getQuarter(quarterNumber) {
        return this.quarters[quarterNumber - 1];
    }
}

// Classe représentant un mois
export class Month {
    constructor(number) {
        this.number = number;
        this.cycles = new Array(14).fill({});
        this.quarters = new Array(98).fill({});

    }


    // Obtenir un cycle spécifique du mois
    getCycle(cycleNumber) {
        return this.cycles[cycleNumber - 1];
    }
}
class Year {
    constructor() {
        // Générer un nombre aléatoire de quarters entre 1222 et 1522
        const randomSize = Math.floor(Math.random() * (1522 - 1222 + 1)) + 1222;

        // Créer un tableau de quarters de la taille générée
        this.quarters = new Array(randomSize).fill({});
        // génère un code d'année aléatoire
        this.code = this.generateCode();
        //remplissage des quarts
        this.quarterDuration = this.quarters.length;
        //remplissage des mois;
        this.monthDuration = Math.ceil(this.quarterDuration / 98);
        this.months = new Array(this.monthDuration).fill({});



        this.initQuarters();
        this.initMonths();






    }
    initMonths() {
        for (let monthIndex = 0; monthIndex < this.monthDuration; monthIndex++) {
            this.months[monthIndex] = new Month(monthIndex + 1);
            this.months[monthIndex].quarters = this.quarters.filter(q => q.monthNumber == (monthIndex + 1));
            for (let cycleIndex = 0; cycleIndex < this.months[monthIndex].cycles.length; cycleIndex++) {
                console.log((monthIndex * 14) + cycleIndex + 1);
                this.months[monthIndex].cycles[cycleIndex] = new Cycle((monthIndex * 14) + cycleIndex + 1);
                console.log(this.months[monthIndex].cycles[cycleIndex]);
                this.months[monthIndex].cycles[cycleIndex].quarters = this.months[monthIndex].quarters.filter(q => q.cycleNumber == this.months[monthIndex].cycles[cycleIndex].yearPosition);
                this.months[monthIndex].cycles[cycleIndex].monthIndex = cycleIndex + 1

            }
            console.log(this.months[monthIndex])
        }

    }
    initQuarters() {
        for (let i = 0; i < this.quarterDuration; i++) {
            this.quarters[i] = new Quarter(i + 1);
        }
    }
    generateCode() {
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += Math.floor(Math.random() * 10) + '#'; // Ajoute un chiffre suivi de #
        }
        result += Math.floor(Math.random() * 10); // Ajoute le dernier chiffre sans #
        return result;
    }
}
// Classe représentant le calendrier
export class Calendar {
    constructor() {
        this.years = [new Year()];
        this.months = [];
        this.currentDate = { year: 0, quarter: 612 };// Date courante par défaut
        this.focusDate = this.currentDate;// Date affichée par défaut
        this.currentStringDate = this.getCurrentDate();
    }

    // Ajouter un mois avant la date courante
    addMonthBefore() {
        let newMonthNumber = this.months.length > 0 ? this.months[0].number - 1 : -1;
        this.months.unshift(new Month(newMonthNumber));
    }

    // Ajouter un mois après la date courante
    addMonthAfter() {
        let newMonthNumber = this.months.length > 0 ? this.months[this.months.length - 1].number + 1 : 1;
        this.months.push(new Month(newMonthNumber));
    }

    // Obtenir un mois spécifique
    getMonth(monthNumber) {
        return this.months.find(month => month.number === monthNumber);
    }

    // Obtenir la date courante sous forme : "xème quart du mois y"
    getCurrentDate() {
        let year = this.years[this.currentDate.year].code;
        let quarter = this.years[this.currentDate.year].quarters[this.currentDate.quarter - 1];
        return `${quarter.monthPosition}ème quart du mois ${quarter.monthNumber} de l'année ${year}`;
    }

    // Définir une nouvelle date courante
    setCurrentDate(month, cycle, quarter) {
        // Vérifier si la date est valide
        if (month < 1 || cycle < 1 || cycle > 14 || quarter < 1 || quarter > 7) {
            throw new Error("Date invalide. Veuillez entrer un mois, un cycle (1-14) et un quart (1-7) valides.");
        }

        // Ajouter des mois si nécessaire
        while (!this.getMonth(month)) {
            if (month < this.currentDate.month) {
                this.addMonthBefore();
            } else {
                this.addMonthAfter();
            }
        }

        // Mettre à jour la date courante
        this.currentDate = { month, cycle, quarter };
        return this;
    }

    // Avancer d'un quart
    advanceQuarter() {
        let { month, cycle, quarter } = this.currentDate;

        if (quarter < 7) {
            this.currentDate.quarter++;
        } else if (cycle < 14) {
            this.currentDate.quarter = 1;
            this.currentDate.cycle++;
        } else {
            this.currentDate.quarter = 1;
            this.currentDate.cycle = 1;
            this.currentDate.month++;
            this.addMonthAfter(); // Ajouter un nouveau mois si nécessaire
        }
    }

    // Reculer d'un quart
    retreatQuarter() {
        let { month, cycle, quarter } = this.currentDate;

        if (quarter > 1) {
            this.currentDate.quarter--;
        } else if (cycle > 1) {
            this.currentDate.quarter = 7;
            this.currentDate.cycle--;
        } else {
            this.currentDate.quarter = 7;
            this.currentDate.cycle = 14;
            this.currentDate.month--;
            this.addMonthBefore(); // Ajouter un mois si nécessaire
        }
    }
    toObject() {
        return { ...this }
    }
}
