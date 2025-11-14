import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseconfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore'; 
import './register.css';

const Registro = () => {
    const [mail, setMail] = useState('');
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState(''); 
    const [loading, setLoading] = useState(false); 
    const navigate = useNavigate();

    const handleRegistrarse = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!mail || !usuario || !contrasena) {
            setError('Por favor, complete todos los campos.');
            return;
        }

        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                mail,
                contrasena
            );

            const user = userCredential.user;
            
            await setDoc(doc(db, "Usuario", user.uid), {
                email: mail,
                fechaRegistro: new Date(),
                fotoPerfil: 'url',
                nivel: 0,
                nombre: usuario, 
            });

            console.log("Registro exitoso. UID:", user.uid);
            alert('Registro exitoso! Ya puedes iniciar sesión.');
            
            navigate('/'); 

        } catch (firebaseError) {
            console.error("Error de registro de Firebase:", firebaseError.code, firebaseError.message);
            
            let errorMessage = 'Error desconocido al registrar. Intente más tarde.';
            
            if (firebaseError.code === 'auth/weak-password') {
                errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
            } else if (firebaseError.code === 'auth/email-already-in-use') {
                errorMessage = 'Este correo electrónico ya está registrado.';
            } else if (firebaseError.code === 'auth/invalid-email') {
                errorMessage = 'El formato del correo electrónico es inválido.';
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-form-card">
                <h2>Registrarse</h2>
                
                {error && <p className="error-message">{error}</p>}
                
                <form className="registro-form" onSubmit={handleRegistrarse}>
                    <label>
                        Mail:
                        <input type="email" value={mail} onChange={e => setMail(e.target.value)} placeholder=" Ingrese su Mail" />
                    </label>
                    <label>
                        Usuario:
                        <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} placeholder=" Ingrese un usuario" />
                    </label>
                    <label>
                        Contraseña:
                        <input type="password" value={contrasena} onChange={e => setContrasena(e.target.value)} placeholder=" Ingrese una contraseña (mínimo 6 caracteres)" />
                    </label>
                    
                    <div className="registro-actions">
                        <button type="submit" className="btn-registrar" disabled={loading}>
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                        <button type="button" className="btn-volver" onClick={() => navigate(-1)} disabled={loading}>
                            Volver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Registro;