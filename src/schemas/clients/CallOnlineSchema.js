import { z } from "zod";

class CallOnlineSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      // you cant create on this endpoint
    });
  }

  // what is needed to update an user (besides api requirements)
  static update() {
    return z.object({
      // you cant update on this endpoint
    });
  }

  // what is needed to read an user (along with api structure)
  // id must be any because on req.query, everything is always string
  static read() {
    return z.object({
      id: z.any().optional(), // search by id dont really work. idk what magnus does, but the record seems to get deleted or something.
      id_user: z.any().optional(),
      canal: z.any().optional(),
      tronco: z.any().optional(),
      status: z.any().optional(),
      codec: z.any().optional(),
      duration: z.any().optional(),
      reinvite: z.any().optional(),
      from_ip: z.any().optional(),
      server: z.any().optional(),
      uniqueid: z.any().optional(),
    });
  }

  // you can only delete by id
  static delete() {
    return z.object({
      id: z.number().int({ message: "ID is required for deletion" }),
    });
  }

  static spy() {
    return z.object({
      channel: z.string(),
      id_sip: z.number(),
      type: z.string() // b:spy, w:whisper | https://docs.asterisk.org/Latest_API/API_Documentation/Dialplan_Applications/ChanSpy/#arguments
    })
  }

}

export default CallOnlineSchema
