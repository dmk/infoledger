'use client';

import { useState } from 'react';
import { Entry } from './EntitiesListContainer';

interface EntityProps {
  entity: Entry[];
}

export function EntityCard({ entity }: EntityProps) {
  const [showHistory, setShowHistory] = useState(false);

  console.log('entity', entity);

  if (!entity.length) return null;

  // Sort entries by timestamp descending to get latest first
  const sortedEntries = [...entity].sort((a, b) => b.timestamp - a.timestamp);
  const latestEntry = sortedEntries[0];
  const hasHistory = sortedEntries.length > 1;

  return (
    <div className="border rounded-lg p-4">
      {/* Latest Entry */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Entity: {latestEntry.entityId}</h3>
          <span className={`px-2 py-1 rounded text-sm ${latestEntry.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {latestEntry.verified ? 'Verified' : 'Pending'}
          </span>
        </div>
        <p className="text-gray-700">{latestEntry.data}</p>
        <div className="text-sm text-gray-500">
          {new Date(latestEntry.timestamp).toLocaleString()}
        </div>
      </div>

      {/* History Toggle */}
      {hasHistory && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            {showHistory ? '▼' : '▶'} Show History ({sortedEntries.length - 1} entries)
          </button>

          {/* Historical Entries */}
          {showHistory && (
            <div className="mt-2 space-y-3 pl-4 border-l-2 border-gray-200">
              {sortedEntries.slice(1).map((entry) => (
                <div key={entry.hash} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${entry.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                      {entry.verified ? 'Verified' : 'Pending'}
                    </span>
                    <span className="text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{entry.data}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
