var ESA = function (...args) {
  if (!new.target) throw 'Foo() must be called with new';

  // this.prototype = Object.create({});
  const id = function (length = 4) {
    return Array.from({length}, (v,i) => (parseInt(Math.random() * Number.MAX_SAFE_INTEGER)).toString(16).slice(0,6).toUpperCase()).join('-')
  }

  const flatten = function (...args) {
    return Array.prototype.reduce.call(args, function(acc, elem) { return acc.concat(elem) }, [])
  }

  this.sum = (...args) => Array.prototype.reduce.call(args, function (x, y) {
    return x + y;
  }, 0);

  const interceptor = new Proxy(ESA, {
    construct: function(target, argumentsList, newTarget) {
      console.log('called: ' + argumentsList.join(', '));
       return { 
        id: id()
      };
    }
  })
  return new interceptor(...args);
}


var KPITEMPLATE = function (...args) {

  const interceptor = function () {
    return new Proxy(this, {
      preventExtensions: function(target) {
        return true;
      },
      defineProperty(target, prop, descriptor) {
        console.log(descriptor);
        return Reflect.defineProperty(target, prop, descriptor);
      },
      get: function (target, property, receiver) {
        const { handler, value, formula } = target[property];
        return handler.get(value);
      },
      set: function(target, property, newValue, receiver) {
        const { handler, value, formula } = target[property];
        return target[property].value = handler.set(newValue, value);
      }
    })
  }

  const types = [String, Number, Date, Boolean, Map, Set, Array, ArrayBuffer, Float32Array, Float64Array]
  
  const validators = {
    'Number'() {}
  }

  const props = {
    goal: 'sum',
    value: 'sum',
    totalValue: 'sum',
    previouslyShipped: 'sum',
    kpiPercentage: 'avg',
  };

  const getId = function (length = 4) {
    return Array.from({length}, (v,i) => (parseInt(Math.random() * Number.MAX_SAFE_INTEGER)).toString(16).slice(0,6).toUpperCase()).join('-')
  }

  const recipeFactory = function (property) {
    const recipe = props[property]
    const recipes = {
      sum: {
        default: 0,
        type: Number,
        min: -100,
        max: 100,
        descriptor: {
          get: function (...args) {
            let { stack, id } = recipes[recipe];
            return stack;
          },
          set: function (newValue) {
            let { stack, id } = recipes[recipe];
            stack.push(newValue || 0);
            return true;
          }
        }
      },
      avg: {
        stack: [0],
        default: 0,
        type: Number,
        typeCheck:  n => !isNaN(parseFloat(n)) && isFinite(n),
        id: Array.from({length: 4}, (v,i) => (parseInt(Math.random() * Number.MAX_SAFE_INTEGER)).toString(16).slice(0,6).toUpperCase()).join('-'),
        descriptor: {
          enumerable: true,
          configurable: true,
          get: function (...args) {
            let { stack, id } = recipes[recipe];
            return stack.reduce((acc, curr) => acc + curr, 0 ) / stack.length
          },
          set: function (newValue) {
            let { stack, id } = recipes[recipe];
            stack.push(newValue || 0);
            return true;
          }
        }
      }
    }

    return recipes[recipe];
  }

  const recipes = Object.keys(props).reduce((hash, key) => {
    return Object.assign(hash, {
      [key]: recipeFactory(key).descriptor
    })
  }, {});
  Object.defineProperties(this, recipes);

  const buildKpiTemplate = function (formulas) {
    return Object.keys(formulas).reduce(function (template, key) {
      return Object.assign(template, { [key]: formulas[key].value });
    }, {});
  }

  const clean = function (object, preserve = true) {
    return Object.keys(object).reduce(function(hash, key) {
      if (key in props) {
        return Object.assign(hash, { [key]: recipeFactory(key).default  });
      } else {
        return Object.assign(hash, ( preserve ? { [key]: object[key]  } : {}));
      }
    }, {});
  }

  const combine = function (...args) {

    const template = new KPITEMPLATE();
    args.forEach(element => {
      Object.keys(props).forEach(prop => {
        template[prop] = element[prop];
        console.log('x:', props)
      })
    })
    return template;
  }

  const template = (...args) => Object.assign(this, ...args)

  // return this.interceptor();
  const [ initial ] = args;
  console.log(initial)
  if(args.length < 2 && typeof args === 'object') {
    // console.log(clean(args))
    return Object.assign(this, clean(args))
  }
  return this;

}


