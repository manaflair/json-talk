import Immutable        from 'immutable';

import { hydrateError } from './hydrateError';

export function hydrateErrors(errors) {

    return new Immutable.List(errors.map(error => {
        return hydrateError(error);
    }));

}
