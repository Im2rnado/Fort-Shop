const { generateShop, getShopItems } = require("./shop");
const { apiKey, language, watermark } = require("./config.json");

(async () => {
  const items = await getShopItems(apiKey, language);
  console.log("[Fort-Shop] Made by Im2rnado. For support, join discord.gg/carbide".rainbow);
  await generateShop(items, watermark);
})()
