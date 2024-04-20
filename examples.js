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

/*

// Debug Level  ->  1:critical  2:error  3:warning  4:info  5:debug  6:trace
// 6 vai pegar <=6,     3 vai pegar <=3.
const { MagnusBilling } = require("<local onde o index.js da lib está no seu sistema>");
const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST, DEBUG_LEVEL);

mb.echoResponse = false // Isso daqui vai fazer a libnão dar print nas respostas da API do Magnus automaticamente. Geralmente é mais pra debug

// Listar usuários
mb.clients.users.list()
.then(ret => {console.log(ret)} )

// Adicionar usuário
mb.clients.users.add({
  <campo>: "<valor>",
  username: 123,
  secret: 1233,
  email: test@hotmail.com
})
.then(ret => {console.log(ret)} )

// Deletar um usuário
mb.clients.users.remove({
  id: <id:integer>
})
.then(ret => {console.log(ret)} )

// Deletar vários usuários em uma unica request
mb.clients.users.remove({
  id: [<id:int>, <id:int>, etc.]
})
.then(ret => {console.log(ret)} )

// Localizar / buscar um usuário
mb.clients.users.find({
  filtro: [
  ['<campo>', '<sinal de operação>', '<valor>'],
  ['username', '~=', 'adri'],
]
})
.then(ret => {console.log(ret)} )

// Buscar, mas retornar APENAS o ID.
mb.clients.users.getid({
  filtro: [
  ['<campo>', '<sinal de operação>', '<valor>'],
  ['username', '~=', 'adri'],
]
})
.then(ret => {console.log(ret)} ) // <-- somente o ID



// Se você quiser saber os campos obrigatórios da API do Magnus, execute:
mb.getFields('endpoint_magnusbilling_aqui')
.then(ret => {
  // Tipos de saída existentes:
  // raw -> Retorno "cru" da API
  // crude -> Retorno levemente trabalhado. Não é mais usado e eventualmente será removido.
  // simple -> Retorno completo e formatado, aparece como um objeto { arg: {tags}, arg2: {tags} }
  // onde "tags" são as necessidades desse argumento: required:true, integeronly:true, numerical:true, default:5, fixed:1 etc.
  console.log(mb.formatApiRequirement(ret, 'simple'))
} )

*/
