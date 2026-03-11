import { useEffect, useState } from 'react';
import { getCatalog } from '../api/catalogApi';

export const useCatalog = () => {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getCatalog()
      .then((data) => {
        if (!mounted) return;
        setCatalog(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || 'Failed to load catalog');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { catalog, loading, error };
};
