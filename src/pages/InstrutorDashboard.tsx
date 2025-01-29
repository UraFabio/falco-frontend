import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../assets/coins.svg';
import logo from '../assets/logo-no-bg.png';

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

  // Fetch data
  useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem('token');
      
        try {
          const [materiasRes] = await Promise.all([
            fetch('http://192.168.1.211:3000/api/instrutor/materias', {
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
          localStorage.clear()
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
    localStorage.clear();
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
        <div className="w-3/4 p-6 overflow-auto">
          {menuOption === 'ciclos' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-4">Matérias</h2>
              <div className="grid grid-cols-4 gap-4">
                {materias.map((materia: any) => (
                  <button
                  key={materia.id}
                  className="flex flex-col items-center justify-end font-semibold text-md bg-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-100"
                  onClick={() => handleMateriaClick(materia)}
                >
                  <img src={"../../public/"+materia.imagem_url} alt="icone materia" />
                  {materia.nome}
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
