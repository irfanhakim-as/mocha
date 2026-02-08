const fs = require("fs");
const path = require("path");
const site = require("./site.json");
const health = require("./health.json");
const owner = require("./owner.json");
// pet.json with cat.json fall back
const petData = fs.existsSync(path.join(__dirname, "pet.json")) ? "pet.json" : "cat.json";
const pet = require(`./${petData}`);

module.exports = {
    site,
    pet,
    cat: pet,
    health,
    owner,
};
