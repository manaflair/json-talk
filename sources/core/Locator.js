import Immutable    from 'immutable';

import { Resource } from './Resource';

export class Locator extends new Immutable.Record({

    type: undefined,
    id: undefined

}) {

    get key() {

        return `${this.type} ${this.id}`;

    }

    get locator() {

        return this;

    }

    toResource() {

        return new Resource({ type: this.type, id: this.id });

    }

}
