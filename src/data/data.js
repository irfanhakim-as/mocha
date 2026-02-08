const fs = require("fs");
const path = require("path");
const site = require("./site.json");
const health = require("./health.json");
const owner = require("./owner.json");
// prioritise cat.json (legacy) with pet.json fall back
const petData = fs.existsSync(path.join(__dirname, "cat.json")) ? "cat.json" : "pet.json";
const pet = require(`./${petData}`);

module.exports = {
    site,
    pet,
    cat: pet,
    health,
    owner,
};
