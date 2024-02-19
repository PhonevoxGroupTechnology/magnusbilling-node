class InvalidOperator extends Error {  
    constructor (message) {
      super(message)

      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor);
    }
}

class Denied extends Error {  
    constructor (message) {
      super(message)

      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor);
    }
}

class IHatePromises extends Error {  
    constructor (message) {
      super(message)

      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor);
    }
}

class ExpectedArgumentMissing extends Error {  
    constructor (message) {
      super(message)

      this.name = this.constructor.name
      Error.captureStackTrace(this, this.constructor);
    }
}


  
module.exports = {
InvalidOperator,
Denied,
IHatePromises,
ExpectedArgumentMissing
}  