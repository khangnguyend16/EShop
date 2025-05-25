'use strict';

const { body, validationResult } = require('express-validator');

function getErrorMessage(req) {
    let error = validationResult(req);
    if (!error.isEmpty()) {
        let errorArray = error.array();
        return errorArray.reduce((message, error) => {
            return message + error.msg + "<br/>"
        }, '');
    }
    return null;
}
module.exports = { body, getErrorMessage };