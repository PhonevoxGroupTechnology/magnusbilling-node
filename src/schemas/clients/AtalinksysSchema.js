import { z } from "zod";

class AtalinksysSchema {

  // what is needed to create an user (besides api requirements)
  static create() {
    return z.object({
      // activated: z.string().default('1'),
      id_user: z.number(),
      nserie: z.string(),
      macadr: z.string(),
      Enable_Web_Server: z.number().min(0).max(1).default(1),
      Dial_Plan_1: z.string().default('([3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)'),
      Dial_Plan_2: z.string().default('([3469]11|0|00|[2-9]xxxxxx|1xxx[2-9]xxxxxxS0|xxxxxxxxxxxx.)'), // so, before [3469] there should be *xx|, but Magnus (?) doesnt allow us to send "*", it returns Invalid API Access. I'll just remove it from the default dialplan. This is the same for Dial_Plan_1
      Register_Expires_1: z.string().default('360'),
      Register_Expires_2: z.string().default('360'),//nat enable mapping must be number from 0 to 1
      NAT_Mapping_Enable_1_: z.number().min(0).max(1).default(0),
      NAT_Mapping_Enable_2_: z.number().min(0).max(1).default(0),
      NAT_Keep_Alive_Enable_1_: z.number().min(0).max(1).default(0),
      NAT_Keep_Alive_Enable_2_: z.number().min(0).max(1).default(0),
      Preferred_Codec_1: z.string().default('G729a'),
      Preferred_Codec_2: z.string().default('G729a'),
      Use_Pref_Codec_Only_1: z.number().min(0).max(1).default(0),
      Use_Pref_Codec_Only_2: z.number().min(0).max(1).default(0),
      STUN_Enable: z.number().min(0).max(1).default(0),
      STUN_Test_Enable: z.number().min(0).max(1).default(0),
      Substitute_VIA_Addr: z.number().min(0).max(1).default(0),
      STUN_Server:  z.string().default(''),
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

export default AtalinksysSchema
