import { useState, useEffect, useCallback } from 'react';
import { calculateAllStatistics } from '../services/statistics';
import type { Statistics } from '../types/statistics';

export function useStatistics(selectedYear?: number) {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await calculateAllStatistics(selectedYear);
      setStatistics(stats);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics, selectedYear]);

  const refreshStatistics = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refreshStatistics };
}
