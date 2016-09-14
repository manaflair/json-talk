import { createPropType }        from 'react-custom-proptypes';

import { isResource, isLocator } from '../core';

export let PropTypes = {

    resource: createPropType(prop => {

        if (!isResource(prop))
            return false;

        return true;

    }, `Expected a resource value`),

    resourceOf: type => createPropType(prop => {

        if (!isResource(prop))
            return false;

        if (prop.type !== type)
            return false;

        return true;

    }, `Expected a resource value of type "${type}"`),

    locator: createPropType(prop => {

        if (!isLocator(prop))
            return false;

        return true;

    }, `Expected a locator value`),

    locatorOf: type => createPropType(prop => {

        if (!isLocator(prop))
            return false;

        if (prop.type !== type)
            return false;

        return true;

    }, `Expected a locator value of type "${type}"`),

    hasLocator: createPropType(prop => {

        if (!isResource(prop) && !isLocator(prop))
            return false;

        return true;

    }, `Expected a resource or locator value`),

    hasLocatorOf: type => createPropType(prop => {

        if (!isResource(prop) && !isLocator(prop))
            return false;

        if (prop.type !== type)
            return false;

        return true;

    }, `Expected a resource or locator value of type "${type}"`)

};
