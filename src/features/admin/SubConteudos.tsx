import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';
import arrow_blue from '../../assets/arrow_blue_right.svg';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

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

const SubConteudos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { materia, conteudo } = location.state || {}; // Recebe o ID da matéria
  const [subConteudos, setSubConteudos] = useState<any[]>([]);
  const [novoSubConteudo, setNovoSubConteudo] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [ciclosBySubConteudo, setCiclosBySubConteudo] = useState<{ [key: number]: any[] }>({});
  const [modalSubConteudoOpen, setModalSubConteudoOpen] = useState(false);
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  
  
  
  // Fetch data
  useEffect(() => {
    if (!conteudo) return;
    
    const fetchSubConteudos = async () => {
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`${API_URL}/admin/subConteudos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ conteudo_id: conteudo.id}),
        });
        if(!response.ok) {
          throw new Error('Erro de autenticação');
        }
        
        const data = await response.json();

        setSubConteudos(data);
        console.log(data)

      } catch (error) {
        console.error('Erro ao buscar sub-conteúdos:', error);
        localStorage.clear()
        navigate('/login');
      }
    };
    
    fetchSubConteudos();
  }, [conteudo]);
  
  useEffect(() => {
    setErrorMessage('');
  }, [modalSubConteudoOpen])
  
  // Toggle dropdown
  const toggleSection = async (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));

    // If the section is being expanded and ciclos are not already loaded
    if (!expandedSections[id] && !ciclosBySubConteudo[id]) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/ciclos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ sub_conteudo_id: id }),
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar ciclos');
        }

        const data = await response.json();
        setCiclosBySubConteudo((prev) => ({
          ...prev,
          [id]: data, // Add the ciclos for the expanded sub_conteúdo
        }));
      } catch (error) {
        console.error(`Erro ao buscar ciclos para sub-conteúdo ${id}:`, error);
      }
    }
  };

  const handleCloseSnackBar = (_?: React.SyntheticEvent | Event,reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };


  const handleCreateSubConteudo = async () => {
    try {

      if (novoSubConteudo.length <= 1) {
        throw new Error('Nome do sub-conteúdo inválido.')
      }

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/admin/subConteudo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ conteudo_id: conteudo.id, nome: novoSubConteudo }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar sub-conteudo');
      }

      const novoSubConteudoCriado = await response.json();

      console.log(novoSubConteudoCriado)
      setSubConteudos([...subConteudos, novoSubConteudoCriado.subConteudo]);
      setNovoSubConteudo('');
      setModalSubConteudoOpen(false);
      setOpenSnackBar(true)
    } catch (error:any) {
      console.error('Erro ao criar sub-conteúdo:', error);
      setErrorMessage(error.message)
    }
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
          <img src={logo} alt="logo falco" className="w-16 cursor-pointer" onClick={ () => { navigate('/admin')}} />
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

      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackBar} severity="success" sx={{ width: "100%" }}>
          Sub-conteúdo criado com sucesso!
        </Alert>
      </Snackbar>

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

      <div className="p-6 h-[calc(100vh-10rem)] min-w-full bg-azulBgAdmin bg-opacity-80">
        <button
          onClick={() => navigate('/admin/conteudos', { state: { materia } })}
          className="text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2"
        >
          ← voltar
        </button> <br/>
        
        <div className='flex flex-row items-center'>
          <span className="text-white text-2xl font-bold">Sub-conteúdos de { conteudo.nome }</span>
          
          <div
            className="bg-blue-500 w-14 ml-4 text-white p-2 rounded shadow flex items-center justify-center cursor-pointer hover:scale-105 transition-all"
            onClick={() => setModalSubConteudoOpen(true)}
          >
            <span className="text-2xl font-bold">+</span>
          </div>
        </div>
        
        {subConteudos.map((subConteudo) => (
          <div key={subConteudo.id} className="px-4 mt-4 w-full">
            <div
              className="flex flex-row bg-slate-300 p-4 rounded shadow mb-1 cursor-pointer w-2/4"
              onClick={() => toggleSection(subConteudo.id)}
            >
              <h3 className="text-xl font-bold flex items-center">
                <img
                  src={arrow_blue}
                  alt='seta azul'
                  className={`h-5 inline-block transform transition-transform duration-300 ${
                    expandedSections[subConteudo.id] ? 'rotate-90' : 'rotate-0'
                  }`}
                />
                <span className="ml-2">{subConteudo.nome}</span>
              </h3>
            </div>

            {expandedSections[subConteudo.id] && (
              <ul className="ml-4 mt-2">
                {(ciclosBySubConteudo[subConteudo.id] || []).map((ciclo: any, _: number) => (
                  <li key={ciclo.id} className="flex flex-row justify-between bg-gray-100 p-2 rounded mb-2 shadow">
                    <div>
                      {`${ciclo.nome}`}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {/* Create Sub-Conteúdo Modal */}
        <Modal open={modalSubConteudoOpen} onClose={() => setModalSubConteudoOpen(false)} className='flex items-center justify-center'>
          <Box className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Criar Novo Sub-Conteúdo</h2>
            <input
              type="text"
              placeholder="Nome do Conteúdo"
              value={novoSubConteudo}
              onChange={(e) => setNovoSubConteudo(e.target.value)}
              className="border p-2 w-full mb-4 rounded"
            />
            <div className="flex justify-end">
              <Button variant="contained" color="primary" onClick={handleCreateSubConteudo}>
                Criar
              </Button>
              <Button variant="outlined" color="secondary" onClick={() => setModalSubConteudoOpen(false)}>
                Cancelar
              </Button>
            </div>
            { errorMessage && 
            <span className='text-red-500 mt-4'>{errorMessage}</span>
          }
          </Box>
        </Modal>
      </div>
    </>
  )
};

export default SubConteudos;
