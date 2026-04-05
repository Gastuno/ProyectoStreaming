import { createBrowserRouter } from 'react-router-dom';
import Login from './Login.jsx';
import MainScreen from './MainScreen.jsx';
import MovieProfile from './MediaProfiles/MovieProfile.jsx';
import Register from './register.jsx';
import UserIndex from './UserIndex.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/main',
    element: <MainScreen />,
  },
  {
    path: '/movie/:id',
    element: <MovieProfile />,
  },
  {
    path: '/userindex',
    element: <UserIndex />,
  },
]);

export default router;
