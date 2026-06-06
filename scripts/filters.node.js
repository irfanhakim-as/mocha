const crypto = require('crypto');
const markdownIt = require('markdown-it');
const _md = markdownIt({ html: false, linkify: true });

// Render markdown string as inline HTML
function markdownInline(value) {
    if (!value) return '';
    return _md.renderInline(String(value));
}

// Return a short SHA-1 hex digest of a string
function sha1(value) {
    return crypto.createHash('sha1').update(String(value)).digest('hex').slice(0, 12);
}

module.exports = {
    markdownInline,
    sha1
};
