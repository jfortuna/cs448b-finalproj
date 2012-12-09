var regions = { "SAS": "South Asia" , "ECS": "Europe and Central Asia", "MEA": "Middle East & North Africa", "SSF": "Sub-Saharan Africa", "LCN": "Latin America & Caribbean", "EAS": "East Asia &amp; Pacific", "NAC": "North America" },
	w = 600,
	h = 400,
	margin = 30,
	startYear = 2000, 
	endYear = 2011,
	startAge = 0.00001,
	endAge = 0.009,
	y = d3.scale.log().clamp(true).domain([endAge, startAge]).range([0 + margin, h - margin]).nice(),
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

var startEnd = {},
    countryCodes = {};
d3.text('clean-data/AIDS-diagnoses-allDemographics.csv', 'text/csv', function(text) {
    var states = d3.csv.parseRows(text);
    
    for (i=1; i < states.length; i++) {
        var values = states[i].slice(5, states[i.length-1]);
        var currData = [];
        countryCodes[states[i][1]] = states[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
                if (!started) {
                    startEnd[states[i][0]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[states[i][0]]['endYear'] = years[j];
                    startEnd[states[i][0]]['endVal'] = values[j];
                }
            }
        }
        var raceClass = {"All races/ethnicities": "allraces", "American Indian/Alaska Native": "indian", "Asian": "asian", "Black/African American": "black", "Hispanic/Latino": "hispanic", "Multiple races": "multipleraces", "Native Hawaiian/Other Pacific Islander": "hawaiian", "White": "white"};
        var sexClass = {"Both sexes": "bothsexes", "Male": "male", "Female": "female"};
        vis.append("svg:path")
            .data([currData])
            .attr("state", states[i][0])
            .attr("race", states[i][1])
            .attr("sex", states[i][2])
            .attr("age", states[i][3])
            .attr("class", states[i][0] + " " + raceClass[states[i][1]] + " " + sexClass[states[i][2]] + " " + states[i][3])
            .attr("d", line)
            //.attr("stroke", "black")
            //.attr("fill","none")
            //.attr("stroke-width", 1)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
});  
    
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

vis.selectAll(".yLabel")
    .data(y.ticks(4))
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
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(1999.5))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(2000))

d3.selection.prototype.moveToFront = function() { 
    return this.each(function() { 
        this.parentNode.appendChild(this); 
    }); 
};

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
    var stateVals = startEnd[state];
    var percentChange = Math.round((stateVals['endVal'] - stateVals['startVal']) * 1000000) / 1000000;
    
    var blurb = '<h2>' + state + ' ' + race + ' ' + sex + ' ' + age + '</h2>';
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

function showRegion(regionCode) {
    var states = d3.selectAll("path."+regionCode).moveToFront();
    if (states.classed('highlight')) {
        states.attr("class", regionCode);
    } else {
        states.classed('highlight', true);
    }
}