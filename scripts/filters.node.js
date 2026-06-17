const crypto = require('crypto');
const markdownIt = require('markdown-it');
const _md = markdownIt({ html: false, linkify: true });
// Open links in new tab
_md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
    tokens[idx].attrSet('target', '_blank');
    tokens[idx].attrSet('rel', 'noopener noreferrer');
    return self.renderToken(tokens, idx, options);
};

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
