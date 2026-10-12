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
exports.News = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const newsSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    link: {
        type: String,
    },
    description: {
        type: String,
        trim: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    author: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
    },
    images: {
        type: [String],
        default: [],
    },
    video: {
        type: String,
    },
    youtube: {
        type: String,
    },
    tags: {
        type: [String],
        default: [],
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'archived'],
        default: 'draft',
    },
    is_featured: {
        type: Boolean,
        default: false,
    },
    published_at: {
        type: Date,
        required: function () {
            return this.status === 'published';
        },
        default: function () {
            return this.status === 'published' ? new Date() : undefined;
        },
    },
    read_time: {
        type: String,
    },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
newsSchema.index({ slug: 1 });
newsSchema.index({ title: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ is_featured: 1 });
newsSchema.index({ created_at: -1 });
newsSchema.index({ published_at: -1 });
newsSchema.index({ title: 1, description: 1 });
newsSchema.methods.toJSON = function () {
    const News = this.toObject();
    return News;
};
exports.News = mongoose_1.default.model('News', newsSchema);
