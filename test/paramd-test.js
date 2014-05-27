var param = require('../'),
    expect     = require('expect.js');

describe('paramd', function() {
  describe('constructor', function() {
    it('returns a function', function() {
      expect(param()).to.be.a(Function);
    });

    it('sets _whiteList to an empty Object', function() {
      expect(param()._whiteList).to.be.an(Object);
    });

    it('sets _blackList to an empty Object', function() {
      expect(param()._blackList).to.be.an(Object);
    });
  });

  describe('require', function() {
    it('returns itself', function() {
      var paramd = param();
      expect(paramd.require('blah')).to.be(paramd);
    });

    it('sets whitelisting', function() {
      var paramd = param().require('test');
      expect(paramd._whitelisting).to.be(true);
      expect(paramd.except.bind(paramd, 'another')).to.throwError();
    });

    it('throws an error if it is missing', function() {
      var paramd = param().require('name');
      function setAge() {
        paramd({age: 123});
      }
      expect(setAge).to.throwError('name is missing');
    });

    it('allows setting the error status code', function() {
      var paramd = param().require('name', { status: 123 });
      try {
        paramd({test: 'woo'});
        expect(true).to.be(false);
      } catch(e) {
        expect(e.status).to.be(123);
      }
    });
  });

  describe('optional/allow', function() {
    it('equal to optional and allow', function() {
      var paramd = param();
      expect(paramd.allow).to.be(paramd.optional);
    });
    it('allows the parameter through', function() {
      var paramd = param().optional('age');
      var params = paramd({age: 27});
      expect(params).to.have.property('age', 27);
    });

    it('sets whitelisting', function() {
      var paramd = param().optional('test');
      expect(paramd._whitelisting).to.be(true);
      expect(paramd.except.bind(paramd, 'another')).to.throwError();
    });
  });

  describe('except/filter', function() {
    it('equal to filter and expect', function() {
      var paramd = param();
      expect(paramd.except).to.be(paramd.filter);
    });
    it('filters the parameter', function() {
      var paramd = param().except('test');
      var params = paramd({test: true, other: false});
      expect(params).to.have.property('other', false);
      expect(params).to.not.have.property('test');
    });

    it('sets blacklisting', function() {
      var paramd = param().except('test');
      expect(paramd._whitelisting).to.be(false);
      expect(paramd.require.bind(paramd, 'another')).to.throwError();
    });
  });

  describe('functionality', function() {
    describe('white list mode', function() {
      it('filters unspecified attributes', function() {
        var paramd = param().require('name');
        var params = paramd({name: 'Bob', age: 27 });
        expect(params).to.have.property('name', 'Bob');
        expect(params).to.not.have.property('age');
      });
    });

    describe('black list mode', function() {
      it('filters specified attributes', function() {
        var paramd = param().filter('name');
        var params = paramd({name: 'Bob', age: 27 });
        expect(params).to.have.property('age', 27);
        expect(params).to.not.have.property('name');
      });
    });

    it('allows conditional rules', function() {
      var returnFalse = function(attrs) {
        expect(attrs).to.have.property('name', 'Dave');
        return false;
      };

      var paramd = param()
        .require('something', { if: returnFalse })
        .optional('name');

      var result = paramd({name: 'Dave'});
      expect(result).to.have.property('name', 'Dave');

      var paramd = param().allow('name', { if: returnFalse });
      result = paramd({name: 'Dave'});
      expect(result).to.not.have.property('name');
    });
  });
});
