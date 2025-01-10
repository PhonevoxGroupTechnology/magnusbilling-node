import { z } from "zod";

class SipSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
        id_user: z.number(), // user id where the sip account belongs
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
    return z.object({
      id: z.number(),
    });
  }

  // what is needed to read an user (along with api structure)
  // id must be any because on req.query, everything is always string
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

export default SipSchema
