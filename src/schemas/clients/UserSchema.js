import { z } from "zod";

class UserSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      active: z.number().default(1),
      id_group: z.number().default(3),
      active: z.string().default("1"),
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
  static read() {
    return z.object({
      id: z.string().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "id é obrigatório para remoção" }),
    });
  }
}

export default UserSchema
