var whitelist_string = `
Collection!entry price!alarm price
gemmy!1.5!3
ghost_kid_dao!1.55!4
zenjin_bottle!0.95!1.8
zenjinviperz!4.5!11
mellowmen!1.4!3.4
tiny_dogz!1.2!1.8
tiny_pupz!1.5!2
ohmygirls!0.56!1.2
wallet_balance!4
original_sol_balance!23.6
`
var html_template = `
<div class="wl_item ALARM PROJECTID">
<a target="_blank" class="melink" href="MELINK"><img src="/static/me.png"/></a>
<a target="_blank" class="sol_sniper_link" href="SOLSNIPERLINK"><img src="/static/solsniper-icon.png"/></a>
<span class="fl collection_name">NAME</span>
<span class="fl collection_entry">ENTRY</span>
<span class="fl collection_current">CURRENT</span>
<span class="fl collection_profit SIGN">PROFIT%</span>
<img class="loader" src="/static/loading.gif"/>
</div>
`
var all_project_names = [];
var duplication_counts = {};
var project_currents = {};
var total_entry = 0;
var formatted_array_of_dicts = [];
var first_time = true;

//Magic eden
var link_sample = "https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/COLLECTIONNAME";
//Coral cube
//var link_sample = "https://api.coralcube.io/v1/getItems?offset=0&page_size=24&ranking=price_asc&symbol=COLLECTIONNAME"
var link_sample_2 = "https://api-mainnet.magiceden.io/rpc/getCollectionEscrowStats/gemmy";
var me_link_sample = "https://magiceden.io/marketplace/COLLECTIONNAME";
var sol_sniper_link_sample = "https://www.solsniper.xyz/collection/COLLECTIONNAME";
function organize_array_from_local_storage(){
    formatted_array_of_dicts = [];
    var array_of_projects = localStorage.getItem("wl_string").split("\n");
    for (let i = 0; i < array_of_projects.length; i++) {
        var line = array_of_projects[i];
        var wallet_balance = line.indexOf("wallet_balance");
        var original_sol_balance = line.indexOf("original_sol_balance");
        if (line != "" && line != "Collection!entry price!alarm price"){
            var splitted_str = line.split('!');
            var project_object = {};
            if (wallet_balance == 0){
                localStorage.setItem("wallet_balance", splitted_str[1]);
            }
            else if (original_sol_balance == 0){
                localStorage.setItem("original_sol_balance", splitted_str[1]);
            }
            else {
                project_object['name'] = splitted_str[0];
                project_object['entry'] = splitted_str[1];
                project_object['alarm'] = splitted_str[2];
                formatted_array_of_dicts.push(project_object);
                if (first_time){
                    all_project_names.push(project_object['name']);
                    project_object['repeat_count'] = 0;
                    var occurence_number = count_duplicates_of_item(all_project_names, project_object['name']);
                    project_object['repeat_count'] = occurence_number;
                }
            }
        }
    }
    if (first_time){
        duplication_counts = count_duplicates(all_project_names);
    }
    return formatted_array_of_dicts;
}
function update(){
    total_entry = 0;
    total_current = 0;
    formatted_array_of_dicts = organize_array_from_local_storage();
    all_html = "";
    var local_projects_count = [];
    for (let i = 0; i < formatted_array_of_dicts.length; i++) {
        var project_html = html_template;
        var project = formatted_array_of_dicts[i];
        local_projects_count.push(project['name']);
        var current = get_floor_from_collection_name(project['name']);
        var entry = parseFloat(project['entry']);
        var profit = current - entry;
        var profit_percentage = ((profit/entry)*100).toFixed(0);
        if (profit_percentage == Infinity){
            profit_percentage = "&#8734;"
        }
        var sign = "positive";
        if (profit < 0){
            sign = "negative"
        }
        var alarm = "";
        if (current >= parseFloat(project['alarm'])){
            alarm = "alarm"
        }
        project_html = html_template
        .replace("NAME", project['name'])
        //.replace("PROJECTID", project['name'])
        .replace("ENTRY", project['entry'])
        .replace("CURRENT", current)
        .replace("SIGN", sign)
        .replace("PROFIT", profit_percentage)
        .replace("MELINK", me_link_sample.replace("COLLECTIONNAME", project['name']))
        .replace("SOLSNIPERLINK", sol_sniper_link_sample.replace("COLLECTIONNAME", project['name']))
        .replace("ALARM", alarm);

        //append number to the end of the NFT #ID if repeated
        //if (duplication_counts[project['name']] == 1){
            //if not repeated just put #project_name as id
            //project_html = project_html.replace("PROJECTID", project['name'])
        //}
        //else{
            //if repeated add #project_name1 as id
            //project_html = project_html.replace("PROJECTID", project['name'] + count_duplicates_of_item(local_projects_count, project['name']))
        //}
        var project_html_id =  project['name'] + count_duplicates_of_item(local_projects_count, project['name'])
        project_html = project_html.replace("PROJECTID", project_html_id);
        project_currents[project_html_id] = current;

        all_html = all_html + project_html;
        total_current += current;
        total_entry += parseFloat(project['entry']);
        //setTimeout(project_specific_refresh(project), 20000);
    }
    first_time = false;
    //calculate totals
    var project_html = html_template;
    var profit = total_current - total_entry;
    var profit_percentage = ((profit/total_entry)*100).toFixed(0);
    var sign = "positive";
    if (profit < 0){
        sign = "negative"
    }
    project_html = html_template
    .replace("PROJECTID", "current_positions")
    .replace("NAME", "current positions")
    .replace("ENTRY", total_entry.toFixed(1))
    .replace("CURRENT", total_current.toFixed(1))
    .replace("SIGN", sign)
    .replace("PROFIT", profit_percentage)
    .replace(`<img class="loader" src="/static/loading.gif"/>`, "")
    .replace("ALARM", "");
    all_html = all_html + project_html;
    //end of totals calculation

    //calculation of portfolio performance
    var wallet_balance = parseFloat(localStorage.getItem("wallet_balance"));
    var original_sol_balance = parseFloat(localStorage.getItem("original_sol_balance")); 
    total_current += wallet_balance;
    profit = total_current - original_sol_balance;
    profit_percentage = ((profit/original_sol_balance)*100).toFixed(0);
    sign = "positive";
    if (profit < 0){
        sign = "negative"
    }

    project_html = html_template
    .replace("PROJECTID", "wallet_balance")
    .replace("NAME", "wallet balance")
    .replace("ENTRY", "")
    .replace("CURRENT", wallet_balance)
    .replace("SIGN", "")
    .replace("PROFIT%", "")
    .replace(`<img class="loader" src="/static/loading.gif"/>`, "")
    .replace("ALARM", "");
    all_html = all_html + project_html;

    project_html = html_template
    .replace("PROJECTID", "totals")
    .replace("NAME", "totals")
    .replace("ENTRY", original_sol_balance.toFixed(1))
    .replace("CURRENT", total_current.toFixed(1))
    .replace("SIGN", sign)
    .replace("PROFIT", profit_percentage)
    .replace(`<img class="loader" src="/static/loading.gif"/>`, "")
    .replace("ALARM", "");
    all_html = all_html + project_html;
    //end calculation of portfolio performance

    $("#actual_wl").html(all_html);
}
//localstorage specific script
function update_wl(){
    localStorage.setItem("wl_string", document.getElementById("watchlist").value);
    //refresh page
    location.reload();
}
function infinity(){
    $(".loader").show();
    update();
    setTimeout(infinity, 120000);
    $(".loader").hide();
}
function project_specific_refresh_caller(){
    if (!first_time){
        $(".loader").show();
        for (let i = 0; i < formatted_array_of_dicts.length; i++) {
            var repeated_count = formatted_array_of_dicts[i]['repeat_count'];
            project_specific_refresh(formatted_array_of_dicts[i], repeated_count);
        }
    }
}
//takes in project with keys name, entry, alarm
function project_specific_refresh(project, repeat_count){
    var project_div_html_id = "." + project['name'];
    if (repeat_count > 0){
        project_div_html_id += repeat_count;
    }
    console.log(project_div_html_id);
    var project_loader_handle = project_div_html_id + " .loader";
    var project_current_handle = project_div_html_id + " .collection_current";
    var project_profit_handle = project_div_html_id + " .collection_profit";
    var strUrl = link_sample.replace("COLLECTIONNAME", project['name']);

    jQuery.ajax({
        method: "GET",
        url: "/",
        data: {url_to_call: strUrl},
        success: function(html) {
            $(project_loader_handle).hide();
            strReturn = html;
            var project_json_object = JSON.parse(strReturn);
            var current = project_json_object['results']['floorPrice']/1000000000;
            project_currents[project_div_html_id] = current;

            console.log("refreshing " + project['name'] + " " + current);
            var entry = parseFloat(project['entry']);
            var profit = current - entry;
            var profit_percentage = ((profit/entry)*100).toFixed(0);
            if (profit_percentage == Infinity){
                profit_percentage = "&#8734;"
            }
            var sign = "positive";
            if (profit < 0){
                sign = "negative"
            }
            var alarm = "";
            if (current >= parseFloat(project['alarm'])){
                alarm = "alarm"
            }
            
            $(project_current_handle).html(current.toFixed(2));
            $(project_profit_handle).removeClass("positive").removeClass("negative");
            $(project_profit_handle).addClass(sign);
            $(project_profit_handle).html(profit_percentage + "%");
            $(project_div_html_id).removeClass("alarm");
            $(project_div_html_id).addClass(alarm);
        }
    });
}
function async_totals_calculation(){
    //the below line sums the current floor values taking into consideration repeated collections
    //the below line is a js wonder because it is unreadable but looks good
    var total_current = array_sum(obj_values(project_currents));
    var profit = total_current - total_entry;
    var profit_percentage = ((profit/total_entry)*100).toFixed(0);
    var sign = "positive";
    if (profit < 0){
        sign = "negative"
    }

    //updating current positions
    $("#current_positions .collection_current").html(total_current.toFixed(2));
    $("#current_positions .collection_profit").removeClass("positive").removeClass("negative");
    $("#current_positions .collection_profit").addClass(sign);
    $("#current_positions .collection_profit").html(profit_percentage + "%");

    //calculating totals
    var wallet_balance = parseFloat(localStorage.getItem("wallet_balance"));
    var original_sol_balance = parseFloat(localStorage.getItem("original_sol_balance")); 
    total_current += wallet_balance;
    profit = total_current - original_sol_balance;
    profit_percentage = ((profit/original_sol_balance)*100).toFixed(0);
    sign = "positive";
    if (profit < 0){
        sign = "negative"
    }

    //updating totals
    $("#totals .collection_current").html(total_current.toFixed(2));
    $("#totals .collection_profit").removeClass("positive").removeClass("negative");
    $("#totals .collection_profit").addClass(sign);
    $("#totals .collection_profit").html(profit_percentage + "%");
}
$(document).ready(function(){
    var wl_string = localStorage.getItem("wl_string");
    if (wl_string != null){
        $('textarea').val(wl_string);
    }
    //infinity();
    update();
    //removed automatic refresh because ME keeps blocking our server
    //setInterval(function () {project_specific_refresh_caller()}, 30000);
    //setInterval(function () {async_totals_calculation()}, 35000);
});

//TODO
//DONE fix asynchronous request API DONE
//DONE handle multiple entry points in same collection div id DONE
//find a way to refresh totals in async
//DONE add links for solsniper.xyz and ME 
//DONE create infinity percentage in case of entry = 0 
//DONE add refresh button for psychological reasons
//build average sol purchase value to evaluate portfolio in USD
//link to api for sol usd price
//add a toggle button to switch from sol to usd
//add opensea support
//improve watchlist UI to match yahoo finance
//improve watchlist setup UX & UI
//make UI mobile friendly
//switch from local sotorage to username & backend database
//switch from username to wallet connect
//read other utility tokens values and fetch floor from FFF
//create wallet token needed for app to werk
//track purchases and wallet balance from wallet & solscan

