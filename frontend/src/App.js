import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from './config';

// Пресет: Клиент, который скоро уйдёт (Высокая вероятность оттока)
const churnPreset = {
  Gender: 'Female',
  SeniorCitizen: 0,
  Partner: 'No',
  Dependents: 'No',
  Tenure: 1, // Новичок (1 месяц)
  PhoneService: 'Yes',
  MultipleLines: 'No',
  InternetService: 'Fiber optic', // Дорогой интернет
  OnlineSecurity: 'No',
  OnlineBackup: 'No',
  DeviceProtection: 'No',
  TechSupport: 'No',
  StreamingTV: 'Yes',
  StreamingMovies: 'Yes',
  Contract: 'Month-to-month', // Помесячная оплата без обязательств
  PaperlessBilling: 'Yes',
  PaymentMethod: 'Electronic check',
  MonthlyCharges: 95.5,
  TotalCharges: 95.5
};

// Пресет: Лояльный клиент (Низкая вероятность оттока)
const stayPreset = {
  Gender: 'Male',
  SeniorCitizen: 0,
  Partner: 'Yes',
  Dependents: 'Yes',
  Tenure: 60, // Старый клиент (5 лет)
  PhoneService: 'Yes',
  MultipleLines: 'Yes',
  InternetService: 'DSL',
  OnlineSecurity: 'Yes',
  OnlineBackup: 'Yes',
  DeviceProtection: 'Yes',
  TechSupport: 'Yes',
  StreamingTV: 'No',
  StreamingMovies: 'No',
  Contract: 'Two year', // Долгосрочный контракт на 2 года
  PaperlessBilling: 'No',
  PaymentMethod: 'Credit card (automatic)',
  MonthlyCharges: 65.0,
  TotalCharges: 3900.0
};

export default function App() {
  const [formData, setFormData] = useState(stayPreset);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData(preset);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // Подготавливаем payload со строгим приведением типов к Pydantic-схеме
    const payload = {
      ...formData,
      SeniorCitizen: Number(formData.SeniorCitizen),
      Tenure: Number(formData.Tenure),
      MonthlyCharges: Number(formData.MonthlyCharges),
      TotalCharges: Number(formData.TotalCharges)
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, payload);
      setResult(response.data);
    } catch (err) {
      if (err.response) {
        const errorDetail = err.response.data?.detail;
        
        // Если FastAPI вернул ошибку валидации 422 (массив объектов)
        if (Array.isArray(errorDetail)) {
          const formattedMsg = errorDetail
            .map((item) => `${item.loc?.[item.loc.length - 1] || 'поле'}: ${item.msg}`)
            .join(' | ');
          setError(formattedMsg);
        } else if (typeof errorDetail === 'object') {
          setError(JSON.stringify(errorDetail));
        } else {
          setError(errorDetail || `Ошибка сервера (${err.response.status})`);
        }
      } else if (err.request) {
        setError('Не удалось связаться с сервером. Проверьте, запущен ли бэкенд на http://localhost:8000');
      } else {
        setError(err.message || 'Произошла неизвестная ошибка');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        body { background-color: #f4f6f8; color: #333; }
        .container { max-width: 900px; margin: 40px auto; padding: 0 20px; }
        
        /* Шапка с кнопкой исходного кода */
        .top-bar { display: flex; justify-content: flex-end; margin-bottom: 16px; }
        .btn-source {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; background-color: #24292e; color: white;
          border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none;
          transition: background 0.2s, transform 0.1s;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .btn-source:hover { background-color: #2f363d; transform: translateY(-1px); }

        .card { background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        h1 { font-size: 24px; font-weight: 700; color: #1a202c; margin-bottom: 8px; }
        p.subtitle { font-size: 14px; color: #718096; margin-bottom: 20px; }
        
        .presets-bar { display: flex; gap: 12px; margin-bottom: 24px; }
        .btn-preset {
          padding: 8px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1px solid transparent; transition: all 0.2s;
        }
        .btn-preset-stay { background-color: #e6fffa; color: #234e52; border-color: #b2f5ea; }
        .btn-preset-stay:hover { background-color: #b2f5ea; }
        .btn-preset-churn { background-color: #fff5f5; color: #742a2a; border-color: #fed7d7; }
        .btn-preset-churn:hover { background-color: #fed7d7; }

        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        label { font-size: 13px; font-weight: 600; color: #4a5568; }
        input, select {
          padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px;
          font-size: 14px; background-color: #f8fafc; transition: all 0.2s;
        }
        input:focus, select:focus {
          outline: none; border-color: #3182ce; background-color: #fff;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
        }
        
        .btn-submit {
          grid-column: 1 / -1; margin-top: 16px; padding: 12px;
          background-color: #3182ce; color: white; border: none; border-radius: 6px;
          font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.2s;
        }
        .btn-submit:hover { background-color: #2b6cb0; }
        .btn-submit:disabled { background-color: #a0aec0; cursor: not-allowed; }

        .result-box {
          margin-top: 24px; padding: 20px; border-radius: 8px;
          font-size: 15px; font-weight: 500; line-height: 1.5;
        }
        .result-box.stay { background-color: #f0fff4; border: 1px solid #c6f6d5; color: #22543d; }
        .result-box.leave { background-color: #fff5f5; border: 1px solid #fed7d7; color: #742a2a; }
        .error-box { margin-top: 24px; padding: 16px; background-color: #fff5f5; border: 1px solid #feb2b2; color: #9b2c2c; border-radius: 8px; word-break: break-word; }
      `}</style>

      {/* Кнопка ссылки на исходный код */}
      <div className="top-bar">
        <a 
          href="https://github.com/wisetree228/first_ml_project" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-source"
        >
          📂 Исходный код проекта (GitHub)
        </a>
      </div>

      <div className="card">
        <h1>Прогноз оттока клиента (Telco Churn)</h1>
        <p className="subtitle">Заполните данные пользователя или выберите готовый тестовый сценарий</p>

        {/* Кнопки автоматического заполнения пресетов */}
        <div className="presets-bar">
          <button
            type="button"
            className="btn-preset btn-preset-stay"
            onClick={() => handleApplyPreset(stayPreset)}
          >
            Заполнить: Лояльный клиент (Останется)
          </button>
          <button
            type="button"
            className="btn-preset btn-preset-churn"
            onClick={() => handleApplyPreset(churnPreset)}
          >
            Заполнить: Клиент из группы риска (Уйдёт)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          {/* Личные данные */}
          <div className="form-group">
            <label>Пол (Gender)</label>
            <select name="Gender" value={formData.Gender} onChange={handleChange}>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
            </select>
          </div>

          <div className="form-group">
            <label>Пенсионер (SeniorCitizen)</label>
            <select name="SeniorCitizen" value={formData.SeniorCitizen} onChange={handleChange}>
              <option value={0}>Нет (0)</option>
              <option value={1}>Да (1)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Есть партнер (Partner)</label>
            <select name="Partner" value={formData.Partner} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Есть иждивенцы (Dependents)</label>
            <select name="Dependents" value={formData.Dependents} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Срок контракта в мес. (Tenure)</label>
            <input type="number" name="Tenure" min="0" value={formData.Tenure} onChange={handleChange} required />
          </div>

          {/* Услуги связи */}
          <div className="form-group">
            <label>Телефонная связь (PhoneService)</label>
            <select name="PhoneService" value={formData.PhoneService} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Несколько линий (MultipleLines)</label>
            <select name="MultipleLines" value={formData.MultipleLines} onChange={handleChange}>
              <option value="No phone service">No phone service</option>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>

          <div className="form-group">
            <label>Интернет (InternetService)</label>
            <select name="InternetService" value={formData.InternetService} onChange={handleChange}>
              <option value="DSL">DSL</option>
              <option value="Fiber optic">Fiber optic</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Защита в сети (OnlineSecurity)</label>
            <select name="OnlineSecurity" value={formData.OnlineSecurity} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Облачный бэкап (OnlineBackup)</label>
            <select name="OnlineBackup" value={formData.OnlineBackup} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Защита устройств (DeviceProtection)</label>
            <select name="DeviceProtection" value={formData.DeviceProtection} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Техподдержка (TechSupport)</label>
            <select name="TechSupport" value={formData.TechSupport} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Стриминг TV (StreamingTV)</label>
            <select name="StreamingTV" value={formData.StreamingTV} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Стриминг фильмов (StreamingMovies)</label>
            <select name="StreamingMovies" value={formData.StreamingMovies} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Yes">Yes</option>
              <option value="No internet service">No internet service</option>
            </select>
          </div>

          {/* Финансовые данные */}
          <div className="form-group">
            <label>Тип контракта (Contract)</label>
            <select name="Contract" value={formData.Contract} onChange={handleChange}>
              <option value="Month-to-month">Month-to-month</option>
              <option value="One year">One year</option>
              <option value="Two year">Two year</option>
            </select>
          </div>

          <div className="form-group">
            <label>Электронный чек (PaperlessBilling)</label>
            <select name="PaperlessBilling" value={formData.PaperlessBilling} onChange={handleChange}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="form-group">
            <label>Способ оплаты (PaymentMethod)</label>
            <select name="PaymentMethod" value={formData.PaymentMethod} onChange={handleChange}>
              <option value="Electronic check">Electronic check</option>
              <option value="Mailed check">Mailed check</option>
              <option value="Bank transfer (automatic)">Bank transfer (automatic)</option>
              <option value="Credit card (automatic)">Credit card (automatic)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ежемесячный платеж (MonthlyCharges)</label>
            <input type="number" step="0.01" name="MonthlyCharges" value={formData.MonthlyCharges} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Суммарный платеж (TotalCharges)</label>
            <input type="number" step="0.01" name="TotalCharges" value={formData.TotalCharges} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Расчет прогноза...' : 'Получить прогноз'}
          </button>
        </form>

        {error && (
          <div className="error-box">
            <strong>Ошибка валидации / запроса:</strong> {error}
          </div>
        )}

        {result && (
          <div className={`result-box ${result.churn_probability >= 0.5 ? 'leave' : 'stay'}`}>
            {result.text}
          </div>
        )}
      </div>
    </div>
  );
}