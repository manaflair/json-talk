import Immutable from 'immutable';

export class Error extends new Immutable.Record({

    id: undefined,

    status: undefined,
    code: undefined,

    title: undefined,
    detail: undefined

}) {

}
