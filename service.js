const elasticsearch = require('elasticsearch');
const $q = require('q');

var client = new elasticsearch.Client({
  host: '35.198.240.233:9200',
  log: 'trace'
});

var service = {};
module.exports = service;

function getItem(org,id){
	console.time("elasticsearch mget");
	return client.mget({
		index: org, 
		body: {
			ids: id
		}
	}).then(function(results){
		console.timeEnd("elasticsearch mget");
		if (!results.docs[0].found) {
			return null;
		} else {
			return results;
		}
	}).catch(function(err) {
		throw new Error(err);
	});
}

function expandIds(items,options){
	// Convert to array if items is an object (get operations)
	var deferred = $q.defer();
	if(!items){
		return $q.when(null);
	}
	if(!options.expandKeys && !options.contextKey){
		return $q.when(items);
	}

	var fetchIds = [];
	items.forEach(function(item){
		options.expandKeys && options.expandKeys.forEach(function(expandKey){
			if (Array.isArray(item._source[expandKey])){
				item[expandKey].forEach(function(idInExpandKey){
					fetchIds.push(IdInExpandKey)
				})
			} else {
				fetchIds.push(item._source[expandKey]);
			}
		})
		// Assuming structure is UserId.ItemId.context
		options.contextKey && fetchIds.push([options.contextKey,item._id,"context"].join("."))
	})	
	deferred.resolve({ids: fetchIds});
	return deferred.promise;
}

function retrieveExpandedIds(org, fetchIds, items, options) {
	return client.mget({index:org,body:{ids:fetchIds}}).then(function(expandResults){
		var lookup = {};
		expandResults.docs.forEach(function(expandedItem){
			lookup[expandedItem._id] = expandedItem;
		})
		items.forEach(function(item){
			if(!!options.expandKeys){
				options.expandKeys.forEach(function(expandKey){
					var targetId = item._source[expandKey];
					item._source["$" + expandKey.replace("@","")] = lookup[targetId];
				})
			}
			if(!!options.contextKey){
				var target = [options.contextKey,item._id,"context"].join(".");
				item.$context = lookup[target];
			}
		})
		return Array.isArray(items) ? items[0] : items;
	})
}

service.get = function(org, id, options){
	// Validation	
	if(!id) throw new Error("Missing required property id");
	if(!org || typeof org !="string") throw new Error("Missing required property org");
	if(options && options.expandKeys && !Array.isArray(options.expandKeys)){
		throw new Error("options.expandKeys must be an array of strings");
	}
	
	console.time("process");
	return getItem(org, id).then(function(items){
		console.timeEnd("process");
		// var isArray = Array.isArray(items);
		// if(!isArray){
		// 	items = [items];
		// }
		return expandIds(items, options).then(function(results) {
			if (results && results.ids) {
				return retrieveExpandedIds(org, results.fetchIds, items, options);
			} else {
				var after = new Date().getTime();
				return results;
			}
		}).catch(function(err) {
			console.log(err);
		});
	}).catch(function(err) {
		console.log(err);
	});
}

service.search = function(query){
	console.time("elasticsearch query");
	return client.search({
		index: 'oikos', 
		size : 25,
		q: 'name:' + query
	}).then(function(results){
		console.timeEnd("elasticsearch query");
		return results;
	}).catch(function(err) {
		console.log(err);
	});
}
