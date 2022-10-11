const isDev = /serve|watch/.test(process.argv.join());

const baseUrl = isDev ? `localhost:8080` : `https://weiweiwu.me`;

module.exports = {
  tracking: {
    gtag: "GTM-5JNK4F8",
  },
  baseUrl,
  isDev,
};
