const path = require("path");
const { createHash } = require("crypto");
const { Logger } = require( path.resolve("src/util/logging") );

function sha256(x, y = {digest: hex}) {
    let hash = createHash('sha256').update(x);
    switch (y.digest) {
        case "hex":
            return hash.digest('hex');
        case "base64":
            return hash.digest('base64');
        default:
            throw new Error("Unknown digest");
    }
}

function envBool(param) {
    return (String(param).toLowerCase() === 'true');
}

module.exports = {
    sha256,
    envBool
}