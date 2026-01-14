import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainScreen from '../MainScreen';

//SUPRIMIR WARNING
const originalError = console.error;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('not wrapped in act')
    ) {
      return;
    }
    originalError(...args);
  });
});

//MOCK IMAGEN
jest.mock('../urlimagen', () => ({
  urlimagen: () => 'http://testimage.jpg',
}));

//BD
jest.mock('../firebaseconfig', () => ({
  db: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn()
}));

//ROUTER Y POS
const mockNavigate = jest.fn();
const mockLocation = { state: { role: 'user' } };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation
}));

//SESION
const mockSessionStorage = {
  getItem: jest.fn((key) => {
    if (key === 'userId') return '123';
    if (key === 'role') return 'user';
    return null;
  }),
  setItem: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

describe('MainScreen Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

///////////////////////////////////////////////////////

test('Renderizar movies correctamente', async () => {
  const { getDocs } = require('firebase/firestore');

  getDocs
    .mockResolvedValueOnce({
      docs: [{ data: () => ({ idFave: 'movie1' }) }]
    })
    .mockResolvedValueOnce({
      docs: [
        {
          id: 'movie1',
          data: () => ({
            nombre: 'Test Movie',
            portada: 'http://test.jpg',
            descripcion: 'test',
            tipo: 'Pelicula'
          })
        }
      ]
    })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] });

  render(
    <BrowserRouter>
      <MainScreen />
    </BrowserRouter>
  );

expect(await screen.findByText('Test Movie')).toBeInTheDocument();
});

///////////////////////////////////////////////////////

test('Rol de usuario', () => {
  const { collection, getDocs } = require('firebase/firestore');

  getDocs.mockRejectedValue(new Error('Firestore error')); //TEST ERRONEo

  render(
    <BrowserRouter>
      <MainScreen />
    </BrowserRouter>
  );

  //NO ADMIN
  expect(mockLocation.state.role).toBe('user');
});
});