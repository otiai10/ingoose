/// <reference path="../lib.ts" />
/// <reference path="../../src/model.ts" />

module Spec {
    chai.should();

    before((done) => {
        ingoose.connect('ingoose_test_testem', 1).schemas({
            'user': {
                keyPath: 'age'
            }
        }).error((err) => {
            throw err;
        }).success(() => {
            done();
        });
    });

    describe('model', () => {
        it('should provide Model-like class definition `ConstructableModel`', () => {
            var User = ingoose.model('user');
            (typeof User).should.equal('function');
        });
    });
    describe('ConstructableModel', () => {
        it('should be initialized by `new` keyword', () => {
            var User = ingoose.model('user');
            var user = new User();
            user.save.should.not.be.a('null');
            user.save.should.be.a('function');
        });
        it('should bind properties with `new` keyword', () => {
            var User = ingoose.model('user');
            var user = new User({
                foo: 'otiai10'
            });
            user.foo.should.equal('otiai10');
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
        describe('findAll', () => {
            it('should find all objects stored in this namespace', () => {
                var User = ingoose.model('user');
            });
        }) ;
    });
}
