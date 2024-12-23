import { createHash } from 'crypto';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { logging } from './logging.js';

const logger = logging.getLogger('api.utils');

export const bcryptPassword = async (password, saltRounds) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        throw new Error('Error trying to encrypt password: ' + err.message);
    }

}

// this is REALLY simplified.
export const zodToJson = (zodSchema) => {
    const schemaDetails = {};

    const processField = (field) => {
        const fieldDetails = {};

        // Optional field
        if (field instanceof z.ZodOptional) {
            fieldDetails.required = false;
            field = field._def.innerType; // Tipo interno
        } else {
            fieldDetails.required = true;
        }

        // Has default value
        if (field instanceof z.ZodDefault) {
            fieldDetails.default = field._def.defaultValue();
            field = field._def.innerType; // Tipo interno
        }

        // Is a number
        if (field instanceof z.ZodNumber) {
            fieldDetails.type = "number";
            if (field._def.checks) {
                field._def.checks.forEach((check) => {
                    if (check.kind === "int") fieldDetails.integer = true;
                    if (check.kind === "min") fieldDetails.min = check.value;
                    if (check.kind === "max") fieldDetails.max = check.value;
                    if (check.kind === "gte") fieldDetails.gte = check.value;
                    if (check.kind === "lte") fieldDetails.lte = check.value;
                });
            }
        }

        // Is a string
        if (field instanceof z.ZodString) {
            fieldDetails.type = "string";
            if (field._def.checks) {
                field._def.checks.forEach((check) => {
                    if (check.kind === "min") fieldDetails.minLength = check.value;
                    if (check.kind === "max") fieldDetails.maxLength = check.value;
                    if (check.kind === "email") fieldDetails.email = true;
                });
            }
        }

        return fieldDetails;
    };

    // Processing zod schema
    if (zodSchema instanceof z.ZodObject) {
        const shape = zodSchema._def.shape();
        for (const key in shape) {
            const field = shape[key];
            schemaDetails[key] = processField(field);
        }
    } else {
        throw new Error("Received schema is not a ZodObject.");
    }

    return schemaDetails;
};


export const sha256 = (x, y = {digest: hex}) => {
    let hash = createHash('sha256').update(x);
    switch (y.digest) {
        case "hex":
            return hash.digest('hex');
        case "base64":
            return hash.digest('base64');
        default:
            throw new Error("Unknown digest");
    }
}

export const interpretarOperador = (op) => {
    switch (op) {
        case '=':
            return 'eq';
        case '>':
            return 'gt';
        case '<':
            return 'lt';
        // Adicione outros operadores conforme necessário
        default:
            return op;
    }
}

export const isFloat = (value) => {
    if (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      !Number.isInteger(value)
    ) {
      return true;
    }
  
    return false;
}

// Usando o simplificado, gera uma tabela markdown.
export const createMDTable = (obj) => {

    let emptyCell = "-"
    let markdownTable = "Key | Required | Default | Type | Min | Max \n"
    markdownTable += "--- | --- | --- | --- | --- | ---\n";

    // generate the "type" column based on present keys
    const getType = (argument) => {

        if (argument.numerical && argument.integerOnly) {
            return "integer";
        }
        if (argument.numerical && ! argument.integerOnly) {
            return "number";
        }
        if (argument.type) {
            return argument.type;
        }

        return "string"; // i am not sure: we didnt find a specific type, so im assuming string
    }

    // generate the "default" column based on present keys
    const getDefault = (argument) => {

        if (argument.default) {
            return argument.default
        }

        if (argument.fixed) {
            return `${argument.fixed} (immutable)`
        }

        return emptyCell;
    }


    // preparing each row data
    let rows = [];
    for (const key in obj) {
        const required = obj[key].required ? "yes" : "no";
        const default_value = getDefault(obj[key])
        const type = getType(obj[key]);
        const min = obj[key].minLength ? obj[key].minLength : emptyCell;
        const max = obj[key].maxLength ? obj[key].maxLength : emptyCell;
        rows.push({ key, required, default_value, type, min, max });
    }

    // sorting rows
    rows.sort((a, b) => {
        if (a.required === b.required) {
            return a.key.localeCompare(b.key); // Ordena por key se required for igual
        }
        return a.required === "yes" ? -1 : 1; // "yes" vem antes de "no"
    });
    
    // generating table
    for (const row of rows) {
        markdownTable += `${row.key} | ${row.required} | ${row.default_value} | ${row.type} | ${row.min} | ${row.max}\n`;
    }

    return markdownTable

}
