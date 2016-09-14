import Immutable           from 'immutable';

import { hydrateResource } from './hydrateResource';

export function hydrateResources(resources = []) {

    return new Immutable.OrderedMap(resources.map(resource => {

        let hydratedResource = hydrateResource(resource);

        return [ hydratedResource.locator, hydratedResource ];

    }));

}
