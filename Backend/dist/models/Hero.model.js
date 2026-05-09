"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hero = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Hero Schema
const HeroSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Slider title is required'],
        trim: true,
        maxlength: [200, 'Slider title must not exceed 200 characters'],
    },
    subtitle: {
        type: String,
        required: [true, 'Slider sub-title is required'],
        trim: true,
        maxLength: [200, 'Sub title must not exceed 200 characters'],
    },
    offer: {
        type: String,
        maxlength: [100, 'offer message must not exceed 100 characters'],
    },
    ctaText: {
        type: String,
        maxlength: [100, 'Button text must not exceed 100 characters'],
    },
    ctaLink: {
        type: String,
        trim: true,
    },
    backgroundImage: { type: String, trim: true, required: [true, 'Image is required'] },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
    versionKey: '__v',
});
// Model
exports.Hero = mongoose_1.default.model('Hero', HeroSchema);
//# sourceMappingURL=Hero.model.js.map