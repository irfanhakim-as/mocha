const filters = require("./scripts/filters");
const transforms = require("./scripts/transforms");

module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        // files to watch
        watch: [
            "src/assets/styles/",
            "src/assets/scripts/"
        ],
    });

    // files to include
    eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
    eleventyConfig.addPassthroughCopy({ "src/assets/logos": "assets/logos" });
    eleventyConfig.addPassthroughCopy({ "src/assets/public": "/" });

    // filters
    Object.keys(filters).forEach((filterName) => {
        eleventyConfig.addFilter(filterName, filters[filterName]);
    });

    // transforms
    Object.keys(transforms).forEach((transformName) => {
        eleventyConfig.addTransform(transformName, transforms[transformName]);
    });

    return {
        dir: {
            // source files
            input: "src/views",
            // output for built files
            output: "dist",
            // templates and layouts
            includes: "../includes",
            // project data
            data: "../data",
        },
        templateFormats: ["njk", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk",
    };
};
