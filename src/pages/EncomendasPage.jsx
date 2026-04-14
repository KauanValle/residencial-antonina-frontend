import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Package, Plus, Search, X, ChevronLeft, ChevronRight,
  Camera, CheckCircle, Clock, User, Building2, CameraOff, RotateCcw, Save
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

export default function EncomendasPage() {
  const navigate = useNavigate();
  const [encomendas, setEncomendas] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ destinatario: '', status: '', bloco: '' });
  const [loading, setLoading] = useState(true);

  // Modal retirada
  const [modalRetirada, setModalRetirada] = useState(null);
  const [retiradaForm, setRetiradaForm] = useState({ retiradaPor: '', selfieRetirada: '' });
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroModal, setErroModal] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const fetchEncomendas = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/encomendas', { params });
      setEncomendas(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchEncomendas(1); }, [fetchEncomendas]);

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  };

  // --- Camera ---
  const iniciarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // ADICIONE ISSO: Força o vídeo a começar a rodar
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error("Erro ao dar play:", e));
        };
      }
      setCameraAtiva(true);
    } catch (err) {
      console.error(err);
      alert('Não foi possível acessar a câmera.');
    }
  };

  const pararCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraAtiva(false);
  };

  useEffect(() => {
    if (cameraAtiva && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraAtiva]); // Executa sempre que a câmera é ligada no estado

  const tirarFoto = () => {
    const video = videoRef.current;
    
    // Garante que o vídeo tem dimensões reais
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;
  
    if (width === 0 || height === 0) {
      alert('Câmera ainda carregando, tente novamente.');
      return;
    }
  
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, width, height);
    
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    
    // Verifica se capturou algo válido
    if (base64 === 'data:,' || base64.length < 1000) {
      alert('Erro ao capturar imagem. Tente novamente.');
      return;
    }
  
    setSelfiePreview(base64);
    setRetiradaForm(f => ({ ...f, selfieRetirada: base64 }));
    pararCamera();
  };

  // const resetarFoto = () => {
  //   setSelfiePreview(null);
  //   setRetiradaForm(f => ({ ...f, selfieRetirada: '' }));
  // };

  const abrirModal = (encomenda) => {
    setModalRetirada(encomenda);
    setRetiradaForm({ retiradaPor: '', selfieRetirada: '' });
    setSelfiePreview(null);
    setErroModal('');
    setCameraAtiva(false);
  };

  const fecharModal = () => {
    pararCamera();
    setModalRetirada(null);
    setSelfiePreview(null);
  };

  const handleRetirada = async () => {
    if (!retiradaForm.retiradaPor.trim()) {
      setErroModal('Informe o nome de quem está retirando.');
      return;
    }
    setSalvando(true);
    setErroModal('');
    try {
      await api.patch(`/encomendas/${modalRetirada.id}/retirada`, retiradaForm);
      fecharModal();
      fetchEncomendas(pagination.page);
    } catch (err) {
      setErroModal(err.response?.data?.error || 'Erro ao registrar retirada.');
    } finally {
      setSalvando(false);
    }
  };

  const hasFilters = filters.destinatario || filters.status || filters.bloco;
  const clearFilters = () => setFilters({ destinatario: '', status: '', bloco: '' });

  const sigCanvas = useRef({});
  const [imageURL, setImageURL] = useState(null);

  // Limpa o desenho
  const limpar = () => sigCanvas.current.clear();

  // Salva a imagem no formato Base64 (pode enviar para o banco de dados)
  const salvar = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Por favor, forneça uma assinatura primeiro.");
      return;
    }
  
    // Em vez de usar getTrimmedCanvas(), acessamos o canvas diretamente
    const canvas = sigCanvas.current.getCanvas();
    
    // Se você realmente precisar "trimmar" (remover espaços vazios), 
    // pode salvar o canvas inteiro primeiro:
    const data = canvas.toDataURL('image/png');
    
    setImageURL(data);
    setRetiradaForm(f => ({ ...f, selfieRetirada: data }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Package size={20} className="text-brand-400" />
            Encomendas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{pagination.total} encomenda(s) encontrada(s)</p>
        </div>
        <button onClick={() => navigate('/encomendas/nova')} className="btn-primary">
          <Plus size={16} />
          Nova Encomenda
        </button>
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1.5">Destinatário</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                className="input-field pl-9"
                placeholder="Nome do morador..."
                value={filters.destinatario}
                onChange={e => setFilters(f => ({ ...f, destinatario: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Bloco</label>
            <input
              type="text"
              className="input-field w-28"
              placeholder="Bloco..."
              value={filters.bloco}
              onChange={e => setFilters(f => ({ ...f, bloco: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5">Status</label>
            <select
              className="input-field"
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="retirada">Retirada</option>
            </select>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary">
              <X size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Tabela desktop */}
      <div className="card overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {['Destinatário', 'Bloco/Apto', 'Chegada', 'Itens', 'Status', 'Retirado por', 'Porteiro', 'Ação', 'Assinatura'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </div>
                </td></tr>
              ) : encomendas.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-600">Nenhuma encomenda encontrada.</td></tr>
              ) : encomendas.map(e => (
                <tr key={e.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-200">{e.destinatario}</td>
                  <td className="px-4 py-3 text-slate-400">
                    <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">Bl {e.bloco}</span>
                    {' '}
                    <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded">Ap {e.apartamento}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{fmtDate(e.horarioChegada)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
                      {e.quantidadeItens}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === 'retirada'
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-400"><CheckCircle size={11} /> Retirada</span>
                      : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-900/50 text-amber-400"><Clock size={11} /> Pendente</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {e.retiradaPor
                      ? <span className="flex items-center gap-1"><User size={11} />{e.retiradaPor}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><User size={11} />{e.criadoPor?.nome}</span>
                  </td>
                  <td className="px-4 py-3">
                    {e.status === 'pendente' && (
                      <button
                        onClick={() => abrirModal(e)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 transition-all"
                      >
                        <CheckCircle size={12} /> Registrar Retirada
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><img src={e.selfieRetirada} className="w-24 h-16"/> </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
            <span className="text-xs text-slate-500">Página {pagination.page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetchEncomendas(pagination.page - 1)} disabled={pagination.page === 1} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"><ChevronLeft size={16} /></button>
              <button onClick={() => fetchEncomendas(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30 transition-all"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Cards mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="card p-8 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /> Carregando...
            </div>
          </div>
        ) : encomendas.length === 0 ? (
          <div className="card p-8 text-center text-slate-600">Nenhuma encomenda encontrada.</div>
        ) : encomendas.map(e => (
          <div key={e.id} className="card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-100">{e.destinatario}</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Bl {e.bloco}</span>
                  <span className="font-mono text-xs bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Ap {e.apartamento}</span>
                </div>
              </div>
              {e.status === 'retirada'
                ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-400 shrink-0"><CheckCircle size={11} /> Retirada</span>
                : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-900/50 text-amber-400 shrink-0"><Clock size={11} /> Pendente</span>
              }
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800/60 rounded-lg p-2.5">
                <p className="text-slate-500 mb-0.5">Chegada</p>
                <p className="font-mono text-slate-300">{fmtDate(e.horarioChegada)}</p>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-2.5">
                <p className="text-slate-500 mb-0.5">Itens</p>
                <p className="text-slate-300 font-bold">{e.quantidadeItens}</p>
              </div>
            </div>

            {e.observacao && (
              <p className="text-xs text-slate-500 bg-slate-800/40 rounded-lg px-3 py-2">{e.observacao}</p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-800">
              <div className="text-xs text-slate-500 flex items-center gap-1">
                <User size={11} />
                {e.retiradaPor ? <span className="text-slate-300">{e.retiradaPor}</span> : 'Não retirado'}
              </div>
              {e.status === 'pendente' && (
                <button
                  onClick={() => abrirModal(e)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 transition-all"
                >
                  <CheckCircle size={12} /> Registrar Retirada
                </button>
              )}
            </div>
          </div>
        ))}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-1 py-2">
            <span className="text-xs text-slate-500">Página {pagination.page} de {pagination.totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => fetchEncomendas(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <button onClick={() => fetchEncomendas(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Retirada */}
      {modalRetirada && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-slate-100 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-400" />
                Registrar Retirada
              </h2>
              <button onClick={fecharModal} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"><X size={16} /></button>
            </div>

            {/* Info da encomenda */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-5 text-sm">
              <p className="font-medium text-slate-200">{modalRetirada.destinatario}</p>
              <p className="text-slate-500 text-xs mt-0.5">Bloco {modalRetirada.bloco} · Apto {modalRetirada.apartamento} · {modalRetirada.quantidadeItens} item(s)</p>
            </div>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Nome de quem retirou <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome completo"
                  value={retiradaForm.retiradaPor}
                  onChange={e => setRetiradaForm(f => ({ ...f, retiradaPor: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Selfie */}
              {/* <div>
                <label className="block text-xs font-medium text-slate-400 mb-2">
                  Selfie <span className="text-slate-600">(opcional)</span>
                </label>

                {!selfiePreview && !cameraAtiva && (
                  <button
                    type="button"
                    onClick={iniciarCamera}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-slate-700 hover:border-brand-500 text-slate-500 hover:text-brand-400 transition-all text-sm"
                  >
                    <Camera size={16} />
                    Tirar selfie
                  </button>
                )}

                {cameraAtiva && (
                  <div className="space-y-2">
                    <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg"
                      onLoadedMetadata={() => {
                        // Força o play após metadados carregados
                        videoRef.current?.play();
                      }}
                    /> 
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={pararCamera} className="btn-secondary flex-1 justify-center">
                        <CameraOff size={14} /> Cancelar
                      </button>
                      <button type="button" onClick={tirarFoto} className="btn-primary flex-1 justify-center">
                        <Camera size={14} /> Capturar
                      </button>
                    </div>
                  </div>
                )}

                {selfiePreview && (
                  <div className="space-y-2">
                    <img src={selfiePreview} alt="Selfie" className="w-full rounded-lg border border-slate-700" />
                    <button type="button" onClick={resetarFoto} className="btn-secondary w-full justify-center">
                      <RotateCcw size={14} /> Tirar novamente
                    </button>
                  </div>
                )}
              </div> */}

              {/* Assinatura Digital */}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px' }}>
                <h3>Assinatura Digital</h3>
                
                <div style={{ border: '2px dashed #ccc', borderRadius: '8px', background: '#f9f9f9' }}>
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      width: 350,
                      height: 200,
                      className: 'signature-canvas'
                    }}
                    penColor="#888"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={limpar} style={btnStyle}>Limpar</button>
                  <button onClick={salvar} style={{ ...btnStyle, backgroundColor: '#007bff', color: 'white' }}>Salvar Assinatura</button>
                </div>

                {imageURL && (
                  <div style={{ marginTop: '20px' }}>
                    <p>Preview da assinatura salva:</p>
                    <img src={imageURL} alt="Assinatura" style={{ border: '1px solid #000', maxWidth: '100%' }} />
                  </div>
                )}
              </div>

              {erroModal && (
                <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-3 py-2.5 rounded-lg">
                  {erroModal}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={fecharModal} className="btn-secondary flex-1 justify-center">Cancelar</button>
              <button onClick={handleRetirada} disabled={salvando} className="btn-primary flex-1 justify-center">
                {salvando
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Save size={14} /> Confirmar Retirada</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  cursor: 'pointer',
  borderRadius: '5px',
  border: '1px solid #ccc'
};
