function count_duplicates(sampleArray){
    var counts = {};
    sampleArray.forEach(function (x) { counts[x] = (counts[x] || 0) + 1; });
    return counts;
}
function count_duplicates_of_item(sampleArray, str){
    return sampleArray.filter(function(item){ return item === str; }).length
    //to test count_duplicates_of_item(['5','5','5','3','3','5'], '5')
}
//helper functions
function get_floor_from_collection_name(collection_name){
    var url = link_sample.replace('COLLECTIONNAME', collection_name);
    var floor = call_api(url);
    return floor
}
function get_floor_from_json(json_object){
    //Magic eden format
    floor = json_object['results']['floorPrice']/1000000000;
    if (floor == undefined){
        //coral cube format
        floor = json_object['collection']['floor_price']/1000000000
    }
    return floor
}
function call_api(strUrl){
    // strUrl is whatever URL you need to call
    var strReturn = "";
    jQuery.ajax({
        method: "GET",
        url: "/",
        data: {url_to_call: strUrl},
        success: function(html) {
            strReturn = html;
        },
        async:false
    });
    //str return is now floor price
    return parseFloat(strReturn);
    //console.log(strReturn);
    //return JSON.parse(strReturn);
}
function obj_values(obj){
    var array = [];
    for (key in obj){
        array.push(obj[key]);
    }
    return array;
}
function array_sum(array){
    return array.reduce((partialSum, a) => partialSum + a, 0);
}