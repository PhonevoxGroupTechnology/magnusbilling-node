const { MagnusBilling } = require("./index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("./auth")

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// Arquivo de log do MagnusBilling: /var/www/html/mbilling/protected/runtime/application.log
// 2024/02/24 13:25:13 [error] [php] Undefined index: id (/var/www/html/mbilling/protected/components/ApiAccess.php:176)
// Significa que falta o campo "id" na payload

// Todas as informações neste arquivo são apenas para utilizar-se como exemplos da api. Este arquivo também é utilizado como teste prático para novos ///desenvolvimentos.








// test with endpoint maker
// mb.test.teste.new({

// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.test.teste.new ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.test.teste.new error")
//     })
// .finally(() => {
//     console.log("\nmb.test.teste.new finish")
// })

mb.test.teste.new({
    usuario: 'wasd',
    senha: 'dwadwa',
    email: 'adrian@phonevox.com.br',
    firstname: 'adrian',
    credit: '10',
    id_user_filtro: [
        ['username', 'eq', 'root']
    ]
})
    .then(ret => {
        console.log('################################################################################')
        console.log(ret);
        console.log("\nmb.test.teste.new ok");
    })
    .catch(error => {
        console.error(error);
        console.log("\nmb.test.teste.new error");
    })
    .finally(() => {
        console.log("\nmb.test.teste.new finish");
    });








// CDR  --------------------------------------------------------

// Listar CDR \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.reports.cdr.find([
//     ['src', '~=', 'ALGAR']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.reports.cdr.find ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.reports.cdr.find error")
//     })
// .finally(() => {
//     console.log("\nmb.reports.cdr.find finish")
// })






// Refill  --------------------------------------------------------

// Inserir, criar um refill \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.billing.refills.new({
//     id_user: 3,
//     credit: 10.5221,
//     // description: "batata frita",
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.billing.refills.new ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.billing.refills.new error")
//     })
// .finally(() => {
//     console.log("\nmb.billing.refills.new finish")
// })


// Editar um refill \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.billing.refills.edit({
//     id_filtro: [
//         ['id_user', '=', '3'],
//         ['description', '~=', 'api']
//     ],
//     credit: 50.1234,
//     description: "edição via api",
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.billing.refills.edit ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.billing.refills.edit error")
//     })
// .finally(() => {
//     console.log("\nmb.billing.refills.edit finish")
// })


// Remover o registro de um Refill \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.billing.refills.delete({
//     id_filtro: [
//         ['id_user', '=', '3'],
//         ['description', '~=', 'edição via api']
//     ]
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.billing.refills.delete ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.billing.refills.delete error")
//     })
// .finally(() => {
//     console.log("\nmb.billing.refills.delete finish")
// })


// Localizar as informações de um Refill \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.billing.refills.find([
//     ['id_user', 'eq', '3'],
//     ['description', '~=', 'api']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.billing.refills.find ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.billing.refills.find error")
//     })
// .finally(() => {
//     console.log("\nmb.billing.refills.find finish")
// })


// Localizar o ID de um refill \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.billing.refills.fGetId([
//     ['id_user', 'eq', '3'],
//     ['description', '~=', 'api']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.billing.refills.fGetId ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.billing.refills.fGetId error")
//     })
// .finally(() => {
//     console.log("\nmb.billing.refills.fGetId finish")
// })






// DID Destination --------------------------------------------------------

// Criar uma DID Destination \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.didDestination.new({
//     type: 'sip',
//     id_did: '5',
//     id_user: '2',
//     id_sip: '1',
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.didDestination.new ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.didDestination.new error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.didDestination.new finish")
// })


// Editar uma DID Destination \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.didDestination.edit({
//     filtro: [
//         ['id_did', 'eq', '5']
//     ],
//     type: 'sip',
//     id_user: 2,
//     id_sip: 3
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.didDestination.edit ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.didDestination.edit error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.didDestination.edit finish")
// }) 


// Deletar uma DID Destination \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.didDestination.delete({
//     filtro: [
//         ['id_did', 'eq', '5']
//     ]
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.didDestination.delete ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.didDestination.delete error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.didDestination.delete finish")
// }) 


// Localizar uma DID Destination por filtro \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.didDestination.find([
//     ['id_did', 'eq', '5']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.didDestination.find ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.didDestination.find error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.didDestination.find finish")
// }) 


// Obter o ID de uma DID Destination \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.didDestination.fGetId([
//     ['id_did', 'eq', '5']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.didDestination.fGetId ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.didDestination.fGetId error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.didDestination.fGetId finish")
// }) 






// DIDS --------------------------------------------------------

// // Criar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.new({
//     did: '551832568300',
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.dids.new ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.new error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.new finish")
// })


// // Editar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.edit({
//     filtro: [
//         ['did', '=', '5518991627865']
//     ],
//     description: 'Teste de alteração de descrição via API',
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.dids.edit ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.edit error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.edit finish")
// })
// ------------- ou pode fazer com promise chain ------------------
// mb.dids.dids.fGetId([
//     ['did', '=', '5518991627865']
// ])
// .then(did_id => {
//     return mb.dids.dids.edit({
//         id: did_id,
//         description: 'Alterando a descrição do did 5518991627865 com promise chain'
//     })
// })
// .then(ret => {
//     console.log(ret)
//     console.log("\nmb.dids.dids.edit ok")
// })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.edit error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.edit finish")
// })


// // Deletar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
// tem um fodendo "s" faltando em '/var/www/html/mbilling/protected/controllers/DidController.php +462', que me fez ficar 1-2 horas procurando o que tava de errado nessa porcaria, meu pai amado. mis-type da própria versão do magnusbilling..
//
// mb.dids.dids.delete({
//     filtro: [
//         ['did', '=', '5518991627865'],
//     ]
// })
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.dids.delete ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.delete error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.delete finish")
// })
// --------- ou fazer via promise-chain -------------
// mb.dids.dids.fGetId([
//     ['did', '=', '5518991627865']
// ])
// .then(async did_id => {
//     return await mb.dids.dids.delete({
//         id: did_id
//     })
// })
// .then(ret => {
//     console.log(ret)
//     console.log("\nmb.dids.dids.delete ok")
// })
// .catch(err => {
//     console.error(err)
//     console.log("\nmb.dids.dids.delete error")
// })
// .finally(() => {
//     console.log("\nmb.dids.dids.delete finish")
// })


// // Localizar um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.find([
//     ['did', 'eq', '5518991627865']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.dids.find ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.find error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.find finish")
// })


// // Obter o ID de um DID \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
//
// mb.dids.dids.fGetId([
//     ['did', 'eq', '5518991627865']
// ])
//     .then(ret => {
//         console.log(ret)
//         console.log("\nmb.dids.dids.fGetId ok")
//     })
//     .catch(error => {
//         console.error(error)
//         console.log("\nmb.dids.dids.fGetId error")
//     })
// .finally(() => {
//     console.log("\nmb.dids.dids.fGetId finish")
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
//     ['name', '=', '1111'],
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
//
// mb.clients.users.find([
//     ['id', '=', '8'],
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

// mb.getFields('call')
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