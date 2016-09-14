import Immutable                from 'immutable';

import { Resource }             from './Resource';
import { hydrateRelationships } from './hydrateRelationships';

export function hydrateResource({ type, id, attributes = {}, relationships = {}, links = {} }) {

    return new Resource({

        type: type,
        id: id,

        attributes: Immutable.fromJS(attributes),
        relationships: hydrateRelationships(relationships),

        links: new Immutable.Map(links)

    });

}
