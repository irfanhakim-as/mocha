const filters = require("./scripts/filters");
const transforms = require("./scripts/transforms");
const shortcodes = require("./scripts/shortcodes");

module.exports = function (eleventyConfig) {
    eleventyConfig.setServerOptions({
        // files to watch
        watch: [
            "src/assets/styles/",
            "src/assets/scripts/"
        ],
    });

    // files to include
    if (process.env.NODE_ENV === "production") {
        // only passthrough SVGs (raster images are optimised by eleventy-img)
        eleventyConfig.addPassthroughCopy({ "src/assets/images/**/*.svg": "assets/images" });
    } else {
        eleventyConfig.addPassthroughCopy({ "src/assets/images": "assets/images" });
    }
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

    // shortcodes (async)
    Object.keys(shortcodes).forEach((shortcodeName) => {
        eleventyConfig.addNunjucksAsyncShortcode(shortcodeName, shortcodes[shortcodeName]);
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
