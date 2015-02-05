/// <reference path="./connection.ts" />
/// <reference path="./schema.ts" />

module ingoose {
    export interface IModel {
        new(props: any): Model;
        save(): PromiseModelTx;
        remove(): PromiseModelTx;
        find(query: FindQuery): PromiseFindTx;
        clear(): PromiseModelTx;
    }
    export class PromiseModelTx {
        constructor(
            public cursorRequest: IDBRequest,
            private onsuccess: (req: IDBRequest, cb: (any) => any) => any = (req, cb: () => any) => {
              cb();
            },
            private upperError: Error = null
        ) {}
        public success(cb: (any?) => any): PromiseModelTx {
            this.cursorRequest.onsuccess = (ev: Event) => {
                this.onsuccess(this.cursorRequest, cb);
            };
            return this;
        }
        public error(cb: (err) => any): PromiseModelTx {
            if (!!this.cursorRequest == false) {
                cb(this.upperError);
                return this;
            }
            this.cursorRequest.onerror = cb;
            return this;
        }
    }
    export class PromiseFindTx extends PromiseModelTx {
        constructor(private factory: (any) => any,
                    private query: FindQuery,
                    cursorRequest,
                    onsuccess,
                    upperError = null) {
            super(cursorRequest, onsuccess, upperError);
        }
        public success(cb: (any?) => any): PromiseFindTx {
            if (this.query.only !== undefined) {
                this.cursorRequest.onsuccess = (ev: any) => {
                    if (!ev.target || !ev.target.result) return cb();
                    var res = this.factory(ev.target.result.value);
                    return cb(res);
                };
                return this;
            }
            var res: any[] = [];
            this.cursorRequest.onsuccess = (ev:any) => {
                if (!ev.target || !ev.target.result) return cb(res);
                var result = ev.target.result;
                res.push(this.factory(result.value));
                result.continue();
            };
            return this;
        }
    }
    class HotCore {
        constructor(public db: IDBDatabase, public modelName: string) {
        }
        public tx(): IDBTransaction {
            // TODO: hard "readwrite"
            return this.db.transaction([this.modelName], "readwrite");
        }
        public objectStore(): IDBObjectStore {
            return this.tx().objectStore(this.modelName);
        }
        public range(query: FindQuery): IDBKeyRange {
            return HotCore.range(query);
        }
        public static range(query: FindQuery): IDBKeyRange {
            if (query.only !== undefined) {
                return IDBKeyRange.only(query.only);
            }
            if (query.min == undefined && query.max == undefined) {
                // TODO
                throw "This is TODO";
            } else if (query.min == undefined) {
                return IDBKeyRange.upperBound(query.max);
            } else if (query.max == undefined) {
                return IDBKeyRange.lowerBound(query.min);
            }
            return IDBKeyRange.bound(query.min, query.max);
        }
    }
    class _Model {
        constructor(private __core: HotCore) {
            // this.__core = new HotCore(db, modelName);
        }
        public save(): PromiseModelTx {
            var store = this.__core.objectStore();
            var toBeStored = {};
            for (var i in this) {
                if (!this.hasOwnProperty(i)) continue;
                if (String(i) == '__core') continue;// skip __core
                toBeStored[i] = this[i];
            }
            // TODO #1
            // try {
                var req:IDBRequest = store.put(toBeStored);
            //    return new PromiseModelTx(req);
            // } catch (err) {
                return new PromiseModelTx(req);
            // }
        }
        public remove(): PromiseModelTx {
            var store = this.__core.objectStore();
            var key = this[SchemaRegistry.keyOf(this.__core.modelName)];
            var request = store.delete(key);
            return new PromiseModelTx(request);

        }
        public static proxyFind(__core: HotCore, query: FindQuery, facotry): PromiseFindTx {
            var store = __core.objectStore();
            var range = __core.range(query);
            var request = store.openCursor(range);
            var onsuccess = (req: IDBRequest, cb) => {
                cb();
            };
            return new PromiseFindTx(facotry, query, request, onsuccess);
        }
        public static proxyClear(__core: HotCore): PromiseModelTx {
            var store = __core.objectStore();
            var request = store.clear();
            return new PromiseModelTx(request);
        }
    }

    /**
     * active model of ingoose.
     * @param modelName Name of this model and storedObject
     * @param props Properties to be bound on this model
     */
    export class Model extends _Model {
        public static __name: string;
        constructor(modelName: string, props: any) {
            // bind inner connected db
            var __core = new HotCore(_db, modelName);
            super(__core);
            for (var i in props) {
                if (props.hasOwnProperty(i)) {
                    this[i] = props[i];
                }
            }
        }
    }

    /**
     * provide extended ActiveModel class definition.
     * @param modelName
     * @param opt
     * @returns ActiveModel
     */
    export function model(modelName: string, opt: any = {}): IModel {

        if (!SchemaRegistry.get(modelName)) errorUnregisteredModel(modelName);

        // clone ActiveModel class definition
        var ActiveModel: any = function(props: any = {}) {
            if (props[SchemaRegistry.keyOf(ActiveModel.__modelName)] == undefined
                && ! SchemaRegistry.get(ActiveModel.__modelName).autoIncrement)
            {
                return errorMissingRequiredProperty(SchemaRegistry.keyOf(ActiveModel.__modelName), 'keyPath');
            }
            Model.call(this, ActiveModel.__modelName, props);
        };
        ActiveModel.__modelName = modelName;
        ActiveModel.prototype = Model.prototype;
        ActiveModel.__core = new HotCore(_db, ActiveModel.__modelName);
        ActiveModel.find = (query: FindQuery): PromiseFindTx => {
            return Model.proxyFind(ActiveModel.__core, query, function(props) {
               return new ActiveModel(props);
            });
        };
        ActiveModel.clear = (): PromiseModelTx => {
            return Model.proxyClear(ActiveModel.__core);
        };

        return ActiveModel;
    }

    /**
     *
     */
    export interface FindQuery {
        only?: any;
        min?: any;
        max?: any;
    }

    function errorUnregisteredModel(modelName: string) {
        throw new Error("Unregistered model `" + modelName + "`");
    }
    function errorMissingRequiredProperty(propName: string, reason: string) {
        throw new Error("Missing required property `" + propName + "` (" + reason + ")");
    }
}