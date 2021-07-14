'use strict';
/**
 * function to build an optimized exportable reducer similar to case statements
 * 
example:
export default buildReducer(

   { data : { isAuthenticated : false }} // default state is first param

   , "some_unique_path"
   , "some_other_path"
   , (state, action) => { 
     return { ...state, data : { isAuthenticated : false } } 
    }

   , "some_unique_path_2"
   , "some_unique_path_3"
   , "some_unique_path_4"
   , "some_unique_path_5"
   , (state, action) => { 
     return { ...state, data : { isAuthenticated : true } } 
    }
)

alternative example:
export default buildReducer(

   () => ([
     { data : { isAuthenticated : false }} // default state is first param
     , "isApi" // key, such as "type", or any property from the action
   ])

   , "some_unique_path"
   , "some_other_path"
   , (state, action) => { 
     return { ...state, data : { isAuthenticated : false } } 
    }

   , "some_unique_path_2"
   , "some_unique_path_3"
   , "some_unique_path_4"
   , "some_unique_path_5"
   , (state, action) => { 
     return { ...state, data : { isAuthenticated : true } } 
    }
)

 * 
 * @param {any} default value for the reducer
 * @param {any} n number of arguments
 * @returns {function} returns a reducer style function
 */

function buildDefault (arr, types) {

  arr.forEach( function(item) {

    types[ item() + "_PENDING" ] = function (state) {
      return Object.assign(
        {}
        , state
        , { pending : true, rejected : false }
      )
    }

    types[ item() + "_REJECTED" ] = function (state, action) {
      return Object.assign(
        {}
        , state
        , { pending : false, rejected : true }
        , action
      )
    }

    types[ item() + "_FULFILLED" ] = function (state, action) {
      return Object.assign(
        {}
        , state
        , { pending : false, rejected : false }
        , action.payload
        , action
        , { payload : undefined }
      )
    }

  })

}

module.exports = function () {

  var args = Array.prototype.slice.call(arguments)
    , def = args.shift()
    , meta
    , key = "type"

  if (typeof def === "function") {
    meta = def()
    def = meta[0]
    key = meta[1] || "type"
  }

  var types = {}
    , fun
    , t
    , x = args.length

  while (x) {
    t = args[--x]
    if (typeof t === "function")
      fun = t
    else if (typeof t === "string")
      types[t] = fun
    else if (typeof t === "object" && t.length)
      buildDefault(t, types)
  }

  return function(s, a) {
    s = s || def
    return types[a[ key ]] ? types[a[key]](s, a) : s
  }

}