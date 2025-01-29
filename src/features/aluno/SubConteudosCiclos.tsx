import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../../assets/coins.svg';
import logo from '../../assets/logo-no-bg.png';
import todo_white from '../../assets/todo_white.svg'
import todo_green from '../../assets/todo_green.svg'
import star_white from '../../assets/star_white.svg'
import star_yellow from '../../assets/star.svg'

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

interface Ciclo {
  id: number
  data_criacao: string
  data_atualizacao: string
  sub_conteudo_id: number
  video_url: string
  descricao: string
  nome: string
  objetivo: string
  requisitos: string
  ordem: number
  questoes: number
  ativo: boolean
  habilidadesabnt: string
}

const SubConteudosCiclos: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { materia, conteudo } = location.state || {}; // Recebe o ID da matéria
  const [subConteudos, setSubConteudos] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [cicloModal, setCicloModal] = useState(false)
  const [selectedCiclo, setSelectedCiclo] = useState<Ciclo | null>({
    id: 0,
  data_criacao: '',
  data_atualizacao: '',
  sub_conteudo_id: 0,
  video_url: '',
  descricao: '',
  nome: '',
  objetivo: '',
  requisitos: '',
  ordem: 0,
  questoes: 0,
  ativo: true,
  habilidadesabnt: ''
  });

  // Fetch data
  useEffect(() => {
    const fetchSubConteudos = async () => {
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_URL}/aluno/ciclos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ usuario_id: usuario.id, conteudo_id: conteudo.id }),
        });

        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }

        const data = await response.json();

        console.log(data)

        const subConteudosMap = new Map();

        data.forEach((item: any) => {
          const { sub_conteudo_id, sub_conteudo_nome, ...ciclo } = item;
    
          if (!subConteudosMap.has(sub_conteudo_id)) {
            subConteudosMap.set(sub_conteudo_id, {
              sub_conteudo_id,
              sub_conteudo_nome,
              ciclos: [],
            });
          }
    
          subConteudosMap.get(sub_conteudo_id).ciclos.push(ciclo);
        });
    
        const transformedData = Array.from(subConteudosMap.values());
    
        setSubConteudos(transformedData);

        console.log('teste')
        console.log(transformedData)

      } catch (error) {
        console.error('Erro ao buscar sub-conteúdos:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchSubConteudos();
  }, [conteudo]);


  // Função para abrir o modal
  const handleOpenModal = (ciclo:Ciclo) => {
    setSelectedCiclo(ciclo);  // Armazena o ciclo selecionado
    setCicloModal(true);  // Abre o modal
  };

  // Função para fechar o modal
  const handleCloseModal = () => {
    setCicloModal(false);
    setSelectedCiclo(null); // Limpa a seleção do ciclo
  };

  // Toggle dropdown
  const toggleSection = (id: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Handle ciclo click
  const handleCicloClick = (ciclo: Ciclo | null) => {

    navigate('/aluno/ciclo', { state : { ciclo }})
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

  // Adicionar Favorito e Todo
  const handleTodoBotao = async (cicloId: number, sub_conteudo_id: number, todo: boolean) => {
    const token = localStorage.getItem('token');

    console.log('todo: ',todo)

    try {
      if (todo) {
        const response = await fetch(`${API_URL}/aluno/todo`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ usuario_id: usuario.id, cicloId }),
        });
  
        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }
      }else {
        const response = await fetch(`${API_URL}/aluno/todo`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ usuario_id: usuario.id, cicloId }),
        });
  
        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }
      }
      

      const novosSubConteudos = subConteudos.map(subConteudo => {
        // Verifica se o sub_conteudo_id é igual a 2
        if (subConteudo.sub_conteudo_id === sub_conteudo_id) {
            // Cria uma cópia do array ciclos com a modificação
            const novosCiclos = subConteudo.ciclos.map((ciclo: any) => {
                if (ciclo.id === cicloId) {
                    return { ...ciclo, todo: todo }; // Modifica o todo para true
                }
                return ciclo; // Mantém os outros ciclos inalterados
            });
            // Retorna o subConteudo com os ciclos atualizados
            return { ...subConteudo, ciclos: novosCiclos };
        }
        return subConteudo; 
    });

    // Atualiza o estado com a nova cópia
    setSubConteudos(novosSubConteudos);

    console.log(subConteudos)
      
    } catch (error) {
      console.error(error)
    }
  }

  const handleFavoritoBotao = async (cicloId: number, sub_conteudo_id: number, favoritos: boolean) => {
    const token = localStorage.getItem('token');

    try {
      if (favoritos) {
        const response = await fetch(`${API_URL}/aluno/favorito`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ usuario_id: usuario.id, cicloId }),
        });
  
        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }
      }else {
        const response = await fetch(`${API_URL}/aluno/favorito`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ usuario_id: usuario.id, cicloId }),
        });
  
        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }
      }

      const novosSubConteudos = subConteudos.map(subConteudo => {
        // Verifica se o sub_conteudo_id é igual a 2
        if (subConteudo.sub_conteudo_id === sub_conteudo_id) {
            // Cria uma cópia do array ciclos com a modificação
            const novosCiclos = subConteudo.ciclos.map((ciclo: any) => {
                if (ciclo.id === cicloId) {
                    return { ...ciclo, favoritos: favoritos }; // Modifica o todo para true
                }
                return ciclo; // Mantém os outros ciclos inalterados
            });
            // Retorna o subConteudo com os ciclos atualizados
            return { ...subConteudo, ciclos: novosCiclos };
        }
        return subConteudo; 
    });

    // Atualiza o estado com a nova cópia
    setSubConteudos(novosSubConteudos);

    console.log(subConteudos)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="logo falco" className="w-16 cursor-pointer" onClick={ () => { navigate('/aluno')} } />
          <h1 className="text-2xl font-bold">Olá, {nomeUsuario}!</h1>
        </div>
        <div className="flex items-center space-x-4">
          {usuario.perfil_id === 1 && false && (
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
          onClick={() => navigate('/aluno/conteudos', { state: { materia } })}
          className="text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2"
        >
          ← voltar
        </button>

        <h2 className="text-white text-2xl font-bold mb-4">Sub-conteúdos de {conteudo.nome}</h2>

        {subConteudos.map((subConteudo) => (
          <div key={subConteudo.sub_conteudo_id} className="mb-4">
            <div
              className="flex flex-row bg-white p-4 rounded shadow cursor-pointer"
              onClick={() => toggleSection(subConteudo.sub_conteudo_id)}
            >
              <h3 className="text-xl font-bold">{subConteudo.sub_conteudo_nome}</h3>
            </div>

            {expandedSections[subConteudo.sub_conteudo_id] && (
              <ul className="ml-4 mt-2">
              {subConteudo.ciclos.map((ciclo: any, index: number) => (
                <li key={ciclo.id} className="flex justify-between bg-azulFalcao p-2 rounded mb-2 shadow">
                  <div
                    className='cursor-pointer'
                    onClick={() => handleOpenModal(ciclo)}
                  >
                    {`Ciclo ${index + 1} - ${ciclo.nome}`}
                  </div>
                  <div className='flex gap-4'>
                    <img onClick={() => handleTodoBotao(ciclo.id, subConteudo.sub_conteudo_id, ciclo.todo ? false : true )} src={ciclo.todo ? todo_green : todo_white} alt="todo icon white" className='w-6 cursor-pointer'/>
                    <img onClick={() => handleFavoritoBotao(ciclo.id, subConteudo.sub_conteudo_id, ciclo.favoritos ? false : true )} src={ciclo.favoritos ? star_yellow : star_white} alt="star icon white" className='w-6 cursor-pointer'/>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </div>
        ))}

        {/* Modal para mostrar detalhes do ciclo */}
      <Modal
        open={cicloModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="flex items-center justify-center"
      >
        <div className="modal-container bg-white p-6 rounded-lg shadow-lg">
          <h2 id="modal-title">Detalhes do Ciclo</h2>
          <div className="modal-content">
            <p><strong>Título:</strong> {selectedCiclo?.nome}</p>
            <p><strong>Descrição:</strong> {selectedCiclo?.descricao}</p>
            <p><strong>Objetivo:</strong> {selectedCiclo?.objetivo}</p>
            <p><strong>Requisitos:</strong> {selectedCiclo?.requisitos}</p>
            <p><strong>Habilidaes ABNT:</strong> {selectedCiclo?.habilidadesabnt}</p>
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleCicloClick(selectedCiclo)} // Chama a função ao clicar
          >
            Confirmar Ciclo
          </Button>
        </div>
      </Modal>
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
