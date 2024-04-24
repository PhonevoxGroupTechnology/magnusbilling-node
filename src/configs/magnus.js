// Cara, isso tá feião, mas não sei como arrumar. Fica assim por enquanto
const { MagnusBilling } = require("../../index");
const { API_KEY, API_SECRET, MAGNUS_HOST } = require("../../auth");

const DEBUG_LEVEL = 10;
const mb = new MagnusBilling(API_KEY, API_SECRET, MAGNUS_HOST, DEBUG_LEVEL);

module.exports = {
    mb
}