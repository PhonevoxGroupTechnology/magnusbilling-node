const path = require("path");
const { EndpointMethodManager } = require(path.resolve("src/lib/magnusbilling/managers"))

const endpoint = new EndpointMethodManager('user').bindMagnusBilling('wasd')
endpoint.addMethod('add', {
    action: 'save', 
    rules: {a: "b"}, 
    handle: (test, magnus, module, action, rules) => {console.log('user endpoint called')}
})

module.exports = endpoint