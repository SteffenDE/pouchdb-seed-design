"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var cloneDeep = require("clone-deep");

function addDesign(s) {
  return "_design/" + s;
}

function normalizeDoc(doc, id) {
  function normalize(doc) {
    doc = Object.assign({}, doc);
    Object.keys(doc).forEach(function (prop) {
      var type = _typeof(doc[prop]);
      if (type === "object") {
        doc[prop] = normalize(doc[prop]);
      } else if (type === "function") {
        doc[prop] = doc[prop].toString();
      }
    });
    return doc;
  }
  var output = normalize(doc);
  output._id = id || doc._id;
  output._rev = doc._rev;
  return output;
}

function docEqual(local, remote) {
  if (!remote) return false;
  return JSON.stringify(local) === JSON.stringify(remote);
}

var pouchSeed = module.exports = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(db, design) {
    var local, docs, remote, update, res, errors;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(!db || !design)) {
              _context.next = 2;
              break;
            }

            throw new TypeError("'db' and 'design' are required");

          case 2:

            design = cloneDeep(design);
            Object.keys(design).map(function (key) {
              var _id = addDesign(key);
              design[_id] = normalizeDoc(design[key], _id);
              delete design[key];
            });

            local = design;
            _context.next = 7;
            return db.allDocs({ include_docs: true, keys: Object.keys(local) });

          case 7:
            docs = _context.sent;
            remote = {};

            docs.rows.forEach(function (doc) {
              if (doc.doc) {
                remote[doc.key] = doc.doc;
              }
            });
            update = Object.keys(local).filter(function (key) {
              if (!remote[key]) return true;
              local[key]._rev = remote[key]._rev;
              return !docEqual(local[key], remote[key]);
            }).map(function (key) {
              return local[key];
            });

            if (!(update.length > 0)) {
              _context.next = 19;
              break;
            }

            _context.next = 14;
            return db.bulkDocs({ docs: update });

          case 14:
            res = _context.sent;
            errors = res.filter(function (el) {
              if (el.error) return true;
            });

            if (!errors.length) {
              _context.next = 18;
              break;
            }

            throw new Error(res);

          case 18:
            return _context.abrupt("return", res);

          case 19:
            return _context.abrupt("return", false);

          case 20:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

if ((typeof window === "undefined" ? "undefined" : _typeof(window)) === "object") {
  window.pouchSeed = pouchSeed;
}