import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  enunciado: string;
  alternativas: string[];
  dicas: string[];
  respostaCorreta: number;
  urlsImagens: string[];
}

interface EstadoQuestao {
  id: number;
  criado: boolean;
  errorMessage: string;
}


const CriarCiclo: React.FC = () => {
  const location = useLocation();
  const { materia, conteudo, subConteudo } = location.state || {}; // Recebe o ID do sub-conteúdo
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [cicloId, setCicloId] = useState<number>();
  const [videoUrl, setVideoUrl] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeCiclo, setNomeCiclo] = useState('');
  const [objetivoCiclo, setObjetivoCiclo] = useState('');
  const [requisitosCiclo, setRequisitosCiclo] = useState('');
  const [cicloFalcoins, setCicloFalcoins] = useState(0)
  const [habilidadesABNT, setHabilidadesABNT] = useState('')

  const [cicloCriado, setCicloCriado] = useState(false);
  const [errorMessage, setErrorMessage] = useState('')
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [estadosQuestoes, setEstadosQuestoes] = useState<EstadoQuestao[]>([])
  
  const navigate = useNavigate();

 useEffect(() => {
    /* Implementar logica para autenticar token*/
  }, );

  const handleSalvarCiclo = async () => {
    const token = localStorage.getItem('token');

    try {
      if (videoUrl.length < 1 || descricao.length < 1 || nomeCiclo.length < 1 || objetivoCiclo.length < 1 || requisitosCiclo.length < 1 || cicloFalcoins < 1 ) {
        throw new Error('Preencha os campos corretamente.')
      }

      const response = await fetch(`${API_URL}/instrutor/ciclo/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sub_conteudo_id: subConteudo.id, ciclo_id:cicloId, video_url: videoUrl, descricao, nome: nomeCiclo, objetivo: objetivoCiclo, requisitos: requisitosCiclo, falcoins: cicloFalcoins, habilidadesabnt: habilidadesABNT }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar ciclo');
      }

      const data = await response.json();

      setCicloCriado(true); // Marca que o ciclo foi criado
      setCicloId(data.cicloId); // Salva o ID do ciclo retornado
      setErrorMessage('')

      console.log('id do ciclo: ', data.cicloId)

      console.log('Ciclo criado com sucesso!');
    } catch (error:any) {
      setErrorMessage(error.message)
      console.error('Erro ao criar ciclo:', error);
    }
  };

  // Estado para questões
  

  // Logout Functionality
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // User Data
  const usuarioString = localStorage.getItem('usuario');
  const usuario: Usuario = usuarioString ? JSON.parse(usuarioString) : ({} as Usuario);

  const nomeUsuario = usuario.nome_completo || '{{ user_name }}';
  const falcoins = usuario.falcoins || 0;

  // Função para adicionar uma nova questão
  const adicionarQuestao = () => {
    try {
      setQuestoes([
        ...questoes,
        { enunciado: '', alternativas: ['', '', '', '', ''], dicas: ['', '', ''], respostaCorreta: 0, urlsImagens: ['', '', ''] }
      ]);
    } catch (error) {
      console.log(error)
    }
  };

  // Função para atualizar uma questão específica
  const atualizarQuestao = (index: number, campo: string, valor: any) => {
    const novasQuestoes = [...questoes];
    if (campo === 'enunciado') novasQuestoes[index].enunciado = valor;
    if (campo === 'alternativas') novasQuestoes[index].alternativas = valor;
    if (campo == 'dicas') novasQuestoes[index].dicas = valor;
    if (campo === 'respostaCorreta') novasQuestoes[index].respostaCorreta = valor;
    if (campo === 'urlsImagens') novasQuestoes[index].urlsImagens = valor;
    setQuestoes(novasQuestoes);
  };

  // Função para salvar uma questão
  const salvarQuestao = async (index: number) => {
    const questao = questoes[index];
    
    
    const token = localStorage.getItem('token');

    if (!questao.enunciado.trim() || questao.respostaCorreta < 0) {
      if (estadosQuestoes.some((obj) => obj.id === index)) {
        const novosEstados = estadosQuestoes.map((obj) =>
          obj.id === index
        ? { ...obj, criado: false, errorMessage: 'preencha corretamente os campos da questão' } 
        : obj 
        );
        setEstadosQuestoes(novosEstados);
      } else {
        setEstadosQuestoes([...estadosQuestoes , {id: index, criado: false, errorMessage: 'preencha corretamente os campos da questão'}])
      }
      // console.log(!questao.enunciado.trim() || questao.respostaCorreta < 0)
      // console.log(!questao.enunciado.trim() )
      // console.log(questao.respostaCorreta < 0)
      // console.log('aqui')
    return;
    }

    console.log('Salvando questão:', questao);
  
  
    try {
      const response = await fetch(`${API_URL}/instrutor/questao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ciclo_id:cicloId, questao }),
      });

      if (!response.ok) {
        throw new Error('Erro ao criar questao');
      }

      if (estadosQuestoes.some((obj) => obj.id === index)) {
        const novosEstados = estadosQuestoes.map((obj) =>
          obj.id === index
            ? { ...obj, criado: true, errorMessage: '' } 
            : obj 
        );
        setEstadosQuestoes(novosEstados);
      } else {
        setEstadosQuestoes([...estadosQuestoes , {id: index, criado: true, errorMessage: ''}])
      }

      console.log('Questão criada com sucesso!');
    } catch (error:any) {
      console.error('Erro ao criar questão:', error);

      if (estadosQuestoes.some((obj) => obj.id === index)) {
        const novosEstados = estadosQuestoes.map((obj) =>
          obj.id === index
            ? { ...obj, criado: false, errorMessage: error.message } 
            : obj 
        );
        setEstadosQuestoes(novosEstados);
      } else {
        setEstadosQuestoes([...estadosQuestoes , {id: index, criado: false, errorMessage: error.message}])
      }
    }
  };

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
          <Button variant="outlined" color="inherit" onClick={() => setModalLogoutOpen(true)}>
            Logout
          </Button>
        </div>
      </header>

      <main className="p-8 bg-azulFalcaoSecundario bg-opacity-60 h-[calc(100vh-10rem)] overflow-auto">
        <button
            onClick={() => navigate('/instrutor/ciclos', { state: { materia, conteudo } })}
            className="text-white bg-azulFalcaoSecundario px-2 rounded-md mb-2"
          >
          ← voltar
        </button>
        <h2 className="text-xl font-bold mb-4">Criar Ciclo</h2>

        {/* Campo para Nome do Ciclo */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Título do ciclo:</label>
          <textarea
            value={nomeCiclo}
            onChange={(e) => setNomeCiclo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira um título para o ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para URL do vídeo */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">URL do Vídeo:</label>
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira a URL do vídeo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para Descrição */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Descrição:</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira uma descrição para o ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para Objetivo */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Objetivo do Ciclo:</label>
          <textarea
            value={objetivoCiclo}
            onChange={(e) => setObjetivoCiclo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira uma objetivo para o ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para Requisitos do Ciclo */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Requisitos do Ciclo:</label>
          <textarea
            value={requisitosCiclo}
            onChange={(e) => setRequisitosCiclo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira Requisitos para o ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para Descrição */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Habilidades BNCC do ciclo:</label>
          <textarea
            value={habilidadesABNT}
            onChange={(e) => setHabilidadesABNT(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira as habilidades BNCC do ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Campo para Falcoins */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Falcoins:</label>
          <textarea
            value={cicloFalcoins}
            onChange={(e) => setCicloFalcoins(parseInt(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Insira uma descrição para o ciclo"
            disabled={cicloCriado}
          />
        </div>

        {/* Botão para Salvar */}
        <div className="flex items-center justify-end">
          { cicloCriado && 
            <span className='text-green-500 font-semibold text-xl mr-80'>Ciclo criado com Sucesso!</span>
          }
          { !cicloCriado &&
            <span className='text-red-500 text-xl font-semibold mr-80'>{errorMessage}</span>
          }
          <Button variant="contained" color="primary" onClick={handleSalvarCiclo} disabled={cicloCriado}>
            Salvar
          </Button>
        </div>

        {/* Questões */}
        { cicloCriado &&
          <h3 className="text-lg font-bold mb-4">Questões</h3>
        }
        {cicloCriado && questoes.map((questao, index) => (
          <div key={index} className="mb-8 p-4 border border-gray-300 rounded">
            <label className="block text-sm font-bold mb-2">Enunciado:</label>
            <textarea
              value={questao.enunciado}
              onChange={(e) => atualizarQuestao(index, 'enunciado', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Insira o enunciado da questão"
              disabled={estadosQuestoes.find((q) => q.id === index)?.criado}
            />

            <label className="block text-sm font-bold mb-2">URLs das Imagens (até 3):</label>
            {questao.urlsImagens.map((url, i) => (
              <input
                key={i}
                type="text"
                value={url}
                onChange={(e) => {
                  const novasImagens = [...questao.urlsImagens];
                  novasImagens[i] = e.target.value;
                  atualizarQuestao(index, 'urlsImagens', novasImagens);
                }}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                placeholder={`URL da imagem ${i + 1}`}
                disabled={estadosQuestoes.find((q) => q.id === index)?.criado}
              />
            ))}

            <label className="block text-sm font-bold mb-2">Alternativas:</label>
            {questao.alternativas.map((alt, i) => (
              <input
                key={i}
                type="text"
                value={alt}
                onChange={(e) => {
                  const novasAlternativas = [...questao.alternativas];
                  novasAlternativas[i] = e.target.value;
                  atualizarQuestao(index, 'alternativas', novasAlternativas);
                }}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                placeholder={`Alternativa ${i + 1}`}
                disabled={estadosQuestoes.find((q) => q.id === index)?.criado}
              />
            ))}

            <label className="block text-sm font-bold mb-2">Dicas:</label>
            {questao.dicas.map((alt, i) => (
              <input
                key={i}
                type="text"
                value={alt}
                onChange={(e) => {
                  const novasDicas = [...questao.dicas];
                  novasDicas[i] = e.target.value;
                  atualizarQuestao(index, 'dicas', novasDicas);
                }}
                className="w-full p-2 border border-gray-300 rounded mb-2"
                placeholder={`Dica ${i + 1}`}
                disabled={estadosQuestoes.find((q) => q.id === index)?.criado}
              />
            ))}

            <label className="block text-sm font-bold mb-2">Resposta Correta:</label>
            <select
              value={questao.respostaCorreta}
              onChange={(e) => atualizarQuestao(index, 'respostaCorreta', parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              disabled={estadosQuestoes.find((q) => q.id === index)?.criado}
            >
              {questao.alternativas.map((alternativa, i) => {
                if (alternativa.length > 0) {
                  return (
                    <option key={i} value={i} >
                      Alternativa {i + 1} ( {alternativa} )
                    </option>
                  )
                }
              })}
            </select>

            <div className="flex justify-end">
              { estadosQuestoes.find((q) => q.id === index)?.criado &&
                <span className='text-green-500 mr-52 font-semibold text-xl'>Questao salva com sucesso!</span>
              }
              {
                !estadosQuestoes.find((q) => q.id === index)?.criado &&
                <span className='text-red-500 mr-40 font-semibold text-xl'> {estadosQuestoes.find((q) => q.id === index)?.errorMessage} </span>
              }
              <Button variant="contained" color="primary" onClick={() => salvarQuestao(index)} disabled={estadosQuestoes.find((q) => q.id === index)?.criado}>
                Salvar Questão
              </Button>
            </div>
          </div>
        ))}

        { cicloCriado &&
          <Button variant="contained" color="primary" onClick={adicionarQuestao}>
            Adicionar Nova Questão
          </Button>
        }
      </main>

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

export default CriarCiclo;
