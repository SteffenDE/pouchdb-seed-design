const cloneDeep = require("clone-deep");

function addDesign(s) {
  return "_design/" + s;
}

function normalizeDoc(doc, id) {
  function normalize(doc) {
    doc = Object.assign({}, doc);
    Object.keys(doc).forEach(prop => {
      var type = typeof doc[prop];
      if (type === "object") {
        doc[prop] = normalize(doc[prop]);
      }
      else if (type === "function") {
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

var pouchSeed = module.exports = async function(db, design) {
  if (!db || !design) {
    throw new TypeError("'db' and 'design' are required");
  }

  design = cloneDeep(design);
  Object.keys(design).map(function(key) {
    let _id = addDesign(key);
    design[_id] = normalizeDoc(design[key], _id);
    delete design[key];
  });

  var local = design;
  const docs = await db.allDocs({ include_docs: true, keys: Object.keys(local) });
  var remote = {};
  docs.rows.forEach(function(doc) {
    if (doc.doc) {
      remote[doc.key] = doc.doc;
    }
  });
  var update = Object.keys(local).filter(function(key) {
    if (!remote[key]) return true;
    local[key]._rev = remote[key]._rev;
    return !docEqual(local[key], remote[key]);
  }).map(function(key) {
    return local[key];
  });
  if (update.length > 0) {
    const res = await db.bulkDocs({ docs: update });
    const errors = res.filter(el => {
      if (el.error) return true;
    });
    if (errors.length) {
      throw new Error(res);
    }
    return res;
  }
  return false;
};

if (typeof window === "object") {
  window.pouchSeed = pouchSeed;
}
