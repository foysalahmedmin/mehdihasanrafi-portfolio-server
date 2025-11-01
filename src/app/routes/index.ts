import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import NewsRoutes from '../modules/news/news.route';
import userRoutes from '../modules/user/user.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/news',
    route: NewsRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
