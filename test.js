const { generateShop, getShopItems } = require("./shop");
const { apiKey, language, watermark } = require("./config.json");

(async () => {
  const items = await getShopItems(apiKey, language);
  await generateShop(items, watermark);
})()
