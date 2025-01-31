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
        const response = await fetch(`${API_URL}/aluno/conteudos`, {
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
    navigate('/aluno/ciclos', { state: { materia, conteudo } });
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
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex sombra-preta justify-between items-center rounded-t-md">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="logo falco" className="w-16 cursor-pointer" onClick={ () => { navigate('/aluno')} } />
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

      <div className="flex flex-col p-6 h-[calc(100vh-10rem)] min-w-full bg-azulBgAluno bg-opacity-60 rounded-b-lg shadow-inner shadow-slate-800">
        <button onClick={() => navigate('/aluno')} className='text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2 border w-fit text-nowrap border-black border-1'>◁ Tela de início</button>
        <div className='m-4 rounded-lg overflow-auto bg-black bg-opacity-20'>
          <span className="flex items-center sombra-botao w-fit text-white text-2xl font-bold bg-azulHeaderAdmin px-4 py-2 rounded-br-md">Conteúdos de {materia.nome} <img src={"/" + materia.imagem_url} alt='' className='w-10 object-contain ml-4'></img></span>
          <div className="grid grid-cols-4 m-4 mt-8 gap-4">
            {conteudos.map((conteudo) => (
              <button
              key={conteudo.id}
              className="flex flex-col items-center justify-end bg-azulBotao text-white p-4 rounded shadow text-center cursor-pointer hover:bg-azulHeaderAdmin hover:scale-105 transition-transform sombra-botao"
              onClick={() => handleConteudoClick(conteudo)}
              >
              {conteudo.nome}
            </button>
            ))}
          </div>
        </div>

     
      </div>
    </>
  )
};

export default Conteudos;
