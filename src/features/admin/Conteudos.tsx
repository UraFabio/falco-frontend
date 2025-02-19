import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';
import edit_white from '../../assets/edit_white.svg';
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
  const [novoConteudo, setNovoConteudo] = useState('');
  const [modalConteudoOpen, setModalConteudoOpen] = useState(false);
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [editConteudo, setEditConteudo] = useState(-1);

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

  const handleCloseSnackBar = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };


  // Fetch data
  useEffect(() => {
    //if (!materiaId) return;

    const fetchConteudos = async () => {
      const token = localStorage.getItem('token');

      console.log(materia)

      try {
        const response = await fetch(`${API_URL}/admin/conteudos`, {
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
        localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
        navigate('/login');
      }
    };

    fetchConteudos();
  }, [materia]);

  useEffect(() => {
    setErrorMessage('')
  }, [modalConteudoOpen])

  console.log('conteudos: ', conteudos)

  const handleCreateConteudo = async () => {
    const token = localStorage.getItem('token');
    try {

      if (novoConteudo.length <= 1) {
        throw new Error('Nome do conteúdo inválido.')
      }

      if (editConteudo > -1){
        const response = await fetch(`${API_URL}/admin/conteudos`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ id: editConteudo, nome: novoConteudo }),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao atualizar conteudo');
        }
  
        const resp =  await response.json();
        const conteudoAtualizado = resp.dados
  
        console.log(conteudoAtualizado)
        setConteudos(conteudos.map(conteudo => 
          conteudo.id === conteudoAtualizado.id 
            ? { ...conteudo, nome: conteudoAtualizado.nome } 
            : conteudo
        ));

        
      } else {
        const response = await fetch(`${API_URL}/admin/conteudo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ materia_id: materia.id, nome: novoConteudo }),
        });
  
        if (!response.ok) {
          throw new Error('Erro ao criar conteudo');
        }
  
        const novoConteudoCriado = await response.json();
  
        console.log(novoConteudoCriado)
        setConteudos([...conteudos, novoConteudoCriado.conteudo]);
      }
      
      setNovoConteudo('');
      setModalConteudoOpen(false);
      setOpenSnackBar(true)
    } catch (error:any) {
      console.error('Erro ao criar conteúdo:', error);
      setErrorMessage(error.message)
    }
  };

  const handleConteudoClick = (conteudo: {}) => {
    navigate('/admin/sub-conteudos', { state: { materia, conteudo } });
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
          <img src={logo} alt="logo falco" className="w-16 cursor-pointer" onClick={() => { navigate('/admin')}} />
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
          Conteúdo criado com sucesso!
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
      <button onClick={() => navigate('/admin')} className='text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2'>← voltar</button>
      <h2 className="text-white text-2xl font-bold mb-4">Conteúdos de {materia.nome}</h2>
      <div className="grid grid-cols-4 gap-4">
        <div
          className="bg-blue-500 text-white p-4 rounded shadow flex items-center justify-center cursor-pointer"
          onClick={() => setModalConteudoOpen(true)}
        >
          <span className="text-2xl font-bold">+</span>
        </div>
        {conteudos.map((conteudo) => (
          <button
          key={conteudo.id}
          className="bg-white p-4 relative rounded shadow text-center cursor-pointer hover:bg-gray-100"
          onClick={() => handleConteudoClick(conteudo)}
          >
            <div 
            className='absolute -top-1 -right-1 bg-azulFalcao z-20 p-1 w-7 rounded-md hover'
            onClick={(event) => {
              event.stopPropagation(); // Impede que o evento suba para o botão
              setNovoConteudo(conteudo.nome);
              setEditConteudo(conteudo.id); 
              setModalConteudoOpen(true);
            }}
            >
              <img src={edit_white} alt="edit logo" />
            </div>

            <span >{conteudo.nome}</span>
          </button>
        ))}
        
      </div>

      {/* Create Conteúdo Modal */}
      <Modal open={modalConteudoOpen} 
        onClose={() => {setModalConteudoOpen(false);
          setNovoConteudo('');
              setEditConteudo(-1); 
        }} 
        className='flex items-center justify-center'
      >
        <Box className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">{editConteudo > 0 ? "Editar Conteúdo" : "Criar Novo Conteúdo"}</h2>
          <input
            type="text"
            placeholder="Nome do Conteúdo"
            value={novoConteudo}
            onChange={(e) => setNovoConteudo(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <div className="flex justify-end">
            <Button variant="contained" color="primary" onClick={handleCreateConteudo}>
            {editConteudo > 0 ? "Atualizar" : "Criar"}
            </Button>
            <Button variant="outlined" color="secondary" 
              onClick={() => {
              setModalConteudoOpen(false);
              setNovoConteudo('');
              setEditConteudo(-1); 
            }}>
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

export default Conteudos;
