import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Users, Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Shield, User
} from 'lucide-react';

const EMPTY_FORM = { nome: '', username: '', password: '', role: 'operator' };

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | { ...user }
  const [form, setForm] = useState(EMPTY_FORM);
  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError('');
    setShowPwd(false);
    setModal('create');
  };

  const openEdit = (u) => {
    setForm({ nome: u.nome, username: u.username, password: '', role: u.role });
    setError('');
    setShowPwd(false);
    setModal(u);
  };

  const closeModal = () => { setModal(null); setError(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const isCreate = modal === 'create';
      if (isCreate) {
        if (!form.password) { setError('Senha obrigatória.'); setSaving(false); return; }
        await api.post('/users', form);
      } else {
        const data = { nome: form.nome, username: form.username, role: form.role };
        if (form.password) data.password = form.password;
        await api.put(`/users/${modal.id}`, data);
      }
      await fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir.');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users size={20} className="text-brand-400" />
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Shield size={11} className="text-brand-500" />
            Área restrita — somente administradores
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/80">
              {['Nome', 'Username', 'Cargo', 'Criado em', 'Ações'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </div>
                </td>
              </tr>
            ) : users.map(u => (
              <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-200">{u.nome}</span>
                    {u.id === currentUser.id && (
                      <span className="text-xs text-slate-600 font-mono">(você)</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-slate-400">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={u.role === 'admin' ? 'badge-admin' : 'badge-operator'}>
                    {u.role === 'admin' ? 'Admin' : 'Operador'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-brand-900/30 transition-all"
                    >
                      <Pencil size={14} />
                    </button>
                    {u.id !== currentUser.id && (
                      <button
                        onClick={() => setDeleteConfirm(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <User size={16} className="text-brand-400" />
                {modal === 'create' ? 'Novo Usuário' : `Editar: ${modal.nome}`}
              </h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Nome completo</label>
                <input type="text" className="input-field" value={form.nome} onChange={e => set('nome', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Username</label>
                <input type="text" className="input-field font-mono" value={form.username} onChange={e => set('username', e.target.value)} required />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  {modal === 'create' ? 'Senha' : 'Nova senha (deixe em branco para manter)'}
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="input-field pr-10"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    required={modal === 'create'}
                  />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Cargo</label>
                <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2.5 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeModal} className="btn-secondary flex-1 justify-center">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><Save size={14} /> Salvar</>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6">
            <h2 className="font-semibold text-slate-100 mb-2">Excluir usuário</h2>
            <p className="text-sm text-slate-400 mb-5">
              Tem certeza que deseja excluir <strong className="text-slate-200">{deleteConfirm.nome}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger flex-1 justify-center">
                <Trash2 size={14} /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
