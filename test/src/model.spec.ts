/// <reference path="../lib.ts" />
/// <reference path="../../src/model.ts" />

module Spec {
    chai.should();

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
}
