function showStatistics() {
	var i = 250; 
	window.setTimeout("countriesStats()",i);
	i+= 2000; 
	window.setTimeout("peopleStats()",i);	
	i+= 2000; 
	window.setTimeout("usStats()",i);	
	i+= 2000; 
	window.setTimeout("diseaseStats()",i);	
	i+= 2000; 
    window.setTimeout("drawLines()", i); 	
}

$(function() {
    $("#radio").buttonset();
});

window.onload=function(){
	$("#slider").hide(); 
	$("#year").hide(); 
	showStatistics(); 
};

function countriesStats() {
    $("#countries").animate({ fontSize: "50px" }, 1000);
    $("#countries").animate({ fontSize: "45px" }, 250);
}

function peopleStats() {
    $("#people").animate({ fontSize: "50px" }, 1000);
    $("#people").animate({ fontSize: "45px" }, 250);
}

function usStats() {
    $("#us").animate({ fontSize: "50px" }, 1000);
    $("#us").animate({ fontSize: "45px" }, 250);
}

function diseaseStats() {
    $("#disease").animate({ fontSize: "50px" }, 1000);
    $("#disease").animate({ fontSize: "45px" }, 250);
}

function diseaseName() {
    $("#diseaseName").animate({ fontSize: "100px" }, 1000);
}

function showButton() {
	document.getElementById("enterButtonDiv").innerHTML = "<div id = \"condom\" onclick = \"reset()\"> <img src=\"condom.png\"/> <p> Click to enter </p> </div>"; 
}

function reset() {
	document.getElementById("header").innerHTML = "<h1>mapped<span id = \"name\">trends</span> </h1>"; 
    $("#statistics").remove(); 
	setup(); 
	showMap(); 
	forwardBlink(); 	
}


var myCounter = 1; 

function forwardBlink() {
	setInterval(function() {
		arrowColor(); },500);
}

function arrowColor() {
	if (myCounter % 2 == 1) $('#forward').find('img').css('opacity', '1.0');	
	else $('#forward').find('img').css('opacity', '0.3');
	myCounter++; 
}


function nextSlide() {
//	d3.select("body").transition()
//		.duration(3000)
//		.style("opacity", 0); 
	window.location.href = "donut.html"; 
}
function setup() {
	document.getElementById("instructions").innerHTML = "Explore national hotspots from 2000 - 2010"; 
	$("#slider").show(); 
	$("#year").show(); 
	$("#slider").slider("option", "min", 2000);
	$("#slider").slider("option", "max", 2010);
	$("#slider").slider("option", "step", 1);
	$("#slider").slider("option", "value", 2000);
}

function showMap() {
	document.getElementById("totalCases").innerHTML = "41031 total cases";
	var year = 2000; 
	var isZoomed = false; 
	var dataArray = new Array(); 
    var aidsData = new Array();
    
    d3.csv("aidsdata", function(data) {
        data.forEach(function(d) { 
        	dataArray.push(d); 
        });
    });
    
    function getPercentForYearForState(state, yearToGet) {
        for (var i = 0; i < 616; i++) {
            if (dataArray[i] != null) {	 
                if (dataArray[i].state == state && dataArray[i].year == yearToGet) return dataArray[i].turnout_rate; 
            }
        }
        return 0; 	
    }
    
	function mousemove() 
	{
		nvtooltip.cleanup(); 
		var event = d3.event; 
		var d = this.__data__; 
		var selectedBar = d3.select(this).select("rect");
		var content = "<p> <b>" + d.properties.name + "</b></p> <p> " + getPercentForYearForState(d.properties.name, year) + " cases per 100,000</p>"; 
	    if (!isZoomed) nvtooltip.show([event.pageX, event.pageY], content);
	}
	
	function mouseout() 
	{
		nvtooltip.cleanup(); 
	}
    
	var width = 960,
    height = 500,
    centered;
	
	
	var fill = d3.scale.quantile()
    .domain([0, 5, 10, 15, 20, 25, 30, 250])
    .range(["#FEE5D9", "#FCBBA1", "#FC9272", "#FB6A4A", "#EF3B2C", "#CB181D", "#99000D"]);
    
	var projection = d3.geo.albersUsa()
    .scale(width)
    .translate([0, 0]);
	
	var path = d3.geo.path()
    .projection(projection);
	
	var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);
	
	svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", click);
	function click(d) {
        var x = 0,
        y = 0,
        k = 1;
        
        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = -centroid[0];
            y = -centroid[1];
            k = 4;
            centered = d;
        } else {
            centered = null;
        }
        
        g.selectAll("path")
        .classed("active", centered && function(d) { return d === centered; });
        
        g.transition()
        .duration(1000)
        .attr("transform", "scale(" + k + ")translate(" + x + "," + y + ")")
        .style("stroke-width", 1.5 / k + "px");
    }
	var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .append("g")
    .attr("id", "states");
    d3.json("readme.json", function(json) {
        g.selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path)
        .on("click", click)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout)
        .attr("fill", function(d) { 
            var state = d.properties.name; 
            var percent = getPercentForYearForState(state, year); 
            return fill(percent); 
        })
        .style("opacity", 0)
        .transition().duration(400).style("opacity", 1);
    });
    
	function getPercentForYearForState(state, yearToGet) {
        for (var i = 0; i < dataArray.length; i++) {
            if (dataArray[i] != null) {	
                if (dataArray[i].state == state && dataArray[i].year == yearToGet) return dataArray[i].turnout_rate; 
            }
        }
        return 0; 	
    }
    
    function getTotalForYear(yearToGet) {
    	var sum = 0; 
        for (var i = 0; i < dataArray.length; i++) {
            if (dataArray[i] != null && dataArray[i].year == yearToGet) {	
                sum += parseInt(dataArray[i].Cases); 
            }
        }
        return sum; 	
    }
    
    
    $( "#slider" ).slider({
    range: false, 
    step: 1, 
    min: 2000,
    max: 2010,
    value:2000,
    change: function() {
        var value = $("#slider").slider("option","value");
        if (value >= 2000 && value <= 2010) {
            document.getElementById("year").innerHTML = value; 
            document.getElementById("totalCases").innerHTML = getTotalForYear(year) + " total cases"; 
            year = value; 
            changeForYear();
        }
    },
    slide: function() {
        var value = $("#slider").slider("option","value");
        if (value >= 2000 && value <= 2010) {
            document.getElementById("year").innerHTML = value; 
            document.getElementById("totalCases").innerHTML = getTotalForYear(year) + " total cases"; 
            year = value; 
            changeForYear(); 
        }
    }
    });
	
    function changeForYear() {
        d3.select("#map").selectAll("path") 
        .attr("fill", function(d) {             
            var state = d.properties.name; 
            var percent = getPercentForYearForState(state, year); 
            return fill(percent); 
        });
    }
}

function drawLines() {
	startBlink(); 
    var m = [20, 20, 30, 20],
    w = 960 - m[1] - m[3],
    h = 500 - m[0] - m[2];
    
    var x,
    y,
    duration = 500,
    delay = 0;
    
    function color(key) {
        if (key == "world") return "#FEE5D9"; 
        else return "#FB6A4A";	
    }
    
    var svg = d3.select("#middle").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])	
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); 
    
    var stocks,
    symbols;
    
    // A line generator, for the dark stroke.
    var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.price); });
    
    // A line generator, for the dark stroke.
    var axis = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y(h);
    
    // A area generator, for the dark stroke.
    var area = d3.svg.area()
    .interpolate("basis")
    .x(function(d) { return x(d.date); })
    .y1(function(d) { return y(d.price); });
    
    d3.csv("stocks.csv", function(data) {
        var parse = d3.time.format("%b %Y").parse;
        
        // Nest stock values by symbol.
        symbols = d3.nest()
        .key(function(d) { return d.symbol; })
        .entries(stocks = data);
        
        // Parse dates and numbers. We assume values are sorted by date.
        // Also compute the maximum price per symbol, needed for the y-domain.
        symbols.forEach(function(s) {
            s.values.forEach(function(d) { d.date = parse(d.date); d.price = +d.price; });
            s.maxPrice = d3.max(s.values, function(d) { return d.price; });
            s.sumPrice = d3.sum(s.values, function(d) { return d.price; });
        });
        
        // Sort by maximum price, descending.
        symbols.sort(function(a, b) { return b.maxPrice - a.maxPrice; });
        
        var g = svg.selectAll("g")
        .data(symbols)
        .enter().append("svg:g")
        .attr("class", "symbol");
        
        
        setTimeout(lines, duration);
    });
    
    function lines() {
        x = d3.time.scale().range([0, w - 60]);
        y = d3.scale.linear().range([h / 4 - 20, 0]);
        
        // Compute the minimum and maximum date across symbols.
        x.domain([
                  d3.min(symbols, function(d) { return d.values[0].date; }),
                  d3.max(symbols, function(d) { return d.values[d.values.length - 1].date; })
                  ]);
        
        var g = svg.selectAll(".symbol")
        .attr("transform", function(d, i) { return "translate(0," + (i * h / 4 + 10) + ")"; }); 
        
        
        g.each(function(d) {
            var e = d3.select(this);
            
            e.append("svg:path")
            .attr("class", "line"); 
            
            e.append("svg:circle")
            .attr("r", 15)
            .attr("class", "circle")
            .attr("id", d.key)
            .style("fill", function(d) { return color(d.key); })
            .style("stroke", "#000")
            .style("stroke-width", "2px");
            
            e.append("svg:text")
            .attr("x", 30)
            .attr("dy", ".31em")
            .text(d.key);
            
        });
        
        function draw(k) {
            g.each(function(d) {
                var e = d3.select(this);
                y.domain([0, d.maxPrice]);
                
                e.select("path")
                .attr("d", function(d) { return line(d.values.slice(0, k + 1)); });
                
                e.selectAll("circle, text")
                .data(function(d) { return [d.values[k], d.values[k]]; })
                .attr("transform", function(d) { return "translate(" + x(d.date) + "," + y(d.price) + ")"; });
            });
        }
        
        var k = 1, n = symbols[0].values.length;
        d3.timer(function() {
            draw(k);
            if ((k += 2) >= n - 1) {
                draw(n - 1);
                return true;
            }
        });
        $('.circle').mouseover(function() {
        });
        
        $('#usa').click(function() {
            zoom();
        });
        
        function zoom() {
            
            
            d3.select("#usa").transition()
            .duration(1000)
            .attr("r",200)
            .style("stroke", "white")
            .style("fill", "#FCBBA1")
            .attr("transform", "translate(465,100)");
            
            
            d3.selectAll("path").transition() 
            .duration(1000)
            .style("stroke", "white");
            
            $("text").remove();
            
            d3.select("#world").transition()
            .duration(1000)
            .style("stroke", "white")
            .style("fill", "white");
            
            document.getElementById("inner").innerHTML = "hiv/aids";
            
            setTimeout(function() { $("#middle").attr("onclick", "reset()");}, 1000); 
            
        }
    }
    
}

var counter = 1; 

function startBlink() {
	setInterval(function() {
		changeColor(); },500);
}

function changeColor() {
	var color = "white"; 
	if (counter % 2 == 1) color = "black"; 
	counter++; 
	d3.select("#usa").style("stroke", color)
}