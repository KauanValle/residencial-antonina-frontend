import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, Search, Car, LogOut, ChevronLeft, ChevronRight,
  ClipboardList, Calendar, Filter, X, User
} from 'lucide-react';

export default function RegistrosPage() {
  const navigate = useNavigate();
  const [registros, setRegistros] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ nome: '', dataInicio: '', dataFim: '' });
  const [loading, setLoading] = useState(true);
  const [registrandoSaida, setRegistrandoSaida] = useState(null);

  const fetchRegistros = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/registros', { params });
      console.log(res.data.data)
      setRegistros(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchRegistros(1); }, [fetchRegistros]);

  const handleSaida = async (id) => {
    setRegistrandoSaida(id);
    try {
      await api.patch(`/registros/${id}/saida`);
      fetchRegistros(pagination.page);
    } catch (err) {
      alert('Erro ao registrar saída.');
    } finally {
      setRegistrandoSaida(null);
    }
  };

  const clearFilters = () => setFilters({ nome: '', dataInicio: '', dataFim: '' });
  const hasFilters = filters.nome || filters.dataInicio || filters.dataFim;

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList size={20} className="text-brand-400" />
            Registros de Acesso
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} registro(s) encontrado(s)</p>
        </div>
        <button onClick={() => navigate('/registros/novo')} className="btn-primary">
          <Plus size={16} />
          Nova Entrada
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs text-slate-500 mb-1.5">Buscar por nome</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Nome da pessoa..."
                value={filters.nome}
                onChange={e => setFilters(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={11} />De</label>
            <input
              type="date"
              className="input-field"
              value={filters.dataInicio}
              onChange={e => setFilters(f => ({ ...f, dataInicio: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Calendar size={11} />Até</label>
            <input
              type="date"
              className="input-field"
              value={filters.dataFim}
              onChange={e => setFilters(f => ({ ...f, dataFim: e.target.value }))}
            />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary">
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {['Nome', 'Tipo', 'Destino', 'Veículo', 'Entrada', 'Saída', 'Porteiro', 'Ação'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      Carregando...
                    </div>
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-600">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : registros.map(r => (
                <tr key={r.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">{r.nomePessoa}</td>
                  <td className="px-4 py-3">
                    <span className="badge-entrada">{r.tipoAcesso}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{r.bloco} - {r.apartamento}</td>
                  <td className="px-4 py-3">
                    {r.temVeiculo ? (
                      <div className="flex items-center gap-1 text-slate-300">
                        <Car size={13} className="text-slate-500" />
                        <span className="text-xs">{r.modeloCarro}</span>
                        <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{r.placa}</span>
                      </div>
                    ) : <span className="text-slate-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{fmtDate(r.dataEntrada)}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {r.dataSaida
                      ? <span className="text-slate-400">{fmtDate(r.dataSaida)}</span>
                      : <span className="text-amber-500">Em andamento</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <User size={11} />
                      {r.criadoPor?.nome}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {!r.dataSaida && (
                      <button
                        onClick={() => handleSaida(r.id)}
                        disabled={registrandoSaida === r.id}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 transition-all disabled:opacity-50"
                      >
                        <LogOut size={12} />
                        {registrandoSaida === r.id ? '...' : 'Saída'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRegistros(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => fetchRegistros(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
