"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("../modules/auth/auth.route"));
const contact_route_1 = __importDefault(require("../modules/contact/contact.route"));
const gallery_route_1 = __importDefault(require("../modules/gallery/gallery.route"));
const news_route_1 = __importDefault(require("../modules/news/news.route"));
const project_route_1 = __importDefault(require("../modules/project/project.route"));
const publication_route_1 = __importDefault(require("../modules/publication/publication.route"));
const user_route_1 = __importDefault(require("../modules/user/user.route"));
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: '/auth',
        route: auth_route_1.default,
    },
    {
        path: '/user',
        route: user_route_1.default,
    },
    {
        path: '/contact',
        route: contact_route_1.default,
    },
    {
        path: '/news',
        route: news_route_1.default,
    },
    {
        path: '/projects',
        route: project_route_1.default,
    },
    {
        path: '/publications',
        route: publication_route_1.default,
    },
    {
        path: '/gallery',
        route: gallery_route_1.default,
    },
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
