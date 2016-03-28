'use strict';
var def = require('./../index');

describe('validator', function () {
    it('should return function', function() {
        expect(def.validator({path:'a', validators:[]})).toBeDefined();
    });

    it('should throw when target absents', function() {
        var fn = def.validator({path:'a',validators:[]});
        expect(()=>fn(null)).toThrow();
    });

    it('should throw when scheme absents', function() {
        expect(()=>def.validator(null)).toThrow();
    });

    it('should throw if the validation part is not specified', function() {
        expect(()=>def.parser('a.b.c')).toThrow();
    });
    it('should not throw if the path part is not specified', function(){
        expect(()=>def.parser('#asd')).not.toThrow();
    });

    it('should return a path without validation part', function() {
        var res = def.parser('a#c');
        expect(res.path).toEqual(['a']);
    });

    it('should throw error when not a string passed', function() {
        expect(()=>def.parser({})).toThrow();
    });
    it('should throw an error if the validator is not specified', function() {
        expect(()=>def.validatorProvider.put()).toThrow();
    });

    it('should throw an error if the name for the validator doesn\'t exist', function() {
        expect(()=>def.validatorProvider.get({})).toThrow();
    });
    it('should put the validator for the name specified', function() {
        expect(()=>def.validatorProvider.put({$name: 'name'})).not.toThrow();
    });
    it('should throw an error if the validator is not specified', function() {
        expect(()=>def.validatorProvider.put('name')).toThrow();
    });
    it('should return the validator for the name passed', function(){
        var name = 'name';
        def.validatorProvider.put( {$name:name});
        expect(def.validatorProvider.get(name)).toBeDefined();
    });
    it('should return "notNull" validator', function() {
        expect(def.validatorProvider.get('notNull')).toBeDefined();
    });

    it('should check the path to exist', function() {
        var notNull = def.validatorProvider.get('notNull');
        expect(notNull({a: {d: 10}}, ['a', 'd'])).toBeTruthy();
    });
    it('should fail while checking the path to exist', function() {
        var notNull = def.validatorProvider.get('notNull');
        expect(notNull({a: {}}, ['a', 'd'])).toBeFalsy();
    });

    it('should fail while checking the path to exist, because of the null term', function() {
        var notNull = def.validatorProvider.get('notNull');
        expect(notNull({a: {d:null}}, ['a', 'd'])).toBeFalsy();
    });

    it('should fail while checking the path to exist if path is not completed', function() {
        var notNull = def.validatorProvider.get('notNull');
        expect(notNull({a: {}}, ['a', 'd', 'c', 'e'])).toBeFalsy();
    });

    it('should return validation function', function() {
        expect(def.validator({
            path: 'a.b',
            validators:['notNull']
        })).toBeDefined();
    });

    it('should validate passed expression', function(){
        var validationFunction = def.validator({
            path: 'a',
            validators:['notNull']
        });
        var context = {a: 10};
        expect(validationFunction(context)).toEqual({success: true, errors:[]});
    });

    it('should validate passed expression and return errors', function(){
        var validationFunction = def.validator({
            path: 'a.b',
            validators:['notNull']
        });
        var context = {a: 10};
        expect(validationFunction(context)).toEqual({success: false, errors:['a.b#notNull']});
    });
    
    it('should not check validator if any condition returns false', ()=>{
        var validationFunction = def.validator({
            path: 'a.b',
            validators:['notNull'],
            conditions:[
                function (context) {
                    return context.a === 10;
                },
                function (context) {
                    return context.a !== 10;
                }
            ]
        });
        var context = {a: 10};
        expect(validationFunction(context)).toEqual({success: true, errors:[]});
    });

    it('should check validator if all conditions return true', ()=>{
        var validationFunction = def.validator({
            path: 'a.b',
            validators:['notNull'],
            conditions:[
                function (context) {
                    return context.a === 10;
                },
                function (context) {
                    return context.a > 2;
                }
            ]
        });
        var context = {a: 10};
        expect(validationFunction(context)).toEqual({success: false, errors:['a.b#notNull']});
    });
});