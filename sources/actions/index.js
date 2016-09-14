import Immutable                 from 'immutable';
import { isNull }                from 'lodash';

import { isResource, isLocator } from '../core';

export let RESOURCE_SET = `RESOURCE_SET`;
export let resourceSet = (resource, options = {}) => {

    let locator = resource.locator;

    return { type: RESOURCE_SET, locator, resource, options };

};

export let RESOURCE_UNSET = `RESOURCE_UNSET`;
export let resourceUnset = (resource, options = {}) => {

    let locator = resource.locator;

    return { type: RESOURCE_UNSET, locator, options };

};

// -----------------------------------------------

export let resourceSetAll = (resources) => {

    return Array.from(resources.values()).map(resource => resourceSet(resource));

};

export let resourceUnsetAll = (resources) => {

    return Array.from(resources.values()).map(resource => resourceUnset(resource));

};

// -----------------------------------------------

export let RESOURCE_CREATE = `RESOURCE_CREATE`;
export let resourceCreate = (resource, options = {}) => {

    let locator = resource.locator;

    return { type: RESOURCE_CREATE, locator, resource, options };

};

export let RESOURCE_PATCH = `RESOURCE_PATCH`;
export let resourcePatch = (resource, options = {}) => {

    let locator = resource.locator;

    return { type: RESOURCE_PATCH, locator, resource, options };

};

export let RESOURCE_DELETE = `RESOURCE_DELETE`;
export let resourceDelete = (resource, options = {}) => {

    let locator = resource.locator;

    return { type: RESOURCE_DELETE, locator, options };

};

// -----------------------------------------------

export let resourceDeleteAll = (resources) => {

    return Array.from(resources.values()).map(resource => resourceDelete(resource));

};

// -----------------------------------------------

export let RELATIONSHIP_ADD = `RELATIONSHIP_ADD`;
export let relationshipAdd = (resource, relationshipName, relationshipResources, options = {}) => {

    if (isResource(relationshipResources) || isLocator(relationshipResources))
        relationshipResources = [ relationshipResources ];

    let locator = resource.locator;
    let relationshipLocators = new Immutable.OrderedSet(relationshipResources.map(resource => resource.locator));

    return { type: RELATIONSHIP_ADD, locator, relationshipName, relationshipLocators, options };

};

export let RELATIONSHIP_REMOVE = `RELATIONSHIP_REMOVE`;
export let relationshipRemove = (resource, relationshipName, relationshipResources, options = {}) => {

    if (isResource(relationshipResources) || isLocator(relationshipResources))
        relationshipResources = [ relationshipResources ];

    let locator = resource.locator;
    let relationshipLocators = new Immutable.OrderedSet(relationshipResources.map(resource => resource.locator));

    return { type: RELATIONSHIP_REMOVE, locator, relationshipName, relationshipLocators, options };

};

export let RELATIONSHIP_APPLY = `RELATIONSHIP_APPLY`;
export let relationshipApply = (resource, relationshipName, relationshipData, options = {}) => {

    let locator = resource.locator;

    if (isResource(relationshipData) || isLocator(relationshipData))
        relationshipData = relationshipData.locator;
    else if (Immutable.Iterable.isIterable(relationshipData))
        relationshipData = new Immutable.OrderedSet(relationshipData.map(resource => resource.locator));

    return { type: RELATIONSHIP_APPLY, locator, relationshipName, relationshipData, options };

};
