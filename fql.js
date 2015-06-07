//Answer:
// Place your code here:

// Adds properties of obj2 into obj1
function merge(obj1, obj2) {
  var obj = {}
  for(var key in obj1) {
    obj[key] = obj1[key]
  }
  for(var key in obj2) {
    obj[key] = obj2[key]
  }
  return obj
}

var _where = function(collection, conditions) {
  return collection.filter(function(datum) {
    for(var key in conditions) {
      if(typeof conditions[key] === 'function') {
        if(!conditions[key](datum[key])) {
          return false
        }
      } else {
        if(datum[key] !== conditions[key]) {
          return false
        }
      }
    }
    return true
  })
}

var _pluck = function(collection, keys) {
  return collection.map(function(datum) {
    var obj = {}
    keys.forEach(function(key) {
      obj[key] = datum[key]
    })
    return obj
  })
}

// var people = [
//   { name: 'zeke', favColor: 'blue', favFood: 'sushi' },
//   { name: 'stan', favColor: 'grey', favFood: 'korean barbeque' }
// ]

// _pluck(people, ['name', 'favFood'])


var FQL = function(data) {
  this.data = data
  this.indexTables = {}
};

FQL.prototype.select = function(columns) {
  return new FQL(_pluck(this.data, columns))
}

FQL.prototype.order = function(key) {
  return new FQL(this.data.sort(function(a, b) {
    if(a[key] > b[key]) return 1
    else if(a[key] < b[key]) return -1
    else return 0
  }))
}

FQL.prototype.left_join = function(otherFql, matchingFunc) {
  var self = this
  var results = []
  this.data.forEach(function(datum) {
    otherFql.exec().forEach(function(otherDatum) {
      if(matchingFunc(datum, otherDatum)) {
        results.push(merge(datum, otherDatum))
      }
    })
  })
  return new FQL(results)
}

FQL.prototype.addIndex = function(column) {
  var obj = {}
  this.data.forEach(function(datum, i) {
    var indexName = datum[column]
    if(Array.isArray(obj[indexName])) {
      obj[indexName].push(i)
    } else {
      obj[indexName] = [i]
    }
  })
  this.indexTables[column] = obj
}

FQL.prototype.hasIndex = function(column) {
  return !!this.indexTables[column]
}

FQL.prototype.getIndicesOf = function(column, value) {
  if(this.hasIndex(column)) {
    return this.indexTables[column][value]
  }
}

FQL.prototype.where = function(conditions, n) {
  n = n || 0
  //if any of the conditions are indexed, take advange of that
  var self = this
  var conditionKeys = Object.keys(conditions)
  if(conditionKeys.length === n) {
    return this
  }

  key = conditionKeys[n]

  if(self.hasIndex(key)) {
    return new FQL(self.getIndicesOf(key, conditions[key]).map(function(i) {
      return self.data[i]
    })).where(conditions, n + 1)
  } else {
    var query = {}
    query[key] = conditions[key]
    return new FQL(_where(this.data, query)).where(conditions, n + 1)
  }

}

FQL.prototype.limit = function(n) {
  return new FQL(this.data.slice(0, n))
}

FQL.prototype.count = function() {
  return this.data.length
}

FQL.prototype.exec = function() {
  return this.data
}

 
// Place your code here:

// // Adds properties of obj2 into obj1
// function merge(obj1, obj2) {
//     var tempObj = {};
//     for (var keys in obj1) {
//         tempObj[keys] = obj1[keys];
//     }
//     for (var keys in obj2) {
//         tempObj[keys] = obj2[keys];
//     } 
//     return tempObj;
// }


// var FQL = function(data) {

//     this.obj = {};

//     this.exec = function() {
//         return data;
//     }

//     this.count = function() {
//         return data.length;
//     }

//     this.limit = function(num) {
//         return new FQL(data.slice(0,num));
//     }

//     this.hasIndex=function(){
//         return !!this.indexTables[column];
//     }

//     this.where = function(searchObj) {
//         // var arrOfmovies = [];
//         // for (var i = 0; i < data.length; i++) {
//         //     var tempNum = 0;
//         //     for(var props in searchObj){
//         //         if(searchObj.hasOwnProperty(props)){
//         //             if(typeof searchObj[props]==='function'){
//         //                 if(searchObj[props](data[i][props])){
//         //                     tempNum++;    
//         //                 }
//         //             }else if(searchObj[props] === data[i][props]) {
//         //                 tempNum++;
//         //             }
//         //         }
//         //     }
//         //     if (tempNum === Object.keys(searchObj).length) {
//         //         arrOfmovies.push(data[i]);
//         //     }
//         // }
//         // data = arrOfmovies;
//         // return this;
//         return new FQL(data.filter(function(datum){
//             for (var key in searchObj){
//                 if(typeof searchObj[key]==='function'){}
//             }
//             return true;
//         }))
//         //a helpful library that one can use is lodash;
//     }
//     var _pluck=function(collection,keys){
//         return collection.map(function(datum){

//         })
//     }

//     this.select = function(keysArray) {
//         var filteredArray = [];
//         for (var i = 0; i < data.length; i++) {
//             var tempObj = {};
//             for (var props in data[i]) {
//                 if(data[i].hasOwnProperty(props)) {
//                     if (keysArray.indexOf(props.toString()) > -1) {
//                         tempObj[props] = data[i][props];
//                     }
//                 }
//             }
//             filteredArray.push(tempObj);
//         }
//         data = filteredArray;
//         return new FQL();
//     }

//     this.order = function(key) {
//         return new FQL(data.sort(function(a, b) {
//             if (a[key] > b[key]) {
//                 return 1;
//               }
//               if (a[key] < b[key]) {
//                 return -1;
//               }
//               // a must be equal to b
//               return 0;
//             })
//        );
//     }

//     this.left_join=function(newData,matchFunc){
//         var roles=newData.exec();
//         var tempArr=[];
//         for (var i = 0; i < data.length; i++) {
//             for(var j=0; j<roles.length; j++){
//                 if(matchFunc(data[i],roles[j])){
//                     tempArr.push(merge(data[i],roles[j]));
//                 }
//             }
//         }

//         data=tempArr;
//         return this;
//     }

//     this.getIndicesOf = function(var1,var2){

//         if (this.obj.hasOwnProperty(var1)) {
//             return this.obj[var1][var2];
//         }
//         else {
//             return undefined;
//         }
//     }


//     this.addIndex = function(key){
//         var tempObj={};
//         data.forEach(function(datum,i){
//             var indexName=datum[key]
//             if(Array.isArray(tempObj[indexName]))
//                 tempObj[indexName].push(i)
//             else
//                 tempObj[indexName]=[i]
//         })
//         this.obj[key]=tempObj;
        
//         // var wrapper = function(x) {
//         //     return x;
//         // }

//         // var tempObj = {};

        
//         // for (var i = 0; i < data.length; i++) {
//         //     if (!tempObj.hasOwnProperty(data[i][key])) {
//         //         tempObj[(data[i][key])] = [];
//         //         tempObj[(data[i][key])].push(wrapper(i));
//         //     }
//         //     else {
//         //         tempObj[(data[i][key])].push(wrapper(i));
//         //     }

//         // }
//         // this.obj[key] = tempObj;
//         // console.log(this.obj);
//     }


// };