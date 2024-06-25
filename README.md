## magnusbilling-node: Intenção do Projeto:

Este repositório é dedicado à reescrita do repositório [magnusbilling-api-php](https://github.com/magnussolution/magnusbilling-api-php) em uma versão NodeJS, para consumir os serviços do [MagnusBilling](https://www.magnusbilling.org/).

## Como usar?

Primeiro, é necessário obter 3 informações do seu servidor MagnusBilling: O endereço do servidor, e uma API-KEY e API-SECRET. As duas últimas podem ser geradas em "*Settings* > *API*".
Utilizando-se dessas 3 informações, segue o snippet inicial para o instanciamento da classe:

```
// Requerindo o arquivo da classe
const { MagnusBilling } = require("./index");

// Dados iniciais
const MB_HOST="192.168.1.101";
const MB_API_URL="http://" + MB_HOST + "/mbilling";
const MB_API_KEY="0110011apikey";
const MB_API_SECRET="2223330022apisecret";

// Instanciando a classe
const mb = new MagnusBilling(MB_API_KEY, MB_API_SECRET, MB_API_URL);
```

A partir disso, pode seguir os exemplos listados no arquivo `examples.js`.
O formato padrão dos endpoints será `mb.{menu}.{submenu}.{acao}({parametros})`

```
// Criação de usuário:
// OBS 29/02/24: Este endpoint será padronizado para utilizar campos em INGLÊS, como a base do MagnusBilling e o restante dos endpoints.
mb.clients.users.new({
  usuario: 'user',
  senha: 'senha',
  primeiro_nome: 'user1',
})
.then(ret => {
  console.log(ret)
})
.catch(err => {
  console.error(err)
})
.finallyy(() => {
  console.log('Request done.')
})
```

---
### EM PROGRESSO!
