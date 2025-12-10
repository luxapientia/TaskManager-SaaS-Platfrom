import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateProfile({ name, email });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>TaskManager</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </header>

      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-header-section">
            <h2>User Profile</h2>
            {!isEditing && (
              <button onClick={handleEdit} className="btn btn-primary">
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="profile-info">
              <div className="profile-field">
                <label>Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="profile-input"
                    required
                    minLength={2}
                    maxLength={255}
                    disabled={loading}
                  />
                ) : (
                  <div className="profile-value">{user.name}</div>
                )}
              </div>

              <div className="profile-field">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="profile-input"
                    required
                    disabled={loading}
                  />
                ) : (
                  <div className="profile-value">{user.email}</div>
                )}
              </div>

              <div className="profile-field">
                <label>Member Since</label>
                <div className="profile-value profile-readonly">
                  {formatDate(user.created_at)}
                </div>
              </div>

              <div className="profile-field">
                <label>Last Updated</label>
                <div className="profile-value profile-readonly">
                  {formatDate(user.updated_at)}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;

