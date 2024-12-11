import { Entry } from './EntitiesListContainer';
import { EntityCard } from './EntityCard';

export interface EntitiesListProps {
  entities: Array<Entry[]>;
}

export function EntitiesList({ entities }: EntitiesListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Entries</h2>
      <div className="space-y-2">
        {entities.sort((a, b) => b[0].timestamp - a[0].timestamp).map((entity) => (
          <EntityCard key={entity[0].hash} entity={entity} />
        ))}
      </div>
    </div>
  );
}
