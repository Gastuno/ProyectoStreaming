import './MainScreen.css';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebaseconfig';
import './UserIndex.css';

function UserIndex() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [uid, setUserId] = useState(null); 
  const [role, setRole] = useState('user');

//interaccion bd
useEffect(() => {
      const sid = sessionStorage.getItem('userId');
      if (sid) {
          setUserId(sid);
      }
  }, []);

useEffect(() => {
  const fromState = location.state?.role;
  const stored = sessionStorage.getItem('role');
  if (fromState) setRole(fromState);
  else if (stored) setRole(stored);
}, [location.state]);

useEffect(() => {
    if (role !== 'admin') { 
        setLoading(false);
        return; 
    }

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "Usuario"));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      console.log("Usuarios cargados:", usersList);
    } catch (error) {
      console.error("Error cargando usuarios", error);
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, [role]);

//Funcion para actualizar el nivel del usuario llamada en el dropdown

  const updateLevel = async (Id, newLevel) => {
    try {
      const userRef = doc(db, "Usuario", Id);
      await updateDoc(userRef, { nivel: newLevel });
      setUsers(users => users.map(u => u.id === Id ? { ...u, nivel: newLevel } : u));
    } catch (error) {
      console.error("Error", error);
    }
  };

  return (
    <div className="main">
      {loading && <p>Cargando...</p>}
      <div className="background"></div>
      <div className="volver-button">
        <button onClick={() => {navigate('/main');}}>{"<"}</button>
      </div>

      {role === 'admin' && (
        <div className="content-section">
          <h2>Usuarios</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Editar</th>
                <th>Id</th>
                <th>Email</th>
                <th>Registro</th>
                <th>Nivel</th>
              </tr>
            </thead>
            <tbody>
              
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>{user.fechaRegistro.toDate().toLocaleString()}</td>
                  <td>
                    <select
                    value={user.nivel} onChange={(e) => updateLevel(user.id, Number(e.target.value))}>
                      <option value={0}>usuario</option>
                      <option value={1}>admin</option>
                      </select>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserIndex;
