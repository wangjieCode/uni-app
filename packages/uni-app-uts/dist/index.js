"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugins_1 = require("./plugins");
const css_1 = require("./plugins/css");
const mainUTS_1 = require("./plugins/mainUTS");
const manifestJson_1 = require("./plugins/manifestJson");
const pagesJson_1 = require("./plugins/pagesJson");
const pre_1 = require("./plugins/pre");
const uvue_1 = require("./plugins/uvue");
exports.default = () => {
    return [
        (0, pre_1.uniPrePlugin)(),
        (0, plugins_1.uniAppUTSPlugin)(),
        (0, uvue_1.uniAppUVuePlugin)(),
        (0, mainUTS_1.uniAppMainPlugin)(),
        (0, manifestJson_1.uniAppManifestPlugin)(),
        (0, pagesJson_1.uniAppPagesPlugin)(),
        (0, css_1.uniAppCssPlugin)(),
    ];
};
