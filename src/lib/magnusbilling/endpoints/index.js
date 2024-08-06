const path = require("path");
const { EndpointManager } = require(path.resolve("src/lib/magnusbilling/managers"))

const epManager = new EndpointManager({
    USER: require(path.resolve("src/lib/magnusbilling/endpoints/clients/usertest")),
})


module.exports = new EndpointManager({
    //ENDPOINT_NAME: require(path.resolve("PATH_TO_ENDPOINT")),
    USER: require(path.resolve("src/lib/magnusbilling/endpoints/clients/usertest")),
    SIP: require(path.resolve("src/lib/magnusbilling/endpoints/clients/siptest")),
})