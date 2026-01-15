import { useState, useEffect } from 'react';
import { useAnatomyStore } from '../store/anatomyStore';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { X, AlertCircle, Loader2 } from 'lucide-react';

interface PainLog {
  id: string;
  created_at: string;
  pain_level: number;
  note: string;
  body_part_id: string | null;
}

const mockLogs: Record<string, PainLog[]> = {
  Torso: [
    {
      id: 'mock-1',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 5,
      note: 'Feels stiff after sitting for long periods. Better with movement.',
      body_part_id: 'Torso',
    },
    {
      id: 'mock-2',
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 8,
      note: 'Sharp pain when bending forward. Had to rest most of the day.',
      body_part_id: 'Torso',
    },
    {
      id: 'mock-3',
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 3,
      note: 'Much better today. Mild discomfort only.',
      body_part_id: 'Torso',
    },
  ],
  Head: [
    {
      id: 'mock-4',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 6,
      note: 'Tension headache, worse in the afternoon.',
      body_part_id: 'Head',
    },
    {
      id: 'mock-5',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 4,
      note: 'Mild headache, possibly from screen time.',
      body_part_id: 'Head',
    },
  ],
  'Left Arm': [
    {
      id: 'mock-6',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 7,
      note: 'Soreness in shoulder and upper arm. Difficulty lifting.',
      body_part_id: 'Left Arm',
    },
    {
      id: 'mock-7',
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 5,
      note: 'Still sore but improving. Can lift light objects now.',
      body_part_id: 'Left Arm',
    },
  ],
  'Right Arm': [
    {
      id: 'mock-8',
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 5,
      note: 'Elbow pain, possibly from repetitive motion.',
      body_part_id: 'Right Arm',
    },
  ],
  'Left Leg': [
    {
      id: 'mock-9',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 4,
      note: 'Knee feels tight after exercise.',
      body_part_id: 'Left Leg',
    },
  ],
  'Right Leg': [
    {
      id: 'mock-10',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      pain_level: 6,
      note: 'Ankle pain after running. Slight swelling.',
      body_part_id: 'Right Leg',
    },
  ],
};

const getPainColor = (level: number) => {
  if (level >= 1 && level <= 3) return 'bg-green-100 text-green-800 border-green-200';
  if (level >= 4 && level <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function SymptomLogSidebar() {
  const { selectedPart, isSidebarOpen, clearSelection } = useAnatomyStore();
  const { user } = useAuth();
  const [painLevel, setPainLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [logs, setLogs] = useState<PainLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storeData, setStoreData] = useState(true);

  useEffect(() => {
    if (isSidebarOpen) {
      if (user) {
        loadLogs();
        loadPreferences();
      } else {
        const mockData = selectedPart ? (mockLogs[selectedPart] || []) : [];
        setLogs(mockData);
      }
    }
  }, [isSidebarOpen, user, selectedPart]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('store_data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setStoreData(data.store_data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadLogs = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (selectedPart) {
        query = query.eq('body_part_id', selectedPart);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to save your pain entries.');
      return;
    }

    setSubmitting(true);
    try {
      if (storeData) {
        const { error } = await supabase.from('logs').insert({
          user_id: user.id,
          body_part_id: selectedPart,
          pain_level: painLevel,
          note: notes,
        });

        if (error) throw error;
        await loadLogs();
      }

      setPainLevel(5);
      setNotes('');
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={`fixed top-16 right-0 h-[calc(100vh-4rem)] bg-white border-l border-slate-200 shadow-xl transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
        } w-full sm:w-[420px]`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-900">
              {selectedPart || 'General Pain Log'}
            </h2>
            <button
              onClick={clearSelection}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5 border-b border-slate-200 bg-white">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                New Entry
              </h3>
              {!user && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Sign in to save your pain entries and track your progress over time.
                  </p>
                </div>
              )}
              {user && !storeData && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    Data storage is disabled. This entry will not be saved to your history.
                  </p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pain Level
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={painLevel}
                      onChange={(e) => setPainLevel(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Mild (1)</span>
                      <span className="text-2xl font-bold text-primary">{painLevel}</span>
                      <span>Severe (10)</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How does it feel? What triggers it?"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Check-in</span>
                  )}
                </button>
              </form>
            </div>

            <div className="p-5 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                History
                {selectedPart && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    ({selectedPart})
                  </span>
                )}
              </h3>
              {!user && logs.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    Viewing sample data. Sign in to save your own pain tracking history.
                  </p>
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
              ) : logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-slate-700">
                            {formatDate(log.created_at)}
                          </span>
                          {log.body_part_id && !selectedPart && (
                            <span className="ml-2 text-xs text-slate-500">
                              ({log.body_part_id})
                            </span>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getPainColor(
                            log.pain_level || 0
                          )}`}
                        >
                          {log.pain_level}/10
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-sm text-slate-600 leading-relaxed">{log.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
                  <AlertCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">
                    {!user ? 'Click a body part to see sample data' : 'No previous entries'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 sm:hidden"
          onClick={clearSelection}
        />
      )}
    </>
  );
}
