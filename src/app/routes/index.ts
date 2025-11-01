import express from 'express';
import AuthRoutes from '../modules/auth/auth.route';
import ContactRoutes from '../modules/contact/contact.route';
import GalleryRoutes from '../modules/gallery/gallery.route';
import NewsRoutes from '../modules/news/news.route';
import ProjectRoutes from '../modules/project/project.route';
import PublicationRoutes from '../modules/publication/publication.route';
import UserRoutes from '../modules/user/user.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/contact',
    route: ContactRoutes,
  },
  {
    path: '/news',
    route: NewsRoutes,
  },
  {
    path: '/projects',
    route: ProjectRoutes,
  },
  {
    path: '/publications',
    route: PublicationRoutes,
  },
  {
    path: '/gallery',
    route: GalleryRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
