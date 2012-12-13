var regions = { "SAS": "South Asia" , "ECS": "Europe and Central Asia", "MEA": "Middle East & North Africa", "SSF": "Sub-Saharan Africa", "LCN": "Latin America & Caribbean", "EAS": "East Asia &amp; Pacific", "NAC": "North America" },
	w = 800,
	h = 500,
	margin = 30,
	startYear = 2000, 
	endYear = 2011,
	startAge = 0.00001,
	endAge = 0.01,
	y = d3.scale.log().clamp(true).domain([endAge, startAge]).range([0 + margin, h - margin]),
	//y = d3.scale.linear().clamp(true).domain([endAge, startAge]).range([0 + margin, h - margin]),
	x = d3.scale.linear().domain([2000, 2010]).range([0 + margin -5, w]),
	years = d3.range(startYear, endYear);

var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
    // .attr("transform", "translate(0, 600)");

			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					

// Regions
var countries_regions = {};
/*d3.text('country-regions.csv', 'text/csv', function(text) {
    var regions = d3.csv.parseRows(text);
    for (i=1; i < regions.length; i++) {
        countries_regions[regions[i][0]] = regions[i][1];
    }
});*/

var raceClass = {"All races/ethnicities": "allraces", "American Indian/Alaska Native": "indian", "Asian": "asian", "Black/African American": "black", "Hispanic/Latino": "hispanic", "Multiple races": "multipleraces", "Native Hawaiian/Other Pacific Islander": "hawaiian", "White": "white"};
var sexClass = {"Both sexes": "bothsexes", "Male": "male", "Female": "female"};
var ageClass = {"Adults and adolescents": "allages", "13-24": "age1324", "25-34": "age2534", "35-44": "age3544", "45-54": "age4554", "55+": "age55"};
var stateClass = {"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Deleware": "DE", "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"};
var startEnd = {},
    countryCodes = {};
d3.text('clean-data/AIDS-data.csv', 'text/csv', function(text) {
    var states = d3.csv.parseRows(text);
    
    for (i=1; i < states.length; i++) {
        var values = states[i].slice(4, states[i.length-1]);
        var currData = [];
        countryCodes[states[i][1]] = states[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
                var uniqueId = stateClass[states[i][0]] + " " + raceClass[states[i][1]] + " " + sexClass[states[i][2]] + " " + ageClass[states[i][3]];
                if (!started) {
                    startEnd[uniqueId] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[uniqueId]['endYear'] = years[j];
                    startEnd[uniqueId]['endVal'] = values[j];
                }
            }
        }
        vis.append("svg:path")
            .data([currData])
            .attr("state", states[i][0])
            .attr("race", states[i][1])
            .attr("sex", states[i][2])
            .attr("age", states[i][3])
            .attr("class", stateClass[states[i][0]] + " " + raceClass[states[i][1]] + " " + sexClass[states[i][2]] + " " + ageClass[states[i][3]])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
            //.on("click", onclick);
    }
});  

var formatPercent = d3.format(".4d");
  
vis.append("svg:line")
    .attr("x1", x(2000))
    .attr("y1", y(startAge))
    .attr("x2", x(2010))
    .attr("y2", y(startAge))
    .attr("class", "axis")

vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startAge))
    .attr("x2", x(startYear))
    .attr("y2", y(endAge))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(5))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

var yticks = [0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01];
vis.selectAll(".yLabel")
    .data(yticks)
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(5))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startAge))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startAge)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks())
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(1999.9))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(2000))

d3.selection.prototype.moveToFront = function() { 
    return this.each(function() { 
        this.parentNode.appendChild(this); 
    }); 
};


function tabulate(data, columns) {
    $("#stories").empty();
    var table = d3.select("#stories").append("table").attr("class", "border").attr("style", "width:300px;"),
        tbody = table.append("tbody").attr("id", "storytbody");

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .on("click", onTableClick);

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                if (column == 'Picture') {
                    var value = '<img src="' + row[column] + '" />';
                    return {column: column, value: value};
                }
                if (column == 'Name') {
                    var value = '<p class="name">' + row[column] + '</p>';
                    return {column: column, value: value};
                }
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
            .html(function(d) { return d.value; });
    if ($('#storytbody').children().length == 0) {
        $('#stories').html("<h1>Sorry.</h1><p>We don't have any stories that fit this filter.</p>");
    }
    return table;
}

var filters = {};
d3.csv('clean-data/AIDS-stories.csv', passToTable);
function passToTable(data) {
    data = data.filter(function(row) {
        // run through all the filters, returning a boolean
        return ['State','Race','Sex','Age'].reduce(function(pass, column) {
            return pass && (
                // pass if no filter is set
                !filters[column] ||
                // pass if the row's value is equal to the filter
                // (i.e. the filter is set to a string)
                row[column] === filters[column] ||
                // pass if the row's value is in an array of filter values
                filters[column].indexOf(row[column]) >= 0
            );
        }, true);
    })
    var storiesTable = tabulate(data, ["Picture", "Name"]);   
}

function onTableClick(d, i) {
    var popupStory = "<div id=\"main-wrapper\"><div id=\"profile\"><div id=\"profile-pic\"><img src=\"" + d.Picture + "\" /></div><div id=\"basic-info\"><h1 id=\"name\">" + d.Name + "</h1><h3 id=\"location\">" + d.State + "</h3><h3 id=\"sex\">" + d.Sex + "</h3><h3 id=\"race\">" + d.Race + "</h3><h3 id=\"age\">" + d.Age + "</h3></div><div style=\"clear: both;\"></div><div id=\"story\"><p>" + d.Story + "</p></div></div></div>";
    $.colorbox({html:popupStory});
}

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
        .moveToFront()
        .attr("class", currClass + " current");
    
    var state = $(this).attr("state");
    var race = $(this).attr("race");
    var sex = $(this).attr("sex");
    var age = $(this).attr("age");
    var uniqueId = $(this).attr("class");
    if (uniqueId.indexOf("current") != -1) {
        uniqueId = uniqueId.slice(0, -" current".length);
    }
    if (uniqueId.indexOf("highlight") != -1) {
        uniqueId = uniqueId.slice(0, -" highlight".length);
    }
    var stateVals = startEnd[uniqueId];
    var percentChange = Math.round((stateVals['endVal'] - stateVals['startVal']) * 1000000) / 1000000;
    
    var blurb = '<h2>' + state + ' &bull; ' + sex + ' &bull; ' + race + ' &bull; ' + age + '</h2>';
    blurb += "<p>On average: an AIDS diagnosis rate of " + stateVals['startVal'] + "% in " + stateVals['startYear'] + " and " + stateVals['endVal'] + "% in " + stateVals['endYear'] + ", ";
    if (percentChange >= 0) {
        blurb += "an increase of " + percentChange + "%"
    } else {
        blurb += "a decrease of " + -1 * percentChange + "%"
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}
function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    // $("#blurb").text("hi again");
    $("#default-blurb").show();
    $("#blurb-content").html('');
}

Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

var dataNameFromClass = {"allraces": "All races/ethnicities", "indian": "American Indian/Alaska Native", "asian": "Asian", "black": "Black/African American", "hispanic": "Hispanic/Latino", "multipleraces": "Multiple races", "hawaiian": "Native Hawaiian/Other Pacific Islander", "white": "White", "bothsexes": "Both sexes", "male": "Male", "female": "Female", "allages": "Adults and adolescents", "age1324": "13-24", "age2534": "25-34", "age3544": "35-44", "age4554": "45-54", "age55": "55+", "AL": "Alabama", "AK":"Alaska", "AZ":"Arizona", "AR":"Arkansas", "CA": "California", "CO": "Colorado", "CT":"Connecticut", "DE":"Deleware", "DC":"District of Columbia", "FL":"Florida", "GA":"Georgia", "HI":"Hawaii", "ID":"Idaho", "IL":"Illinois", "IN":"Indiana", "IA":"Iowa", "KS":"Kansas", "KY":"Kentucky", "LA":"Louisiana", "ME":"Maine", "MD":"Maryland", "MA":"Massachusetts", "MI":"Michigan", "MN":"Minnesota", "MS":"Mississippi", "MO":"Missouri", "MT":"Montana", "NE":"Nebraska", "NV":"Nevada", "NH":"New Hampshire", "NJ": "New Jersey", "NM":"New Mexico", "NY":"New York", "NC":"North Carolina", "ND":"North Dakota", "OH":"Ohio", "OK":"Oklahoma", "OR":"Oregon", "PA":"Pennsylvania", "RI":"Rhode Island", "SC":"South Carolina", "SD": "South Dakota", "TN":"Tennessee", "TX":"Texas", "UT":"Utah", "VT":"Vermont", "VA":"Virginia", "WA":"Washington", "WV":"West Virginia", "WI": "Wisconsin", "WY": "Wyoming", "allstates": "All states"};
var dataCategoryFromName = {"All races/ethnicities": "Race", "American Indian/Alaska Native": "Race", "Asian": "Race", "Black/African American": "Race", "Hispanic/Latino": "Race", "Multiple races": "Race", "Native Hawaiian/Other Pacific Islander": "Race", "White": "Race", "Both sexes": "Sex", "Male": "Sex", "Female": "Sex", "Adults and adolescents": "Age", "13-24": "Age", "25-34": "Age", "35-44": "Age", "45-54": "Age", "55+": "Age", "Alabama": "State", "Alaska": "State", "Arizona": "State", "Arkansas": "State", "California": "State", "Colorado": "State", "Connecticut": "State", "Deleware": "State", "District of Columbia": "State", "Florida": "State", "Georgia": "State", "Hawaii": "State", "Idaho": "State", "Illinois": "State", "Indiana": "State", "Iowa": "State", "Kansas": "State", "Kentucky": "State", "Louisiana": "State", "Maine": "State", "Maryland": "State", "Massachusetts": "State", "Michigan": "State", "Minnesota": "State", "Mississippi": "State", "Missouri": "State", "Montana": "State", "Nebraska": "State", "Nevada": "State", "New Hampshire": "State", "New Jersey": "State", "New Mexico": "State", "New York": "State", "North Carolina": "State", "North Dakota": "State", "Ohio": "State", "Oklahoma": "State", "Oregon": "State", "Pennsylvania": "State", "Rhode Island": "State", "South Carolina": "State", "South Dakota": "State", "Tennessee": "State", "Texas": "State", "Utah": "UT", "Vermont": "State", "Virginia": "State", "Washington": "State", "West Virginia": "State", "Wisconsin": "State", "Wyoming": "State", "All states": "State"};
function showRegion(regionCode) {
    var selectedCategories = regionCode.split(".").clean("");
    filters = {};
    for (var i = 0; i < selectedCategories.length; i++) {
        if (selectedCategories[i] != "allraces" && selectedCategories[i] != "bothsexes" && selectedCategories[i] != "allages" && selectedCategories[i] != "allstates") {
            var dataName = dataNameFromClass[selectedCategories[i]];
            var dataCategory = dataCategoryFromName[dataName];
            filters[dataCategory] = dataName;
        }
    }
    d3.csv('clean-data/AIDS-stories.csv', passToTable);
    
    var region = regionCode;
    if (region.indexOf(".allstates") != -1) {
        region = region.slice(0, -".allstates".length);
    }
    d3.selectAll("path.highlight").classed('highlight', false);
    var selectedStates = d3.selectAll("path"+region).moveToFront();
    if (selectedStates[0].length == 0) {
        $.colorbox({html:"<h1>Sorry</h1><p>Due to privacy reasons, we are unable to show these results.</p><p>Try making your filter more general to see results.</p>"});
    }
    selectedStates.classed('highlight', true);
}