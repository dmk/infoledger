'use client';

import useSWR from 'swr';
import { EntitiesList } from './EntitiesList';

export interface Entry {
  hash: string;
  entityId: string;
  data: string;
  timestamp: number;
  verified: boolean;
}

export interface EntriesResponse {
  [entityId: string]: Entry[];
}

export default function EntriesListContainer() {
  const { data: entities, error, isLoading } = useSWR<EntriesResponse>('entries');

  if (error) return <div>Failed to load entries</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!entities) return <div>No entries found</div>;

  return <EntitiesList entities={Object.values(entities)} />;
}
