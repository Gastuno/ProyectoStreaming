import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import loginImage from "./assets/login.jpg";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Usuario logeado:", user.email);

      const userRef = doc(db, "Usuario", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("No existe el perfil del usuario.");
        return;
      }

      //DATOS DE SESION

      const userId = user.uid;
      const { nivel } = userSnap.data();

      sessionStorage.setItem('userId', userId);
      sessionStorage.setItem('role', nivel === 1 ? 'admin' : 'user');

      if (nivel === 1) {
        navigate('/main', { state: { role: 'admin' } });
      } else {
        navigate('/main', { state: { role: 'user' } });
      }

    } catch (err) {
      console.error("Error iniciando sesión:", err);
      setError("Correo o contraseña incorrectos");
    }
  };

  return (
    <>
      <div className="background"></div>
      <div className="side-image">
        <img src={loginImage} alt="Side" />
      </div>
      <div className="page-title">
        <h1>Proyectostreaming</h1>
      </div>
      <div className="login-container">
        <h2>INICIAR SESION</h2>

        <form onSubmit={handleLogin}>
          <div>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-container">
          <button type="submit">Iniciar Sesión</button>
          <button type="button" onClick={() => navigate('/register')}>
            Registrarse
          </button>
          </div>

        </form>

        {error && <p>{error}</p>}
      </div>

      
    </>
  );
}

export default Login;
