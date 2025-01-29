import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';
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
  const { materia, conteudo } = location.state || {}; // Recebe o ID da matéria
  const [sub_conteudos, setSubConteudos] = useState<any[]>([]);
  const [novoSubConteudo, setNovoSubConteudo] = useState('');
  const [modalSubConteudoOpen, setModalSubConteudoOpen] = useState(false);
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  
  const handleCloseSnackBar = (reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  const navigate = useNavigate();

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

  console.log('subconteudos: ', sub_conteudos)

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
      setSubConteudos([...sub_conteudos, novoSubConteudoCriado.subConteudo]);
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
        onClose={() => handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => handleCloseSnackBar} severity="success" sx={{ width: "100%" }}>
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
        <button onClick={() => navigate('/admin/conteudos', { state: { materia } })} className='text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2'>← voltar</button>
        <h2 className="text-white text-2xl font-bold mb-4">Sub-conteúdos de { conteudo.nome }</h2>
        <div className="grid grid-cols-4 gap-4">
          {sub_conteudos.map((sub_conteudo) => (
            <div
            key={sub_conteudo.id}
            className="bg-white p-4 rounded shadow text-center "
          >
            {sub_conteudo.nome}
          </div>
          ))}
          <div
            className="bg-blue-500 text-white p-4 rounded shadow flex items-center justify-center cursor-pointer"
            onClick={() => setModalSubConteudoOpen(true)}
          >
            <span className="text-2xl font-bold">+</span>
          </div>
        </div>

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
