import Immutable                                from 'immutable';
import { first, flatten, isArray, isUndefined } from 'lodash';
import { fork, put }                            from 'redux-saga/effects';
import { takeEvery }                            from 'redux-saga';

import { getActionHandlers }                    from './getActionHandlers';

function resolveActionTree(action) {

    if (isArray(action)) {
        return flatten(action.map(subAction => resolveActionTree(subAction)));
    } else if (action.options && action.options.sideEffects) {
        return [ action ].concat(resolveActionTree(action.options.sideEffects));
    } else {
        return [ action ];
    }

}

function makeCommitAction(controls) {

    return flatten(controls.map(control => {
        return Array.from(control.generateCommitActions());
    }));

}

function makeRollbackAction(controls) {

    return flatten(controls.map(control => {
        return Array.from(control.generateRollbackActions());
    }));

}

export function* resourceSaga({ baseUrl = `/`, headers = {} } = {}) {

    let resourceLocks = new Immutable.Map();
    let actionHandlers = getActionHandlers({ baseUrl, headers });

    function* getActionControls(actions) {

        let controls = [];

        for (let action of actions)
            controls.push(yield* actionHandlers[action.type](action));

        return controls;

    }

    function getResourcesLocks(locators) {

        return locators.map(locator => {
            return resourceLocks.get(locator);
        }).filter(lock => {
            return !isUndefined(lock);
        });

    }

    function waitForResourcesToUnlock(locators, exec) {

        let locks = getResourcesLocks(locators);

        if (locks.length === 0)
            return exec();

        return Promise.all(locks).then(() => {
            return waitForResourcesToUnlock(locators, exec);
        });

    }

    function getUnifiedLock(locators) {

        let resolve, promise = new Promise(nativeResolve => {
            resolve = nativeResolve;
        });

        let release = () => {

            for (let locator of locators)
                resourceLocks = resourceLocks.delete(locator);

            resolve();

        };

        return waitForResourcesToUnlock(locators, () => {

            for (let locator of locators)
                resourceLocks = resourceLocks.set(locator, promise);

            return { release };

        });

    }

    yield takeEvery(Reflect.ownKeys(actionHandlers), function* (action) {

        yield fork(function* () {

            // Flatten "sideEffects" into an array of actions
            let actions = resolveActionTree(action);

            // Request a lock on every affected resources before proceeding
            let lock = yield getUnifiedLock(actions.map(action => action.locator));

            // Generate controls for every action
            let controls = yield* getActionControls(actions);

            // Optimistically commit everything to the store in a single batch
            yield put(makeCommitAction(controls));

            try {

                // We now try to reach the remote server
                let { executeAction } = first(controls);
                yield* executeAction();

            } catch (error) {

                console.error(error.stack);

                // And if something fails, we revert our local changes in a single batch too
                yield put(makeRollbackAction(controls, `rollback`));

            } finally {

                // Whatever happens, we finish our process by releasing the lock
                lock.release();

            }

        });

    });

}
