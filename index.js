'use strict';

const COMMAND_DELIMITER = '#';

function notNull(context, path) {
    for (var state = context, i = 0; i < path.length; i++) {
        if (state == null) {
            return false;
        }
        var pathTerm = path[i];
        state = state[pathTerm];
    }
    return state != null;
}
notNull.$name = 'notNull';
const provider = validatorProvider();

function validator(scheme) {
    if (!scheme) {
        throw 'The Scheme must be defined';
    }
    var parsed = parser(scheme);
    var path = parsed.path;
    var validators = parsed.validators;
    var conditions = scheme.conditions || [];
    return function (context) {
        if (!context) {
            throw 'The context must be defined'
        }
        var allConditionsSuccess = conditions.every(function (condition) {
            return condition(context);
        });
        var res = formValidationResult(context, allConditionsSuccess);
        return res.reduce(function (res, validator) {
            res.errors.push(`${path.join('.')}#${validator.$name}`);
            return res;
        }, {success: res.length === 0, errors: []});
    };

    function formValidationResult(context, allConditionsSuccess) {
        if (!allConditionsSuccess) {
            return [];
        }
        return validators.map(function (validator) {
            return typeof validator === 'function' ? validator : provider.get(validator)
        }).filter(function (validator) {
            return !validator(context, path);
        });
    }


}


function parser(expression) {
    switch(Object.prototype.toString.call(expression)){
        case '[object String]':
            return stringParser(expression);
        case '[object Object]':
            return schemaParser(expression);
        default:
            throw 'The expression must be either a string or an object';
    }

}
function schemaParser(schema) {
    var validators = schema.validators;
    checkValidatorsExistence(validators);
    return {
        validators: validators,
        path: splitPath(schema.path)
    };
}
function stringParser(expression) {
    var parts = expression.split(COMMAND_DELIMITER);
    var path = parts[0];
    var validators = parts[1];
    checkValidatorsExistence(validators);
    return {
        path: splitPath(path),
        validators: validators.split('&')
    };
}
function checkValidatorsExistence(validators){
    if (typeof validators !== 'string' && !Array.isArray(validators)) {
        throw 'Validators have to be specified';
    }
}

function splitPath(path) {
    return path.split('.');
}

function validatorProvider() {
    var validators = {};
    var provider = {
        get: function (name) {
            var validator = validators[name];
            if (!validator) {
                throw `Validator for the name '${name}' doesn't exist`;
            }
            return validator;
        },
        put: function (validator) {
            if (!validator) {
                throw `The validator  is not passed`;
            }
            if (!validator.$name) {
                throw 'The name of the validator is not specified';
            }
            validators[validator.$name] = validator;
        }
    };
    provider.put(notNull);
    return provider;
}


module.exports.validator = validator;
module.exports.parser = parser;
module.exports.validatorProvider = provider;