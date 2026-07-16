import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { addTransaction, subscribeToTransactions } from '../services/treasuryService';
import { subscribeToRoster } from '../services/rosterService';
import { Coins, Gem, TrendingUp, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const Treasury = () => {
  const { currentUser, isOfficer } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState({ transactions: [], totalAdena: 0, totalMC: 0 });
  const [roster, setRoster] = useState([]);
  const [exchangeRate, setExchangeRate] = useState(29000);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('adena');
  const [type, setType] = useState('income');
  const [member, setMember] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubTx = subscribeToTransactions(setData);
    const unsubRoster = subscribeToRoster(setRoster);
    return () => { unsubTx(); unsubRoster(); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !member || submitting) return;

    setSubmitting(true);
    try {
      const selectedSlot = roster.find(s => s.name === member);
      await addTransaction({
        amount: Number(amount),
        currency,
        type,
        member,
        memberId: selectedSlot?.userId || '',
        description,
        addedBy: currentUser.displayName,
        addedById: currentUser.uid
      });
      setAmount('');
      setDescription('');
      setMember('');
    } catch (error) {
      console.error(error);
      alert(t('treasury.addError'));
    } finally {
      setSubmitting(false);
    }
  };

  const rosterMembers = roster.filter(s => s.name && s.name !== '—');

  const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <Coins size={22} /> {t('treasury.title')}
        </h2>
        <div className="flex items-center gap-2" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.75rem'
        }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t('treasury.rate')}</span>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="input-field"
            style={{ width: '90px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
          />
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>{t('treasury.adena').toLowerCase()}</span>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <div className="stat-card-icon stat-card-icon--gold"><Coins size={20} /></div>
          <div className="stat-card-label">{t('treasury.adena')}</div>
          <div className="stat-card-value">{formatNumber(data.totalAdena)}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card-icon stat-card-icon--blue"><Gem size={20} /></div>
          <div className="stat-card-label">{t('treasury.mc')}</div>
          <div className="stat-card-value">{formatNumber(data.totalMC)}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card-icon stat-card-icon--green"><TrendingUp size={20} /></div>
          <div className="stat-card-label">{t('treasury.totalInAdena')}</div>
          <div className="stat-card-value">{formatNumber(data.totalAdena + (data.totalMC * exchangeRate))}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="glass-panel">
          <h3 className="section-header mb-4">{t('treasury.history')}</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('treasury.date')}</th>
                  <th>{t('treasury.member')}</th>
                  <th>{t('treasury.sum')}</th>
                  <th>{t('treasury.currency')}</th>
                  <th>{t('treasury.description')}</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="text-secondary">{tx.timestamp?.toDate().toLocaleDateString('ru-RU') || '...'}</td>
                    <td>{tx.member}</td>
                    <td style={{ fontWeight: 700 }}>
                      <span className="flex items-center gap-1">
                        {tx.type === 'income'
                          ? <><ArrowUpCircle size={14} className="text-success" /> <span className="text-success">+{formatNumber(tx.amount)}</span></>
                          : <><ArrowDownCircle size={14} className="text-danger" /> <span className="text-danger">-{formatNumber(tx.amount)}</span></>
                        }
                      </span>
                    </td>
                    <td className="text-secondary">{tx.currency.toUpperCase()}</td>
                    <td className="text-muted">{tx.description || '—'}</td>
                  </tr>
                ))}
                {data.transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                      {t('treasury.noTransactions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isOfficer ? (
          <div className="glass-panel">
            <h3 className="section-header mb-4"><Plus size={16} /> {t('treasury.addRecord')}</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>{t('treasury.type')}</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                  <option value="income">{t('treasury.income')}</option>
                  <option value="expense">{t('treasury.expense')}</option>
                </select>
              </div>
              <div className="input-group">
                <label>{t('treasury.member')}</label>
                <select value={member} onChange={(e) => setMember(e.target.value)} className="input-field" required>
                  <option value="">{t('treasury.memberPlaceholder')}</option>
                  {rosterMembers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>{t('treasury.amount')}</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" required />
                </div>
                <div className="input-group" style={{ width: '90px' }}>
                  <label>{t('treasury.currency')}</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                    <option value="adena">Adena</option>
                    <option value="mc">MC</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>{t('treasury.description')}</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder={t('treasury.descriptionPlaceholder')} />
              </div>
              <button type="submit" className="btn btn-primary btn-block mt-2" disabled={submitting}>
                {submitting ? t('treasury.saving') : (type === 'income' ? <><ArrowUpCircle size={16} /> {t('treasury.submitIncome')}</> : <><ArrowDownCircle size={16} /> {t('treasury.submitExpense')}</>)}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel flex items-center justify-center text-center">
            <p className="text-muted">{t('treasury.noPermission')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
