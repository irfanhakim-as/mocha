// Eleventy shortcodes

const Image = require("@11ty/eleventy-img");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const originalUrl = (src) => `/assets/images/${src}`;

// Optimise images in production and skip SVGs
function shouldOptimise(src) {
    return isProduction && path.extname(src).toLowerCase() !== ".svg";
}

// Build common img attribute string (alt, class, loading)
function imgAttrs(alt, className, loading) {
    return `alt="${alt || ""}"${className ? ` class="${className}"` : ""} loading="${loading || "lazy"}"`;
}

// Generate optimised versions at given widths and formats using eleventy-img
async function processImage(src, widths, formats) {
    return Image(path.join("src/assets/images", src), {
        widths,
        formats,
        outputDir: "dist/assets/images/optimised",
        urlPath: "/assets/images/optimised",
        filenameFormat: (_id, src, width, format) =>
            `${path.basename(src, path.extname(src))}-${width}w.${format}`,
    });
}

// Format an array of image metadata into a srcset string
function buildSrcset(images) {
    return images.map((img) => `${img.url} ${img.width}w`).join(", ");
}

// Returns a picture element with srcset (optimised) or plain img
async function optimisedImage(src, alt, className, loading) {
    if (!src) return "";
    if (!shouldOptimise(src)) {
        return `<img src="${originalUrl(src)}" ${imgAttrs(alt, className, loading)}>`;
    }

    const isHero = className && className.includes("hero");
    const widths = isHero ? [200, 400, 560] : [400, 600, 800];
    const sizes = isHero ? "(min-width: 768px) 280px, 200px" : "(min-width: 768px) 386px, calc(100vw - 3rem)";

    let metadata;
    try {
        metadata = await processImage(src, widths, ["webp", "jpeg"]);
    } catch (err) {
        console.warn(`[image] Could not optimise "${src}": ${err.message}`);
        // return `<img src="${originalUrl(src)}" ${imgAttrs(alt, className, loading)}>`;
        return "";
    }

    const largest = metadata.jpeg.at(-1);

    return `<picture>
    <source type="image/webp" srcset="${buildSrcset(metadata.webp)}" sizes="${sizes}">
    <source type="image/jpeg" srcset="${buildSrcset(metadata.jpeg)}" sizes="${sizes}">
    <img src="${largest.url}" ${imgAttrs(alt, className, loading)} width="${largest.width}" height="${largest.height}">
</picture>`;
}

// Returns the URL of an optimised image or original path
async function optimisedImageUrl(src, width, format) {
    if (!src || !shouldOptimise(src)) return originalUrl(src || "");

    const fmt = format || "jpeg";

    try {
        const metadata = await processImage(src, [width || 1920], [fmt]);
        return metadata[fmt][0].url;
    } catch (err) {
        console.warn(`[image] Could not optimise "${src}": ${err.message}`);
        // return originalUrl(src);
        return "";
    }
}

module.exports = { optimisedImage, optimisedImageUrl };
