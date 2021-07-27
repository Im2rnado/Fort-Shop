const { generateShop, getShopItems } = require("./shop");
const { apiKey, language, watermark } = require("./config.json");

getShopItems(apiKey, language).then(items => generateShop(items, watermark));
