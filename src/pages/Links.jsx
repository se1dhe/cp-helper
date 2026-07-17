import React, { useEffect, useMemo, useState } from 'react';
import { Link2, Plus, Trash2, ExternalLink, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { subscribeToLinks, addLink, deleteLink, seedDefaultLinks } from '../services/linksService';
import { openExternal } from '../utils/openExternal';

const DEFAULT_LINKS = [
  { category: 'Вики Lu4', title: 'Lu4 Wiki — главная', url: 'https://masterwork.wiki/lu4', description: 'Официальная вики сервера' },
  { category: 'Вики Lu4', title: 'Квесты 1-19 (стартовые локации)', url: 'https://masterwork.wiki/lu4/posts/post/365-lu4-quests-in-starter-zones-1-19', description: 'Все квесты 1-19 с наградами' },
  { category: 'Вики Lu4', title: 'Квесты 40-60', url: 'https://masterwork.wiki/lu4/posts/post/377-lu4-quests-40-60', description: 'Квесты после 40' },
  { category: 'Вики Lu4', title: 'Апгрейд Ng/D экипировки', url: 'https://masterwork.wiki/posts/post/364-ngd-equipment-upgrade', description: 'Улучшение оружия/брони/бижи' },
  { category: 'Базы данных', title: 'L2Hub — база квестов и предметов', url: 'https://l2hub.info', description: 'Квесты, предметы, дроп/спойл' },
  { category: 'Инструменты', title: 'Калькулятор крафта (Telegram-бот)', url: 'https://github.com/se1dhe/lineage2-bot', description: 'Полный калькулятор крафта по рецептам' },
];

export const Links = () => {
  const { isOfficer } = useAuth();
  const { t } = useLang();
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLinks(setLinks);
    return () => unsub();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const l of links) {
      const c = l.category || t('links.other');
      if (!map.has(c)) map.set(c, []);
      map.get(c).push(l);
    }
    return [...map.entries()];
  }, [links, t]);

  const host = (url) => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      await addLink(form.title.trim(), form.url.trim(), form.description.trim(), form.category.trim());
      setForm({ title: '', url: '', category: '', description: '' });
      setShowForm(false);
    } catch { alert(t('links.saveError')); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('links.deleteConfirm'))) return;
    try { await deleteLink(id); } catch { alert(t('links.deleteError')); }
  };

  const handleSeed = async () => {
    try { await seedDefaultLinks(DEFAULT_LINKS); } catch { alert(t('links.saveError')); }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}><Link2 size={22} /> {t('links.title')}</h2>
        {isOfficer && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(s => !s)}>
            <Plus size={15} /> {t('links.add')}
          </button>
        )}
      </div>

      {isOfficer && showForm && (
        <div className="glass-panel mb-4">
          <form onSubmit={handleAdd}>
            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
              <div className="input-group" style={{ flex: 2, minWidth: '160px' }}>
                <label>{t('links.formTitle')}</label>
                <input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="input-group" style={{ flex: 1, minWidth: '120px' }}>
                <label>{t('links.formCategory')}</label>
                <input className="input-field" list="link-cats" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder={t('links.other')} />
                <datalist id="link-cats">{grouped.map(([c]) => <option key={c} value={c} />)}</datalist>
              </div>
            </div>
            <div className="input-group">
              <label>{t('links.formUrl')}</label>
              <input className="input-field" type="url" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." required />
            </div>
            <div className="input-group">
              <label>{t('links.formDesc')}</label>
              <input className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder={t('links.descPlaceholder')} />
            </div>
            <button type="submit" className="btn btn-primary btn-block mt-2" disabled={saving}>
              <Check size={16} /> {saving ? t('links.saving') : t('links.save')}
            </button>
          </form>
        </div>
      )}

      {links.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="text-muted" style={{ marginBottom: isOfficer ? '1rem' : 0 }}>{t('links.empty')}</p>
          {isOfficer && (
            <button className="btn btn-primary" onClick={handleSeed}>
              <Plus size={16} /> {t('links.loadDefaults')}
            </button>
          )}
        </div>
      ) : (
        grouped.map(([category, items]) => (
          <div key={category} className="links-group">
            <h3 className="section-header">{category}</h3>
            <div className="links-grid">
              {items.map(l => (
                <div key={l.id} className="link-card" onClick={() => openExternal(l.url)}>
                  <div className="link-card-top">
                    <ExternalLink size={14} className="link-card-icon" />
                    <span className="link-card-title">{l.title}</span>
                    {isOfficer && (
                      <button className="link-card-del" onClick={(e) => { e.stopPropagation(); handleDelete(l.id); }} title={t('links.delete')}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                  {l.description && <p className="link-card-desc">{l.description}</p>}
                  <span className="link-card-host">{host(l.url)}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};
