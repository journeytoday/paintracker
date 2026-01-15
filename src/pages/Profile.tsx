import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  User,
  Shield,
  Trash2,
  AlertTriangle,
  CheckCircle,
  X,
  Database,
} from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  isDangerous?: boolean;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  isDangerous = true,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-full ${
                  isDangerous ? 'bg-red-100' : 'bg-yellow-100'
                }`}
              >
                <AlertTriangle
                  className={`h-6 w-6 ${
                    isDangerous ? 'text-red-600' : 'text-yellow-600'
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <p className="text-slate-600 mb-6">{description}</p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [storeData, setStoreData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDataStorageModal, setShowDataStorageModal] = useState(false);
  const [pendingDataStorageValue, setPendingDataStorageValue] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadPreferences();
  }, [user, navigate]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('store_data')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setStoreData(data.store_data);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDataStorageChange = (value: boolean) => {
    setPendingDataStorageValue(value);
    setShowDataStorageModal(true);
  };

  const confirmDataStorageChange = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          store_data: pendingDataStorageValue,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (error) throw error;

      setStoreData(pendingDataStorageValue);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteData = async () => {
    try {
      const { error } = await supabase
        .from('logs')
        .delete()
        .eq('user_id', user!.id);

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.from('logs').delete().eq('user_id', user!.id);
      await supabase.from('user_preferences').delete().eq('user_id', user!.id);
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Changes saved successfully</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-50 rounded-full">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
                <p className="text-slate-600 text-sm mt-1">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Privacy & Data Management
                </h2>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Database className="h-5 w-5 text-slate-700" />
                        <h3 className="font-semibold text-slate-900">Data Storage</h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Control whether your pain log history is stored. When disabled, new
                        entries will not be saved to your history.
                      </p>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="storeData"
                            checked={storeData}
                            onChange={() => handleDataStorageChange(true)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                            disabled={saving}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Store my data
                          </span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="storeData"
                            checked={!storeData}
                            onChange={() => handleDataStorageChange(false)}
                            className="w-4 h-4 text-primary focus:ring-primary"
                            disabled={saving}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            Don't store my data
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Delete Your Pain Log Data
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    This will permanently delete all your pain log entries. This action cannot
                    be undone. Your account will remain active.
                  </p>
                  <button
                    onClick={() => setShowDeleteDataModal(true)}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete All Data</span>
                  </button>
                </div>

                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Delete Your Account
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    This will permanently delete your account and all associated data. This
                    action cannot be undone and you will be immediately signed out.
                  </p>
                  <button
                    onClick={() => setShowDeleteAccountModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">GDPR Compliance</h3>
              <div className="text-sm text-slate-600 space-y-2">
                <p>
                  <strong>Your Rights:</strong> You have the right to access, correct, or delete
                  your personal data at any time.
                </p>
                <p>
                  <strong>Data Processing:</strong> Your health data is processed solely for the
                  purpose of tracking your symptoms and improving your health management.
                </p>
                <p>
                  <strong>Data Security:</strong> All data is encrypted and stored securely using
                  industry-standard practices.
                </p>
                <p>
                  <strong>Data Retention:</strong> When data storage is disabled, new entries
                  will not be saved to your history.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:text-primary-600 font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDataStorageModal}
        onClose={() => setShowDataStorageModal(false)}
        onConfirm={confirmDataStorageChange}
        title={pendingDataStorageValue ? 'Enable Data Storage?' : 'Disable Data Storage?'}
        description={
          pendingDataStorageValue
            ? 'Your pain log entries will be saved to your history. You can track your progress over time.'
            : 'New pain log entries will not be saved to your history. Existing data will remain until you delete it manually.'
        }
        confirmText="Confirm"
        isDangerous={!pendingDataStorageValue}
      />

      <ConfirmationModal
        isOpen={showDeleteDataModal}
        onClose={() => setShowDeleteDataModal(false)}
        onConfirm={handleDeleteData}
        title="Delete All Data?"
        description="This will permanently delete all your pain log entries. This action cannot be undone. Your account settings will remain intact."
        confirmText="Delete Data"
        isDangerous={true}
      />

      <ConfirmationModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account?"
        description="This will permanently delete your account and all associated data including pain logs and preferences. This action cannot be undone and you will be immediately signed out."
        confirmText="Delete Account"
        isDangerous={true}
      />
    </div>
  );
}
