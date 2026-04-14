import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save, Package } from 'lucide-react';

const BLOCOS = [1,2,3,4,5,6,7,8,9,10]
const APARTAMENTOS = [11,12,13,14,21,22,23,24,31,32,33,34,41,42,43,44]

export default function NovaEncomendaPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    destinatario: '',
    bloco: '',
    apartamento: '',
    horarioChegada: new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date()).replace(' ', 'T'),
    quantidadeItens: 1,
    observacao: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.destinatario || !form.bloco || !form.apartamento || !form.horarioChegada) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/encomendas', form);
      navigate('/encomendas');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao registrar encomenda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/encomendas')} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package size={20} className="text-brand-400" />
            Nova Encomenda
          </h1>
          <p className="text-sm text-slate-500">Registre a chegada de uma encomenda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 space-y-5">

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Destinatário <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Nome do morador"
              value={form.destinatario}
              onChange={e => set('destinatario', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Bloco <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field"
                value={form.bloco}
                onChange={e => set('bloco', e.target.value)}
              >
                <option value="">Selecione...</option>
                {BLOCOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Apartamento <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field"
                value={form.apartamento}
                onChange={e => set('apartamento', e.target.value)}
              >
                <option value="">Selecione...</option>
                {APARTAMENTOS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Horário de Chegada <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={form.horarioChegada}
                onChange={e => set('horarioChegada', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Quantidade de Itens <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                className="input-field"
                value={form.quantidadeItens}
                onChange={e => set('quantidadeItens', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Observação <span className="text-slate-600">(opcional)</span>
            </label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Ex: Caixa frágil, produto refrigerado..."
              value={form.observacao}
              onChange={e => set('observacao', e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button type="button" onClick={() => navigate('/encomendas')} className="btn-secondary flex-1 justify-center">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Save size={15} /> Registrar Encomenda</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
