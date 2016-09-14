import Immutable           from 'immutable';
import { isArray }         from 'lodash';

import { Relationship }    from './Relationship';
import { hydrateLocators } from './hydrateLocators';
import { hydrateLocator }  from './hydrateLocator';

export function hydrateRelationship({ data, links }) {

    return new Relationship({

        data: isArray(data)
            ? hydrateLocators(data)
            : hydrateLocator(data),

        links: new Immutable.Map(links)

    });

}
