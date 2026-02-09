require("dotenv").config();
const fs = require("fs");
const path = require("path");
const settings = require("../../helpers/constants");

const allSettings = settings.ALL_NOTE_SETTINGS;

/** Return ISO date string for "created" when frontmatter does not set it (e.g. use file birthtime). */
function getCreatedFallback(inputPath) {
  if (!inputPath || typeof inputPath !== "string") return undefined;
  const resolved = path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
  try {
    const stat = fs.statSync(resolved);
    const birth = stat.birthtime;
    if (birth && birth.getTime && !Number.isNaN(birth.getTime())) {
      return birth.toISOString();
    }
    return stat.mtime.toISOString();
  } catch {
    return undefined;
  }
}

module.exports = {
  eleventyComputed: {
    created: (data) => {
      if (data.created) return data.created;
      const inputPath = data.page && data.page.inputPath;
      return getCreatedFallback(inputPath);
    },
    layout: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "layouts/index.njk";
      }
      return "layouts/note.njk";
    },
    permalink: (data) => {
      if (data.tags.indexOf("gardenEntry") != -1) {
        return "/";
      }
      return data.permalink || undefined;
    },
    settings: (data) => {
      const noteSettings = {};
      allSettings.forEach((setting) => {
        let noteSetting = data[setting];
        let globalSetting = process.env[setting];

        let settingValue =
          noteSetting || (globalSetting === "true" && noteSetting !== false);
        noteSettings[setting] = settingValue;
      });
      return noteSettings;
    },
  },
};
