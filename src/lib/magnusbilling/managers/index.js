const path = require("path");
module.exports = {
    EndpointMethodManager: require(path.resolve("src/lib/magnusbilling/managers/EndpointMethodManager")),
    EndpointManager: require(path.resolve("src/lib/magnusbilling/managers/EndpointManager")),
}
