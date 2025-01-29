import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

interface Questao {
    id: number;
    ciclo_id: number;
    enunciado: string | null;
    dicas: string[] | null;
    imagens_url: string[] | null;
    resposta_correta: number | null;
    alternativas: string[] | null;
}

interface Ciclo {
    id: number;
    data_criacao: string;
    data_atualizacao: string;
    sub_conteudo_id: number;
    video_url: string;
    descricao: string;
    ordem: number | null;
    questoes: Questao[];
    ativo: boolean;
}

interface EstadoQuestao {
  estado: 'naoRespondida' | 'correta' | 'errada';
  tentativas: number;
}

interface MostrarDicas {
  [questaoId: number]: {
    [indiceAlternativa: number]: boolean;
  };
}
  

const Ciclo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const { materia, conteudo, subConteudo, ciclo } = location.state || {};
  const [videoUrl, setVideoUrl] = useState('');
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [mostrarSecao, setMostrarSecao] = useState('video');
  const [respostas, setRespostas] = useState<{ [key: number]: number | null }>({});
  const [estadoQuestoes, setEstadoQuestoes] = useState<{ [key: number]: EstadoQuestao }>({});
  const [mostrarDicas, setMostrarDicas] = useState<MostrarDicas>({});

  const token = localStorage.getItem('token');

  // Fetch ciclo data
  useEffect(() => {
    const fetchCicloData = async () => {
      
      try {
        const response = await fetch(`${API_URL}/aluno/ciclo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cicloId: ciclo.id }),
        });

        if (!response.ok) {
          throw new Error('Erro de autenticação');
        }

        const data = await response.json();
        setVideoUrl(data.video_url);
        setQuestoes(data.questoes);

         // Inicializa estadoQuestoes
         const estadoInicial: { [key: number]: EstadoQuestao } = {};
         data.questoes.forEach((questao: Questao) => {
           estadoInicial[questao.id] = { estado: 'naoRespondida', tentativas: 0 };
         });
         setEstadoQuestoes(estadoInicial);


      } catch (error) {
        console.error('Erro ao buscar ciclo:', error);
        localStorage.clear();
        navigate('/login');
      }
    };

    fetchCicloData();
  }, [ciclo]);

  const toggleDica = (questaoId: number, index: number) => {
    setMostrarDicas((prev) => ({
      ...prev,
      [questaoId]: {
        ...prev[questaoId],
        [index]: !prev[questaoId]?.[index],
      },
    }));
  };

  

  // Handle answer selection
  const handleSelectResposta = (questaoId: number, alternativaIndex: number) => {
    setRespostas((prevRespostas) => ({
      ...prevRespostas,
      [questaoId]: alternativaIndex,
    }));

    const estadoAtualizado: { [key: number]: EstadoQuestao } = { ...estadoQuestoes };

    questoes.forEach((questao) => {
      if (questao.id === questaoId) {
        estadoAtualizado[questao.id] = {
          ...estadoAtualizado[questao.id],
          estado: 'naoRespondida',
        };
      }
    });

    setEstadoQuestoes(estadoAtualizado);


  };

   // Handle confer responses
  const handleConferirRespostas = async () => {
    const estadoAtualizado: { [key: number]: EstadoQuestao } = { ...estadoQuestoes };
    let todasCorretas = true;

    questoes.forEach((questao) => {
      const respostaUsuario = respostas[questao.id];
      if (respostaUsuario === undefined) {
        todasCorretas = false;
        estadoAtualizado[questao.id] = {
          ...estadoAtualizado[questao.id],
          estado: 'naoRespondida',
        };
      } else if (respostaUsuario !== questao.resposta_correta) {
        todasCorretas = false;
        estadoAtualizado[questao.id] = {
          estado: 'errada',
          tentativas: estadoAtualizado[questao.id].tentativas + 1,
        };
      } else {
        estadoAtualizado[questao.id] = {
          estado: 'correta',
          tentativas: estadoAtualizado[questao.id].tentativas + 1,
        };
      }
    });

    setEstadoQuestoes(estadoAtualizado);

    if (todasCorretas) {
      console.log(materia)
      setMostrarSecao('finalizado');
      try {
        const response = await fetch(`${API_URL}/aluno/falcoins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ usuario_id: usuario.id, falcoins: ciclo.falcoins }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao atualizar falcoins do aluno ${usuario.nome_completo}`);
        }
      } catch (error: any) {
        console.log(error)
      }

      try {
        const response = await fetch(`${API_URL}/aluno/todo`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ usuario_id: usuario.id, cicloId: ciclo.id }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao excluir ciclo ${ciclo.nome} da lista de todo`);
        }

      } catch (error) {

      }

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


      <div className="p-4">
        {/* Video Section */}
        {mostrarSecao === 'video' && (
          <div className="flex flex-col items-center">
            <iframe
                src={videoUrl}
                title="Ciclo Video"
                className="w-full max-w-3xl h-64"
                frameBorder="0"
                allowFullScreen
            ></iframe>
            <Button
                variant="contained"
                color="primary"
                className="mt-4"
                onClick={() => setMostrarSecao('questoes')}
            >
                Questões
            </Button>
          </div>
        )}

        {/* Questoes Section */}
        {mostrarSecao === 'questoes' && (
          <div className="mt-4">
            {questoes.map((questao) => (
              <Box key={questao.id} className="bg-white p-4 mb-4 rounded shadow-md">
                <h3 className="font-bold text-lg my-8">{questao.enunciado}</h3>
                <div className="flex justify-evenly">
                  {questao.imagens_url?.map((url, i) => (
                    <iframe key={i} src={url} className="mb-2 max-w-full h-auto"></iframe>
                  ))}
                </div>

                 <div className="flex mt-6 space-x-4">
        {/* Alternativas à esquerda */}
        <div className="flex-1 space-y-2">
          {questao.alternativas?.map((alternativa, i) => (
            <div key={i} className="relative flex items-center">
              <Button
                variant={respostas[questao.id] === i ? 'contained' : 'outlined'}
                color={
                  estadoQuestoes[questao.id]?.estado === 'correta'
                    ? 'success'
                    : estadoQuestoes[questao.id]?.estado === 'errada'
                    ? 'error'
                    : 'primary'
                }
                style={{
                  width: '32px', // Tamanho do botão
                  height: '25px', // Altura do botão
                  borderRadius: '5px', // Bordas arredondadas
                  minWidth: 'unset', // Remove largura mínima padrão
                  padding: '0',
                }}
                disabled={estadoQuestoes[questao.id]?.estado === 'correta'}
                onClick={() => handleSelectResposta(questao.id, i)}
              />
              <span className="ml-3">{alternativa}</span>

              {/* Balão de Dica */}
              {estadoQuestoes[questao.id]?.estado !== 'correta' &&
                estadoQuestoes[questao.id]?.tentativas > 0 &&
                questao.dicas &&
                questao.dicas[i] && (
                  <div className="absolute right-0 ml-4">
                    
                    {mostrarDicas[questao.id]?.[i] && (
                      <div className="absolute top-0 right-full z-30 bg-gray-200 p-2 shadow-md rounded w-48">
                        <p className="text-sm">{questao.dicas[i]}</p>
                        <button
                          className="text-red-500 text-xs mt-2"
                          onClick={() => toggleDica(questao.id, i)}
                        >
                          Fechar
                        </button>
                      </div>
                    )}
                    <button
                      className="text-blue-500 underline"
                      onClick={() => toggleDica(questao.id, i)}
                    >
                      Mostrar Dica
                    </button>
                  </div>
                )}
            </div>
          ))}
        </div>

        
      </div>
              </Box>
            ))}
            <Button variant="contained" color="primary" className="mt-4" onClick={handleConferirRespostas}>
              Conferir Respostas
            </Button>
          </div>
        )}

        {/* Finalizado */}
        {mostrarSecao === 'finalizado' && (
          <div className="text-center h-[calc(100vh-12rem)] m-4 p-20 bg-slate-400 bg-opacity-50 rounded-lg">
            <div className='bg-white rounded-lg h-full p-14'>
              <span className="text-2xl font-bold mb-8 block">Parabéns! Você conseguiu!</span>
              <Button variant="contained" color="primary" onClick={() => navigate('/aluno')}>
                Voltar para tela inicial
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
    
  );
};

export default Ciclo;
