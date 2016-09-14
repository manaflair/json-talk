import Immutable   from 'immutable';

import { Locator } from './Locator';

export class Resource extends new Immutable.Record({

    type: undefined,
    id: undefined,

    attributes: new Immutable.Map(),
    relationships: new Immutable.Map(),

    links: new Immutable.Map()

}) {

    get key() {

        return `${this.type} ${this.id}`;

    }

    get locator() {

        return new Locator({ type: this.type, id: this.id });

    }

    clear() {

        return this.locator.toResource();

    }

}
