import { z } from "zod";

class UserSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      active: z.string().default("1"),
      id_group: z.number().default(3),
      email: z.string().email({ message: "Email inválido" }).min(1, "Email é obrigatório"),
    });
  }

  // what is needed to update an user (besides api requirements)
  static update() {
    return z.object({
      id: z.number(),
    });
  }

  // what is needed to read an user (along with api structure)
  // id must be any because on req.query, everything is always string
  // @TODO: remove schema for read, base only in api
  static read() {
    return z.object({
      id: z.any().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "ID is required for deletion" }),
    });
  }
}

export default UserSchema
