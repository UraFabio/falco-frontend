import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import coins from '../assets/coins.svg';
import logo from '../assets/logo-no-bg.png';
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

interface NovoUsuario {
  nome_completo: string;
  login: string;
  senha: string;
  escola?: string;
  ano_escolar?: string;
  materias: number[]; // IDs das matérias selecionadas
}

const AdminDashboard: React.FC = () => {
  const [menuOption, setMenuOption] = useState('materias');
  const [materias, setMaterias] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [alunos, setAlunos] = useState<any[]>([]);
  const [novaMateria, setNovaMateria] = useState('');
  const [modalLogoutOpen, setModalLogoutOpen] = useState(false);
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [modalUserOpen, setModalUserOpen] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [novoUsuario, setNovoUsuario] = useState<NovoUsuario>({
    nome_completo: '',
    login: '',
    senha: '',
    escola: '',
    ano_escolar: '',
    materias: [],
  });
  const [perfilSelecionado, setPerfilSelecionado] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    instrutores: false,
    administradores: false,
    alunos: false,
  });

  const navigate = useNavigate();

  
  
  const handleCloseSnackBar = (_?: React.SyntheticEvent | Event,reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackBar(false);
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
    
      try {
        const [materiasRes, funcionariosRes, alunosRes] = await Promise.all([
          fetch(`${API_URL}/admin/materias`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/admin/funcionarios`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_URL}/admin/alunos`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
    
        // Verificar se alguma resposta deu erro (código >= 400)
        if (!materiasRes.ok || !funcionariosRes.ok || !alunosRes.ok) {
          throw new Error('Erro de autenticação');
        }
    
        // Processar os dados das respostas
        const materiasData = await materiasRes.json();
        const funcionariosData = await funcionariosRes.json();
        const alunosData = await alunosRes.json();
    
        setMaterias(materiasData);
        setFuncionarios(funcionariosData);
        setAlunos(alunosData);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        localStorage.clear()
        navigate('/login'); // Redirecionar para /login em caso de erro
      }
    };
    fetchData()
  }, []);

  useEffect(() => {
    setErrorMessage('')
  }, [modalMateriaOpen, modalUserOpen])

  

  console.log(materias, funcionarios, alunos);

  const handleMateriaClick = (materia: {}) => {
    navigate('/admin/conteudos', { state: { materia } });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };


  // Create a new "Matéria"
  const handleCreateMateria = useCallback(async () => {
    try {

      if (novaMateria.length <= 1) {
        throw new Error('Nome da matéria inválido.')
      }

      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/admin/materias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ nome: novaMateria }),
      });
      console.log(novaMateria)
      if (!response.ok) {
        throw new Error('Erro ao criar matéria');
      }

      const novaMateriaCriada = await response.json();
      setMaterias([...materias, novaMateriaCriada.materia]);
      setNovaMateria('');
      setModalMateriaOpen(false);
      setOpenSnackBar(true)
      setErrorMessage('')
    } catch (error:any) {
      console.error('Erro ao criar matéria:', error);
      setErrorMessage(error.message)
    }
  }, [novaMateria]);

  const handleCreateUser = async () => {
    try {

      const token = localStorage.getItem('token');
      // Determinar o perfil_id com base no perfil selecionado
      let perfil_id = 0;
      let endpoint = '';
  
      if (perfilSelecionado === 'aluno') {
        perfil_id = 1;
        endpoint = 'aluno';
      } else if (perfilSelecionado === 'instrutor') {
        perfil_id = 2;
        endpoint = 'funcionario';
      } else if (perfilSelecionado === 'administrador') {
        perfil_id = 3;
        endpoint = 'funcionario';
      }
  
      // Preparar os dados do usuário com o perfil_id correto
      const usuarioParaCriar = {
        ...novoUsuario,
        perfil_id
      };

      console.log('usuarioParaCriar: ', usuarioParaCriar)
  
      const response = await fetch(`${API_URL}/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify(usuarioParaCriar),
      });
  
      if (!response.ok) {
        throw new Error('Erro ao criar usuário: ' + response.status);
      }
  
      const novoUsuarioCriado = await response.json();
  
      // Atualizar o estado local com base no perfil selecionado
      if (perfilSelecionado === 'instrutor' || perfilSelecionado === 'administrador') {
        setFuncionarios((prev) => [...prev, novoUsuarioCriado.funcionario]);
      } else if (perfilSelecionado === 'aluno') {
        setAlunos((prev) => [...prev, novoUsuarioCriado.aluno]);
      }
  
      // Resetar o estado para o próximo usuário
      setNovoUsuario({
        nome_completo: '',
        login: '',
        senha: '',
        escola: '',
        ano_escolar: '',
        materias: [],
      });
      setModalUserOpen(false);
      setOpenSnackBar(true)
      setErrorMessage('')
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      setErrorMessage('Error ao criar usuário.')
    }
  };

  // const onCloseModal = () => {
  //   setModalMateriaOpen(false); 
  //   setErrorMessage('')
  // }

  const handleToggleAtivo = async (id: number, ativo: boolean, perfil: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const endpoint = perfil === 'aluno' ? 'alunos' : 'funcionarios';
      const response = await fetch(`${API_URL}/admin/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, },
        body: JSON.stringify({ id, ativo: !ativo }),
        
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar status do usuário');
      }
  
      //const updatedUser = await response.json();
  
      // Atualizar o estado local
      if (perfil === 'instrutor' || perfil === 'administrador') {
        setFuncionarios((prev) =>
          prev.map((func) =>
            func.id === id ? { ...func, ativo: !ativo } : func
          )
        );
      } else if (perfil === 'aluno') {
        setAlunos((prev) =>
          prev.map((aluno) =>
            aluno.id === id ? { ...aluno, ativo: !ativo } : aluno
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
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
          <img src={logo} alt="logo falco" className="w-16" />
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

      <div className="flex h-[calc(100vh-10rem)] min-w-full bg-azulBgAdmin bg-opacity-80">
        {/* Sidebar */}
        <div className="w-1/4 bg-blue-900 flex flex-col items-center p-4">
          <button
            className="text-white py-2 px-4 w-full mb-4 bg-blue-700 rounded hover:bg-blue-800"
             onClick={() => setMenuOption('materias')}
          >
            Matérias
          </button>
          <button
            className="text-white py-2 px-4 w-full bg-blue-700 rounded hover:bg-blue-800"
            onClick={() => setMenuOption('contas')}
          >
            Contas
          </button>
        </div>

        {/* Main Content */}
        <div className="w-3/4 p-6 overflow-auto">
          {menuOption === 'materias' && (
            <div>
              <h2 className="text-white text-2xl font-bold mb-4">Matérias</h2>
              <div className="grid grid-cols-4 gap-4">
                {materias.map((materia: any) => (
                  <button
                  key={materia.id}
                  className="flex flex-col items-center justify-end font-semibold text-md bg-white p-4 rounded shadow text-center cursor-pointer hover:bg-gray-100"
                  onClick={() => handleMateriaClick(materia)}
                >
                  <img src={"/"+materia.imagem_url} alt="" />
                  {materia.nome}
                </button>
                ))}
                <div
                  className="bg-blue-500 text-white p-4 rounded shadow flex items-center justify-center cursor-pointer"
                  onClick={() => setModalMateriaOpen(true)}
                >
                  <span className="text-2xl font-bold">+</span>
                </div>
              </div>
            </div>
          )}

          {menuOption === 'contas' && (
            

            <div>
              <h2 className="text-white text-2xl font-bold mb-4">Contas</h2>
              <div className="text-white">
                <div className="flex gap-4 items-center mb-2">
                  <button onClick={() => toggleSection('instrutores')}>
                    {expandedSections.instrutores ? '▷' : '∇'}
                  </button>
                  <h3 className="text-xl font-bold">Instrutores</h3>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setPerfilSelecionado('instrutor');
                      setModalUserOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                {expandedSections.instrutores && (
                <ul className="ml-4 mb-4">
                {funcionarios
                  .filter((func) => func.perfil_nome === 'instrutor')
                  .map((instrutor) => (
                    <li
                      key={instrutor.id}
                      className={`py-1 flex items-center space-x-2 ${
                        !instrutor.ativo ? 'text-gray-500' : ''
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full cursor-pointer ${
                          instrutor.ativo ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        onClick={() =>
                          handleToggleAtivo(instrutor.id, instrutor.ativo, 'instrutor')
                        }
                      ></div>
                      <span>{instrutor.nome_completo}</span>
                    </li>
                  ))}
              </ul>
              )}

              <div className="flex gap-4 items-center mb-2">
                <button onClick={() => toggleSection('administradores')}>
                  {expandedSections.administradores ? '▷' : '∇'}
                </button>
                <h3 className="text-xl font-bold">Administradores</h3>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setPerfilSelecionado('administrador');
                      setModalUserOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                {expandedSections.administradores && (
                <ul className="ml-4 mb-4">
                {funcionarios
                  .filter((func) => func.perfil_nome === 'administrador')
                  .map((admin) => (
                    <li
                      key={admin.id}
                      className={`py-1 flex items-center space-x-2 ${
                        !admin.ativo ? 'text-gray-500' : ''
                      }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full cursor-pointer ${
                          admin.ativo ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                        onClick={() =>
                          handleToggleAtivo(admin.id, admin.ativo, 'administrador')
                        }
                      ></div>
                      <span>{admin.nome_completo}</span>
                    </li>
                  ))}
              </ul>
                )}

                <div className="flex gap-4 items-center mb-2">
                <button onClick={() => toggleSection('alunos')}>
                  {expandedSections.alunos ? '▷' : '∇'}
                </button>
                <h3 className="text-xl font-bold">Alunos</h3>
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => {
                      setPerfilSelecionado('aluno');
                      setModalUserOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                {expandedSections.alunos && (
                <ul className="ml-4">
                {alunos.map((aluno) => (
                  <li
                    key={aluno.id}
                    className={`py-1 flex items-center space-x-2 ${
                      !aluno.ativo ? 'text-gray-500' : ''
                    }`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full cursor-pointer ${
                        aluno.ativo ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                      onClick={() => handleToggleAtivo(aluno.id, aluno.ativo, 'aluno')}
                    ></div>
                    <span>{aluno.nome_completo}</span>
                  </li>
                ))}
              </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Snack Bar */}
      <Snackbar
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackBar} severity="success" sx={{ width: "100%" }}>
          Criado com sucesso!
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

      {/* Create Matéria Modal */}
      <Modal open={modalMateriaOpen} onClose={() => setModalMateriaOpen(false) } className="flex items-center justify-center">
        <Box className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Criar Nova Matéria</h2>
          <input
            type="text"
            placeholder="Nome da Matéria"
            value={novaMateria}
            onChange={(e) => setNovaMateria(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />
          <div className="flex justify-end">
            <Button variant="contained" color="primary" onClick={handleCreateMateria}>
              Criar
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setModalMateriaOpen(false)}>
              Cancelar
            </Button>
          </div>
          { errorMessage && 
            <span className='text-red-500 mt-4'>{errorMessage}</span>
          }
        </Box>
      </Modal>

      <Modal open={modalUserOpen} onClose={() => setModalUserOpen(false)} className="flex items-center justify-center">
        <Box className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <h2 className="text-xl font-bold mb-4">Criar Novo Usuário</h2>
          <input
            type="text"
            placeholder="Nome e Sobrenome"
            value={novoUsuario.nome_completo}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, nome_completo: e.target.value })}
            className="border p-2 w-full mb-4 rounded"
          />
          <input
            type="text"
            placeholder="Login"
            value={novoUsuario.login}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, login: e.target.value })}
            className="border p-2 w-full mb-4 rounded"
          />
          <input
            type="password"
            placeholder="Senha"
            value={novoUsuario.senha}
            onChange={(e) => setNovoUsuario({ ...novoUsuario, senha: e.target.value })}
            className="border p-2 w-full mb-4 rounded"
          />
          {perfilSelecionado === 'aluno' && (
            <>
              <input
                type="text"
                placeholder="Escola"
                value={novoUsuario.escola}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, escola: e.target.value })}
                className="border p-2 w-full mb-4 rounded"
              />
              <input
                type="text"
                placeholder="Ano Escolar"
                value={novoUsuario.ano_escolar}
                onChange={(e) => setNovoUsuario({ ...novoUsuario, ano_escolar: e.target.value })}
                className="border p-2 w-full mb-4 rounded"
              />
              <h3 className="font-bold mb-2">Matérias</h3>
              <div className="flex flex-wrap gap-2">
                {materias.map((materia) => (
                  <label key={materia.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={materia.id}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setNovoUsuario((prev) => ({
                          ...prev,
                          materias: isChecked
                            ? [...prev.materias, materia.id]
                            : prev.materias.filter((id: any) => id !== materia.id),
                        }));
                      }}
                    />
                    <span>{materia.nome}</span>
                  </label>
                ))}
              </div>
            </>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="contained" color="primary" onClick={handleCreateUser}>
              Criar
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setModalUserOpen(false)}>
              Cancelar
            </Button>
          </div>
          { errorMessage && 
            <span className='text-red-500 mt-4'>{errorMessage}</span>
          }
        </Box>
      </Modal>
    </>
  );
};

export default AdminDashboard;
