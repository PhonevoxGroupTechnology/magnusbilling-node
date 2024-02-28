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
    this.code = 500
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidatingError extends Error {  
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor);
  }
}

class FindError extends Error {  
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

class ExpectedArgumentMisuse extends Error {  
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.code = 5000
    Error.captureStackTrace(this, this.constructor);
  }
}

class ExpectedArgumentMissingArg extends Error {  
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.code = 4000
    Error.captureStackTrace(this, this.constructor);
  }
}

class ExpectedArgumentTooManyArguments extends Error {  
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.code = 4001
    Error.captureStackTrace(this, this.constructor);
  }
}

class ExpectedArgumentArgumentNotAllowed extends Error {  
  constructor (message) {
    super(message)

    this.name = this.constructor.name
    this.code = 4001
    Error.captureStackTrace(this, this.constructor);
  }
}

 
module.exports = {
InvalidOperator,
Denied,
ValidatingError,
IHatePromises,
FindError,
ExpectedArgumentMisuse,
ExpectedArgumentMissingArg,
ExpectedArgumentTooManyArguments,
ExpectedArgumentArgumentNotAllowed,
}  