'use strict';

module.exports = function transformData (prefix, data) {
  // Setting the last modified key will yield incorrect result when deleting a key.
  // Basically we do not catch deleted keys.
  // If ModifyIndex is a running counter and we would store the latest index then we could see if we go backwards,
  // but we wouldn't know which key without comparing the old configuration against the new, and if we
  // would do that then we wouldn't need to keep track on the index.
  var modifyIndex = 0;

  return data.reduce(function (result, item) {
    var keyPath = clean(item.Key).split('/').filter(Boolean);
    if (!keyPath.length) return result;

    var key = keyPath.pop();
    var inner = createParent(keyPath, result);
    inner[key] = parseValue(item);

    if (item.ModifyIndex > modifyIndex) {
      modifyIndex = item.ModifyIndex;
      result._last_modified_key = clean(item.Key);
    }
    return result;
  }, {
    _modified_time: new Date().toJSON()
  });

  function clean (key) {
    return key.replace(prefix, '');
  }

  function createParent (keyPath, initial) {
    return keyPath.reduce(function (inner, parent) {
      if (inner[parent] === undefined) inner[parent] = {};
      return inner[parent];
    }, initial);
  }

  function parseValue (item) {
    var value;
    try {
      value = JSON.parse(item.Value);
    } catch (e) {
      value = item.Value;
    }
    return value;
  }
};
