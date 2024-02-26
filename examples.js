const { MagnusBilling } = require("./index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("./auth")

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// Arquivo de log do MagnusBilling: /var/www/html/mbilling/protected/runtime/application.log
// 2024/02/24 13:25:13 [error] [php] Undefined index: id (/var/www/html/mbilling/protected/components/ApiAccess.php:176)
// Significa que falta o campo "id" na payload

// Todas as informações neste arquivo são apenas para utilizar-se como exemplos da api. Este arquivo também é utilizado como teste prático para novos desenvolvimentos.

// DIDS --------------------------------------------------------

// // Criar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.new({
//     did: '5511111111',
// })
//     .then(ret => {
//         console.log("")
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         // console.error(error)
//     })
// .finally(() => {
//     console.log("\nDIDs new: done")
// })

// // Editar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.edit({
//     filtro: [
//         ['did', '=', '5511114444']
//     ],
//     description: 'alteracao sem promise chain',
// })
//     .then(ret => {
//         console.log("")
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log("\nDIDs edit: done")
// })
// ------------- ou pode fazer com promise chain ------------------
// mb.dids.dids.fGetId([
//     ['did', '=', '5511114444']
// ])
// .then(did_id => {
//     return mb.dids.dids.edit({
//         id: did_id,
//         description: 'alteracao com promise chain'
//     })
// })
// .then(ret => {
//     console.log('Retorno DID EDIT: ')
//     console.log(ret)
// })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })

// // Deletar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// tem um fodendo "s" faltando em '/var/www/html/mbilling/protected/controllers/DidController.php +462', que me fez ficar 1-2 horas procurando o que tava de errado nessa porcaria, meu pai amado. mis-type da própria versão do magnusbilling..
//
// mb.dids.dids.delete({
//     filtro: [
//         ['did', '=', '1232221231'],
//     ]
// })
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })
// --------- ou fazer via promise-chain -------------
// mb.dids.dids.fGetId([
//     ['did', '=', '5511114444']
// ])
// .then(async did_id => {
//     mb.clearFilter()
//     return await mb.dids.dids.delete({
//         id: parseInt(did_id)
//     })
// })
// .then(ret => {
//     console.log('Retorno DID DELETE: ')
//     console.log(ret)
// })
// .catch(err => {
//     console.log('Retorno ERRO: DID DELETE: ')
//     console.error(err)
// })
// .finally(() => {
//     console.log("\nfinish did delete!")
// })


// // Localizar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.find([
//     ['did', 'eq', '5511111111']
// ])
//     .then(ret => {
//         console.log("")
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         // console.error(error)
//     })
// .finally(() => {
//     console.log("\nDIDs edit: done")
// })

// // Obter o ID de um did baseado em filtro \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.fGetId([
//     ['did', 'eq', '5511111111']
// ])
//     .then(ret => {
//         console.log("")
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         // console.error(error)
//     })
// .finally(() => {
//     console.log("\nDIDs edit: done")
// })

// CONTAS SIPS --------------------------------------------------------

// // Criar uma conta SIP nova \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.sipUsers.new(
//     {
//         id_user_filtro: [
//             ['username', '=', '0053']
//         ],
//         defaultuser: 'batatafrita',
//         secret: 'fritabatata',
//         qualify: 'no',
//     }
// )
//     .then(ret => {
//         console.log("")
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log("\nSIP Account Creation: done")
// })

// // Localizar uma conta SIP utilizando filtro pra pegar o ID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// 
// mb.clients.sipUsers.find([
//     ['id_user', '=', '8'],
//     ['secret', '=', 'batatafrita']
// ])
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })

// // Deletar uma conta SIP \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.sipUsers.delete({
//     filtro: [
//         ['defaultuser', '=', 'aaaaaaad'],
//     ]
// })
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })

// // Editar uma conta SIP \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ 
//
// mb.clients.sipUsers.edit({
//     filtro: [ // quem (conta sip) que será alterado
//         ['id_user', '=', '8'],
//         ['defaultuser', '=', 'aguacomgas'],
//     ],
//     // a partir daqui, valores que serão alterados na conta sip filtrada
//     id_user_filtro: [ // o id do usuário (dono da conta sip) será alterado pro id desse user aqui
//         ['username', '=', '4237456']
//     ],
//     defaultuser: 'aaaaaaad',
// })
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })

// // Obter o ID (interno) de uma conta SIP \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.sipUsers.fGetId([
//     ['id_user', '=', '8'],
//     ['defaultuser', '=', '1235235325123']
// ])
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log("")
//         console.error(error)
//     })
// .finally(() => {
//     console.log('finish!')
// })

// USUÁRIOS -------------------------------------------------------

// // Criar um usuário novo \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.users.new({
//     usuario: 'adriwwan-test',
//     senha: 'adrian-testing',
//     email: 'adriatesdwadwaten@phonevox.com.br',
//     primeiro_nome: 'adrian teste',
//     prefix_local: '123123',
//     limite_chamadas: 5})
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
// .finally(() => {
//     console.log('User Creation: done')
// })

// Localizar um usuário usando filtros \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// mb.clients.users.find([
//     ['usuario', '=', 'adrian-test'],
// ])
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
// .finally(() => {
//     console.log('Find: done')
// })

// // Deletar um usuário utilizando filtros \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.users.delete({
//     filtro: [
//         ['usuario', '=', 'batatafrita'],
//     ],
// })
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
// .finally(() => {
//     console.log('Edit: done')
// })

// // Editar um usuário \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.clients.users.edit({
//     filtro: [
//         ['usuario', '=', 'batatafrita'],
//     ],
//     usuario: 'arroz',
//     senha: 'feijao',
// })
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
// .finally(() => {
//     console.log('Edit: done')
// })


// GERAL DO SISTEMA ----------------------------------------------------------------

// mb.getFields('sip')
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(err => {
//         console.log(err)
//     })
// .finally(() => {
//     console.log('GetFields: done')
// });

// mb.getModules()
//     .then(ret => {
//         console.log(ret)
//     })
//     .catch(err => {
//         console.log(err)
//     })
// .finally(() => {
//     console.log('GetFields: done')
// });