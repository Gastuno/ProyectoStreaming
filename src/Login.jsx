import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from './assets/login.jpg';
import './Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (username === 'admin' && password === 'pass') {
      setError('');
      sessionStorage.setItem('role', 'admin');
      navigate('/main', { state: { role: 'admin' } });
    } else if (username === 'user' && password === 'pass') {
      setError('');
      sessionStorage.setItem('role', 'user');
      navigate('/main', { state: { role: 'user' } });
    } else {
      setError('Nombre de usuario o contraseña incorrectos');
    }
  };

return (
  <>
    <div className="login-container">
      <h2>INICIAR SESION</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesion</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
    <div className="side-image">
      <img src={loginImage} alt="Side" />
      
    </div>
  </>
);
}

//figure out why the side text is not showing up

export default Login;
