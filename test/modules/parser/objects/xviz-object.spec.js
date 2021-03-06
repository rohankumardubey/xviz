// Copyright (c) 2019 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {XVIZObject} from '@xviz/parser';

import test from 'tape-catch';

test('XVIZObject#static methods', t => {
  t.ok(typeof XVIZObject.get, 'function', 'get is exposed');
  t.ok(typeof XVIZObject.clear, 'function', 'clear is exposed');
  t.ok(typeof XVIZObject.resetAll, 'function', 'resetAll is exposed');
  t.ok(typeof XVIZObject.getAll, 'function', 'getAll is exposed');
  t.ok(typeof XVIZObject.getAllInCurrentFrame, 'function', 'getAllInCurrentFrame is exposed');
  t.end();
});

test('XVIZObject#constructor', t => {
  const object = new XVIZObject({id: 11, index: 0, timestamp: 1000});
  t.ok(object, 'creates OBJECT object successfully');
  t.is(object.id, 11, 'OBJECT object id is correct');
  t.ok(object.state, 'creates state object');
  t.ok(object._props, 'creates props object');
  t.is(object.startTime, 1000, 'has startTime');
  t.is(object.endTime, 1000, 'has endTime');
  t.end();
});

test('XVIZObject#observe', t => {
  const object = new XVIZObject({id: 11, index: 0, timestamp: 1000});

  object._observe(1001);
  t.is(object.startTime, 1000, 'has correct startTime');
  t.is(object.endTime, 1001, 'has correct endTime');

  object._observe(999);
  t.is(object.startTime, 999, 'has correct startTime');
  t.is(object.endTime, 1001, 'has correct endTime');

  t.end();
});

test('XVIZObject#_reset, _addFeature, isValid', t => {
  const object = new XVIZObject({id: 11, index: 0, timestamp: 1000});

  t.not(object.isValid, 'object should be empty');

  object._addFeature('/a', {});
  t.not(object.isValid, 'point is not valid');

  object._addFeature('/b', {center: 1});
  t.not(object.isValid, 'point is not valid');

  object._addFeature('/c', {center: [0, 1]});
  t.deepEquals(object.position, [0, 1, 0], 'sets geometry from single point');
  t.ok(object.isValid, 'object should not be empty');
  t.deepEquals(Array.from(object.streamNames), ['/a', '/b', '/c'], 'gets streamNames');

  object._reset();
  t.not(object.isValid, 'object should be empty');
  object._addFeature('/a', {vertices: [[0, 1], [1, 2], [2, 3]]});
  t.deepEquals(object.position, [1, 2, 0], 'sets geometry from polygon');
  t.ok(object.isValid, 'object should not be empty');

  object._addFeature('/b', {center: [0, 1, 2]});
  t.deepEquals(object.position, [0, 1, 2], 'overwrites geometry from single point');

  object._addFeature('/c', {vertices: [[0, 1], [1, 2]]});
  t.deepEquals(object.position, [0, 1, 2], 'prefers point geometry over polygons');

  object._reset();
  object._addFeature('/a', {vertices: [[0, 1]]});
  t.deepEquals(object.position, [0, 1], 'valid position if array has a single point');

  t.end();
});

test('XVIZObject#attributes', t => {
  const object = new XVIZObject({id: 11, index: 0, timestamp: 1000});

  object._setAttribute('/a', 'a', 5);
  t.deepEquals(object.getAttributes(), {a: 5}, 'attribute is fetched correctly');

  object._setAttribute('/b', 'b', 7);
  t.deepEquals(object.getAttributes(), {a: 5, b: 7}, 'additional attribute is fetched correctly');

  object._setAttribute('/b', 'b', 8);
  t.deepEquals(object.getAttributes(), {a: 5, b: 8}, 'overwritten attribute is fetched correctly');

  object._reset();
  t.deepEquals(object.getAttributes(), {}, 'reset clears attributes');

  t.end();
});
