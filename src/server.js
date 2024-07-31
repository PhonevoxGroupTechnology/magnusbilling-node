require("dotenv").config();
const path = require("path");

// Defina o caminho do arquivo .env com base no NODE_ENV
const envFilePath = path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`);
require('dotenv').config({ path: envFilePath });

const Queue = require(path.resolve("src/lib/Queue"));
const { envBool } = require( path.resolve("src/util/utils") )
const ROUTES = require(path.resolve('src/express/routing'));
const { setLogPrefix } = require(path.resolve('src/express/middleware'));
const express = require('express');

// Iniciando o Express e suas rotas.
const app = express();
app.use('/', setLogPrefix, ROUTES)
app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server is running on "${process.env.NODE_ENV}" environment!`)
    console.log(`Server running on http://localhost:${process.env.EXPRESS_PORT}`)
    console.info(`Bull Dashboard: http://localhost:${process.env.EXPRESS_PORT}${process.env.BULL_DASHBOARD_ROUTE}`)
})