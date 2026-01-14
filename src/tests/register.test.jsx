import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Registro from '../register';

//BD
jest.mock('../firebaseconfig', () => ({
  auth: {},
  db: {}
}));

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn()
}));

//ROUTER
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

global.alert = jest.fn();

describe('Registro Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ///////////////////////////////////////////////////////

  test('Formulario de registro mostrado correctamente', () => {
    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>
    );

    expect(screen.getByText('Registrarse')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese su Mail')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese un usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ingrese una contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
  });

  ///////////////////////////////////////////////////////

  test('Se navega al login luego de registrarse', async () => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');
    const { doc, setDoc } = require('firebase/firestore');

    createUserWithEmailAndPassword.mockRejectedValue( //TEST ERRONEO
      new Error('Auth error')
    );

    const mockDoc = { id: '123' };
    doc.mockReturnValue(mockDoc);
    setDoc.mockResolvedValue();

    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Ingrese su Mail');
    const usuarioInput = screen.getByPlaceholderText('Ingrese un usuario');
    const passwordInput = screen.getByPlaceholderText('Ingrese una contraseña');
    const submitButton = screen.getByRole('button', { name: 'Registrarse' });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(usuarioInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith({}, 'test@test.com', 'test');
      expect(setDoc).toHaveBeenCalledWith(mockDoc, {
        email: 'test@test.com',
        fechaRegistro: expect.any(Date),
        fotoPerfil: 'url',
        nivel: 0,
        nombre: 'test'
      });
      expect(global.alert).toHaveBeenCalledWith('Usuario registrado con exito.');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  ///////////////////////////////////////////////////////

  test('registration with empty fields shows error', async () => {
    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: 'Registrarse' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Por favor, complete todos los campos.')).toBeInTheDocument();
    });
  });

  ///////////////////////////////////////////////////////

  test('Error de registro esperado', async () => {
    const { createUserWithEmailAndPassword } = require('firebase/auth');

    createUserWithEmailAndPassword.mockRejectedValue(new Error('Error desconocido de registro.'));

    render(
      <BrowserRouter>
        <Registro />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('Ingrese su Mail');
    const usuarioInput = screen.getByPlaceholderText('Ingrese un usuario');
    const passwordInput = screen.getByPlaceholderText('Ingrese una contraseña');
    const submitButton = screen.getByRole('button', { name: 'Registrarse' });

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(usuarioInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: 'test' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error desconocido de registro.')).toBeInTheDocument();
    });
  });
});