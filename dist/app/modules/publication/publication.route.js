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
const PublicationControllers = __importStar(require("./publication.controller"));
const publication_utils_1 = require("./publication.utils");
const PublicationValidations = __importStar(require("./publication.validation"));
const router = express_1.default.Router();
// GET
router.get('/', PublicationControllers.getPublicBulkPublications);
router.get('/:slug', PublicationControllers.getPublicPublication);
// PATCH
router.patch('/bulk', (0, auth_middleware_1.default)('admin'), (0, validation_middleware_1.default)(PublicationValidations.updateBulkPublicationValidationSchema), PublicationControllers.updateBulkPublications);
router.patch('/:id', (0, auth_middleware_1.default)('admin'), (0, file_middleware_1.default)({
    name: 'thumbnail',
    folder: publication_utils_1.folderMap.thumbnail,
    resourceType: 'image',
    size: 5_000_000,
    maxCount: 1,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}, {
    name: 'pdf',
    folder: publication_utils_1.folderMap.pdf,
    resourceType: 'raw',
    size: 20_000_000,
    maxCount: 1,
    allowedTypes: ['application/pdf'],
}, {
    name: 'images',
    folder: publication_utils_1.folderMap.image,
    resourceType: 'image',
    size: 5_000_000,
    maxCount: 4,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}), (0, validation_middleware_1.default)(PublicationValidations.updatePublicationValidationSchema), PublicationControllers.updatePublication);
// DELETE
router.delete('/bulk/permanent', (0, auth_middleware_1.default)('admin'), (0, validation_middleware_1.default)(PublicationValidations.bulkPublicationOperationValidationSchema), PublicationControllers.deleteBulkPublicationsPermanent);
router.delete('/:id/permanent', (0, auth_middleware_1.default)('admin'), (0, validation_middleware_1.default)(PublicationValidations.publicationOperationValidationSchema), PublicationControllers.deletePublicationPermanent);
// POST
router.post('/', (0, auth_middleware_1.default)('admin', 'author'), (0, file_middleware_1.default)({
    name: 'thumbnail',
    folder: publication_utils_1.folderMap.thumbnail,
    resourceType: 'image',
    size: 5_000_000,
    maxCount: 1,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}, {
    name: 'pdf',
    folder: publication_utils_1.folderMap.pdf,
    resourceType: 'raw',
    size: 20_000_000,
    maxCount: 1,
    allowedTypes: ['application/pdf'],
}, {
    name: 'images',
    folder: publication_utils_1.folderMap.image,
    resourceType: 'image',
    size: 5_000_000,
    maxCount: 4,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
}), (0, validation_middleware_1.default)(PublicationValidations.createPublicationValidationSchema), PublicationControllers.createPublication);
const PublicationRoutes = router;
exports.default = PublicationRoutes;
