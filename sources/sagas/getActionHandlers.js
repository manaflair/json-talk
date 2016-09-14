import { camelCase }                                                 from 'lodash';
import pluralize                                                     from 'pluralize';
import { select }                                                    from 'redux-saga/effects';
import { resolve as resolveUrl }                                     from 'url';

import { RELATIONSHIP_ADD, RELATIONSHIP_REMOVE, RELATIONSHIP_APPLY } from '../actions';
import { RESOURCE_CREATE, RESOURCE_PATCH, RESOURCE_DELETE }          from '../actions';
import { resourceSet, resourceUnset }                                from '../actions';

import { fetchJsonServer }                                           from '../core';

function sendAction({ baseUrl, headers }, method, path, body) {

    return fetchJsonServer(resolveUrl(baseUrl.replace(/\/?$/, `/`), path), { method, headers, body });

}

export let getActionHandlers = config => ({

    [RESOURCE_CREATE]: function* (action) {

        return {

            executeAction: function* () {
                yield sendAction(config, `POST`, `${pluralize(camelCase(action.locator.type))}`, action.resource.toJS());
            },

            generateCommitActions: function* () {
                yield resourceSet(action.resource);
            },

            generateRollbackActions: function* () {
                yield resourceUnset(action.resource);
            }

        };

    },

    [RESOURCE_PATCH]: function* (action) {

        let resource = yield select(state => {
            return state.resourceRegistry.get(action.locator);
        });

        return {

            executeAction: function* () {
                yield sendAction(config, `PATCH`, `${pluralize(camelCase(action.locator.type))}/${action.locator.id}`, action.resource.toJS());
            },

            generateCommitActions: function* () {
                yield resourceSet(action.resource);
            },

            generateRollbackActions: function* () {
                yield resourceSet(resource);
            }

        };

    },

    [RESOURCE_DELETE]: function* (action) {

        let resource = yield select(state => {
            return state.resourceRegistry.get(action.locator);
        });

        return {

            executeAction: function* () {
                yield sendAction(config, `DELETE`, `${pluralize(camelCase(action.locator.type))}/${action.locator.id}`);
            },

            generateCommitActions: function* () {
                yield resourceUnset(action.locator);
            },

            generateRollbackActions: function* () {
                yield resourceSet(resource);
            }

        };

    },

    [RELATIONSHIP_ADD]: function* (action) {

        let resource = yield select(state => {
            return state.resourceRegistry.get(action.locator);
        });

        return {

            executeAction: function* () {
                yield sendAction(config, `POST`, `${pluralize(camelCase(action.locator.type))}/${action.locator.id}/relationships/${action.relationshipName}`, action.relationshipLocators.toJS());
            },

            generateCommitActions: function* () {
                yield resourceSet(resource.updateIn([ `relationships`, action.relationshipName, `data` ], resources => resources.union(action.relationshipLocators)));
            },

            generateRollbackActions: function* () {
                yield resourceSet(resource);
            }

        };

    },

    [RELATIONSHIP_REMOVE]: function* (action) {

        let resource = yield select(state => {
            return state.resourceRegistry.get(action.locator);
        });

        return {

            executeAction: function* () {
                yield sendAction(config, `DELETE`, `${pluralize(camelCase(action.locator.type))}/${action.locator.id}/relationships/${action.relationshipName}`, action.relationshipLocators.toJS());
            },

            generateCommitActions: function* () {
                yield resourceSet(resource.updateIn([ `relationships`, action.relationshipName, `data` ], resources => resources.subtract(action.relationshipLocators)));
            },

            generateRollbackActions: function* () {
                yield resourceSet(resource);
            }

        };

    },

    [RELATIONSHIP_APPLY]: function* (action) {

        let resource = yield select(state => {
            return state.resourceRegistry.get(action.locator, { include: [ action.relationshipName ] });
        });

        return {

            executeAction: function* () {
                yield sendAction(config, `PATCH`, `${pluralize(camelCase(action.locator.type))}/${action.locator.id}/relationships/${action.relationshipName}`, action.relationshipLocators.toJS());
            },

            generateCommitActions: function* () {
                yield resourceSet(resource.setIn([ `relationships`, action.relationshipName, `data` ], action.relationshipData));
            },

            generateRollbackActions: function* () {
                yield resourceSet(resource);
            }

        };

    }

});
