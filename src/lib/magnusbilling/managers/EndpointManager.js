class EndpointManager {
    constructor(endpoints) {
        this._magnus = null;
        this.endpoint = {}
        this._DEBUG = true;

        for (const [key, value] of Object.entries(endpoints)) {
            this.endpoint[key] = value;
        }

        return this;
    }

    _log(msg) {
        if (this._DEBUG) {
            console.log('EndpointManager: ' + msg)
        }
    }

    bindAll(magnus) {
        this._magnus = magnus;        
        for (const endpoint in this.endpoint) {
            this._log(`Tratando o endpoint "${endpoint}"`)
            this._bind(this.endpoint[endpoint])
        }

        return this;
    }

    _bind(EndpointClass, magnus = this._magnus) {
        this._log(`Bindando "${JSON.stringify(EndpointClass)}"`)
        EndpointClass._bindMagnusBilling(magnus) // We expect that the EndpointClass has a method called "_bindMagnusBilling"
        return this;
    }

    // method to create documentation for every endpoint located, based on endpoint rules
    //_createDocumentation() {} 

}

module.exports = EndpointManager
