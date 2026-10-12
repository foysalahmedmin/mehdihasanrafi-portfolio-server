"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordValidationSchema = exports.forgetPasswordValidationSchema = exports.changePasswordValidationSchema = exports.refreshTokenValidationSchema = exports.signupValidationSchema = exports.signinValidationSchema = void 0;
const zod_1 = require("zod");
exports.signinValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6).max(12),
    }),
});
exports.signupValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        password: zod_1.z.string().min(6).max(12),
    }),
});
exports.refreshTokenValidationSchema = zod_1.z.object({
    cookies: zod_1.z.object({
        refresh_token: zod_1.z.string(),
    }),
});
exports.changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        current_password: zod_1.z.string().min(6).max(12),
        new_password: zod_1.z.string().min(6).max(12),
    })
        .refine((value) => value.current_password !== value.new_password, {
        message: 'New password must be unique',
    }),
});
exports.forgetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email(),
    }),
});
exports.resetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().min(6).max(12),
    }),
});
