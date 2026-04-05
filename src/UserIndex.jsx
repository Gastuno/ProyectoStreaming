import './MainScreen.css';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from './firebaseconfig';

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


  return (
    <div className="main">
      {loading && <p>Cargando...</p>}
      <div className="background"></div>

      {role === 'admin' && (
        <div className="content-section">
          <h2>Usuarios</h2>
          <table className="users-table">
            <thead>
              <tr>
                <th>Editar</th>
                <th>Email</th>
                <th>Contraseña</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td><button>Editar</button></td>
                  <td>{user.email}</td>
                  <td>{user.password}</td>
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
