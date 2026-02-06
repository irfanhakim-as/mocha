// Eleventy transforms

const htmlMinifier = require('html-minifier-terser');

// Minify HTML in production
function minifyHtml(content, outputPath) {
    if (process.env.NODE_ENV !== 'production') {
        return content;
    }
    if (outputPath && outputPath.endsWith('.html')) {
        return htmlMinifier.minify(content, {
            useShortDoctype: true,
            removeComments: true,
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        });
    }
    return content;
}

module.exports = {
    minifyHtml
};
