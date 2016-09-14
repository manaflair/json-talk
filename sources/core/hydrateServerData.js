import Immutable            from 'immutable';

import { ServerData }       from './ServerData';
import { hydrateErrors }    from './hydrateErrors';
import { hydrateResources } from './hydrateResources';

export function hydrateServerData({ data = [], included = [], errors = [] }) {

    return new ServerData({

        data: hydrateResources(data),
        included: hydrateResources(included),

        errors: hydrateErrors(errors)

    });

}
