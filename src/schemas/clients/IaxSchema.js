import { z } from "zod";

class IaxSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      id_user: z.number(),
      username: z.string(),
      secret: z.string(),
      callerid: z.string().default(""),
      accountcode: z.string().default(""),
      fromuser: z.string().default(""),
      fromdomain: z.string().default(""),
      mailbox: z.string().default(""),
      md5secret: z.string().default(""),
      permit: z.string().default(""),
      deny: z.string().default(""),
      context: z.string().default("billing"),
      context: z.string().default("RFC2833"),
      host: z.string().default("dynamic"),
      insecure: z.string().default("no"),
      nat: z.string().default("force_rport,comedia"),
      qualify: z.string().default("no"),
      type: z.string().default("friend"),
      disallow: z.string().default("all"),
      allow: z.string().default("g729,gsm,alaw,ulaw"),
      calllimit: z.number().default(0),
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
      username: z.any().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "ID is required for deletion" }),
    });
  }
}

export default IaxSchema
