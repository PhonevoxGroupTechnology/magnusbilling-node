require("dotenv").config();
const path = require("path");

// Defina o caminho do arquivo .env com base no NODE_ENV
const envFilePath = path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`);
require('dotenv').config({ path: envFilePath });

const { Logger } = require( path.resolve("src/util/logging") );
const log = new Logger('test.js', true).useEnvConfig().create()

const { MagnusBilling } = require(path.resolve("src/lib/magnusbilling"));
const mb = new MagnusBilling(process.env.MB_API_KEY, process.env.MB_API_SECRET, process.env.MB_PUBLIC_URL);


// ------------------------------------------------------------------

const EndpointManager = require(path.resolve("src/lib/magnusbilling/endpoints"));
EndpointManager.bindAll(mb);
console.log(EndpointManager.endpoint.USER.getAllMethods())
// console.log(endpoints);
// endpoints.USER.methods.add.handle('teste')
