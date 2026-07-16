import React, { useEffect, useState } from 'react';
import { Newspaper, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToNews, addNews, updateNews, deleteNews } from '../services/newsService';

export const News = () => {
  const { currentUser, userNickname, isOfficer } = useAuth();
  const { t } = useLang();
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    const unsub = subscribeToNews(setNews);
    return () => unsub();
  }, []);

  const fmtDate = (ts) =>
    ts?.toDate?.().toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) || '';

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    try {
      await addNews(title.trim(), body.trim(), userNickname || currentUser?.email, currentUser?.uid);
      setTitle('');
      setBody('');
      setShowForm(false);
    } catch { alert(t('news.saveError')); }
    finally { setSaving(false); }
  };

  const startEdit = (article) => {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditBody(article.body);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim() || !editBody.trim()) return;
    try {
      await updateNews(id, { title: editTitle.trim(), body: editBody.trim() });
      setEditingId(null);
    } catch { alert(t('news.saveError')); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('news.deleteConfirm'))) return;
    try { await deleteNews(id); } catch { alert(t('news.deleteError')); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <Newspaper size={22} /> {t('news.title')}
        </h2>
        {isOfficer && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
            <Plus size={15} /> {t('news.add')}
          </button>
        )}
      </div>

      {isOfficer && showForm && (
        <div className="glass-panel mb-4">
          <form onSubmit={handlePublish}>
            <div className="input-group">
              <label>{t('news.formTitle')}</label>
              <input type="text" className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder={t('news.titlePlaceholder')} required />
            </div>
            <div className="input-group">
              <label>{t('news.formBody')}</label>
              <textarea className="input-field" rows={5} value={body} onChange={e => setBody(e.target.value)} placeholder={t('news.bodyPlaceholder')} required style={{ resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-2" disabled={saving}>
              {saving ? t('news.saving') : <><Check size={16} /> {t('news.publish')}</>}
            </button>
          </form>
        </div>
      )}

      {news.length === 0 ? (
        <div className="glass-panel">
          <p className="text-center text-muted" style={{ padding: '2rem' }}>{t('news.empty')}</p>
        </div>
      ) : (
        <div className="news-list">
          {news.map(article => (
            <article key={article.id} className="glass-panel news-card">
              {editingId === article.id ? (
                <>
                  <input type="text" className="input-field mb-2" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  <textarea className="input-field" rows={5} value={editBody} onChange={e => setEditBody(e.target.value)} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                    <button className="btn btn-sm" onClick={() => setEditingId(null)}><X size={13} /> {t('news.cancel')}</button>
                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(article.id)}><Check size={13} /> {t('news.save')}</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="news-card-head">
                    <h3 className="news-card-title">{article.title}</h3>
                    {isOfficer && (
                      <div className="news-card-actions">
                        <button className="roster-card-btn" onClick={() => startEdit(article)} title={t('news.edit')}><Edit2 size={12} /></button>
                        <button className="roster-card-btn roster-card-btn--danger" onClick={() => handleDelete(article.id)} title={t('news.delete')}><Trash2 size={12} /></button>
                      </div>
                    )}
                  </div>
                  <p className="news-card-body">{article.body}</p>
                  <div className="news-card-meta">{article.author}{article.createdAt ? ` · ${fmtDate(article.createdAt)}` : ''}</div>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
