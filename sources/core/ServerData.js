import Immutable from 'immutable';

export class ServerData extends new Immutable.Record({

    data: new Immutable.OrderedMap(),
    included: new Immutable.OrderedMap(),

    errors: new Immutable.List()

}) {

    get all() {

        return this.data.merge(this.included);

    }

    get main() {

        return this.data.first();

    }

}
