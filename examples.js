const { MagnusBilling } = require("./index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("./auth")

const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST);

// Arquivo de log do MagnusBilling: /var/www/html/mbilling/protected/runtime/application.log
// 2024/02/24 13:25:13 [error] [php] Undefined index: id (/var/www/html/mbilling/protected/components/ApiAccess.php:176)
// Significa que falta o campo "id" na payload

// Todas as informações neste arquivo são apenas para utilizar-se como exemplos da api. Este arquivo também é utilizado como teste prático para novos desenvolvimentos.

// CONTAS SIPS --------------------------------------------------------

mb.clients.sipUsers.new(
    {
        filtro: [
            ['username', '=', '0053']
        ],
        id_user: 27,
        defaultuser: '1235235325123',
        secret: '544532532',
        qualify: 'no',
        // dry: true,
        // "id": 0,
        // "id_user": 27,
        // "name": "",
        // "accountcode": "",
        // "regexten": "",
        // "amaflags": "",
        // "callgroup": "",
        // "callerid": "",
        // "directmedia": "no",
        // "context": "billing",
        // "DEFAULTip": "",
        // "dtmfmode": "RFC2833",
        // "fromuser": "",
        // "fromdomain": "",
        // "host": "dynamic",
        // "sip_group": "",
        // "insecure": "no",
        // "language": "",
        // "mailbox": "",
        // "md5secret": "",
        // "nat": "force_rport,comedia",
        // "deny": "",
        // "permit": "",
        // "pickupgroup": "",
        // "port": "",
        // "qualify": "no",
        // "rtptimeout": "",
        // "rtpholdtimeout": "",
        // "dwadwadwa": "frita",
        // "type": "friend",
        // "disallow": "all",
        // "allow": "g729,gsm,opus,alaw,ulaw",
        // "regseconds": null,
        // "ipaddr": "",
        // "fullcontact": "",
        // "setvar": "",
        // "regserver": "",
        // "lastms": "",
        // "defaultuser": "aaaaaaaaaaaaaaaaaa",
        // "auth": "",
        // "subscribemwi": "",
        // "vmexten": "",
        // "cid_number": "",
        // "callingpres": "",
        // "usereqphone": "",
        // "mohsuggest": "",
        // "allowtransfer": "no",
        // "autoframing": "",
        // "maxcallbitrate": "",
        // "outboundproxy": "",
        // "rtpkeepalive": "",
        // "useragent": "",
        // "calllimit": 0,
        // "lineStatus": "",
        // "url_events": "",
        // "ringfalse": 0,
        // "record_call": 0,
        // "voicemail": 0,
        // "forward": "",
        // "block_call_reg": "",
        // "dial_timeout": 60,
        // "techprefix": 0,
        // "alias": "",
        // "description": "",
        // "addparameter": "",
        // "amd": 0,
        // "cnl": "",
        // "id_trunk_group": 0,
        // "videosupport": "no",
        // "type_forward": "",
        // "id_ivr": "",
        // "id_queue": "",
        // "id_sip": "",
        // "extension": "",
        // "voicemail_email": "",
        // "voicemail_password": 378391,
        // "sip_config": "",
        // "sipshowpeer": ""
    }
)
    .then(ret => {
        console.log("")
        console.log(ret)
    })
    .catch(error => {
        console.log("")
        console.error(error)
    })
    .finally(() => {
        console.log("\nSIP Account Creation: done")
    })


// USUÁRIOS -------------------------------------------------------

// // Criar um usuário novo
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

// // Localizar um usuário usando filtros
//
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

// // Editar um usuário
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