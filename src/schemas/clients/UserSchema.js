import { z } from "zod";

// Schema para validação do método "add"
const CreateUserSchema = z.object({
  active: z.number().default(1), // active tem valor padrão 1
  id_group: z.number().default(3), // id_group tem valor padrão 3
  createUser: z.number().int().min(1, { message: "createUser é obrigatório e fixo como 1" }),
  id: z.number().int().max(0, { message: "id é obrigatório e fixo como 0" }),
  email: z.string().email({ message: "Email inválido" }).nonempty("Email é obrigatório"),
});

// Schema para validação do método "edit"
const UpdateUserSchema = z.object({
  id: z.number().int({ message: "id é obrigatório para editar" }),
});

// Schema para validação do método "remove"
const DeleteUserSchema = z.object({
  id: z.number().int({ message: "id é obrigatório para remoção" }),
});

// Schema para validação do método "find"
const FindUserSchema = z.object({
  filtro: z.array(z.any()).nonempty({ message: "Filtro é obrigatório" }),
});

// Exportando os schemas
export const UserSchemas = {
  create: CreateUserSchema,
  update: UpdateUserSchema,
  read: FindUserSchema,
  delete: DeleteUserSchema,
};
