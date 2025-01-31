import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';
import arrow_blue from '../../assets/arrow_blue_right.svg';
import edit from '../../assets/edit.svg';

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

const SubConteudosCiclos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { materia, conteudo } = location.state || {}; // Recebe o ID da matéria
  const [subConteudos, setSubConteudos] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [ciclosBySubConteudo, setCiclosBySubConteudo] = useState<{ [key: number]: any[] }>({});
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchSubConteudos = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_URL}/instrutor/sub-conteudos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ conteudo_id: conteudo.id }),
        });

        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }

        const data = await response.json();

        setSubConteudos(data);
        console.log(data)

      } catch (error) {
        console.error('Erro ao buscar sub-conteúdos:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchSubConteudos();
  }, [conteudo]);

  console.log(subConteudos)


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
        const response = await fetch(`${API_URL}/instrutor/ciclos`, {
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

  const handleSubConteudoClick = async (subConteudo: {}) => {
    navigate('/instrutor/ciclos/novo', { state: { materia, conteudo, subConteudo } });
  }

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
          <button className="text-white border border-white px-3 py-1 rounded" onClick={() => setModalLogoutOpen(true)}>
            Logout
          </button>
        </div>
      </header>

      <div className="p-6 h-[calc(100vh-10rem)] min-w-full bg-azulBgAdmin bg-opacity-80 overflow-auto">
        <button
          onClick={() => navigate('/instrutor/conteudos', { state: { materia } })}
          className="text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2"
        >
          ← voltar
        </button>

        <h2 className="text-white text-2xl font-bold mb-4">Sub-conteúdos de {conteudo.nome}</h2>

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
              
              <button
                className="bg-azulFalcao ml-2 p-2 rounded shadow text-center cursor-pointer hover:bg-gray-100"
                onClick={() => handleSubConteudoClick(subConteudo)}
              >
                +
              </button>
            </div>

            {expandedSections[subConteudo.id] && (
              <ul className="ml-4 mt-2">
                {(ciclosBySubConteudo[subConteudo.id] || []).map((ciclo: any, index: number) => (
                  <li key={ciclo.id} className="flex flex-row justify-between bg-gray-100 p-2 rounded mb-2 shadow">
                    <div>
                      {`Ciclo ${index + 1} - ${ciclo.nome}`}
                    </div>
                    <img onClick={() => navigate('/instrutor/ciclos/novo', { state: {materia, conteudo, ciclo } } )}  src={edit} className='w-5 cursor-pointer'></img>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
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

export default SubConteudosCiclos;
