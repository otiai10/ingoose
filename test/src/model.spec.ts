/// <reference path="../lib.ts" />
/// <reference path="../../src/model.ts" />

module Spec {
    chai.should();
    var db_name = 'ingoose_test_testem';
    var db_version = 7;
    before((done) => {
        ingoose.connect(db_name, db_version).schemas({
            'user': {
                keyPath: 'age'
            },
            'todo': {
                keyPath: 'timestamp'
            }
        }).error((err) => {
            throw err;
        }).success(() => {
            done();
        });
    });
    after((done) => {
        // TODO: promise on close
        ingoose.close();
        // TODO: ingoose.truncate(db_name);
        var req = window.indexedDB.deleteDatabase(db_name);
        req.onsuccess = () => { done(); };
        req.onerror = (err) => { done(err); };
    });
    describe('model', () => {
        it('should provide Model-like class definition `ConstructableModel`', () => {
            var User = ingoose.model('user');
            var type: Object = typeof User;
            type.should.equal('function');
        });
    });
    describe('ConstructableModel', () => {
        it('should be initialized by `new` keyword', () => {
            var User = ingoose.model('user');
            var user = new User({age: 100});
            user.save.should.not.be.a('null');
            user.save.should.be.a('function');
        });
        it('should bind properties with `new` keyword', () => {
            var User = ingoose.model('user');
            var user = new User({
                foo: 'otiai10',
                age: 100
            });
            user['foo'].should.equal('otiai10');
        });
    });
    describe('Model', () => {
        describe('save', () => {
            it('should store this object', (done) => {
                var User = ingoose.model('user');
                var user = new User({name: 'otiai10', age: 28});
                user.save().success(() => {
                    done();
                });
            });
            // TODO: #1
            // it("should rise error if object doesn't have pathKey", (done) => {
            //     var User = ingoose.model('user');
            //     var user = new User({name: 'otiai10' /* , age: 28 */});
            //     user.save().error((err) => {
            //         done(err);
            //     });
            // });
        });
        describe('find', () => {
            it('should find all objects stored in this namespace', (done) => {
                var Todo = ingoose.model('todo');
                Todo.clear().error((err) => {
                    done(err);
                });
                Todo.find({min: 0}).success((res) => {
                    res.length.should.equal(0);
                    var todo = new Todo({
                        text: 'JavaScript',
                        timestamp: Date.now()
                    });
                    todo.save().error((err) => {
                        done(err);
                    }).success(() => {
                        Todo.find({min:0, max: Date.now() + 100}).success((res2) => {
                            res2.length.should.equal(1);
                            done();
                        }).error((err) => {
                            done(err);
                        });
                    });
                });
            });
            describe('when `only` query given', () => {
                it('should return only one object', (done) => {
                    var Todo = ingoose.model('todo');
                    Todo.clear().error((err) => {
                        done(err);
                    });
                    Todo.find({min: 0}).success((res) => {
                        res.length.should.equal(0);
                        var todo = new Todo({
                            text: 'CoffeeScript',
                            timestamp: 1234
                        });
                        todo.save().error((err) => {
                            done(err);
                        }).success(() => {
                            Todo.find({only: 1234}).success((res2) => {
                                res2.text.should.equal('CoffeeScript');
                                done();
                            }).error((err) => {
                                done(err);
                            });
                        });
                    });
                });
            });
        });
        describe('remove', () => {
            it('should remove object from storage by key', (done) => {
                var Todo = ingoose.model('todo');
                var python = new Todo({text: 'Python', timestamp: 1000});
                var php = new Todo({text: 'PHP', timestamp: 1010});
                var ruby = new Todo({text: 'Ruby', timestamp: 1101});
                python.save().success(() => {
                    php.save().success(() => {
                        ruby.save();
                    });
                });
                Todo.find({min: 0}).success((res) => {
                    res.length.should.not.equal(0);
                    Todo.find({only: 1010}).success(function (todo) {
                        todo.should.not.be.a('null');
                        todo.text.should.equal('PHP');
                        todo.timestamp.should.equal(1010);
                        todo.remove().success(function () {
                            Todo.find({only: 1010}).success(function (todo) {
                                chai.expect(todo).to.be.undefined;
                                done();
                            });
                        });
                    });
                });
            });
        })
    });
}
