import { z } from "zod";

class CalleridSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      // activated: z.string().default('1'),
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
      id: z.number().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "id é obrigatório para remoção" }),
    });
  }
}

export default CalleridSchema
