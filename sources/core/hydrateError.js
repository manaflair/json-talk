import { Error } from './Error';

export function hydrateError({ id, status, code, title, detail }) {

    return new Error({

        id,

        status,
        code,

        title,
        detail

    });

}
