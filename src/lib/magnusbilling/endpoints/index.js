const path = require("path");
const { EndpointMethodManager } = require(path.resolve("src/lib/magnusbilling/managers"))

module.exports = {
    // USER: require(path.resolve("src/lib/magnusbilling/endpoints/clients/user")),
    USER: require(path.resolve("src/lib/magnusbilling/endpoints/clients/usertest")),
    // SIP: require(path.resolve("src/lib/magnusbilling/endpoints/clients/sip")),
    // CALLONLINE: require(path.resolve("src/lib/magnusbilling/endpoints/clients/callonline")),
}