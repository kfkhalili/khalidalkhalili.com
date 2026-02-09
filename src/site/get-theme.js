require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const crypto = require("crypto");
const {globSync} = require("glob");

const themeCommentRegex = /\/\*[\s\S]*?\*\//g;

/**
 * Build axios proxy config from HTTP_PROXY or HTTPS_PROXY env vars (for corporate proxies).
 * @returns {{ host: string, port: number, protocol: string, auth?: { username: string, password: string } } | undefined}
 */
function getProxyConfig() {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (!proxyUrl || proxyUrl.trim() === "") return undefined;
  try {
    const u = new URL(proxyUrl);
    const port = u.port ? parseInt(u.port, 10) : u.protocol === "https:" ? 443 : 80;
    const config = {
      host: u.hostname,
      port: Number.isNaN(port) ? 80 : port,
      protocol: u.protocol.replace(":", ""),
    };
    if (u.username || u.password) {
      config.auth = { username: decodeURIComponent(u.username), password: decodeURIComponent(u.password) };
    }
    return config;
  } catch {
    return undefined;
  }
}

async function getTheme() {
  const proxy = getProxyConfig();
  const axiosOptions = proxy ? { proxy } : {};

  const themeUrl = process.env.THEME;
  if (!themeUrl) return;

  let urlToFetch = themeUrl;
  // https://forum.obsidian.md/t/1-0-theme-migration-guide/42537
  // Not all themes with no legacy mark have a theme.css file, so we need to check for it
  try {
    await axios.get(themeUrl, axiosOptions);
  } catch {
    if (themeUrl.indexOf("theme.css") > -1) {
      urlToFetch = themeUrl.replace("theme.css", "obsidian.css");
    } else if (themeUrl.indexOf("obsidian.css") > -1) {
      urlToFetch = themeUrl.replace("obsidian.css", "theme.css");
    }
  }

  try {
    const res = await axios.get(urlToFetch, axiosOptions);
    try {
      const existing = globSync("src/site/styles/_theme.*.css");
      existing.forEach((file) => {
        fs.rmSync(file);
      });
    } catch {}
    let skippedFirstComment = false;
    const data = res.data.replace(themeCommentRegex, (match) => {
      if (skippedFirstComment) {
        return "";
      }
      skippedFirstComment = true;
      return match;
    });
    const hashSum = crypto.createHash("sha256");
    hashSum.update(data);
    const hex = hashSum.digest("hex");
    fs.writeFileSync(`src/site/styles/_theme.${hex.substring(0, 8)}.css`, data);
  } catch (err) {
    const existing = globSync("src/site/styles/_theme.*.css")[0];
    const msg = existing
      ? `Could not fetch theme (${err.message ?? err}). Using existing theme file.`
      : `Could not fetch theme (${err.message ?? err}). Run without proxy or add THEME later.`;
    console.warn("get-theme:", msg);
  }
}

getTheme();
