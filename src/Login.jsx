import React, { useState, useEffect,  useRef} from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebaseconfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import loginImage from "./assets/login.jpg";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  // para evitar que quiera poblar la bd multiples veces
  const ref = useRef(false);
  // para que se quede cargando mientras pobla la db
  const [cargando, setCargando] = useState(false);
  // animacion cargando
  const [puntos, setPuntos] = useState("");

  // popup popular
  useEffect(() => {
  if (ref.current) return;
  ref.current = true;

    const checkAndPopulate = async () => {
      try {
        const prodSnap = await getDocs(collection(db, "Producto"));
        if (prodSnap.empty) {
          const confirmed = window.confirm(
            "Inicializar base de datos?"
          );
          if (confirmed) {
            setCargando(true);
            await populateDatabase();
            setCargando(false);
          }
        }
      } catch (err) {
        console.error("Error", err);
      }
    };
    checkAndPopulate();
  }, []);
  
  // DB POPULATOR
  const populateDatabase = async () => {
    try {
      // Generos
      const genreNames = [
        "Accion",
        "Romance",
        "Comedia",
        "Drama",
        "Sci-Fi",
        "Terror",
      ];
      const genreIds = [];
      for (let i = 0; i < genreNames.length; i++) {
        const idStr = String(i);
        await setDoc(doc(db, "Genero", idStr), { nombre: genreNames[i] });
        genreIds.push(idStr);
      }

      // Pelicula test
      const movieRef = await addDoc(collection(db, "Producto"), {
        fechaLanz: new Date(),
        descripcion: "Pelitest",
        'duracion-m': 90,
        director: "Director",
        mov: "",
        nombre: "Pelitest",
        numTemps: null,
        portada: "url",
        tipo: "Pelicula",
      });
      await addDoc(collection(db, "Generos"), {
        idProducto: movieRef.id,
        idGenero: genreIds[0],
      });

      // Serie test
      const seriesRef = await addDoc(collection(db, "Producto"), {
        fechaLanz: new Date(),
        descripcion: "Seritest",
        'duracion-m': null,
        director: "Director",
        mov: "",
        nombre: "Seritest",
        numTemps: 1,
        portada: "url",
        tipo: "Serie",
      });
      await addDoc(collection(db, "Generos"), {
        idProducto: seriesRef.id,
        idGenero: genreIds[0],
      });

      // Serie test capitulo
      await addDoc(collection(db, "Capitulo"), {
        idProducto: seriesRef.id,
        titulo: "Capítulo 1",
        duracion: 45,
      });

      // Ejemplos
      try {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          "test@gmail.com",
          "password"
        );
        await setDoc(doc(db, "Usuario", userCred.user.uid), {
          email: "test@gmail.com",
          fechaRegistro: new Date(),
          nivel: 0,
        });
        await addDoc(collection(db, "UsuarioFaves"), {
          idUser: userCred.user.uid,
          idFave: movieRef.id,
        });
      } catch (e) {
        console.warn("Error al crear usuario", e);
      }

      try {
        const adminCred = await createUserWithEmailAndPassword(
          auth,
          "admin@gmail.com",
          "password"
        );
        await setDoc(doc(db, "Usuario", adminCred.user.uid), {
          email: "admin@gmail.com",
          fechaRegistro: new Date(),
          nivel: 1,
        });
      } catch (e) {
        console.warn("Error al crear usuario", e);
      }

      alert("BD inicializada con exito! test@gmail.com / admin@gmail.com, contrasenas: password");
    } catch (error) {
      console.error("Error al poblar la bd", error);
    }
  };

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

    // animacion cargando
  useEffect(() => {
  if (!cargando) return;

  const interval = setInterval(() => {
    setPuntos(prev => {
      if (prev === "...") return ".";
      return prev + ".";
    });

  }, 500);
  
  return () => clearInterval(interval);
}, [cargando]);

  // pantalla de carga

if (cargando) {
  return (
    <div className="loading-overlay">
      <h2>
        Inicializando base de datos {puntos}
      </h2>
    </div>
  );
}

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
