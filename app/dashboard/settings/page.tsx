'use client';

import { useState, useEffect } from 'react';
import { Settings, ToggleLeft, ToggleRight, Save, RefreshCw } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';

interface Setting { key: string; value: string; updated_at: number }

const SETTING_META: Record<string, { label: string; type: 'number' | 'toggle'; description: string }> = {
  limits_enabled: {
    label: 'Ограничения',
    type: 'toggle',
    description: 'Когда ВЫКЛ — все ограничения отключены, любой может создавать неограниченное количество инбоксов',
  },
  global_inbox_limit: {
    label: 'Глобальный лимит инбоксов',
    type: 'number',
    description: 'Максимальное количество активных инбоксов в любой момент времени (0 = без лимита)',
  },
  daily_ip_limit: {
    label: 'Дневной лимит по IP',
    type: 'number',
    description: 'Максимальное количество инбоксов на один IP-хэш за 24 часа',
  },
  rate_limit_per_min: {
    label: 'Лимит запросов/мин',
    type: 'number',
    description: 'Максимальное количество созданий инбоксов с одного IP в минуту',
  },
  inbox_ttl_seconds: {
    label: 'Время жизни инбокса (сек)',
    type: 'number',
    description: 'Через сколько секунд инбокс истекает (600 = 10 минут)',
  },
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, string>>({});

  const fetchSettings = async () => {
    setLoading(true);
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data.settings || []);
    const map: Record<string, string> = {};
    (data.settings || []).forEach((s: Setting) => { map[s.key] = s.value; });
    setLocalValues(map);
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    await fetchSettings();
    setSaving(null);
  };

  const handleToggle = async (key: string, currentValue: string) => {
    const newValue = currentValue === 'true' ? 'false' : 'true';
    setLocalValues(prev => ({ ...prev, [key]: newValue }));
    await handleSave(key, newValue);
  };

  if (loading) return <div className="text-[var(--muted)] text-sm">Загрузка настроек...</div>;

  const limitsEnabled = localValues['limits_enabled'] !== 'false';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <h2 className="font-display text-3xl font-light text-ink">Настройки</h2>
        </div>
        <button onClick={fetchSettings} aria-label="Обновить" className="grid min-h-11 w-11 place-items-center hover:bg-ink/[0.05] rounded-pill transition">
          <RefreshCw className="w-4 h-4 text-ink-dust" />
        </button>
      </div>

      <div className={`border rounded-lg p-5 ${limitsEnabled ? 'card-elevated' : 'bg-success/5 border-success/40'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {limitsEnabled ? (
              <ToggleRight className="w-8 h-8 text-ink-dust cursor-pointer" onClick={() => handleToggle('limits_enabled', 'true')} />
            ) : (
              <ToggleLeft className="w-8 h-8 text-success cursor-pointer" onClick={() => handleToggle('limits_enabled', 'false')} />
            )}
            <div>
              <h3 className="font-medium">Все ограничения</h3>
              <p className="text-sm text-[var(--muted)]">
                {limitsEnabled ? 'Ограничения активны — лимиты действуют' : 'Все ограничения ОТКЛЮЧЕНЫ — свободный доступ'}
              </p>
            </div>
          </div>
          <span className={`text-sm font-mono px-3 py-1 rounded-pill ${limitsEnabled ? 'bg-ink/[0.05] text-ink-mist' : 'bg-success/20 text-success'}`}>
            {limitsEnabled ? 'ВКЛ' : 'ВЫКЛ'}
          </span>
        </div>
        <button
          onClick={() => handleToggle('limits_enabled', limitsEnabled ? 'true' : 'false')}
          className={`mt-3 min-h-11 w-full py-2 rounded-pill text-sm font-medium transition ${
            limitsEnabled
              ? 'bg-danger/10 text-danger border border-danger/40 hover:bg-danger/20'
              : 'bg-success/10 text-success border border-success/40 hover:bg-success/20'
          }`}
        >
          {limitsEnabled ? 'Отключить все ограничения' : 'Включить все ограничения'}
        </button>
      </div>

      <div className="grid gap-4">
        {settings
          .filter(s => s.key !== 'limits_enabled')
          .map(setting => {
            const meta = SETTING_META[setting.key];
            if (!meta) return null;
            const currentValue = localValues[setting.key] || setting.value;

            return (
              <div key={setting.key} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{meta.label}</h3>
                    <p className="text-xs text-[var(--muted)]">{meta.description}</p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">
                    Обновлено: {formatTimestamp(setting.updated_at)}
                  </span>
                </div>

                {meta.type === 'number' && (
                  <div className="flex gap-3 items-center mt-3">
                    <input
                      type="number"
                      min="0"
                      value={currentValue}
                      onChange={e => setLocalValues(prev => ({ ...prev, [setting.key]: e.target.value }))}
                      className="w-32 bg-surface border border-border rounded-pill px-4 py-2 text-sm font-mono focus:outline-none focus:border-ink/40"
                    />
                    <button
                      onClick={() => handleSave(setting.key, currentValue)}
                      disabled={saving === setting.key}
                      className="flex items-center gap-2 min-h-11 px-5 py-2 text-sm bg-ink text-white rounded-pill uppercase tracking-[0.08em] hover:bg-[#3a3435] transition disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving === setting.key ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
