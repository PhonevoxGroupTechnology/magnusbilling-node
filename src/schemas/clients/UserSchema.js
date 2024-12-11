import { z } from "zod";

class UserSchema {
  // Schema de criação de usuário
  static create() {
    return z.object({
      active: z.number().default(1),
      id_group: z.number().default(3),
      email: z.string().email({ message: "Email inválido" }).nonempty("Email é obrigatório"),
    });
  }

  // Schema de atualização de usuário
  static update() {
    return z.object({
      id: z.number().int({ message: "id é obrigatório para editar" }),
    });
  }

  // Schema de leitura de usuário
  static read() {
    return z.object({
      filtro: z.array(z.any()).nonempty({ message: "Filtro é obrigatório" }),
    });
  }

  // Schema de remoção de usuário
  static delete() {
    return z.object({
      id: z.number().int({ message: "id é obrigatório para remoção" }),
    });
  }
}

export default UserSchema





