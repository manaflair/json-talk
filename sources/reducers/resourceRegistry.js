import Immutable                        from 'immutable';
import { isFunction }                   from 'lodash';

import { RESOURCE_SET, RESOURCE_UNSET } from '../actions';
import { resolveSelector }              from '../core';

class Registry {

    constructor(map = new Immutable.Map()) {

        this.map = map;

    }

    push(resource) {

        return new Registry(this.map.update(resource.locator, (current = resource) => current.merge({
            attributes: current.attributes.merge(resource.attributes),
            relationships: current.relationships.merge(resource.relationships)
        })));

    }

    delete(resourceCompatible) {

        return new Registry(this.map.delete(resourceCompatible.locator));

    }

    get(selector, options) {

        if (isFunction(selector))
            selector = this.map.filter(resource => selector(resource));

        return resolveSelector(this.map, selector, options);

    }

}

export function resourceRegistry(state = new Registry(), action) {

    switch (action.type) {

        case RESOURCE_SET: {
            return state.push(action.resource);
        } break;

        case RESOURCE_UNSET: {
            return state.delete(action.locator);
        } break;

        default: {
            return state;
        }

    }

}
