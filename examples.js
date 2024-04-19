const { MagnusBilling } = require("./index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("./auth")

// 1 = critical, 2 = error, 3 = warning, 4 = info, 5 = debug, 6 = trace
const DEBUG_LEVEL = 0;
const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST, DEBUG_LEVEL);

// Realmente recomendo que utilize o método ".list" nos endpoints, para descobrir os campos que pode repassar!
// Está convidado à olhar o código fonte (./lib/endpoints/{endpoint_folder}/{endpoint_file}) para ver outras formas que pode repassar alguns campos. (Somente em alguns endpoints)

// Arquivo de log do MagnusBilling: /var/www/html/mbilling/protected/runtime/application.log
// 2024/02/24 13:25:13 [error] [php] Undefined index: id (/var/www/html/mbilling/protected/components/ApiAccess.php:176)
// Significa que falta o campo "id" na payload

// Todas as informações neste arquivo são apenas para utilizar-se como exemplos da api. Este arquivo também é utilizado como teste prático para novos desenvolvimentos

// ------------------------------------------- TEST AREA -------------------------------------------

// mb.echoResponse = false;
// // mb.echoResponse = true;
// // mb.getModules()

// // Se você quiser saber os campos obrigatórios da API do Magnus, execute:
// mb.getFields('user') // Coloque aqui o endpoint do MB que quer consultar.
// .then(ret => {
//   console.log(mb.formatApiRequirement(ret, 'simple'))
// } )
// .catch(err => {
//     console.log(err)
// })

// ------------------------------------------- --------- -------------------------------------------

mb.clients.users.add({
  id: 1,
})
.then(ret => {
  console.log('<#@#> Sucesso! <#@#>')
  console.log(ret)
})
.catch(err => {
  console.log('<!@!> Erro! <!@!>')
  console.log(err)
})
