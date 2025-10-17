import { createBrowserRouter } from 'react-router-dom';
import Login from './Login.jsx';
import MainScreen from './MainScreen.jsx';
import MovieProfile from './MediaProfiles/MovieProfile.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/main',
    element: <MainScreen />,
  },
  {
    path: '/movie/:name',
    element: <MovieProfile />,
  },
]);

export default router;
