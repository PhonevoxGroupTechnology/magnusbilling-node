import { z } from "zod";

class UserHistorySchema {

  // There is a class in MagnusBilling's API/codebase that detects SQL Injections
  // "Detects" SQL Injections
  // They basically check if there are any SQL statements in your query.
  // That means you can't write "This is just for update test", because it contains "UPDATE".
  // You will receive an "SQL INJECTION DETECTED" error. Don't blame me. Ask MagnusSolution to do a better handling of that, if this bothers you. I don't use this module often (userHistory), so I don't really care.

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      id_user: z.number(),
      description: z.string(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Format must be YYYY-MM-DD HH:mm:ss').optional() // this can cause errors: if users pass an invalid date, they will receive magnus' db error. i am not willing to solve this at the moment.
    })
  }

  // what is needed to update an user (besides api requirements)
  static update() {
    return z.object({
      id: z.number(),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Format must be YYYY-MM-DD HH:mm:ss').optional() // this can cause errors: if users pass an invalid date, they will receive magnus' db error. i am not willing to solve this at the moment.
    });
  }

  // what is needed to read an user (along with api structure)
  // id must be any because on req.query, everything is always string
  // @TODO: remove schema for read, base only in api
  static read() {
    return z.object({
      id: z.any().optional(),
      description: z.string().optional(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, 'Format must be YYYY-MM-DD HH:mm:ss').optional() // this can cause errors: if users pass an invalid date, they will receive magnus' db error. i am not willing to solve this at the moment.
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "ID is required for deletion" }),
    });
  }
}

export default UserHistorySchema
