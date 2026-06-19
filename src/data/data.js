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
const petDataFile = fs.existsSync(path.join(__dirname, "cat.json")) ? "cat.json" : "pet.json";
const pet = require(`./${petDataFile}`);

// pre-process arrays used in templates
const galleryPhotos = (pet.photos || []).filter(p => !p.featured);
const vaccinations = (health.vaccinations || []).map(vax => ({
    ...vax,
    status: vaccinationStatus(vax.nextDue, vax, health.vaccinations).class,
}));
const medications = (health.medications || []).map(med => ({
    ...med,
    status: medicationStatus(med.endDate, med).class,
}));

// hasData controls section + nav link visibility in templates
const petData = {
    ...pet,
    galleryPhotos,
    hasData: !!galleryPhotos.length,
};

const healthData = {
    ...health,
    vaccinations,
    medications,
    hasData: !!(
        vaccinations.length ||
        (health.vetVisits || []).length ||
        (health.weight || []).length ||
        (health.allergies || []).length ||
        (health.conditions || []).length ||
        medications.length
    ),
};

const ownerData = {
    ...owner,
    hasOwner: !!(
        owner.name || owner.phone || owner.email ||
        owner.address || owner.notes ||
        (owner.socials || []).length
    ),
    hasData: !!(
        owner.name || owner.phone || owner.email ||
        owner.address || owner.notes ||
        (owner.socials || []).length ||
        owner.emergencyContact
    ),
};

module.exports = {
    version: pkg.version,
    site,
    pet: petData,
    cat: petData,
    health: healthData,
    owner: ownerData,
};
