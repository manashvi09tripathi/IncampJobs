/**
 * class for our error handler middleware
 */

class ErrorResponse extends Error {
    constructor(message, statusCode) {
        super(message)
        this.statusCode = statusCode
    }
}

module.exports = ErrorResponse