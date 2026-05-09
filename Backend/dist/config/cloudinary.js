"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const env_config_1 = require("../config/env.config");
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
cloudinary_1.v2.config({
    cloud_name: env_config_1.env.CLOUDINARY_CLOUD_NAME,
    api_key: env_config_1.env.CLOUDINARY_API_KEY,
    api_secret: env_config_1.env.CLOUDINARY_API_SECRET,
    secure: true,
});
//# sourceMappingURL=cloudinary.js.map