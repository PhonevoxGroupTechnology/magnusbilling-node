import { z } from "zod";

class SipSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
        defaultuser: z.string(), // sip account name
        secret: z.string(), // sip account password
        callerid: z.string().default(''), // sip account callerid
        qualify: z.string().default('yes'),
        host: z.string().default('dynamic'),
        disallow: z.string().default('all'),
        allow: z.string().default('g729,gsm,opus,alaw,ulaw'),
    });
  }

  // what is needed to update an user (besides api requirements)
  static update() {
    return null;
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

export default SipSchema
