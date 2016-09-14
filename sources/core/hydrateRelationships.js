import Immutable               from 'immutable';

import { hydrateRelationship } from './hydrateRelationship';

export function hydrateRelationships(relationships = {}) {

    return new Immutable.Map(relationships).map(relationship => {
        return hydrateRelationship(relationship);
    });

}
