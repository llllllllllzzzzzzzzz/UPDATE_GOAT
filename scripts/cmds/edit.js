const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const apiUrl = "https://raw.githubusercontent.com/Saim-x69x/sakura/main/ApiUrl.json";

async function getApiUrl() {
  const res = await axios.get(apiUrl);
  return res.data.apiv3;
}

async function urlToBase64(url) {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(res.data).toString("base64");
}

module.exports = {
  config: {
    name: "editpro",
    version: "1.0",
    author: "Saimx69x",// 𝗙𝗶𝘅𝗲𝗱 𝗯𝘆 𝗧𝗮𝗺𝗶𝗺 𝗕𝗯𝘇
    countDown: 5,
    premium: true,
    role: 0,
    shortDescription: "Edit an image using text prompt",
    longDescription: "Only edits an existing image. Must reply to an image.",
    guide: "{p}editpro <prompt> (reply to an image)"
  },

  onStart: async function ({ api, event, args, message }) {
    const repliedImage = event.messageReply?.attachments?.[0];
    const prompt = args.join(" ").trim();

    if (!repliedImage || repliedImage.type !== "photo") {
      return message.reply(
        "❌ Please reply to an image to edit it.\n\nExample:\n/edit make it anime style"
      );
    }

    if (!prompt) {
      return message.reply("❌ Please provide an edit prompt.");
    }

    const processingMsg = await message.reply("🖌️ 𝗘𝗱𝗶𝘁𝗶𝗻𝗴 𝗶𝗺𝗮𝗴𝗲....");

    const imgPath = path.join(
      __dirname,
      "cache",
      `${Date.now()}_edit.jpg`
    );

    try {
      const API_URL = await getApiUrl();

      const payload = {
        prompt: `Edit the given image based on this description:\n${prompt}`,
        images: [await urlToBase64(repliedImage.url)],
        format: "jpg"
      };

      const res = await axios.post(API_URL, payload, {
        responseType: "arraybuffer",
        timeout: 180000
      });

      await fs.ensureDir(path.dirname(imgPath));
      await fs.writeFile(imgPath, Buffer.from(res.data));

      await api.unsendMessage(processingMsg.messageID);

      await message.reply({
        body: `✅ 𝗜𝗺𝗮𝗴𝗲 𝗲𝗱𝗶𝘁𝗲𝗱 𝘀𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆\nPrompt: ${prompt}`,
        attachment: fs.createReadStream(imgPath)
      });

    } catch (error) {
      console.error("𝗘𝗱𝗶𝘁 𝗘𝗿𝗿𝗼𝗿:", error?.response?.data || error.message);
      await api.unsendMessage(processingMsg.messageID);
      message.reply("❌ 𝗙𝗮𝗶𝗹𝗱 𝘁𝗼 𝗲𝗱𝗶𝘁 𝗶𝗺𝗮𝗴𝗲..𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝗹𝗮𝘁𝗲𝗿.");
    } finally {
      if (fs.existsSync(imgPath)) {
        await fs.remove(imgPath);
      }
    }
  }
};
