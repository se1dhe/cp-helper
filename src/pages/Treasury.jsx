import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addTransaction, subscribeToTransactions } from '../services/treasuryService';
import { Coins, Gem, TrendingUp, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const Treasury = () => {
  const { currentUser, isOfficer } = useAuth();
  const [data, setData] = useState({ transactions: [], totalAdena: 0, totalMC: 0 });
  const [exchangeRate, setExchangeRate] = useState(29000);

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('adena');
  const [type, setType] = useState('income');
  const [member, setMember] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToTransactions(setData);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !member) return;

    try {
      await addTransaction({
        amount: Number(amount),
        currency,
        type,
        member,
        description,
        addedBy: currentUser.displayName,
        addedById: currentUser.uid
      });
      setAmount('');
      setDescription('');
    } catch (error) {
      console.error(error);
      alert('Ошибка при добавлении транзакции');
    }
  };

  const formatNumber = (num) => new Intl.NumberFormat('ru-RU').format(num);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="page-title" style={{ marginBottom: 0 }}>
          <Coins size={22} /> Казна
        </h2>
        <div className="flex items-center gap-2" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.4rem 0.75rem'
        }}>
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Курс MC:</span>
          <input
            type="number"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="input-field"
            style={{ width: '90px', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
          />
          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Адены</span>
        </div>
      </div>

      <div className="stat-cards">
        <div className="stat-card stat-card--gold">
          <div className="stat-card-icon stat-card-icon--gold"><Coins size={20} /></div>
          <div className="stat-card-label">Адена</div>
          <div className="stat-card-value">{formatNumber(data.totalAdena)}</div>
        </div>
        <div className="stat-card stat-card--blue">
          <div className="stat-card-icon stat-card-icon--blue"><Gem size={20} /></div>
          <div className="stat-card-label">Master Coins</div>
          <div className="stat-card-value">{formatNumber(data.totalMC)}</div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-card-icon stat-card-icon--green"><TrendingUp size={20} /></div>
          <div className="stat-card-label">Всего в адене</div>
          <div className="stat-card-value">{formatNumber(data.totalAdena + (data.totalMC * exchangeRate))}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="glass-panel">
          <h3 className="section-header mb-4">История транзакций</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Мембер</th>
                  <th>Сумма</th>
                  <th>Валюта</th>
                  <th>Описание</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map(t => (
                  <tr key={t.id}>
                    <td className="text-secondary">{t.timestamp?.toDate().toLocaleDateString('ru-RU') || '...'}</td>
                    <td>{t.member}</td>
                    <td style={{ fontWeight: 700 }}>
                      <span className="flex items-center gap-1">
                        {t.type === 'income'
                          ? <><ArrowUpCircle size={14} className="text-success" /> <span className="text-success">+{formatNumber(t.amount)}</span></>
                          : <><ArrowDownCircle size={14} className="text-danger" /> <span className="text-danger">-{formatNumber(t.amount)}</span></>
                        }
                      </span>
                    </td>
                    <td className="text-secondary">{t.currency.toUpperCase()}</td>
                    <td className="text-muted">{t.description || '—'}</td>
                  </tr>
                ))}
                {data.transactions.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted" style={{ padding: '2rem' }}>
                      Нет транзакций
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isOfficer ? (
          <div className="glass-panel">
            <h3 className="section-header mb-4"><Plus size={16} /> Добавить запись</h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Тип</label>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input-field">
                  <option value="income">Взнос (Приход)</option>
                  <option value="expense">Трата (Расход)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Мембер</label>
                <input type="text" value={member} onChange={(e) => setMember(e.target.value)} className="input-field" placeholder="Ник персонажа" required />
              </div>
              <div className="flex gap-2">
                <div className="input-group" style={{ flex: 1 }}>
                  <label>Сумма</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" required />
                </div>
                <div className="input-group" style={{ width: '90px' }}>
                  <label>Валюта</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                    <option value="adena">Adena</option>
                    <option value="mc">MC</option>
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Описание</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Сет Кармиана, BSPS..." />
              </div>
              <button type="submit" className="btn btn-primary btn-block mt-2">
                {type === 'income' ? <><ArrowUpCircle size={16} /> Внести в казну</> : <><ArrowDownCircle size={16} /> Списать из казны</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="glass-panel flex items-center justify-center text-center">
            <p className="text-muted">У вас нет прав для добавления записей в казну.</p>
          </div>
        )}
      </div>
    </div>
  );
};
