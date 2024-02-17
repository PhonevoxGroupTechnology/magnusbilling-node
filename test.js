const { MagnusBilling } = require("./index");

// Configurações
const API_KEY = 'h0824809g4398i4g9';
const API_SECRET = '329h23h89f249843f89';
const MAGNUS_HOST = 'http://167.114.97.2/mbilling';

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// mb.clients.users.new({usuario: 'adrian-test', senha: 'adrian-testing', email: 'tewdwste@gmail.com', limite_chamadas: 5})
//     .then (ret => {
//         console.log('success')
//         console.log(ret)
//     })
//     .catch(error => {
//         console.log('error')
//         console.error('Erro:', error)
//     })

mb.clients.users.find([
    ['username', 'eq', '123123'],
])
    .then (ret => {
        console.log('success');
        console.log(ret);
    })
    .catch (error => {
        console.log('error!');
        console.error('erro:', error);
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