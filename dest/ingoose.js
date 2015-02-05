var ingoose;
(function (ingoose) {
    var SchemaRegistry;
    (function (SchemaRegistry) {
        var _SchemaRegistry = {};
        function upsertAll(schemas) {
            for (var name in schemas) {
                if (!schemas.hasOwnProperty(name))
                    continue;
                if (typeof schemas[name] !== 'object')
                    continue;
                if (!validate(schemas[name]))
                    continue;
                _SchemaRegistry[name] = schemas[name];
            }
        }
        SchemaRegistry.upsertAll = upsertAll;
        function validate(schemaLike) {
            return !!schemaLike['keyPath'];
        }
        function all() {
            return _SchemaRegistry;
        }
        SchemaRegistry.all = all;
        function get(name) {
            var schema = _SchemaRegistry[name];
            if (!schema || typeof schema != 'object')
                return null;
            return _SchemaRegistry[name];
        }
        SchemaRegistry.get = get;
        function keyOf(name) {
            var schema = get(name);
            if (!schema)
                return "";
            return schema['keyPath'];
        }
        SchemaRegistry.keyOf = keyOf;
    })(SchemaRegistry = ingoose.SchemaRegistry || (ingoose.SchemaRegistry = {}));
})(ingoose || (ingoose = {}));

/// <reference path="./schema.ts" />
var ingoose;
(function (ingoose) {
    // TODO: #2 exportしたくない（同module内で有効なprivateスコープってどうやるの？）
    ingoose._db;
    var PromiseOpened = (function () {
        function PromiseOpened(openRequest) {
            this.openRequest = openRequest;
        }
        PromiseOpened.prototype.schemas = function (schemas) {
            ingoose.SchemaRegistry.upsertAll(schemas);
            this.openRequest.onupgradeneeded = function (ev) {
                ingoose._db = ev.target['result'];
                ev.target['transaction'].onerror = function (err) {
                    throw new Error("xxx00: " + err.toString());
                };
                for (var name in ingoose.SchemaRegistry.all()) {
                    if (ingoose._db.objectStoreNames.contains(name)) {
                        ingoose._db.deleteObjectStore(name);
                    }
                    ingoose._db.createObjectStore(name, ingoose.SchemaRegistry.get(name));
                }
            };
            return this;
        };
        PromiseOpened.prototype.error = function (onerror) {
            if (onerror === void 0) { onerror = function () {
            }; }
            this.openRequest.onerror = onerror;
            return this;
        };
        PromiseOpened.prototype.success = function (onsuccess) {
            var _this = this;
            if (onsuccess === void 0) { onsuccess = function () {
            }; }
            // overwrite onsuccess
            this.openRequest.onsuccess = function (ev) {
                ingoose._db = _this.openRequest.result;
                onsuccess();
            };
            return this;
        };
        return PromiseOpened;
    })();
    ingoose.PromiseOpened = PromiseOpened;
    function connect(dbname, version) {
        var openRequest = indexedDB.open(dbname, version);
        return new PromiseOpened(openRequest);
    }
    ingoose.connect = connect;
    function close() {
        ingoose._db.close();
    }
    ingoose.close = close;
})(ingoose || (ingoose = {}));

/// <reference path="./connection.ts" />
/// <reference path="./schema.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ingoose;
(function (ingoose) {
    var PromiseModelTx = (function () {
        function PromiseModelTx(cursorRequest, onsuccess, upperError) {
            if (onsuccess === void 0) { onsuccess = function (req, cb) {
                cb();
            }; }
            if (upperError === void 0) { upperError = null; }
            this.cursorRequest = cursorRequest;
            this.onsuccess = onsuccess;
            this.upperError = upperError;
        }
        PromiseModelTx.prototype.success = function (cb) {
            var _this = this;
            this.cursorRequest.onsuccess = function (ev) {
                _this.onsuccess(_this.cursorRequest, cb);
            };
            return this;
        };
        PromiseModelTx.prototype.error = function (cb) {
            if (!!this.cursorRequest == false) {
                cb(this.upperError);
                return this;
            }
            this.cursorRequest.onerror = cb;
            return this;
        };
        return PromiseModelTx;
    })();
    ingoose.PromiseModelTx = PromiseModelTx;
    var PromiseFindTx = (function (_super) {
        __extends(PromiseFindTx, _super);
        function PromiseFindTx(factory, query, cursorRequest, onsuccess, upperError) {
            if (upperError === void 0) { upperError = null; }
            _super.call(this, cursorRequest, onsuccess, upperError);
            this.factory = factory;
            this.query = query;
        }
        PromiseFindTx.prototype.success = function (cb) {
            var _this = this;
            if (this.query.only !== undefined) {
                this.cursorRequest.onsuccess = function (ev) {
                    if (!ev.target || !ev.target.result)
                        return cb();
                    var res = _this.factory(ev.target.result.value);
                    return cb(res);
                };
                return this;
            }
            var res = [];
            this.cursorRequest.onsuccess = function (ev) {
                if (!ev.target || !ev.target.result)
                    return cb(res);
                var result = ev.target.result;
                res.push(_this.factory(result.value));
                result.continue();
            };
            return this;
        };
        return PromiseFindTx;
    })(PromiseModelTx);
    ingoose.PromiseFindTx = PromiseFindTx;
    var HotCore = (function () {
        function HotCore(db, modelName) {
            this.db = db;
            this.modelName = modelName;
        }
        HotCore.prototype.tx = function () {
            // TODO: hard "readwrite"
            return this.db.transaction([this.modelName], "readwrite");
        };
        HotCore.prototype.objectStore = function () {
            return this.tx().objectStore(this.modelName);
        };
        HotCore.prototype.range = function (query) {
            return HotCore.range(query);
        };
        HotCore.range = function (query) {
            if (query.only !== undefined) {
                return IDBKeyRange.only(query.only);
            }
            if (query.min == undefined && query.max == undefined) {
                throw "This is TODO";
            }
            else if (query.min == undefined) {
                return IDBKeyRange.upperBound(query.max);
            }
            else if (query.max == undefined) {
                return IDBKeyRange.lowerBound(query.min);
            }
            return IDBKeyRange.bound(query.min, query.max);
        };
        return HotCore;
    })();
    var _Model = (function () {
        function _Model(__core) {
            this.__core = __core;
            // this.__core = new HotCore(db, modelName);
        }
        _Model.prototype.save = function () {
            var store = this.__core.objectStore();
            var toBeStored = {};
            for (var i in this) {
                if (!this.hasOwnProperty(i))
                    continue;
                if (String(i) == '__core')
                    continue; // skip __core
                toBeStored[i] = this[i];
            }
            // TODO #1
            // try {
            var req = store.put(toBeStored);
            //    return new PromiseModelTx(req);
            // } catch (err) {
            return new PromiseModelTx(req);
            // }
        };
        _Model.prototype.remove = function () {
            var store = this.__core.objectStore();
            var key = this[ingoose.SchemaRegistry.keyOf(this.__core.modelName)];
            var request = store.delete(key);
            return new PromiseModelTx(request);
        };
        _Model.proxyFind = function (__core, query, facotry) {
            var store = __core.objectStore();
            var range = __core.range(query);
            var request = store.openCursor(range);
            var onsuccess = function (req, cb) {
                cb();
            };
            return new PromiseFindTx(facotry, query, request, onsuccess);
        };
        _Model.proxyClear = function (__core) {
            var store = __core.objectStore();
            var request = store.clear();
            return new PromiseModelTx(request);
        };
        return _Model;
    })();
    /**
     * active model of ingoose.
     * @param modelName Name of this model and storedObject
     * @param props Properties to be bound on this model
     */
    var Model = (function (_super) {
        __extends(Model, _super);
        function Model(modelName, props) {
            // bind inner connected db
            var __core = new HotCore(ingoose._db, modelName);
            _super.call(this, __core);
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    this[i] = props[i];
                }
            }
        }
        return Model;
    })(_Model);
    ingoose.Model = Model;
    /**
     * provide extended Model class definition.
     * @param modelName
     * @param opt
     * @returns ModelConstructable
     */
    function model(modelName, opt) {
        if (opt === void 0) { opt = {}; }
        if (!ingoose.SchemaRegistry.get(modelName))
            return errorUnregisteredModel(modelName);
        // clone Model class definition
        var ConstructableModel = function (props) {
            if (props === void 0) { props = {}; }
            if (props[ingoose.SchemaRegistry.keyOf(ConstructableModel.__modelName)] == undefined) {
                return errorMissingRequiredProperty(ingoose.SchemaRegistry.keyOf(ConstructableModel.__modelName), "keyPath");
            }
            Model.call(this, ConstructableModel['__modelName'], props);
        };
        ConstructableModel.__modelName = modelName;
        ConstructableModel.prototype = Model.prototype;
        ConstructableModel.__core = new HotCore(ingoose._db, ConstructableModel.__modelName);
        ConstructableModel.find = function (query) {
            return Model.proxyFind(ConstructableModel.__core, query, function (props) {
                return new ConstructableModel(props);
            });
        };
        ConstructableModel.clear = function () {
            return Model.proxyClear(ConstructableModel.__core);
        };
        return ConstructableModel;
    }
    ingoose.model = model;
    function errorUnregisteredModel(modelName) {
        throw new Error("Unregistered model `" + modelName + "`");
    }
    function errorMissingRequiredProperty(propName, reason) {
        throw new Error("Missing required property `" + propName + "` (" + reason + ")");
    }
})(ingoose || (ingoose = {}));
