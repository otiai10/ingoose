var ingoose;
(function (ingoose) {
    // TODO: exportしたくない（同module内で有効なprivateスコープってどうやるの？）
    ingoose._db;
    var PromiseOpened = (function () {
        function PromiseOpened(openRequest) {
            this.openRequest = openRequest;
        }
        PromiseOpened.prototype.schemas = function (schemas) {
            this.openRequest.onupgradeneeded = function (ev) {
                ingoose._db = ev.target['result'];
                ev.target['transaction'].onerror = function (err) {
                    throw new Error("xxx00: " + err.toString());
                };
                for (var name in schemas) {
                    if (!schemas.hasOwnProperty(name))
                        continue;
                    if (typeof schemas[name] !== "object")
                        continue;
                    console.log("_0", name);
                    if (ingoose._db.objectStoreNames.contains(name)) {
                        console.log("_1", name);
                        ingoose._db.deleteObjectStore(name);
                    }
                    console.log("_2", name);
                    ingoose._db.createObjectStore(name, schemas[name]);
                    console.log("_3", name);
                }
            };
            /*
            this.openRequest.onsuccess = () => {
                _db = this.openRequest.result;
                afterAll();
            };
            */
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
})(ingoose || (ingoose = {}));

/// <reference path="./connection.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ingoose;
(function (ingoose) {
    var PromiseModelTx = (function () {
        function PromiseModelTx(cursorRequest, upperError) {
            if (upperError === void 0) { upperError = null; }
            this.cursorRequest = cursorRequest;
            this.upperError = upperError;
        }
        PromiseModelTx.prototype.success = function (cb) {
            this.cursorRequest.onsuccess = cb;
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
        return HotCore;
    })();
    var _Model = (function () {
        function _Model(db, modelName) {
            this.__core = new HotCore(db, modelName);
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
            return new PromiseModelTx(req, null);
            // }
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
            _super.call(this, ingoose._db, modelName);
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    this[i] = props[i];
                }
            }
        }
        Model.findAll = function () {
            console.log("findAll!!");
        };
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
        // clone Model class definition
        var ConstructableModel = function (props) {
            if (props === void 0) { props = {}; }
            ConstructableModel['__modelName'] = modelName;
            Model.call(this, ConstructableModel['__modelName'], props);
        };
        ConstructableModel.prototype = Model.prototype;
        return ConstructableModel;
    }
    ingoose.model = model;
})(ingoose || (ingoose = {}));
