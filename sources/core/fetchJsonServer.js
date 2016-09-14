import fetchPonyfill              from 'fetch-ponyfill';
import { isEmpty, isPlainObject } from 'lodash';

import { hydrateServerData }      from './hydrateServerData';

let { fetch } = fetchPonyfill();

export function fetchJsonServer(target, opts) {

    if (opts && opts.body && isPlainObject(opts.body)) {

        opts = Object.assign({}, opts);
        opts.body = JSON.stringify({ data: opts.body });

        if (!opts.headers) {
            opts.headers = {};
        } else {
            opts.headers = Object.assign({}, opts.headers);
        }

        opts.headers[`Content-Type`] = `application/json`;

    }

    return fetch(target, opts).then(res => {

        if (!res.ok) {
            return processError(res);
        } else {
            return processSuccess(res);
        }

    });

}

function processError(res) {

    return getServerData(res).then(serverData => {

        throw new Error(`Server answered with ${res.status} ${res.statusText}\n${formatErrors(serverData.errors)}`);

    });

}

function processSuccess(res) {

    return getServerData(res).then(serverData => {

        return serverData;

    });

}

function getServerData(res) {

    return res.text().then(text => {

        let serverData;

        try {
            serverData = JSON.parse(!isEmpty(text) ? text : `{}`);
        } catch (err) {
            throw new Error(`Server answered with invalid JSON data: "${text.substr(0, 100)}"`);
        }

        return hydrateServerData(serverData);

    });

}

function formatErrors(errors) {

    if (errors.isEmpty()) {
        return `  - No specific error returned`;
    } else {
        return errors.map(error => `  - ${error.detail || error.title}`).join(`\n`);
    }

}
