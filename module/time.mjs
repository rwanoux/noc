// Classe représentant un quart
class Quarter {
    constructor(number) {
        this.number = number;
        this.duration = 7; // Durée d'un quart en heures

        // Les quarts de travail et repos alternent tous les deux quarts
        if (number % 4 === 1 || number % 4 === 2) {
            this.type = "travail"; // Quarts 1 et 2, 5 et 6, etc. sont des quarts de travail
        } else {
            this.type = "repos"; // Quarts 3 et 4, 7 et 8, etc. sont des quarts de repos
        }

        // Le 7ème quart est également un quart de contemplation
        if (number === 7) {
            this.isContemplation = true;
        } else {
            this.isContemplation = false;
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
class Cycle {
    constructor(number) {
        this.number = number;
        this.quarters = [];

        // Ajouter les 7 quarts dans le cycle avec alternance travail/repos
        for (let i = 1; i <= 7; i++) {
            this.quarters.push(new Quarter(i));
        }
    }

    // Obtenir un quart spécifique du cycle
    getQuarter(quarterNumber) {
        return this.quarters[quarterNumber - 1];
    }
}

// Classe représentant un mois
class Month {
    constructor(number) {
        this.number = number;
        this.cycles = [];

        // Ajouter les 14 cycles dans le mois
        for (let i = 1; i <= 14; i++) {
            this.cycles.push(new Cycle(i));
        }
    }

    // Obtenir un cycle spécifique du mois
    getCycle(cycleNumber) {
        return this.cycles[cycleNumber - 1];
    }
}

// Classe représentant le calendrier
class Calendar {
    constructor() {
        this.months = [];
        this.currentDate = { month: 1, cycle: 1, quarter: 1 }; // Date courante par défaut
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
        let currentMonth = this.getMonth(this.currentDate.month);
        if (!currentMonth) return "Aucun mois correspondant à la date actuelle";

        let currentCycle = currentMonth.getCycle(this.currentDate.cycle);
        let currentQuarter = currentCycle.getQuarter(this.currentDate.quarter);

        return `${this.currentDate.quarter}ème quart du cycle ${this.currentDate.cycle} du mois ${this.currentDate.month}`;
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
}
