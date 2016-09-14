import Immutable                                              from 'immutable';
import { isArray, isPlainObject, isNil, isNull, isUndefined } from 'lodash';

import { isLocator }                                          from './isLocator';
import { isResource }                                         from './isResource';

export function resolveSelector(all, selector, { bestEfforts = false, include } = {}) {

    if (isNull(selector))
        return null;

    if (isResource(selector))
        selector = selector.locator;

    if (isLocator(selector))
        return resolveLocator(all, selector, { bestEfforts, include });

    if (Immutable.Iterable.isIterable(selector))
        return selector.map(selector => resolveSelector(all, selector, { bestEfforts, include }));

    throw new Error(`Resource resolution failed - invalid selector (${typeof selector})`);

}

function resolveLocator(all, locator, { bestEfforts, include }) {

    let resource = all.get(locator);

    if (isUndefined(resource)) {

        if (bestEfforts) {
            return null;
        } else {
            throw new Error(`Resource resolution failed - resource not found (//${locator.type}/${locator.id})`);
        }

    }

    if (!isNil(include)) {

        if (isArray(include)) {
            resource = resolveArrayRelationships(all, resource, { bestEfforts, include });
        } else if (isPlainObject(include)) {
            resource = resolveObjectRelationships(all, resource, { bestEfforts, include });
        } else {
            throw new Error(`Resource resolution failed - invalid "include" property, expected nil, an array, or a plain object`);
        }

    }

    return resource;

}

function resolveArrayRelationships(all, resource, { bestEfforts, include }) {

    for (let relationshipName of include) {

        let relationship = resource.relationships.get(relationshipName);

        if (isUndefined(relationship)) {

            if (bestEfforts) {
                continue;
            } else {
                throw new Error(`Resource resolution failed - relationship not found (//${resource.type}/${resource.id}/${resource.type}/${name})`);
            }

        }

        let relationshipData = resolveSelector(all, relationship.data, { bestEfforts });
        resource = resource.setIn([ `relationships`, relationshipName, `data` ], relationshipData);

    }

    return resource;

}

function resolveObjectRelationships(all, resource, { bestEfforts, include }) {

    for (let relationshipName of Object.keys(include)) {

        let relationship = resource.relationships.get(relationshipName);

        if (isUndefined(relationship)) {

            if (bestEfforts) {
                continue;
            } else {
                throw new Error(`Resource resolution failed - relationship not found (//${resource.type}/${resource.id}/${resource.type}/${name})`);
            }

        }

        let relationshipData = resolveSelector(all, relationship.data, { bestEfforts, include: include[relationshipName] });
        resource = resource.setIn([ `relationships`, relationshipName, `data` ], relationshipData);

    }

    return resource;

}
