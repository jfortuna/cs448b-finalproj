function showPie() {
	var width = 600,
	    height = 400,
	    radius = Math.min(width, height) / 2 - 25;
	
	var color = d3.scale.ordinal()
	    .range(["#CB181D", "#FC9272"]);
	
	var arc = d3.svg.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(radius - 70);
	
	var pie = d3.layout.pie()
	    .sort(null)
	    .value(function(d) { return d.population; });
	
	var svg = d3.select("#pie").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	d3.csv("piedata.csv", function( data) {
	
	  data.forEach(function(d) {
	    d.population = +d.population;
	  });
	
	  var g = svg.selectAll(".arc")
	      .data(pie(data))
	    .enter().append("g")
	      .attr("id", "cats")
	      .attr("class", "arc");
	
	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d) { return color(d.data.age); });
	
	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
	      .attr("dy", "-3em")
	      .style("text-anchor", "left")
	      .text(function(d) { return d.data.age; });
	});
}

function showTreemap(div) {

	var margin = {top: 40, right: 10, bottom: 10, left: 10},
	    width = 650 - margin.left - margin.right,
	    height = 370 - margin.top - margin.bottom;
	
	var color = d3.scale.category10();
	
	var treemap = d3.layout.treemap()
	    .size([width, height])
	    .sticky(true)
	    .value(function(d) { return d.size });
	
	var div = d3.select(div).append("div")
	    .style("position", "relative")
	    .style("width", (width + margin.left + margin.right) + "px")
	    .style("height", (height + margin.top + margin.bottom) + "px")
	    .style("left", margin.left + "px")
	    .style("top", margin.top + "px");
	
	d3.json("flare.json", function(root) {
	  var node = div.datum(root).selectAll(".node")
	      .data(treemap.nodes)
	    .enter().append("div")
	      .attr("class", "node")
	      .call(position)
	      .style("background", function(d) { return color(d.name); })
	      .on("mousemove", mousemove)
	      .on("mouseout", mouseout)
	      .text(function(d) { return d.children ? null : d.name; });
	
	  d3.selectAll("#input").on("change", function change() {
	    var value = this.value === "pop"
	        ? function(d) { return d.pop; }
	        : function(d) { return d.size; };
	
	    node
	        .data(treemap.value(value).nodes)
	      	.transition()
	        .duration(1500)
	        .call(position);
	  });
	});
	function mousemove() {
		nvtooltip.cleanup(); 
		nvtooltip.show([event.pageX, event.pageY], "<p><b>" + this.innerHTML + "</b></p><p>"+ this.__data__.size +" new cases in 2010</h4>");
	}
	
	function mouseout() {
		nvtooltip.cleanup(); 
	}
	function position() {
	  this.style("left", function(d) { return d.x + "px"; })
	      .style("top", function(d) { return d.y + "px"; })
	      .style("width", function(d) { return Math.max(0, d.dx - 1) + "px"; })
	      .style("height", function(d) { return Math.max(0, d.dy - 1) + "px"; });
	}
}
var d = new Date();
var hours = d.getHours(); 

var xlocationWorld = 90; 
var worldCounter = 0; 
var cyWorld = 100; 
function worldTimer(svg)
{
	svg.append("circle")
    	.attr("cy", cyWorld)
    	.attr("cx", xlocationWorld)
    	.attr("r", 3)
    	.style("fill", "#FB6A4A");
    xlocationWorld += 8; 
    worldCounter++; 
    if (worldCounter % 150 == 0) {
    	cyWorld += 10; 	
    	xlocationWorld=90; 
    }
}
function startWorldCircles() {
	var svg = d3.select("#world-circles").append("svg");
	for (var i = 0; i < hours*300; i++) {
		worldTimer(svg); 	
	}
	var myVar=setInterval(function(){worldTimer(svg)},12000);
}

var counter = 1; 
var xlocationUS = 90; 
var cy = 90; 
function usTimer(svg)
{
	svg.append("circle")
    	.attr("cy", cy)
    	.attr("cx", xlocationUS)
    	.attr("r", 3)
    	.style("fill", "#CB181D");
    xlocationUS += 8; 
    counter++; 
    if (counter == 150) {
    	cy+= 10; 
    	xlocationUS = 90;
    	counter = 0;  
    }
}
function startUSCircles() {
	var svg = d3.select("#us-circles").append("svg");
	for (var i = 0; i < hours*12; i++) {
		usTimer(svg); 
	}
	var myVar=setInterval(function(){usTimer(svg)},5*60000);
}

