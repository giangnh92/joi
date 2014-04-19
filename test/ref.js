// Load modules

var Lab = require('lab');
var Joi = require('../lib');
var Validate = require('./helper');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;


describe('ref', function () {

    it('uses ref as a valid value', function (done) {

        var schema = Joi.object({
            a: Joi.ref('b'),
            b: Joi.any()
        });

        schema.validate({ a: 5, b: 6 }, function (err, value) {

            expect(err).to.exist;
            expect(err.message).to.equal('the value of a must be one of ref:b');

            Validate(schema, [
                [{ a: 5 }, false],
                [{ b: 5 }, true],
                [{ a: 5, b: 5 }, true],
                [{ a: '5', b: '5' }, true]
            ]);

            done();
        });
    });

    it('uses ref with nested keys as a valid value', function (done) {

        var schema = Joi.object({
            a: Joi.ref('b.c'),
            b: {
                c: Joi.any()
            }
        });

        schema.validate({ a: 5, b: { c: 6 } }, function (err, value) {

            expect(err).to.exist;
            expect(err.message).to.equal('the value of a must be one of ref:b.c');

            Validate(schema, [
                [{ a: 5 }, false],
                [{ b: { c: 5 } }, true],
                [{ a: 5, b: 5 }, false],
                [{ a: '5', b: { c: '5' } }, true]
            ]);

            done();
        });
    });

    it('uses ref with combined nested keys in sub child', function (done) {

        var ref = Joi.ref('b.c');
        expect(ref.root).to.equal('b');

        var schema = Joi.object({
            a: ref,
            b: {
                c: Joi.any()
            }
        });

        var input = { a: 5, b: { c: 5 } };
        schema.validate(input, function (err, value) {

            expect(err).to.not.exist;

            var parent = Joi.object({
                e: schema
            });

            parent.validate({ e: input }, function (err, value) {

                expect(err).to.not.exist;
                done();
            });
        });
    });

    it('uses ref reach options', function (done) {

        var ref = Joi.ref('b/c', { separator: '/' });
        expect(ref.root).to.equal('b');

        var schema = Joi.object({
            a: ref,
            b: {
                c: Joi.any()
            }
        });

        schema.validate({ a: 5, b: { c: 5 } }, function (err, value) {

            expect(err).to.not.exist;
            done();
        });
    });

    it('ignores the order in which keys are defined', function (done) {

        var ab = Joi.object({
            a: {
                c: Joi.number()
            },
            b: Joi.ref('a.c')
        });

        ab.validate({ a: { c: '5' }, b: 5 }, function (err, value) {

            expect(err).to.not.exist;

            var ba = Joi.object({
                b: Joi.ref('a.c'),
                a: {
                    c: Joi.number()
                }
            });

            ba.validate({ a: { c: '5' }, b: 5 }, function (err, value) {

                expect(err).to.not.exist;
                done();
            });
        });
    });

    it('uses ref as default value', function (done) {

        var schema = Joi.object({
            a: Joi.any().default(Joi.ref('b')),
            b: Joi.any()
        });

        schema.validate({ b: 6 }, function (err, value) {

            expect(err).to.not.exist;
            expect(value).to.deep.equal({ a: 6, b: 6 });
            done();
        });
    });

    describe('#create', function () {

        it('throws when key is missing', function (done) {

            expect(function () {

                Joi.ref();
            }).to.throw('Missing reference key');
            done();
        });

        it('throws when key is missing', function (done) {

            expect(function () {

                Joi.ref(5);
            }).to.throw('Invalid reference key: 5');
            done();
        });

        it('finds root with default separator', function (done) {

            expect(Joi.ref('a.b.c').root).to.equal('a');
            done();
        });

        it('finds root with default separator and options', function (done) {

            expect(Joi.ref('a.b.c', {}).root).to.equal('a');
            done();
        });

        it('finds root with custom separator', function (done) {

            expect(Joi.ref('a+b+c', { separator: '+' }).root).to.equal('a');
            done();
        });
    });
});