import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../assets/coins.svg';
import logo from '../assets/logo-no-bg.png';
import subjects from '../assets/subjects_purple.svg';
const API_URL = import.meta.env.VITE_API_URL;

interface Usuario {
  ano_escolar: any;
  ativo: boolean;
  data_atualizacao: string;
  escola: string;
  falcoins: number;
  id: number;
  matricula: string;
  nome_completo: string;
  perfil_id: number;
}

const AdminDashboard: React.FC = () => {
  const [menuOption, setMenuOption] = useState('ciclos');
  const [materias, setMaterias] = useState<any[]>([]);
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const tokenExp = localStorage.getItem('token_exp');

    if (tokenExp) {
      const tempoRestante = Number(tokenExp) - Date.now();

      if (tempoRestante <= 0) {
        console.log('Token expirado. Deslogando...');
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
        navigate('/login');
      } else {
        console.log(`Token expira em ${tempoRestante / 1000} segundos`);

        // Configura um timer para deslogar automaticamente
        setTimeout(() => {
          console.log('Token expirado. Deslogando...');
          localStorage.removeItem('usuario');
          localStorage.removeItem('token');
          localStorage.removeItem('token_exp');
          navigate('/login');
        }, tempoRestante);
      }
    }
  }, [navigate]);


  // Fetch data
  useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem('token');
      
        try {
          const [materiasRes] = await Promise.all([
            fetch(`${API_URL}/instrutor/materias`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
          ]);
      
          // Verificar se alguma resposta deu erro (código >= 400)
          if (!materiasRes.ok ) {
            throw new Error('Erro de autenticação');
          }
      
          // Processar os dados das respostas
          const materiasData = await materiasRes.json();

          setMaterias(materiasData);

        } catch (error) {
          console.error('Erro ao buscar dados:', error);
          localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
          navigate('/login'); // Redirecionar para /login em caso de erro
        }
      };
      fetchData()
    }, []);
  

  const handleMateriaClick = (materia: {}) => {
    navigate('/instrutor/conteudos', { state: { materia } });
  };

  // Logout Functionality
  const handleLogout = useCallback(() => {
    localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');;
    navigate('/login');
  }, [navigate]);

  // User Data
  const usuarioString = localStorage.getItem('usuario');
  const usuario: Usuario = usuarioString ? JSON.parse(usuarioString) : ({} as Usuario);

  const nomeUsuario = usuario.nome_completo || '{{ user_name }}';
  const falcoins = usuario.falcoins || 0;

  return (
    <>
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="logo falco" className="w-16" />
          <h1 className="text-2xl font-bold">Olá, {nomeUsuario}!</h1>
        </div>
        <div className="flex items-center space-x-4">
          {usuario.perfil_id === 1 && (
            <>
              <img src={coins} alt="fal-coins" />
              <span>Fal-coins: {falcoins}</span>
            </>
          )}
          <Button variant="outlined" color="inherit" onClick={() => setModalLogoutOpen(true)}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-10rem)] min-w-full bg-azulBgAdmin bg-opacity-80">
        {/* Sidebar */}
        <div className="w-1/4 bg-blue-900 flex flex-col items-center p-4">
          <button
            className="text-white py-2 px-4 w-full mb-4 bg-blue-700 rounded hover:bg-blue-800"
             onClick={() => setMenuOption('ciclos')}
          >
            Ciclos
          </button>
          {/* <button
            className="text-white py-2 px-4 w-full bg-blue-700 rounded hover:bg-blue-800"
            onClick={() => setMenuOption('alunos')} 
          >
            Alunos
          </button> */}
        </div>

        {/* Main Content */}
        <div className="w-3/4 overflow-auto">
          {menuOption === 'ciclos' && (
            <div>
              <span className="flex items-center sombra-botao w-fit text-white text-2xl font-bold bg-azulHeaderAdmin px-4 py-2 rounded-br-md">Matérias <img src={subjects} alt='Subjects Icon' className='h-6 w-6 object-contain ml-2'></img></span>
              <div className="grid grid-cols-4 m-4 mt-8 gap-4">
                {materias.map((materia: any) => (
                  <button
                  key={materia.id}
                  className="flex flex-col items-center justify-end bg-azulBotao text-white p-4 rounded shadow text-center cursor-pointer hover:bg-azulHeaderAdmin hover:scale-105 transition-transform sombra-botao"
                  onClick={() => handleMateriaClick(materia)}
                >
                  <img src={"/"+materia.imagem_url} alt="" />
                  <span className='font-semibold text-md'>{materia.nome}</span>
                </button>
                ))}
              
              </div>
            </div>
          )}

          {menuOption === 'alunos' && (
            

            <div>
              <h2 className="text-white text-2xl font-bold mb-4">Alunos</h2>
              
              
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      <Modal open={modalLogoutOpen} onClose={() => setModalLogoutOpen(false)} className="flex items-center justify-center">
        <Box className="bg-slate-300 p-6 rounded-lg shadow-lg">
          <span className="text-xl font-bold mb-4">Deseja sair da sua conta?</span>
          <div className="flex justify-between mt-8">
            <Button variant="contained" color="primary" onClick={handleLogout}>
              Sim
            </Button>
            <Button variant="outlined" color="error" onClick={() => setModalLogoutOpen(false)}>
              Não
            </Button>
          </div>
        </Box>
      </Modal>

      
    </>
  );
};

export default AdminDashboard;
