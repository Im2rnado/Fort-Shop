const fs = require("fs");
const {
	createCanvas,
	loadImage,
	registerFont,
} = require("canvas");
const axios = require("axios");
const moment = require("moment");
const date = moment().format("dddd, MMMM Do YYYY");
require("colors");

module.exports = {
	/**
	 * Generates the shop image in a design similar to the in-game design.
	 */
	async generateShop(shop, watermark) {
		const beforeFinish = Date.now();
		console.log("[Fort-Shop] Made by Im2rnado. For support, join discord.gg/carbide".rainbow);

		// Font
		registerFont("./assets/fonts/BurbankBigRegularBlack.otf", {
			family: "Burbank Big Regular",
			style: "Black",
		});

		// Check shop
		if (!shop) process.exit(1);

		// Get the image width
		const keys = Object.keys(shop);
		let bigwidth = 0;

		for (let i of keys) {
			let curwidth = 250;
			i = shop[i].entries;

			i.forEach(el => {
				if (el.size === "DoubleWide") curwidth += 1060;
				else if (el.size === "Small") curwidth += 250;
				else if (el.size === "Normal") curwidth += 500;
				else curwidth += 500;
				curwidth += 60;
			});

			if (curwidth > bigwidth) bigwidth = curwidth;
		}

		// Make the image
		const canvasHeight = (keys.length * 1200) + 1000;
		const canvasWidth = bigwidth;

		console.log(`[CANVAS] Width ${canvasWidth} x Height ${canvasHeight}`.green);
		const canvas = createCanvas(canvasWidth, canvasHeight);
		const ctx = canvas.getContext("2d");

		// Starting points
		let featuredX = 150;
		let featuredY = 900;
		let rendered = 0;
		let below = "no";

		// Background
		const background = await loadImage("./assets/background.png");
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		console.log("[WATERMARK] Drawing Date and Watermarks".yellow);

		// Item Shop
		ctx.fillStyle = "#ffffff";
		ctx.font = "italic 300px Burbank Big Rg Bk";
		ctx.textAlign = "left";
		ctx.fillText("Item Shop", 170, 500);

		// Date
		ctx.font = "italic 125px Burbank Big Rg Bk";
		ctx.textAlign = "right";
		ctx.fillText(date, canvas.width - 100, 400);

		// Watermark
		if (watermark) ctx.fillText(watermark, canvas.width - 100, 550);

		// Start Rendering
		for (const i of keys) {
			const items = shop[i].entries;

			// Draw shop section name
			if (shop[i].name !== null) {
				console.log(`[SECTIONS] Drawing ${shop[i].name} Section`.magenta);

				ctx.fillStyle = "#ffffff";
				ctx.font = "italic 100px Burbank Big Rg Bk";
				ctx.textAlign = "left";
				ctx.fillText(shop[i].name, 185, featuredY - 60);
				ctx.drawImage(await loadImage("./assets/clock.png"), ctx.measureText(shop[i].name).width + 200, featuredY - 160, 125, 125);
			}

			// Draw items
			for (const item of items) {

				console.log(`[ITEMS] Drawing ${item.name}`.blue);

				let itemImg;
				let ov;
				let imgWidth = 0;
				let imgHeight = 0;
				let wasBelow = "no";

				// Get the image width/height
				if (item.size === "DoubleWide") {
					imgWidth = 1060;
					imgHeight = 1000;
					below = "no";
					wasBelow = "no";
				} else if (item.size === "Small") {
					imgWidth = 500;
					imgHeight = 480;
					if (below === "yes") {
						featuredX = featuredX - (imgWidth + 60);
						featuredY = featuredY + 520;
						below = "no";
						wasBelow = "yes";
					} else {
						below = "yes";
						wasBelow = "no";
					}
				} else if (item.size === "Normal") {
					imgWidth = 500;
					imgHeight = 1000;
					below = "no";
					wasBelow = "no";
				} else {
					imgWidth = 500;
					imgHeight = 1000;
					below = "no";
					wasBelow = "no";
				}

				// Load Overlay
				try {
					ov = await loadImage(`./assets/rarities/${item.series ? item.series.name.toLowerCase().replace(/ /g, "").replace("series", "") : item.rarity.name}Down.png`);
				} catch {
					ov = await loadImage("./assets/rarities/UncommonDown.png");
				}

				// Load image
				if (item.images.background) {
					try {
						itemImg = await loadImage(item.images.background);
					} catch {
						console.log(`Could not load image for ${item.name}`.red);
						itemImg = await loadImage("./assets/placeholder.png");
					}
				} else if (item.images.icon) {
					try {
						itemImg = await loadImage(item.images.icon);
					} catch {
						console.log(`Could not load image for ${item.name}`.red);
						itemImg = await loadImage("./assets/placeholder.png");
					}
				} else {
					console.log(`Could not load image for ${item.name}`.red);
					itemImg = await loadImage("./assets/placeholder.png");
				}

				// Draw image
				if (item.size === "DoubleWide") {
					ctx.drawImage(itemImg, featuredX, featuredY, imgWidth, imgHeight);
					ctx.drawImage(ov, featuredX, featuredY + (imgHeight - 600), imgWidth, 600);
				} else if (item.size === "Small") {
					ctx.drawImage(itemImg, imgWidth / 4.7, 0, imgWidth + 300, imgHeight + 300, featuredX, featuredY, imgWidth, imgHeight);
					ctx.drawImage(ov, featuredX, featuredY + (imgHeight - 600), imgWidth, 600);
				} else {
					ctx.drawImage(itemImg, imgWidth / 2, 0, imgWidth, imgHeight, featuredX, featuredY, imgWidth, imgHeight);
					ctx.drawImage(ov, featuredX, featuredY + (imgHeight - 600), imgWidth, 600);
				}

				// Load & Draw Name
				ctx.fillStyle = "#ffffff";
				let fontSize = 55;
				ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";

				let measure = ctx.measureText(item.name.toUpperCase()).width;
				while (measure > (imgWidth - 40)) {
					fontSize = fontSize - 0.6;
					ctx.font = "italic " + fontSize + "px Burbank Big Rg Bk";
					measure = ctx.measureText(item.name.toUpperCase()).width;
				}
				ctx.textAlign = "center";
				ctx.fillText(item.name.toUpperCase(), featuredX + (imgWidth / 2), featuredY + (imgHeight - (400 / 7.5)));

				// Load & Draw Price
				ctx.fillStyle = "#d3d3d3";
				ctx.font = "30px Burbank Big Rg Bk";
				ctx.textAlign = "right";
				ctx.fillText(item.price.finalPrice.toLocaleString(), featuredX + (imgWidth - (500 / 6)), featuredY + (imgHeight - (500 / 45)));

				ctx.drawImage(await loadImage("./assets/vbucks.png"), item.size === "DoubleWide" ? featuredX + 560 : featuredX, featuredY + (imgHeight - 500), 500, 500);

				// Gameplay Tags
				if (item.effects && item.effects.length) {
					try {
						ctx.drawImage(await loadImage(`./assets/gptags/${item.effects[0].split(".").pop()}EF.png`), featuredX + (imgWidth - 100), featuredY + (imgHeight - 220), 80, 80);
					} catch {
						console.log(`Could not load Gameplay Tag ${item.effects[0].split(".").pop()}`.red);
					}
				}

				// Return to the default height
				if (wasBelow === "yes") {
					featuredY = featuredY - 520;
				}

				// Rows
				featuredX = featuredX + imgWidth + 60;
				rendered = rendered + 1;
				if (rendered === items.length) {
					rendered = 0;
					featuredY = featuredY + 1200;
					featuredX = 150;
				}
			}
		}

		// Save image
		const buf = canvas.toBuffer("image/png");

		fs.writeFileSync("shop-cataba.png", buf);

		// Return path
		console.log(`Successfully rendered Item Shop image in ${(Date.now() - beforeFinish) / 1000}s`.green.bold);
		return buf;
	},

	/**
	 * Get's the current shop items and formats them.
	 */
	async getShopItems(apiKey, language) {
		const shop = {};

		const items = await axios.get(`https://fortniteapi.io/v2/shop?lang=${language}&renderData=true`, {
			headers: {
				"Authorization": apiKey,
			},
		}).catch(console.error);

		const store = items.data.shop;
		
		if (!store) return console.error("Please add your API Key in the Authorization header for the HTTP Request.\nGet your FortniteAPI.io Authorization Key at https://dashboard.fortniteapi.io".red);

		store.forEach(el => {
			if (!shop[el.section.id]) {
				shop[el.section.id] = {
					name: el.section.name,
					entries: [],
				};
			}
			shop[el.section.id].entries.push({
				name: el.displayName,
				description: el.displayDescription,
				id: el.mainId,
				type: el.displayType,
				mainType: el.mainType,
				offerId: el.offerId,
				giftAllowed: el.giftAllowed,
				price: el.price,
				rarity: el.rarity,
				series: el.series,
				images: {
					icon: el.displayAssets[0].url,
					background: el.displayAssets[0].background,
				},
				banner: el.banner,
				effects: el.granted[0].gameplayTags.filter(kek => kek.includes("UserFacingFlags")),
				priority: el.priority,
				section: el.section,
				size: el.tileSize,
				renderData: el.displayAssets[0].renderData,
			});
		});

		return shop;
	},
};
