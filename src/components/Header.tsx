import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../assets/coins.svg';
import logo from '../assets/logo-no-bg.png';

const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const nomeUsuario = 'João Silva'; // Exemplo: Pegue isso de um estado global ou do backend
  const falcoins = 100; // Exemplo: Pegue isso de um estado global ou do backend

  const handleLogout = () => {
    localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');; // Remove o token e outros dados
    navigate('/login'); // Redireciona para a página de login
  };

  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);

  return (
    <>
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="logo falco" className="w-16" />
          <h1 className="text-2xl font-bold text-shadow">Olá, {nomeUsuario}!</h1>
        </div>
        <div className="flex items-center space-x-4">
          <img src={coins} alt="fal-coins" />
          <span>Fal-coins: {falcoins}</span>
          <Button variant="outlined" color="inherit" onClick={handleOpenModal}>
            Logout
          </Button>
        </div>
      </header>

      {/* Modal de Confirmação */}
      <Modal
        open={open}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="flex items-center justify-center"
      >
        <Box
          className="bg-white p-6 rounded-lg shadow-lg"
          style={{
            width: '300px',
            textAlign: 'center',
          }}
        >
          <h2 id="modal-title" className="text-xl font-bold mb-4">
            Deseja sair?
          </h2>
          <div className="flex justify-between mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              className="mr-2"
            >
              Sim
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCloseModal}
            >
              Não
            </Button>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default Header;
