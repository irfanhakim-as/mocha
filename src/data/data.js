const fs = require("fs");
const path = require("path");
const pkg = require("../../package.json");
const site = require("./site.json");
const health = require("./health.json");
const owner = require("./owner.json");
const {
    medicationStatus,
    vaccinationStatus,
} = require("../../scripts/filters");
// prioritise cat.json (legacy) with pet.json fall back
const petData = fs.existsSync(path.join(__dirname, "cat.json")) ? "cat.json" : "pet.json";
const pet = require(`./${petData}`);

module.exports = {
    version: pkg.version,
    site,
    pet,
    cat: pet,
    health: {
        ...health,
        vaccinations: (health.vaccinations || []).map(vax => ({
            ...vax,
            status: vaccinationStatus(vax.nextDue, vax, health.vaccinations).class,
        })),
        medications: (health.medications || []).map(med => ({
            ...med,
            status: medicationStatus(med.endDate, med).class,
        })),
    },
    owner,
};
