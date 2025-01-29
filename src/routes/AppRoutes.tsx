import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/Login';

import AlunoDashboard from '../pages/AlunoDashboard';
import AlunoConteudos from '../features/aluno/Conteudos';
import AlunoSubConteudosCiclos from '../features/aluno/SubConteudosCiclos';
import AlunoCiclo from '../features/aluno/Ciclo'


import InstrutorDashboard from '../pages/InstrutorDashboard';
import InstrutorConteudos from '../features/instrutor/Conteudos'
import InstrutorSubConteudosCiclos from '../features/instrutor/SubConteudosCiclos'
import InstrutorCriarCiclo from '../features/instrutor/CriarCiclo'

import AdminDashboard from '../pages/AdminDashboard';
import AdminConteudos from '../features/admin/Conteudos'
import AdminSubConteudos from '../features/admin/SubConteudos'
import NotFound from '../pages/NotFound'

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/aluno" element={<AlunoDashboard />} />
        <Route path="/aluno/conteudos" element={<AlunoConteudos />} />
        <Route path="/aluno/ciclos" element={<AlunoSubConteudosCiclos />} />
        <Route path="/aluno/ciclo" element={<AlunoCiclo />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/conteudos" element={<AdminConteudos />} />
        <Route path="/admin/sub-conteudos" element={<AdminSubConteudos />} />

        <Route path="/instrutor" element={<InstrutorDashboard />} />
        <Route path="/instrutor/conteudos" element={<InstrutorConteudos />} />
        <Route path="/instrutor/ciclos" element={<InstrutorSubConteudosCiclos />} />
        <Route path="/instrutor/ciclos/novo" element={<InstrutorCriarCiclo />} />


        <Route path="/*" element={<NotFound />} />

      </Routes>
    </Router>
  )
};

export default AppRoutes;

