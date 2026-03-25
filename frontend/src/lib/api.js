import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function authHeaders() {
  const token = localStorage.getItem("pm_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const ax = () => axios.create({ headers: authHeaders() });

export const api = {
  // Auth
  login: (username, password) => axios.post(`${API}/auth/login`, { username, password }).then(r => r.data),
  getMe: () => ax().get(`${API}/auth/me`).then(r => r.data),

  // Services
  getProximoNumero: () => ax().get(`${API}/servicos/proximo-numero`).then(r => r.data),
  createServico: (data) => ax().post(`${API}/servicos`, data).then(r => r.data),
  listServicos: (params) => ax().get(`${API}/servicos`, { params }).then(r => r.data),
  getServico: (id) => ax().get(`${API}/servicos/${id}`).then(r => r.data),
  updateServico: (id, data) => ax().put(`${API}/servicos/${id}`, data).then(r => r.data),
  deleteServico: (id) => ax().delete(`${API}/servicos/${id}`).then(r => r.data),
  getServicosKPI: () => ax().get(`${API}/servicos-kpi`).then(r => r.data),
  listAtividades: (tipo) => ax().get(`${API}/atividades`, { params: { tipo } }).then(r => r.data),
  getDashboardStats: () => ax().get(`${API}/dashboard/stats`).then(r => r.data),
  getRelatorio: (params) => ax().get(`${API}/relatorio`, { params }).then(r => r.data),

  // Fiscalizacao
  getFiscTipos: () => ax().get(`${API}/fiscalizacoes/tipos`).then(r => r.data),
  getFiscProximoNumero: (tipo) => ax().get(`${API}/fiscalizacoes/proximo-numero`, { params: { tipo } }).then(r => r.data),
  createFisc: (data) => ax().post(`${API}/fiscalizacoes`, data).then(r => r.data),
  listFisc: (params) => ax().get(`${API}/fiscalizacoes`, { params }).then(r => r.data),
  getFisc: (id) => ax().get(`${API}/fiscalizacoes/${id}`).then(r => r.data),
  updateFisc: (id, data) => ax().put(`${API}/fiscalizacoes/${id}`, data).then(r => r.data),
  deleteFisc: (id) => ax().delete(`${API}/fiscalizacoes/${id}`).then(r => r.data),
  getFiscStats: () => ax().get(`${API}/fiscalizacoes-stats`).then(r => r.data),
};
