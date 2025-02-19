import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import do hook useNavigate
import logo from '../assets/logo-no-bg.png';
const API_URL = import.meta.env.VITE_API_URL;

const Login: React.FC = () => {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate(); // Inicializa o hook para redirecionamento

  const handleTokenExpiration = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertendo para milissegundos

      // Armazena a data de expiração no localStorage
      localStorage.setItem('token_exp', expirationTime.toString());

      console.log(`Token expira em: ${(expirationTime - Date.now()) / 1000} segundos`);
    } catch (error) {
      console.error('Erro ao processar o token:', error);
      localStorage.removeItem('usuario');
      localStorage.removeItem('token');
      localStorage.removeItem('token_exp');
      navigate('/login');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, senha }),
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message);
      }

      const data = await response.json();
      console.log('Login bem-sucedido:', data);

      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('token', data.token);

      handleTokenExpiration(data.token);

      // Redireciona com base no perfil_id
      switch (data.usuario.perfil_id) {
        case 1: 
          navigate('/aluno');
          break;
        case 2: 
          navigate('/instrutor');
          break;
        case 3: 
          navigate('/admin');
          break;
        default:
          throw new Error('Perfil desconhecido');
      }
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login');
    }
  };

  return (
    <>
      <header className='bg-transparent'>
        <div className='flex items-center p-4'>
          <img src={logo} alt="Logo" className="w-24" />
          <h1 className='text-azulFalcao text-6xl'>FALCO</h1>
        </div>
      </header>

      <div className="flex justify-center w-full">
        <form
          onSubmit={handleSubmit}
          className='p-6 flex flex-col items-center'
        >
          <div className='flex w-100 flex-col items-center mb-8'>
            <h1 className='text-wrap text-3xl text-white font-bold mb-8 text-center whitespace-nowrap sombra-azul'>Seu tempo de estudo e qualidade</h1>
            <h1 className='text-5xl text-white font-bold mb-2 text-center whitespace-nowrap sombra-azul'>Começa agora</h1>
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <div className="mb-4">
            <label htmlFor="login" className="block text-white font-medium text-xl">
              Login
            </label>
            <input
              type="text"
              id="login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-72 mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="senha" className="block text-white font-medium text-xl">
              Senha
            </label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-72 mt-2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-40 bg-blue-500 text-white py-2 px-4 mt-5 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
