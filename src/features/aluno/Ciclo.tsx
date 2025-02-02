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
    dicas?: string[] | null;
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
  [questaoId: number]: boolean[]; // Um array de booleanos para cada questão, onde cada índice é uma dica
}
  

const Ciclo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const { ciclo } = location.state || {};
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

        console.log(data.questoes)

         // Inicializa estadoQuestoes
         const estadoInicial: { [key: number]: EstadoQuestao } = {};
         data.questoes.forEach((questao: Questao) => {
           estadoInicial[questao.id] = { estado: 'naoRespondida', tentativas: 0 };
           setMostrarDicas((prev) => ({
            ...prev,
            [questao.id]:  [false, false, false] // Inicializa com todas as dicas ocultas
          }));
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

  const toggleDica = (questaoId: number, dicaIndex: number) => {
    setMostrarDicas((prev) => ({
      ...prev,
      [questaoId]: prev[questaoId]
        ? prev[questaoId].map((dica, index) =>
            index === dicaIndex ? !dica : false // Fecha todas as dicas, exceto a que foi clicada
          )
        : [false, false, false], // Inicializa com todas as dicas ocultas
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

        usuario.falcoins += ciclo.falcoins

        localStorage.setItem('usuario', JSON.stringify(usuario))
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
        console.log(error)
      }

      try {
        const response = await fetch(`${API_URL}/aluno/estado-ciclo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ aluno_id: usuario.id, ciclo_id: ciclo.id, estado: 'concluido' }),
        });

        if (!response.ok) {
          throw new Error(`Erro ao registrado conclusao do ciclo ${ciclo.nome}`);
        }

      } catch (error) {
        console.log(error)
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
  let falcoins = usuario.falcoins || 0;

  return (
    <>
      <header className="bg-azulFalcaoSecundario text-white py-4 px-8 flex sombra-preta justify-between rounded-t-md items-center">
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


      <div className="min-h-[calc(100vh-10rem)] bg-white bg-opacity-60 rounded-b-lg shadow-inner shadow-slate-800 ">
        {/* Video Section */}
        {mostrarSecao === 'video' && (
          <div className="p-4 flex flex-col items-center h-full">
            <iframe
                src={videoUrl}
                title="Ciclo Video"
                className="md:w-4/5 rounded-xl border-none"
                style={{ aspectRatio: '16/9' }}
                allowFullScreen
            ></iframe>
            <div className='flex flex-row w-full justify-end m-4'>
              <Button variant="contained" color="primary" className="mt-4" onClick={() => setMostrarSecao('questoes')}>
                Questões
              </Button>
            </div>
          </div>
        )}

        {/* Questoes Section */}
        {mostrarSecao === 'questoes' && (
          <div className="">
            <button onClick={() => setMostrarSecao('video')} 
              className=' text-white font-semibold text-xl m-4 bg-azulFalcaoSecundario px-2 rounded-md border w-fit text-nowrap border-black border-1'>
                ◁ Vídeo
            </button>


            <div className='overflow-auto py-4 px-36'>
              {questoes.map((questao, i) => (
                <div 
                key={questao.id} 
                className={`${estadoQuestoes[questao.id]?.estado === 'correta'
                  ? 'bg-green-100'
                  : estadoQuestoes[questao.id]?.estado === 'errada'
                  ? 'bg-red-100'
                  : 'bg-white'}
                  p-4 mb-4 rounded shadow-md relative`}>

                  <h3 className='text-sm font-semibold  bg-azulBgAluno w-fit py-2 px-4 border border-black rounded-md shadow-md'>
                    Questão {i+1}
                  </h3>
                  <span className="font-bold text-lg block my-8">{questao.enunciado}</span>

                  <div className="flex flex-col justify-center gap-2">
                    {questao.imagens_url?.map((url, i) => (
                      <iframe key={i} src={url} className="mb-2 w-2/4 h-auto"></iframe>
                    ))}
                  </div>

                  {/* Alternativas à esquerda */}
                  <div className="flex mt-6 space-x-4">
                    <div className="flex-1 space-y-2">
                      {questao.alternativas?.map((alternativa, i) => (
                        <div key={i} className="relative flex items-center">
                          <button
                            onClick={() => handleSelectResposta(questao.id, i)}
                            disabled={estadoQuestoes[questao.id]?.estado === 'correta'}
                            style={{
                              backgroundColor:
                                respostas[questao.id] === i && estadoQuestoes[questao.id]?.estado === 'correta'
                                  ? '#4CAF50' // Verde apenas para a alternativa selecionada correta
                                  : respostas[questao.id] === i && estadoQuestoes[questao.id]?.estado === 'errada'
                                  ? '#f44336' // Vermelho apenas para a alternativa selecionada errada
                                  : respostas[questao.id] === i
                                  ? '#2196F3' // Azul quando selecionado
                                  : estadoQuestoes[questao.id]?.estado === 'correta'
                                  ? '#c9c9c9' // Cinza para as não selecionadas se a resposta estiver correta
                                  : 'white', //
                              width: '32px',
                              height: '28px',
                              borderRadius: '5px',
                              boxShadow: '0px 2px 5px rgba(0, 0, 0, .4)', // Sombra para efeito de elevação
                              cursor: estadoQuestoes[questao.id]?.estado === 'correta' ? 'not-allowed' : 'pointer',
                              transition: 'all 0.3s ease-in-out',
                            }}
                          >
                          </button>

                          <span className="ml-3">{alternativa}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                      {/* Botão "DICAS" no canto inferior direito */}
                      {estadoQuestoes[questao.id]?.estado !== 'correta' &&
                        estadoQuestoes[questao.id]?.tentativas > 0 && (questao.dicas?.length || 0) > 0 && (
                        <div className="absolute bottom-2 right-2">
                          <button
                            className=" text-azulBgAluno text-xl font-semibold p-3"
                            onClick={() => toggleDica(questao.id, 0)}
                          >
                            DICAS
                          </button>
                        </div>
                      )}

                      {/* Balões de dicas */}
                      {questao.dicas?.map((dica, index) => (
                        <div key={index} className="absolute bottom-2 right-24">

                          {mostrarDicas[questao.id]?.[index] && (
                            <div className="bg-azulBotao p-5 rounded-md">
                              <h3> <strong>Dica{index+1}</strong> </h3>
                              <p>{dica}</p>
                              {questao.dicas && index < questao.dicas.length - 1 && (
                                <button
                                  onClick={() => toggleDica(questao.id, index + 1)} // Mostra a próxima dica
                                >
                                  +
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                </div>
              ))}

              <Button variant="contained" color="primary" onClick={handleConferirRespostas}>
                Conferir Respostas
              </Button>
            </div>
            
            
          </div>
        )}

        {/* Finalizado */}
        {mostrarSecao === 'finalizado' && (
          <div className="text-center h-[calc(100vh-12rem)] p-20">
            <div className='bg-white rounded-lg gap-5 h-full p-14'>
              <span className='text-7xl'>😄</span>
              <span className="text-2xl font-bold my-4 block">Parabéns! Você conseguiu!</span>
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
