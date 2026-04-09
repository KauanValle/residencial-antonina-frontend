import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Car, Save } from 'lucide-react';

const TIPOS_ACESSO = ['Visitante', 'Prestador de Serviço', 'Fornecedor', 'Funcionário', 'Entregador', 'Outro'];
const BLOCOS = [1,2,3,4,5,6,7,8,9,10]
const APARTAMENTOS = [11,12,13,14,21,22,23,24,31,32,33,34,41,42,43,44]

export default function NovoRegistroPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nomePessoa: '',
    tipoAcesso: '',
    bloco: '',
    apartamento: '',
    temVeiculo: false,
    modeloCarro: '',
    placa: '',
    dataEntrada: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.nomePessoa || !form.tipoAcesso) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (form.temVeiculo && (!form.modeloCarro || !form.placa)) {
      setError('Informe o modelo e a placa do veículo.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/registros', form);
      navigate('/registros');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/registros')} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Nova Entrada</h1>
          <p className="text-sm text-slate-500">Registre a entrada de uma pessoa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Nome da Pessoa <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Nome completo"
              value={form.nomePessoa}
              onChange={e => set('nomePessoa', e.target.value)}
            />
          </div>

          {/* Tipo, Bloco e Apto */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Tipo de Acesso <span className="text-red-500">*</span>
              </label>
              <select
                className="input-field"
                value={form.tipoAcesso}
                onChange={e => set('tipoAcesso', e.target.value)}
              >
                <option value="">Selecione...</option>
                {TIPOS_ACESSO.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
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

          {/* Data */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Data/Hora de Entrada <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={form.dataEntrada}
              onChange={e => set('dataEntrada', e.target.value)}
            />
          </div>

          {/* Veículo */}
          <div className="border border-slate-800 rounded-xl p-4 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={form.temVeiculo}
                  onChange={e => set('temVeiculo', e.target.checked)}
                />
                <div className="w-10 h-5 bg-slate-700 rounded-full peer-checked:bg-brand-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                <Car size={15} className="text-slate-500" />
                Possui veículo
              </span>
            </label>

            {form.temVeiculo && (
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Modelo do Carro</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Ex: Honda Civic"
                    value={form.modeloCarro}
                    onChange={e => set('modeloCarro', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Placa</label>
                  <input
                    type="text"
                    className="input-field font-mono uppercase"
                    placeholder="ABC-1234"
                    value={form.placa}
                    onChange={e => set('placa', e.target.value.toUpperCase())}
                    maxLength={8}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={() => navigate('/registros')} className="btn-secondary flex-1 justify-center">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Save size={15} /> Registrar Entrada</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
