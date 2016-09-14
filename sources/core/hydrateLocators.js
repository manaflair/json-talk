import Immutable          from 'immutable';

import { hydrateLocator } from './hydrateLocator';

export function hydrateLocators(locators = []) {

    return new Immutable.OrderedSet(locators.map(locator => {
        return hydrateLocator(locator);
    }));

}
