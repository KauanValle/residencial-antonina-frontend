import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NovoRegistroAguaPage() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        porteiro: user?.nome,
        porteiroId: user?.id,
        leituraManha: '',
        dataLeitura: new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        }).format(new Date()).replace(' ', 'T'),
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        setLoading(true);
        try {
            await api.post('/registro-agua', form);
            navigate('/registro-agua');
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
            <h1 className="text-xl font-bold text-slate-100">Novo Registro de Água`</h1>
            <p className="text-sm text-slate-500">Registre o registro de água</p>
            </div>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="card p-6 space-y-5">
            {/* Nome */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Porteiro <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                className="input-field"
                placeholder="Nome do porteiro"
                value={form.porteiro}
                onChange={e => set('porteiro', e.target.value)}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Leitura <span className="text-red-500">*</span>
                </label>
                <input
                type="text"
                className="input-field"
                placeholder="Valor da leitura da água"
                value={form.leituraManha}
                onChange={e => set('leituraManha', e.target.value)}
                />
            </div>

            {/* Data */}
            <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Data/Hora de Entrada <span className="text-red-500">*</span>
                </label>
                <input
                type="datetime-local"
                className="input-field"
                value={form.dataLeitura}
                onChange={e => set('dataLeitura', e.target.value)}
                />
            </div>
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
                <><Save size={15} /> Salvar o Registro</>
                )}
            </button>
            </div>
        </form>
        </div>
    );
}
