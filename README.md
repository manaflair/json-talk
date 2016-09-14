# [![Json-Talk](/logo.png?raw=true)](https://github.com/manaflair/json-talk)

> A Redux-friendly, JSON-API-compatible, ORM library

[![](https://img.shields.io/npm/v/@manaflair/json-talk.svg)]() [![](https://img.shields.io/npm/l/@manaflair/json-talk.svg)]()

[Check out our other OSS projects!](https://manaflair.github.io)

## Installation

```
$> npm install --save @manaflair/json-talk
```

## Overview

- [Hydrate the data you get from your API](https://github.com/manaflair/json-talk#hydrate-the-data-you-get-from-your-api)
- [Persist your resources inside a Redux store](https://github.com/manaflair/json-talk#persist-your-resources-inside-a-redux-store)
- [Resolve relationships directly when fetching data from your store](https://github.com/manaflair/json-talk#resolve-relationships-directly-when-fetching-data-from-your-store)
- [Optimistically sync your resource updates with the server](https://github.com/manaflair/json-talk#optimistically-sync-your-resource-updates-with-the-server)
- [Optimistically alter your resources' relationships](https://github.com/manaflair/json-talk#optimistically-alter-your-resources-relationships)

## Usage

### Hydrate the data you get from your API

The `hydrateServerData` helper is exactly what you need to convert your data from plain old data to Immutable objects.

```js
import { hydrateServerData } from '@manaflair/json-talk';

function fetchApi(path) {

    return fetch(path).then(res => {
        return res.json();
    }).then(serverData => {
        return hydrateServerData(serverData);
    });

}
```

### Persist your resources inside a Redux store

Use the `resourceRegistry` reducer, and the `resourceSet` action to save your data.

**Note:** Because other utilities expect the resource registry to be located in the `state.resourceRegistry` variable, you will need to abide to this rule and use this name too.

```js
import { resourceSet }                  from '@manaflair/json-talk/actions';
import { resourceRegistry }             from '@manaflair/json-talk/reducers';
import { combineReducers, createStore } from 'redux';

let resource = hydrateResource({ type: `post`, id: `0`, attributes: { title: `Simple Blogpost` } });
let locator = resource.locator;

let store = createStore(combineReducers({ resourceRegistry }));
store.dispatch(resourceSet(resource));

let state = store.getState();
state.resourceRegistry.get(locator);
```

In some cases, you might want to fetch data from your store before they're actually ready. We **strongly** advise you to avoid doing this (if it happens because of your routing, [Uxie](https://github.com/manaflair/uxie) is a library that should help you fixing this), but if you really have no other way to fix your code, you can use the `bestEfforts` option. When set to true, the registry will try to resolve the resource you asked, but it will not fail if this resource or one of its included relationships isn't available (it will just skip the entry if possible, or return null otherwise). You will end up with a partial resource, and will have to manually check for null values, but at least you'll be able to display your data as soon as they become available.

### Resolve relationships directly when fetching data from your store

```js
let locator = hydrateLocator({ type: `post`, id: `0` });

state.resourceRegistry.get(locator, { include: { Author: [], Comments: [ `Author` ] } });
```

In the code above, we asked the registry to also return the `post.Author`, `post.Comments`, and `post.Comments.Author` relationships. Of course, in order to work, you need to have pushed these relationships into your store (you may need to use the `?include=` query string parameter when querying the remote server to ask for these relationships to be submit with the return payload). If one of these relationships cannot be successfully resolved and you haven't set the `bestEfforts` flag, the resolution will throw an error.

### Optimistically sync your resource updates with the server

The `resourceSaga` saga is precisely what you want to update your data on the fly. It's an optimistic saga that will update your store resources instantly before sending data to the server. Once the response is available, the saga will choose to apply further updates (if the server answered with new data), keep everything as it is (if nothing happened), or rollback the changes (if an error occured).

```js
import { resourceSaga }                                  from '@manaflair/json-talk/sagas';
import { createSagaMiddleware }                          from 'redux-saga';
import { applyMiddleware, combineReducers, createStore } from 'redux';

let sagaMiddleware = createSagaMiddleware();

let reducer = combineReducers({ resourceRegistry });
let middlewares = applyMiddleware(sagaMiddleware);

let store = createStore(reducer, middlewares);

sageMiddleware.run(resourceSaga, { baseUrl: `/api` });
```

Once the saga correctly setup, you can use the `resourceCreate`, `resourcePatch`, and `resourceDelete` actions to trigger changes:

```js
import { resourceCreate, resourcePatch, resourceDelete } from '@manaflair/json-talk/actions';
import { Resource }                                      from '@manaflair/json-talk';

store.dispatch(resourceCreate(new Resource({ type: `comment` }).mergeIn([ `attributes` ], { content: `Wonderful blogpost!` }));
store.dispatch(resourcePatch(post.clear().mergeIn([ `attributes` ], { title: `A new title` })));
store.dispatch(resourceDelete(post));
```

### Optimistically alter your resources' relationships

On top of creating, updating, and deleting resources, you also have access to the `relationshipAdd`, `relationshipRemove`, and `relationshipApply` actions, that allow you to quickly change relationship links:

```js
import { relationshipAdd, relationshipRemove, relationshipApply } from '@manaflair/json-talk/actions';

store.dispatch(relationshipAdd(post, `Comments`, comment));
store.dispatch(relationshipRemove(post, `Comments`, comment));
store.dispatch(relationshipApply(post, `Comments`, [ comments ]));
store.dispatch(relationshipApply(comment, `Post`, post));
```

## Advanced

### Locators

A locator is the absolute minimal set of data required in order to query a specific resource. Because Json-Talk has been designed with the JSON-API in mind, these objects only contain the `type` and `id` properties of a resource.

You can access a resource's locator from its `locator` property and, as a bonus, it also works on `Locator` instances (in such a case, the locator returned will be the instance itself, which means that the following expression will be true: `locator.locator === locator`). It comes handy if you only need a locator to perform an action, but also want to support passing resources for convenience: just use the `locator` property of whatever is passed as argument, and everything will work just fine.

### Side effects

Because Json-Talk is schemaless, it's unfortunately impossible for it to correctly manage two-ways relationships (such as "A Post has Comments, and Comments have a Post"). In such a case, you will need to explicitely inform Json-Talk of any "silent" action that could occur as a side effect of another one. This can be done via the `sideEffects` option:

```js
store.dispatch(resourceDelete(post, { sideEffects: [
    resourceDeleteAll(post.relationships.getIn([ `Comments`, `data` ]))
] }));
```

In the example above, we ask Json-Talk to delete a resource, and inform it that should the API call succeed, other resources will be deleted in the process. This way, the optimistic architecture will be able to automatically remove those resources from the registry even before the request fires, and to rollback everything as needed should something happen that would prevent the deletion from being performed.

The main use case for the `sideEffects` option is on `resourceDelete` actions, since you'll usually want to cascade a resource deletion to its child relationships, but you will certainly also want to use it when working with any kind of relationship action. For example, the following will correctly change a comment's owner, and will be correctly rollback if the server returns an error:

```js
store.dispatch(relationshipUpdate(comment, `Post`, post, { sideEffects: [
    relationshipRemove(comment.relationships.getIn([ `Post`, `data` ]), `Comments`, comment),
    relationshipAdd(post, `Comments`, comment)
] }));
```

## License (MIT)

> **Copyright © 2016 Manaflair**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
