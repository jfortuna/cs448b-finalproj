
$(function() {
    $("#radio").buttonset();
});

window.onload=function(){
    //	reset(); 
};


function showButton() {
	document.getElementById("enterButtonDiv").innerHTML = "<div id = \"condom\" onclick = \"reset()\"> <img src=\"condom.png\"/> <p> Click to enter </p> </div>"; 
}

function reset() {
	showMap(); 
}


var myCounter = 1; 

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
		var content = "<p> <b>" + d.properties.name + "</b></p> <p> " + getPercentForYearForState(d.properties.name, year) + " cases per 100k</p>"; 
	    if (!isZoomed) nvtooltip.show([event.pageX, event.pageY], content);
	}
	
	function mouseout() 
	{
		nvtooltip.cleanup(); 
	}
    
	var width = 700,
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
    displayLegend(); 
    
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
    function displayLegend() {
        d3.select("#legend").selectAll("svg").remove();
        var legend = d3.select("#legend").append("svg")
        .attr("width", 225)
        .attr("height", 200)
        .append("g");
        var yPos = 25;
        for (var i = 0; i <= fill.quantiles().length; i++) {
            var valueForLegendSquare;
            var endValueForLegendSquare;
            if (i == 0) {
                valueForLegendSquare = 0;
                endValueForLegendSquare = fill.quantiles()[i] - 0.1;
            } else if (i == fill.quantiles().length) {
                valueForLegendSquare = fill.quantiles()[i - 1];
                endValueForLegendSquare = 215;
            } else {
                valueForLegendSquare = fill.quantiles()[i - 1];
                endValueForLegendSquare = fill.quantiles()[i] - 0.1;
            }
            legend.append("rect")
            .attr("x", 0)
            .attr("width", 20)
            .attr("y", yPos)
            .attr("height", 20)
            .attr("fill", function(d) { return fill(valueForLegendSquare); });
            legend.append("text")
            .attr("x", 25)
            .attr("y", yPos + 15)
            .style("text-anchor", "beginning")
            .text(valueForLegendSquare + " - " + endValueForLegendSquare + " cases per 100k");
            yPos += 25;
        }
    }
    
}	
function showAges() {
	$("#casesA").css("background-color", "#FB6A4A"); 
	var width = 600,
    height = 600,
    format = d3.format(",d"),
    color = d3.scale.category20();
	
	var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(10);
	
	var svg = d3.select("#ageBubbles").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");
        
	
	d3.json("flare.json", function(root) {
        var arrP = bubble.nodes(classesPop(root));
        var arrC = bubble.nodes(classesCases(root)); 
        var node = svg.selectAll(".node")
        .data(bubble.nodes(classesCases(root))
              .filter(function(d) { return !d.children; }))
	    .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; });
        
        d3.selectAll(".agesButt").on("click", function change() {
            if (this.value == "cases") {
                d3.selectAll("#ageBubbles circle").transition().duration(1500)
		 		.attr("r", function(d,i) {return arrC[i+1].r})
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrC[i+1].x) + "," + (0 - d.y + arrC[i+1].y) + ")"; });
                d3.selectAll("#ageBubbles text").transition().duration(1500)
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrC[i+1].x) + "," + (0 - d.y + arrC[i+1].y) + ")"; });
                document.getElementById("agesTitle").innerHTML = "New HIV/AIDS diagnoses in 2010, by age group"; 
                $("#popA").css("background-color", "#FEE5D9"); 
                $("#casesA").css("background-color", "#FB6A4A"); 
		    	d3.selectAll("#ageBubbles circle, #ageBubbles text").on("mousemove", function(d) {
		    		nvtooltip.cleanup(); 
					var event = d3.event; 
					var d = this.__data__; 
			    	nvtooltip.show([event.pageX, event.pageY], "<p>Age range: <b>"+ d.className +"</b></p>" + "<p>" + d.cases + " cases</p>");
				});     
		                        
                
            }
            else {
                d3.selectAll("#ageBubbles circle").transition().duration(1500)
		 		.attr("r", function(d,i) {return arrP[i+1].r})
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrP[i+1].x) + "," + (0 - d.y + arrP[i+1].y) + ")"; });
                d3.selectAll("#ageBubbles text").transition().duration(1500)
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrP[i+1].x) + "," + (0 - d.y + arrP[i+1].y) + ")"; });
                document.getElementById("agesTitle").innerHTML = "American population distribution in 2010";
                $("#casesA").css("background-color", "#FEE5D9"); 
                $("#popA").css("background-color", "#FB6A4A"); 
		    	d3.selectAll("#ageBubbles circle, #ageBubbles text").on("mousemove", function(d) {
		    		nvtooltip.cleanup(); 
					var event = d3.event; 
					var d = this.__data__; 
			    	nvtooltip.show([event.pageX, event.pageY], "<p>Age range: <b>"+ d.className +"</b></p>" + "<p>" + Math.ceil(d.pop/1000) + " million people</p>");
				});     
                        
                
            }
        });
		
        node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.className); })
        .attr("pop", function(d) { return d.r; })
        .attr("cases", function(d) {return d.cases; })
        .attr("id", function(d) {return d.id});
        node.append("text")
        .attr("dy", ".1em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.className; });
        
    	d3.selectAll("#ageBubbles circle, #ageBubbles text").on("mousemove", function(d) {
    		nvtooltip.cleanup(); 
			var event = d3.event; 
			var d = this.__data__; 
			console.log(d); 
	    	nvtooltip.show([event.pageX, event.pageY], "<p>Age range: <b>"+ d.className +"</b></p>" + "<p>" + d.value + " cases</p>");
		});     
        
       d3.selectAll("#ageBubbles circle").on("mouseout", function(d) {
    		nvtooltip.cleanup(); 
		});     
        
	});
	
	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classesCases(root) {
        var classes = [];
        
        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size, pop:node.pop, cases:node.size});
        }
        
        recurse(null, root);
        return {children: classes};
	}
	
	function classesPop(root) {
        var classes = [];
        
        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.pop, pop:node.pop, cases:node.size});
        }
        
        recurse(null, root);
        return {children: classes};
	}
	
	d3.select(self.frameElement).style("height", height + "px");
}


function showEthnicities() {
	ethLegend(); 
		$("#casesE").css("background-color", "#FB6A4A"); 

	var width = 600,
    height = 600,
    format = d3.format(",d"),
    color = d3.scale.category20();

	var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height])
    .padding(10);

	var svg = d3.select("#ethBubbles").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "bubble");
    

	d3.json("flareEth.json", function(root) {
        var arrP = bubble.nodes(classesPop(root));
        var arrC = bubble.nodes(classesCases(root)); 
        var node = svg.selectAll(".node")
        .data(bubble.nodes(classesCases(root))
              .filter(function(d) { return !d.children; }))
	    .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d, i) { return "translate(" + d.x + "," + d.y + ")"; });
        
        d3.selectAll(".ethButt").on("click", function change() {

            if (this.value == "cases") {
                d3.selectAll("#ethBubbles circle").transition().duration(1500)
		 		.attr("r", function(d,i) {return arrC[i+1].r})
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrC[i+1].x) + "," + (0 - d.y + arrC[i+1].y) + ")"; });
                d3.selectAll("#ethBubbles text").transition().duration(1500)
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrC[i+1].x) + "," + (0 - d.y + arrC[i+1].y) + ")"; });
                document.getElementById("ethTitle").innerHTML = "New HIV/AIDS diagnoses in 2010, by ethnicity"; 
                $("#popE").css("background-color", "#FEE5D9"); 
                $("#casesE").css("background-color", "#FB6A4A"); 
                       	d3.selectAll("#ethBubbles circle, #ethBubbles text").on("mousemove", function(d) {
    		nvtooltip.cleanup(); 
			console.log(d); 
			var event = d3.event; 
			var d = this.__data__; 
	    	nvtooltip.show([event.pageX, event.pageY], "<p>Race/ethnicity: <b>"+ d.className +"</b></p>" + "<p>" + d.value + " cases</p>");
		});     
            }
            else {
                d3.selectAll("#ethBubbles circle").transition().duration(1500)
		 		.attr("r", function(d,i) {return arrP[i+1].r})
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrP[i+1].x) + "," + (0 - d.y + arrP[i+1].y) + ")"; });
                d3.selectAll("#ethBubbles text").transition().duration(1500)
		 		.attr("transform", function(d, i) { return "translate(" + (0 - d.x + arrP[i+1].x) + "," + (0 - d.y + arrP[i+1].y) + ")"; });
                document.getElementById("ethTitle").innerHTML = "American population distribution in 2010"; 
                $("#casesE").css("background-color", "#FEE5D9"); 
                $("#popE").css("background-color", "#FB6A4A"); 
                       	d3.selectAll("#ethBubbles circle, #ethBubbles text").on("mousemove", function(d) {
    		nvtooltip.cleanup(); 
			console.log(d); 
			var event = d3.event; 
			var d = this.__data__; 
	    	nvtooltip.show([event.pageX, event.pageY], "<p>Race/ethnicity: <b>"+ d.className +"</b></p>" + "<p>" + Math.ceil(d.pop * 3.09) + " million people</p>");
		});     

            }
            
            
        }
                                 
		);

  

        
        node.append("circle")
        .attr("r", function(d) { return d.r; })
        .style("fill", function(d) { return color(d.className); })
        .attr("pop", function(d) { return d.r; })
        .attr("cases", function(d) {return d.cases; })
        .attr("id", function(d) {return d.id});
        node.append("text")
        .attr("dy", ".1em")
        .style("text-anchor", "middle")
        .text(function(d) { return d.className; });
       	d3.selectAll("#ethBubbles circle, #ethBubbles text").on("mousemove", function(d) {
    		nvtooltip.cleanup(); 
			console.log(d); 
			var event = d3.event; 
			var d = this.__data__; 
	    	nvtooltip.show([event.pageX, event.pageY], "<p>Race/ethnicity: <b>"+ d.className +"</b></p>" + "<p>" + d.value + " cases</p>");
		});     
        
       d3.selectAll("#ethBubbles circle").on("mouseout", function(d) {
    		nvtooltip.cleanup(); 
		}); 
        
        
        
	});

	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classesCases(root) {
        var classes = [];
        
        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.size, pop:node.pop, cases:node.size});
        }
        
        recurse(null, root);
        return {children: classes};
	}

	function classesPop(root) {
        var classes = [];
        
        function recurse(name, node) {
            if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
            else classes.push({packageName: name, className: node.name, value: node.pop, pop:node.pop, cases:node.size});
        }
        
        recurse(null, root);
        return {children: classes};
	}

	d3.select(self.frameElement).style("height", height + "px");
}



function ethLegend() {
     var legend = d3.select("#ethLegend").append("svg")
     .attr("width", 500)
     .attr("height", 200)
     .append("g");
     var yPos = 25;
     
     legend.append("rect")
	     .attr("x", 0)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#1f77b4"});
     legend.append("text")
	     .attr("x", 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("Black/African-American");
	     yPos += 25;
	     
     legend.append("rect")
	     .attr("x", 0)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#ff7f0e"});
     legend.append("text")
	     .attr("x", 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("White");
	     yPos += 25;
	     
     legend.append("rect")
	     .attr("x", 0)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#2ca02c"});
     legend.append("text")
	     .attr("x", 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("American Indian/Alaska Native");
	     yPos += 25;   
	     
     legend.append("rect")
	     .attr("x", 0)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#d62728"});
     legend.append("text")
	     .attr("x", 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("Asian");
	     yPos += 25;
	     
	 xPos = 240; 
	 yPos = 25; 
     legend.append("rect")
	     .attr("x", xPos)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#aec7e8"});
     legend.append("text")
	     .attr("x", xPos + 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("Hispanic/Latino");
	     yPos += 25;
	     
     legend.append("rect")
	     .attr("x", xPos)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#ffbb78"});
     legend.append("text")
	     .attr("x", xPos + 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("Multiple races");
	     yPos += 25;
	     
     legend.append("rect")
	     .attr("x", xPos)
	     .attr("width", 20)
	     .attr("y", yPos)
	     .attr("height", 20)
	     .attr("fill", function(d) { return "#98df8a"});
     legend.append("text")
	     .attr("x", xPos + 25)
	     .attr("y", yPos + 15)
	     .style("text-anchor", "beginning")
	     .text("Hawaiian/Other Pacific Islander");
	     yPos += 25;	     
}