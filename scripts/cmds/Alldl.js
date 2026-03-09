const axios = require('axios');

module.exports = {
  config: {
    name: "alldl",
    version: "10.0",
    author: "𝗧𝗮𝗺𝗶𝗺 𝗕𝗯𝘇",
    countDown: 3,
    role: 0,
    shortDescription: "Ultra Fast Multi-Source Downloader",
    longDescription: "Download videos with automatic retry and stream fix.",
    category: "media",
    guide: "{pn} <link> or just send the link"
  },

  onStart: async function ({ api, event, args, message }) {
    const url = args[0];
    if (!url) return message.reply("⚠️ দয়া করে একটি ভিডিও লিঙ্ক দিন!");
    return await this.handleDownload(url, api, event, message);
  },

  onChat: async function ({ api, event, message }) {
    const { body, senderID } = event;
    if (!body || senderID === api.getCurrentUserID()) return;

    const linkRegEx = /(https?:\/\/[^\s]+)/g;
    const match = body.match(linkRegEx);

    if (match) {
      const url = match[0];
      const sites = ["tiktok.com", "facebook.com", "fb.watch", "instagram.com", "reels", "youtube.com", "youtu.be", "pinterest.com", "pin.it", "twitter.com", "x.com", "capcut.com"];
      
      if (sites.some(s => url.includes(s))) {
        return await this.handleDownload(url, api, event, message);
      }
    }
  },

  handleDownload: async function (url, api, event, message) {
    const { messageID } = event;
    const start = Date.now();

    try {
      if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

      let videoUrl, title, source = "Unknown";


      if (url.includes("tiktok.com")) {
        try {
          const tikRes = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
          videoUrl = tikRes.data.video.noWatermark || tikRes.data.video.watermark;
          title = tikRes.data.title;
          source = "TikTok";
        } catch (e) {}
      }

      if (!videoUrl && url.includes("tiktok.com")) {
        try {
          const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
          videoUrl = res.data.data.play;
          title = res.data.data.title;
          source = "TikTok";
        } catch (e) {}
      }


      if (!videoUrl) {
        try {
          const configRes = await axios.get("https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json");
          const apiUrl = configRes.data.autodl;
          const res = await axios.get(`${apiUrl}/download?url=${encodeURIComponent(url)}`);
          if (res.data && res.data.success) {
            videoUrl = res.data.data.video_url || res.data.data.nowatermark || res.data.data.hd;
            title = res.data.data.title;
            source = res.data.data.source || "Social Media";
          }
        } catch (e) {}
      }

      if (!videoUrl) throw new Error("Could not fetch video from any API.");
      
      const stream = await axios.get(videoUrl, { 
        responseType: 'stream',
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Accept': '*/*'
        },
        timeout: 60000 
      });

      const time = ((Date.now() - start) / 1000).toFixed(2);
      const xalmanBody = 
        `『 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 \n` +
        `📝 𝗧𝗶𝘁𝗹𝗲:" এতো বড়ো title তর আব্বা নি দিবো"}\n` +
        `🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${source.toUpperCase()}\n` +
        `👨‍💻 Dev: Tamim Bbz`;

      await message.reply({
        body: xalmanBody,
        attachment: stream.data
      });

      if (api.setMessageReaction) api.setMessageReaction("☑️", messageID, () => {}, true);

    } catch (e) {
      console.error("Download Error:", e.message);
      if (api.setMessageReaction) api.setMessageReaction("❗", messageID, () => {}, true);
    }
  }
};
