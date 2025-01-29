import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../assets/coins.svg';
import logo from '../assets/logo-no-bg.png';
import star from '../assets/star.svg';
import todo from '../assets/todo_green.svg'
import subjects from '../assets/subjects_purple.svg'
import arrow_blue from '../assets/arrow_blue_right.svg'
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

const AlunoDashboard: React.FC = () => {
  const [menuOption, setMenuOption] = useState('inicio');
  //const [ciclosTodo, setCiclosTodos] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  //const [ciclosFavoritos, setCiclosFavoritos] = useState<any[]>([])
  const [subConteudosTodo, setSubConteudosTodo] = useState<any[]>([]);
  const [subConteudosFavoritos, setSubConteudosFavoritos] = useState<any[]>([]);
  const [expandedSectionsTodo, setExpandedSectionsTodo] = useState<{ [key: number]: boolean }>({});
  const [expandedSectionsFavoritos, setExpandedSectionsFavoritos] = useState<{ [key: number]: boolean }>({});
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
    

  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch data
  useEffect(() => {
    const fetchTodo = async () => {

      try {
        const ciclosTodo = await fetch(`${API_URL}/aluno/todos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`  },
          body: JSON.stringify({ aluno_id: usuario.id }),
        });
  
        if (!ciclosTodo.ok) {
          throw new Error('Erro de autenticação');
        }
  
        const ciclosTodoData = await ciclosTodo.json();
        console.log(ciclosTodoData);
  
        const subConteudosMap = new Map()
  
        ciclosTodoData.forEach((item: any) => {
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
  
        setSubConteudosTodo(transformedData);
  
        console.log(transformedData)
  
        //setCiclosTodos(ciclosTodoData);
      } catch (error) {
        console.error('Erro ao buscar ciclos do to-do', error);
        localStorage.clear();
        navigate('/login');
      }
      
    }

    fetchTodo()
  }, []);

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


  const handleMateriaClick = (materia: {}) => {
    navigate('/aluno/conteudos', { state: { materia } });
  };

  const handleCicloClick = (ciclo: Ciclo | null) => {
    navigate('/aluno/ciclo', { state: { ciclo }})
  }

  // Fazer a requisição de cada opção do menu
  const fetchMenuOption = async (menuOption: string) => {
    try {
      switch(menuOption){
        case 'inicio':
          const ciclosTodo = await fetch(`${API_URL}/aluno/todos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`  },
            body: JSON.stringify({ aluno_id: usuario.id }),
          });
    
          if (!ciclosTodo.ok) {
            throw new Error('Erro de autenticação');
          }
    
          const ciclosTodoData = await ciclosTodo.json();
          console.log(ciclosTodoData);
    
          const subConteudosMap = new Map()
    
          ciclosTodoData.forEach((item: any) => {
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
    
          setSubConteudosTodo(transformedData);
    
          console.log(transformedData)
    
          //setCiclosTodos(ciclosTodoData);
  
          break
        case 'materias':
          const materias = await fetch(`${API_URL}/aluno/materias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ aluno_id: usuario.id }),
          });
  
          if (!materias.ok) {
            throw new Error('Erro de autenticação');
          }

          const materiasData = await materias.json();

          setMaterias(materiasData);

          console.log(materiasData)
  
          break
        case 'favoritos':
          const favoritos = await fetch(`${API_URL}/aluno/favoritos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ aluno_id: usuario.id }),
          });
  
          if (!favoritos.ok) {
            throw new Error('Erro de autenticação');
          }

          const favoritosData = await favoritos.json();
          console.log(favoritosData)

          const subConteudosFavoritosMap = new Map()
    
          favoritosData.forEach((item: any) => {
            const { sub_conteudo_id, sub_conteudo_nome, ...ciclo } = item;
      
            if (!subConteudosFavoritosMap.has(sub_conteudo_id)) {
              subConteudosFavoritosMap.set(sub_conteudo_id, {
                sub_conteudo_id,
                sub_conteudo_nome,
                ciclos: [],
              });
            }
      
            subConteudosFavoritosMap.get(sub_conteudo_id).ciclos.push(ciclo);
          });

          const transformedFavoritosData = Array.from(subConteudosFavoritosMap.values());

          setSubConteudosFavoritos(transformedFavoritosData)

          //setCiclosFavoritos(favoritosData)

          console.log(transformedFavoritosData)
  
          break
      }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // localStorage.clear()
        //navigate('/login');
    }
    
    console.log(menuOption)
    setMenuOption(menuOption);
  }

   // Toggle dropdown
   const toggleSectionTodo = (id: number) => {
    setExpandedSectionsTodo((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSectionFavoritos = (id: number) => {
    setExpandedSectionsFavoritos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex justify-between items-center sombra-preta rounded-t-md">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="logo falco" className="w-16" />
          <h1 className="text-2xl font-bold">Olá, {nomeUsuario}!</h1>
        </div>
        <div className="flex items-center space-x-4">
          {usuario.perfil_id === 1 && false && (
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

      <div className="flex h-[calc(100vh-10rem)] min-w-full bg-azulBgAluno bg-opacity-60 rounded-b-lg shadow-inner shadow-md shadow-slate-800">
        {/* Sidebar */}
        <div className="text-lg w-1/4 bg-azulAluno flex flex-col items-center p-4">
          <button
            className={`flex items-center justify-center text-white py-6 px-4 w-full mb-4 ${menuOption === 'inicio' ? 'bg-azulHeaderAdmin scale-90 rounded-2xl border-2 border-black border-opacity-50' : 'bg-azulBotao rounded sombra-botao'}  hover:bg-azulHeaderAdmin   transition-all duration-300 ease-in-out`}
             onClick={() => fetchMenuOption('inicio')}
          >
            Início
            <img src={todo} alt='Star Icon' className='h-6 w-6 object-contain ml-2'></img>
          </button>
          <button
            className={`flex items-center justify-center text-white py-6 px-4 w-full mb-4 ${menuOption === 'materias' ? 'bg-azulHeaderAdmin scale-90 rounded-2xl border-2 border-black border-opacity-50' : 'bg-azulBotao rounded sombra-botao'}  hover:bg-azulHeaderAdmin  transition-all duration-300 ease-in-out`}
            onClick={() => fetchMenuOption('materias')}
          >
            Matérias
            <img src={subjects} alt='Subjects Icon' className='h-6 w-6 object-contain ml-2'></img>
          </button>
          <button
            className={`flex items-center justify-center text-white py-6 px-4 w-full ${menuOption === 'favoritos' ? 'bg-azulHeaderAdmin scale-90 rounded-2xl border-2 border-black border-opacity-50' : 'bg-azulBotao rounded sombra-botao'}  hover:bg-azulHeaderAdmin  transition-all duration-300 ease-in-out`}
            onClick={() => fetchMenuOption('favoritos')}
          >
            Favoritos
            <img src={star} alt='Star Icon' className='h-6 w-6 object-contain ml-2'></img>
          </button>
        </div>

        {/* Main Content */}
        <div className="w-3/4 m-4 mr-10 mb-10 rounded-lg overflow-auto bg-black bg-opacity-20 ">
          {menuOption === 'inicio' && (
            <>
              <span className="flex items-center sombra-botao w-fit text-white text-2xl font-bold bg-azulHeaderAdmin px-4 py-2 rounded-br-md">To-do <img src={todo} alt='Todo Icon' className='h-6 w-6 object-contain ml-2'></img></span>
            
              {subConteudosTodo.map((subConteudo) => (
                <div key={subConteudo.sub_conteudo_id} className="px-4 mt-4 w-full">
                  <div
                    className="flex flex-row bg-slate-300 p-4 rounded mb-1 shadow cursor-pointer w-2/4"
                    onClick={() => toggleSectionTodo(subConteudo.sub_conteudo_id)}
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <img
                        src={arrow_blue}
                        alt='seta azul'
                        className={`h-5 inline-block transform transition-transform duration-300 ${
                          expandedSectionsTodo[subConteudo.sub_conteudo_id] ? 'rotate-90' : 'rotate-0'
                        }`}
                      />
                      <span className="ml-2">{subConteudo.sub_conteudo_nome}</span>
                    </h3>
                  </div>
      
                  {expandedSectionsTodo[subConteudo.sub_conteudo_id] && (
                    <ul className="ml-4 mt-2">
                    {subConteudo.ciclos.map((ciclo: any) => (
                      <li key={ciclo.id} className="flex justify-between bg-azulFalcao p-2 rounded mb-2 shadow">
                        <div
                          className='cursor-pointer font-semibold'
                          onClick={() => handleOpenModal(ciclo)}
                        >
                          {ciclo.nome}
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </div>
              ))}
            </>
          )}

          {menuOption === 'materias' && (
            <div>
              <span className="flex items-center sombra-botao w-fit text-white text-2xl font-bold bg-azulHeaderAdmin px-4 py-2 rounded-br-md">Matérias <img src={subjects} alt='Subjects Icon' className='h-6 w-6 object-contain ml-2'></img></span>
              <div className="grid grid-cols-4 m-4 mt-8 gap-4">
                {materias.map((materia: any) => (
                  <button
                  key={materia.id}
                  className="flex flex-col items-center justify-end bg-azulBotao text-white p-4 rounded shadow text-center cursor-pointer hover:bg-azulHeaderAdmin hover:scale-105 transition-transform sombra-botao"
                  onClick={() => handleMateriaClick(materia)}
                >
                  <img src={"/"+materia.imagem_url} alt="" />
                  <span className='font-semibold text-md'>{materia.nome}</span>
                </button>
                ))}
                
              </div>
            </div>
          )}

          {menuOption === 'favoritos' && (
            <>
                <span className="flex items-center sombra-botao text-white text-2xl font-bold bg-azulHeaderAdmin px-4 py-2 rounded-br-md w-fit">Favoritos <img src={star} alt='Star Icon' className='h-6 w-6 object-contain ml-2'></img></span>
                
                {subConteudosFavoritos.map((subConteudo) => (
                <div key={subConteudo.sub_conteudo_id} className="px-4 mt-4 w-full">
                  <div
                    className="flex flex-row bg-slate-300 p-4 rounded shadow mb-1 cursor-pointer w-2/4"
                    onClick={() => toggleSectionFavoritos(subConteudo.sub_conteudo_id)}
                  >
                    <h3 className="text-xl font-bold flex items-center">
                      <img
                        src={arrow_blue}
                        alt='seta azul'
                        className={`h-5 inline-block transform transition-transform duration-300 ${
                          expandedSectionsFavoritos[subConteudo.sub_conteudo_id] ? 'rotate-90' : 'rotate-0'
                        }`}
                      />
                      <span className="ml-2">{subConteudo.sub_conteudo_nome}</span>
                    </h3>
                  </div>
      
                  {expandedSectionsFavoritos[subConteudo.sub_conteudo_id] && (
                    <ul className="ml-4 mt-2">
                    {subConteudo.ciclos.map((ciclo: any) => (
                      <li key={ciclo.id} className="flex justify-between bg-azulFalcao p-2 rounded mb-2 shadow">
                        <div
                          className='cursor-pointer font-semibold'
                          onClick={() => handleOpenModal(ciclo)}
                        >
                          {`${ciclo.nome}`}
                        </div>
                        <div className='flex gap-4'>
                          
                        </div>
                      </li>
                    ))}
                  </ul>
                  )}
                </div>
              ))}
  
            </>
          )}

          
        </div>
      </div>

      {/* Modal para mostrar detalhes do ciclo */}
      <Modal
        open={cicloModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        className="flex w-2/3 items-center justify-center m-auto"
      >
        <div className="modal-container bg-slate-300 p-6 rounded-lg shadow-lg">
          <div className='flex flex-col items-center m-auto'>
            <h2 id="modal-title" className='text-2xl'><strong>{selectedCiclo?.nome}</strong></h2>
            <button
              className='flex justify-center items-center w-28 h-16 my-7 bg-white rounded-2xl border border-black hover:scale-110 transition-all'
              onClick={() => handleCicloClick(selectedCiclo)} // Chama a função ao clicar
              >
              <img  className='w-10' src={arrow_blue} alt="" />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <p><strong>Descrição:</strong> {selectedCiclo?.descricao}</p>
            <p><strong>Objetivo:</strong> {selectedCiclo?.objetivo}</p>
            <p><strong>Requisitos:</strong> {selectedCiclo?.requisitos}</p>
            { selectedCiclo?.habilidadesabnt ? <p><strong>Habilidades BNCC:</strong> {selectedCiclo?.habilidadesabnt}</p> : ''}
            
          </div>
        </div>
      </Modal>

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

export default AlunoDashboard;
