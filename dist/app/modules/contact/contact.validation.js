"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactValidationSchema = void 0;
const zod_1 = require("zod");
// ----------------------------------------
// ✅ Create Contact Validation Schema
// ----------------------------------------
exports.createContactValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .trim()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name cannot exceed 100 characters'),
        email: zod_1.z
            .string()
            .trim()
            .email('Please provide a valid email address')
            .toLowerCase(),
        subject: zod_1.z
            .string()
            .trim()
            .min(3, 'Subject must be at least 3 characters')
            .max(200, 'Subject cannot exceed 200 characters'),
        message: zod_1.z
            .string()
            .trim()
            .min(10, 'Message must be at least 10 characters')
            .max(5000, 'Message cannot exceed 5000 characters'),
    }),
});
