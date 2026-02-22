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
  db: {},
  auth: {}
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn()
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn()
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
    // collection mock returns an object with the name for easier assertion
    const { collection } = require('firebase/firestore');
    collection.mockImplementation((db, name) => ({ __collectionName: name }));
    window.confirm = jest.fn().mockReturnValue(false);
  });

///////////////////////////////////////////////////////

test('Renderizar movies correctamente', async () => {
  const { getDocs } = require('firebase/firestore');

  // first call is the emptiness check
  getDocs
    .mockResolvedValueOnce({ docs: [] })
    // faves
    .mockResolvedValueOnce({
      docs: [{ data: () => ({ idFave: 'movie1' }) }]
    })
    // productos
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
    // generos
    .mockResolvedValueOnce({ docs: [] })
    // generos links
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

///////////////////////////////////////////////////////

test('Debes confirmar si base de datos vacía y se ejecuta poblado', async () => {
  const { getDocs, addDoc } = require('firebase/firestore');
  const { createUserWithEmailAndPassword } = require('firebase/auth');

  // initial emptiness check returns empty
  getDocs
    .mockResolvedValueOnce({ docs: [] })
    // subsequent fetches: faves, productos, generos, generos links
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] });

  window.confirm = jest.fn().mockReturnValue(true);
  addDoc.mockResolvedValue({ id: 'dummy' });
  createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } });

  render(
    <BrowserRouter>
      <MainScreen />
    </BrowserRouter>
  );

  await waitFor(() => expect(window.confirm).toHaveBeenCalled());
  // ensure we attempted to create genres (setDoc called for each id)
  const { doc, setDoc } = require('firebase/firestore');
  expect(doc).toHaveBeenCalledWith(expect.anything(), "Genero", "0");
  expect(setDoc).toHaveBeenCalled();
  // at least one addDoc should target capitulo and usuariofaves via returned collection name
  const calledCollections = addDoc.mock.calls.map(c => c[0]?.__collectionName).filter(Boolean);
  expect(calledCollections).toEqual(expect.arrayContaining(["Capitulo", "UsuarioFaves"]));
  expect(createUserWithEmailAndPassword).toHaveBeenCalledTimes(2);
});

///////////////////////////////////////////////////////

test('No pide confirm si coleccion no está vacía', async () => {
  const { getDocs } = require('firebase/firestore');
  getDocs.mockResolvedValueOnce({ docs: [{ id:'x', data:()=>({}) }] });
  // the rest of calls should still be stubbed
  getDocs
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] })
    .mockResolvedValueOnce({ docs: [] });

  render(
    <BrowserRouter>
      <MainScreen />
    </BrowserRouter>
  );

  expect(window.confirm).not.toHaveBeenCalled();
});
});