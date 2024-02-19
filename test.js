const { MagnusBilling } = require("./index");

// Configurações
const API_KEY = 'h0824809g4398i4g9';
const API_SECRET = '329h23h89f249843f89';
const MAGNUS_HOST = 'http://167.114.97.2/mbilling';

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// mb.clients.users.new({
//     usuario: 'adrian-test', 
//     senha: 'adrian-testing', 
//     email: 'tewdwste@gmail.com', 
//     limite_chamadas: 5})
//     .then (ret => {
//         console.log(ret)
//     })
//     .catch(error => {
//         console.error(error)
//     })
//     .finally(() => {
//         console.log('User Creation: done')
//     })


// mb.clients.users.find([
//     ['usuario', '=', '0053'],
// ])
//     .then (ret => {
//         console.log('ret: ' + JSON.stringify(ret));
//         console.log('id: ' + ret.rows[0].id );
//         return ret
//     })
//     .then (wasd => {
//         console.log('222222222222222222222222222222222222222222222222222222222222222')
//         console.log(wasd)
//     })
//     .catch (error => {
//         console.log('3333333333333333333333333333333333333333333333333333333333333333333333')
//         console.error(error);
//     })
//     .finally(() => {
//         console.log('4444444444444444444444444444444444444444444444444444444444444444444444444444')
//         console.log('User Search: done')
//     })

mb.clients.users.fDelete([
    ['=', '='],
])
    .then (ret => {
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ RETORNO FINAL: success @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        console.log(ret)
    })
    .catch (err => {
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ RETORNO FINAL: err @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        console.error(' deu erro mano ')
        console.log('err: ' + err)
    })
    .finally (() => {
        console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ RETORNO FINAL @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        console.log('fim')
    })


    // mb.getFields('user')
//     .then(ret => {
//         console.log('success')
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log('error')
//         console.error("Erro ao obter os módulos:", error);
//     });

// mb.clients.users.new({
//     username: '0053'
// });

// mb.clients.users.find({
//     id_group: 3,
//     username: '0053'
// })

// mb.clients.users.delete({
//     id: 1,
//     username: '0053'
// })