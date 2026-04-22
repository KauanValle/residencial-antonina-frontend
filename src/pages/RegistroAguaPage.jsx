import { Calendar, ChevronLeft, ChevronRight, FileIcon, GlassWater, LogOut, Plus, RegexIcon, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RegistroAguaPage() {
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ nome: '', dataInicio: '', dataFim: '' });
    const hasFilters = filters.nome || filters.dataInicio || filters.dataFim;
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [registros, setRegistros] = useState([]);
    const [registrandoLeituraNoite, setRegistrandoLeituraNoite] = useState(null);
    const [deletando, setDeletando] = useState(null);

    const fetchRegistros = useCallback(async (page = 1) => {
        setLoading(true);
        try {
          const params = { page, limit: 10, ...filters };
          Object.keys(params).forEach(k => !params[k] && delete params[k]);
          const res = await api.get('/registro-agua', { params });
          setRegistros(res.data.data);
          setPagination(res.data.pagination);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }, [filters]);

      useEffect(() => { fetchRegistros(1); }, [fetchRegistros]);
      const clearFilters = () => setFilters({ nome: '', dataInicio: '', dataFim: '' });

      const fmtDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: '2-digit',
          hour: '2-digit', minute: '2-digit',
          hour12: false,
        });
      };

      const handleLeituraNoite = (id) => {
        navigate(`/registro-agua/${id}/leitura-noite`);
      };

      const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja deletar este registro?')) return;
        
        setDeletando(id);
        try {
          await api.delete(`/registro-agua/${id}`);
          // Recarrega a página atual
          await fetchRegistros(pagination.page);
        } catch (err) {
          console.error(err);
          alert('Erro ao deletar registro');
        } finally {
          setDeletando(null);
        }
      };

    return (
        <div className="p-6 max-w-7xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <GlassWater size={20} className="text-brand-400" />
                        Registro de água
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">{pagination.total} registro(s) encontrado(s)</p>
                </div>
                <button onClick={() => navigate('/registro-agua/novo')} className="btn-primary">
                    <Plus size={16} />
                    Nova Entrada
                </button>
            </div>

            {/* Table */}

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80">
                        {['Porteiro', 'Leitura Manhã', 'Leitura Noite', 'Média', 'Data Leitura', 'Ação'].map(h => (
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
                        <td className="px-4 py-3 font-medium text-slate-200">{r.porteiro.nome}</td>
                        <td className="px-4 py-3">
                            <span className="badge-entrada">{r.leituraManha}</span>
                        </td>
                        <td className="px-4 py-3">
                            <span className="badge-entrada">{r.leituraNoite}</span>
                        </td>
                        <td className="px-4 py-3">
                            <span className="badge-entrada">{r.media}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{fmtDate(r.dataLeitura)}</td>
                        <td className="px-4 py-3 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {!r.leituraNoite && (
                              <button
                                  onClick={() => handleLeituraNoite(r.id)}
                                  disabled={registrandoLeituraNoite === r.id}
                                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 transition-all disabled:opacity-50"
                              >
                                  <FileIcon size={12} />
                                  {registrandoLeituraNoite === r.id ? '...' : 'Registrar Leitura Noite'}
                              </button>
                          )}
                          <button
                              onClick={() => handleDelete(r.id)}
                              disabled={deletando === r.id}
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-all disabled:opacity-50"
                              title="Deletar registro"
                          >
                              <Trash2 size={12} />
                              {deletando === r.id ? '...' : 'Deletar'}
                          </button>
                        </div>
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
    )
}