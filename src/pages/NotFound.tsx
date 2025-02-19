import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import do hook useNavigate
import logo from '../assets/logo-no-bg.png';

const NotFound: React.FC = () => {
  
  const navigate = useNavigate(); // Inicializa o hook para redirecionamento

  const handleVoltar = () => {
    localStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('token_exp');
    navigate('/login')
  }
  
  return (
    <div className='h-[calc(100vh-10rem)] flex flex-col justify-center items-center '>
      <div className='flex flex-col w-min p-5 text-white bg-opacity-30 bg-gray-900 justify-center items-center rounded-3xl'>
        <img src={logo} alt="logo-falcao" className='w-48'/>
        <span className='text-2xl text-nowrap my-4'>Opa, parece que você se perdeu</span>
        <button className='bg-azulFalcaoSecundario px-8 py-2 rounded-md' onClick={() => handleVoltar()}>
          Voltar
        </button>
      </div>
    </div>
  );
};

export default NotFound;
