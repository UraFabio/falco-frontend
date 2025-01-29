import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';

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

const Conteudos: React.FC = () => {

  const location = useLocation();
  const { materia } = location.state || {}; // Recebe o ID da matéria
  const [conteudos, setConteudos] = useState<any[]>([]);
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    //if (!materiaId) return;

    const fetchConteudos = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_URL}/instrutor/conteudos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ materia_id: materia.id}),
        });
        if(!response.ok) {
          throw new Error('Erro de autenticação');
        }

        const data = await response.json();
        setConteudos(data);
      } catch (error) {
        console.error('Erro ao buscar conteúdos:', error);
        localStorage.clear()
        navigate('/login');
      }
    };

    fetchConteudos();
  }, [materia]);

  console.log('conteudos: ', conteudos)

  const handleConteudoClick = (conteudo: {}) => {
    navigate('/instrutor/ciclos', { state: { materia, conteudo } });
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
          <img src={logo} alt="logo falco" className="w-16 cursor-pointer" onClick={ () => { navigate('/instrutor') }} />
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
    
        {/* Conteudos */}
      <div className="p-6 h-[calc(100vh-10rem)] min-w-full bg-azulBgAdmin bg-opacity-80 overflow-auto">
        <button onClick={() => navigate('/instrutor')} className='text-white bg-azulFalcaoSecundario px-2 cursor-pointer rounded-md mb-2'>← voltar</button>
        <h2 className="text-white text-2xl font-bold mb-4">Conteúdos de {materia.nome}</h2>
        <div className="grid grid-cols-4 gap-4">
          {conteudos.map((conteudo) => (
            <button
            key={conteudo.id}
            className="bg-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-100"
            onClick={() => handleConteudoClick(conteudo)}
          >
            {conteudo.nome}
          </button>
          ))}
        </div>

      
      </div>
    </>
  )
};

export default Conteudos;
