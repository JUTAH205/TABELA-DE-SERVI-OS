import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const api = {
  // Services
  getProximoNumero: () => axios.get(`${API}/servicos/proximo-numero`).then(r => r.data),
  createServico: (data) => axios.post(`${API}/servicos`, data).then(r => r.data),
  listServicos: (params) => axios.get(`${API}/servicos`, { params }).then(r => r.data),
  getServico: (id) => axios.get(`${API}/servicos/${id}`).then(r => r.data),
  updateServico: (id, data) => axios.put(`${API}/servicos/${id}`, data).then(r => r.data),
  deleteServico: (id) => axios.delete(`${API}/servicos/${id}`).then(r => r.data),

  // Dashboard
  getDashboardStats: () => axios.get(`${API}/dashboard/stats`).then(r => r.data),

  // Atividades
  listAtividades: (tipo) => axios.get(`${API}/atividades`, { params: { tipo } }).then(r => r.data),

  // Relatorio
  getRelatorio: (params) => axios.get(`${API}/relatorio`, { params }).then(r => r.data),
};
