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
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = __importDefault(require("../../middlewares/auth.middleware"));
const file_middleware_1 = __importDefault(require("../../middlewares/file.middleware"));
const validation_middleware_1 = __importDefault(require("../../middlewares/validation.middleware"));
const AuthControllers = __importStar(require("./auth.controller"));
const AuthValidations = __importStar(require("./auth.validation"));
const router = express_1.default.Router();
router.post('/signin', (0, validation_middleware_1.default)(AuthValidations.signinValidationSchema), AuthControllers.signin);
router.post('/signup', (0, file_middleware_1.default)({
    name: 'image',
    folder: 'users',
    resourceType: 'image',
    size: 5_000_000,
    maxCount: 1,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}), (0, validation_middleware_1.default)(AuthValidations.signupValidationSchema), AuthControllers.signup);
router.post('/refresh-token', (0, validation_middleware_1.default)(AuthValidations.refreshTokenValidationSchema), AuthControllers.refreshToken);
router.patch('/change-password', (0, auth_middleware_1.default)('admin', 'editor', 'author', 'contributor', 'subscriber', 'user'), (0, validation_middleware_1.default)(AuthValidations.changePasswordValidationSchema), AuthControllers.changePassword);
router.post('/forget-password', (0, validation_middleware_1.default)(AuthValidations.forgetPasswordValidationSchema), AuthControllers.forgetPassword);
router.patch('/reset-password', (0, validation_middleware_1.default)(AuthValidations.resetPasswordValidationSchema), AuthControllers.resetPassword);
router.post('/email-verification-source', (0, auth_middleware_1.default)('admin', 'editor', 'author', 'contributor', 'subscriber', 'user'), AuthControllers.emailVerificationSource);
router.post('/email-verification', AuthControllers.emailVerification);
const authRoutes = router;
exports.default = authRoutes;
