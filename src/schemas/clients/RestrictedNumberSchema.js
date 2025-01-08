import { z } from "zod";

class AtalinksysSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      id_user: z.number(),
      number: z.number(),
      direction: z.number().optional(),
    });
  }

  // what is needed to update an user (besides api requirements)
  static update() {
    return z.object({
      id: z.number(),
      number: z.any().optional(),
      direction: z.any().optional(),
    });
  }

  // what is needed to read an user (along with api structure)
  // id must be any because on req.query, everything is always string
  static read() {
    return z.object({
      id: z.any().optional(),
      number: z.any().optional(),
      direction: z.any().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "ID is required for deletion" }),
    });
  }
}

export default AtalinksysSchema
