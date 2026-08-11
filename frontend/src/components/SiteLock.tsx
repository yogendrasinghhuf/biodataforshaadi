import React, { useState } from 'react';
import './SiteLock.css';

const SITE_USERNAME = process.env.REACT_APP_SITE_USERNAME || 'team';
const SITE_PASSWORD = process.env.REACT_APP_SITE_PASSWORD || 'biodata2026';
const UNLOCK_KEY = 'bfs_unlocked';

interface SiteLockProps {
  children: React.ReactNode;
}

const SiteLock: React.FC<SiteLockProps> = ({ children }) => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === SITE_USERNAME && password === SITE_PASSWORD) {
      sessionStorage.setItem(UNLOCK_KEY, 'true');
      setUnlocked(true);
      setError('');
    } else {
      setError('Incorrect username or password.');
    }
  };

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <div className="site-lock">
      <form className="site-lock-card" onSubmit={handleSubmit}>
        <h1 className="site-lock-title">BiodataForShaadi</h1>
        <p className="site-lock-subtitle">This site is restricted. Enter your credentials to continue.</p>
        <label className="site-lock-label">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
        </label>
        <label className="site-lock-label">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="site-lock-error">{error}</p>}
        <button type="submit" className="site-lock-button">Unlock</button>
      </form>
    </div>
  );
};

export default SiteLock;
