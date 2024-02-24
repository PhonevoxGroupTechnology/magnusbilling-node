const { MagnusBilling } = require("./index");

// Configurações
const API_KEY = 'h0824809g4398i4g9';
const API_SECRET = '329h23h89f249843f89';
const MAGNUS_HOST = 'http://167.114.97.2/mbilling';

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// CONTAS SIPS --------------------------------------------------------

// mb.clients.sipUsers.new({
//     usuario_sip: 'batataaaaaa',
//     senha: 'arrozfeijao,'
// })
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
// .finally(() => {
//     console.log('SIP Account Creation: done')
// })


// USUÁRIOS -------------------------------------------------------

// // Criar um usuário novo
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

// // Localizar um usuário usando filtros
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

// // Deletar um usuário utilizando filtros
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

// // Editar um usuário
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

// mb.getFields('user')
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