
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
		var content = "<p> <b>" + d.properties.name + "</b></p> <p> " + getPercentForYearForState(d.properties.name, year) + " cases per 100,000</p>"; 
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
                 endValueForLegendSquare = 100;
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
                 .text(valueForLegendSquare + " - " + endValueForLegendSquare + " cases per 100,000");
             yPos += 25;
         }
     }

}

function showPop() {
		console.log("Here"); 
		var cases = "pop"; 
		var size = $("#id7").attr(cases);
		d3.select("#id7").transition().duration(1000).attr("r", size); 
		size = $("#id6").attr(cases);
		d3.select("#id6").transition().duration(1000).attr("r", size); 
	    size = $("#id5").attr(cases);
		d3.select("#id5").transition().duration(1000).attr("r", size); 
	    size = $("#id4").attr(cases);
		d3.select("#id4").transition().duration(1000).attr("r", size); 
	    size = $("#id3").attr(cases);
		d3.select("#id3").transition().duration(1000).attr("r", size); 
	    size = $("#id2").attr(cases);
		d3.select("#id2").transition().duration(1000).attr("r", size); 
		size = $("#id1").attr(cases);
		d3.select("#id1").transition().duration(1000).attr("r", size); 	
		
		d3.layout.pack()


	}


	function showCases() {
		var cases = "cases"; 
		var size = ($("#id7").attr(cases) / 33025) * 250;
		console.log("New size " + size); 
		d3.select("#id7").transition().duration(1000).attr("r", size); 
		size = ($("#id6").attr(cases) / 33025) * 250;
		d3.select("#id6").transition().duration(1000).attr("r", size); 
		size = ($("#id5").attr(cases) / 33025) * 250;
		d3.select("#id5").transition().duration(1000).attr("r", size); 
		size = ($("#id4").attr(cases) / 33025) * 250;
		d3.select("#id4").transition().duration(1000).attr("r", size); 
		size = ($("#id3").attr(cases) / 33025) * 250;
		d3.select("#id3").transition().duration(1000).attr("r", size); 
		size = ($("#id2").attr(cases) / 33025) * 250;
		d3.select("#id2").transition().duration(1000).attr("r", size); 
		size = ($("#id1").attr(cases) / 33025) * 250;
		d3.select("#id1").transition().duration(1000).attr("r", size); 
		
	}
	
function showEthnicities(div) {
	var width = 600,
		height = 600,
	    format = d3.format(",d"),
	    color = d3.scale.category10();
	
	var bubble = d3.layout.pack()
	    .sort(null)
	    .size([width, height])
	    .padding(10);
	
	var svg = d3.select(div).append("svg")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("class", "bubble");
	
	
	d3.json("flare.json", function(root) {
	  var node = svg.selectAll(".node")
	      .data(bubble.nodes(classesCases(root))
	      .filter(function(d) { return !d.children; }))
	    .enter().append("g")
	      .attr("class", "node")
	      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	
	 d3.selectAll("button").on("click", function change() {
	 	var node = svg.selectAll("circle")
		 	.data(bubble.nodes(classesPop(root)))
		      	.transition().duration(1500)
		        .attr("r", function(d) {console.log("changing the radius to: " + d.r); return d.r});
//				.attr("transform", function(d) { console.log(d.r + " " + d.className); return "translate(" + d.x + "," + d.y + ")"; });
	      });
	
	  node.append("title")
	      .text(function(d) { return d.className + ": " + format(d.value); });
	
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
	      
	  function position() {
	  	console.log("position"); 
	
	  }  


	});
	
	// Returns a flattened hierarchy containing all leaf nodes under the root.
	function classesCases(root) {
	  var classes = [];
	
	  function recurse(name, node) {
	    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
	    else classes.push({packageName: name, className: node.name, value: node.size});
	  }
	
	  recurse(null, root);
	  return {children: classes};
	}
	
	function classesPop(root) {
	  var classes = [];
	
	  function recurse(name, node) {
	    if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
	    else classes.push({packageName: name, className: node.name, value: node.pop});
	  }
	
	  recurse(null, root);
	  return {children: classes};
	}
	
	d3.select(self.frameElement).style("height", height + "px");
}

function showTreemap() {
var margin = {top: 40, right: 10, bottom: 10, left: 10},
    width = 700 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

var color = d3.scale.category20c();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) { return d.size; });

var div = d3.select("#sexytree").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.json("sexy.json", function(root) {
  var node = div.datum(root).selectAll(".node")
      .data(treemap.nodes)
    .enter().append("div")
      .attr("class", "node")
      .call(position)
      .style("background", function(d) { return d.children ? color(d.name) : null; })
      .text(function(d) { return d.children ? null : d.name; });

  d3.selectAll("input").on("click", function change() {
    var value = this.value === "equal"
        ? function() { return 1; }
        : function(d) { return d.size; };

    node
        .data(treemap.value(value).nodes)
      .transition()
        .duration(1500)
        .call(position);
  });
});

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
}


	
}
	