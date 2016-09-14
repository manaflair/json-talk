import { Locator } from './Locator';

export function hydrateLocator({ type, id }) {

    return new Locator({

        type: type,
        id: id

    });

}
