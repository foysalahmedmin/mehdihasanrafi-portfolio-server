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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = __importDefault(require("../../config"));
const userSchema = new mongoose_1.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: [6, 'the password should minimum 6 character'],
        maxlength: [12, 'the password should maximum 12 character'],
        select: false,
    },
    password_changed_at: { type: Date, default: Date.now, select: false },
    role: {
        type: String,
        enum: [
            'super-admin',
            'admin',
            'editor',
            'author',
            'contributor',
            'subscriber',
            'user',
        ],
        required: true,
    },
    status: {
        type: String,
        enum: ['in-progress', 'blocked'],
        default: 'in-progress',
    },
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false, select: false },
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema.index({ email: 1 }, {
    unique: true,
    partialFilterExpression: { is_deleted: false },
    name: 'unique_email_not_deleted',
});
// toJSON override to remove sensitive fields from output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.password_changed_at;
    delete user.is_deleted;
    return user;
};
// Post save middleware/ hook
userSchema.post('save', function (document, next) {
    document.password = '';
    next();
});
// Pre save middleware/ hook
userSchema.pre('save', async function (next) {
    // Hash password
    if (this.isModified('password')) {
        this.password = await bcrypt_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        if (!this.isNew) {
            this.password_changed_at = new Date();
        }
    }
    // Reset is_verified on email change
    if (this.isModified('email')) {
        this.is_verified = false;
    }
    next();
});
// Query middleware to exclude deleted users
userSchema.pre(/^find/, function (next) {
    const query = this;
    const opts = query.getOptions();
    if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
        query.setQuery({
            ...query.getQuery(),
            is_deleted: { $ne: true },
        });
    }
    next();
});
// userSchema.pre(/^update/, function (this: Query<TUser, TUser>, next) {
//   this.setQuery({
//     ...this.getQuery(),
//     is_deleted: { $ne: true },
//   });
//   next();
// });
// Aggregation pipeline
userSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
    next();
});
// Static methods
userSchema.statics.isUserExist = async function (_id) {
    return await this.findById(_id).select('+password +password_changed_at');
};
userSchema.statics.isUserExistByEmail = async function (email) {
    return await this.findOne({ email: email }).select('+password +password_changed_at');
};
// Instance methods
userSchema.methods.softDelete = async function () {
    this.is_deleted = true;
    return await this.save();
};
userSchema.methods.isPasswordChanged = function (jwtTimestamp) {
    const passwordChangedTimestamp = Math.floor(this.password_changed_at.getTime() / 1000);
    return jwtTimestamp < passwordChangedTimestamp;
};
exports.User = mongoose_1.default.model('User', userSchema);
