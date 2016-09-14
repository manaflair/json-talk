import Immutable from 'immutable';

export class Relationship extends new Immutable.Record({

    data: undefined,

    links: new Immutable.Map()

}) {

}
