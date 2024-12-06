require("dotenv").config();
const path = require("path");

// Defina o caminho do arquivo .env com base no NODE_ENV
const envFilePath = path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`);
require('dotenv').config({ path: envFilePath });

const { Logger } = require( path.resolve("src/util/logging") );
const { createMDTable } = require(path.resolve("src/util/utils"));
const log = new Logger('test.js', false).useEnvConfig().create()

const { MagnusBilling } = require(path.resolve("src/lib/magnusbilling"));
console.log(`API KEY: ${process.env.MB_API_KEY}\nAPI SECRET: ${process.env.MB_API_SECRET}\nAPI URL: ${process.env.MB_PUBLIC_URL}`);
const mb = new MagnusBilling(process.env.MB_API_KEY, process.env.MB_API_SECRET, process.env.MB_PUBLIC_URL);
mb.echoResponse = true;

// ------------------------------------------------------------------

// mb.newEndpoints.clients.user.add({email: 'testando@hotmail.com', username: 'testando', password: 'testeat923h8f32h98ifj2'})
// console.log( mb.newEndpoints.clients.sip.add({id_user: 2, secret: '3f2hfu234iho23', defaultuser: '65156165198', name: '3298hf32', callerid: '5518991627865'}) )
// console.log(endpoints);
// endpoints.USER.methods.add.handle('teste')



mb.newEndpoints.clients.user.add({email: 'teste@123.com', username: 'testinggdsgds', password: 'df32f23gf43g'})
    .then((data) => {
        // console.log(createMDTable(data))
        console.log(data)
    })


// Create MD Table for all of USER endpoints (clients.users)
// mb.epm.endpoint.USER.getAllRules()
//     .then((data) => {
//         for (const [method, rules] of Object.entries(data)) {
//             console.log('---------------------------------------------------------------------------------', method)
//             console.log('Method: ', method)
//             console.log(createMDTable(rules))
//         } 
//     })
