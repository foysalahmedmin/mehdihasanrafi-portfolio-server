"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersOperationValidationSchema = exports.userOperationValidationSchema = exports.updateUsersValidationSchema = exports.updateUserValidationSchema = exports.updateSelfValidationSchema = exports.createUserValidationSchema = void 0;
const zod_1 = require("zod");
const idSchema = zod_1.z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid ID format',
});
exports.createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters'),
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(12, 'Password must be at most 12 characters'),
    }),
});
exports.updateSelfValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters')
            .optional(),
        email: zod_1.z.string().email('Invalid email format').optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.updateUserValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name cannot exceed 50 characters')
            .optional(),
        email: zod_1.z.string().email('Invalid email format').optional(),
        status: zod_1.z.enum(['in-progress', 'blocked']).optional(),
        role: zod_1.z
            .enum(['editor', 'author', 'contributor', 'subscriber', 'user'])
            .optional(),
        is_verified: zod_1.z
            .preprocess((val) => {
            if (val === 'true' || val === true)
                return true;
            if (val === 'false' || val === false)
                return false;
            return val;
        }, zod_1.z.boolean())
            .optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.updateUsersValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z
            .array(idSchema, {
            required_error: 'At least one user ID is required',
            invalid_type_error: 'User IDs must be an array of strings',
        })
            .nonempty('At least one user ID is required'),
        status: zod_1.z.enum(['in-progress', 'blocked']).optional(),
        role: zod_1.z
            .enum(['editor', 'author', 'contributor', 'subscriber', 'user'])
            .optional(),
        is_verified: zod_1.z.boolean().optional(),
    }),
});
exports.userOperationValidationSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: idSchema,
    }),
});
exports.usersOperationValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(idSchema).nonempty('At least one user ID is required'),
    }),
});
