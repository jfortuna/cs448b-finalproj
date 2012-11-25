$(function() {
    $("#radio").buttonset();
});

window.onload=function() {
	d3.select("body").transition() 
		.duration(3000)
		.style("opacity", 1); 
	showDonut(); 
};

function showButton() {
	document.getElementById("enterButtonDiv").innerHTML = "<div id = \"condom\" onclick = \"reset()\"> <img src=\"condom.png\"/> <p> Click to enter </p> </div>"; 
}

function showDonut() {
	d3.select("body")
		.style("opacity", 0);
	var form = "<p> <form><div id=\"radio\"><input type=\"radio\" id=\"radio1\" name=\"radio\" checked=\"checked\" value = \"males\"/><label for=\"radio1\">Males</label><input type=\"radio\" id=\"radio2\" name=\"radio\" value = \"females\"/><label for=\"radio2\">Females</label></div></form></p> "; 
	document.getElementById("instructions").innerHTML = "<p> New cases, in 2010, divided by gender </p>"; 
	document.getElementById("stats").innerHTML = "<div id = \"gender\"> males </div> <div id = \"total\"> 37045 cases in 2010 </div>" + form;  
    
	var malesChecked = true; 
	function mousemove() 
	{
	    nvtooltip.cleanup(); 
	    var event = d3.event; 
	    var d = this.__data__; 
	    content = "<h3>" + getLabel(d.value) + "</h3><p>" + d.value + " cases</p>"; 
	    nvtooltip.show([event.pageX, event.pageY], content);
	}
	
	function mouseout() 
	{
	    nvtooltip.cleanup(); 
	}
	var males = [28782, 2373, 1443, 4416, 31]; 
	var females = [0, 1393, 0, 8459, 16]; 
	var categories=["Male-to-male sexual contact","Injection drug use","Male-to-male sexual contact and injection drug use", "Heterosexual contact", "Other"];
	
	function maleTotal() {
		var sum = 0; 
		for (var i = 0; i < 5; i++) {
			sum += males[i]; 
		}
		return sum; 	
	}
	
	function femaleTotal() {
		var sum = 0; 
		for (var i = 0; i < 5; i++) {
			sum += females[i]; 
		}
		return sum; 	
	}
	
	function getLabel(number) {
		if ($("input")[1].checked) {
			for (var i = 0; i < 5; i++) {
				if (females[i] == number) return categories[i]; 
			}	
		}
		else {
			for (var i = 0; i < 5; i++) {
				if (males[i] == number) return categories[i]; 
			}
		}
	}
	
	var dataset = {
    males: [28782, 2373, 1443, 4416, 31],
    females: [0, 1393, 0, 8459, 16], };
	
	var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2;
	
	var color = d3.scale.category10();
	
	var pie = d3.layout.pie()
    .sort(null);
	
	var arc = d3.svg.arc()
    .innerRadius(radius - 100)
    .outerRadius(radius - 20);
	
	var svg = d3.select("#donutMap").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	
	var path = svg.selectAll("path")
    .data(pie(dataset.males))
    .enter().append("path")
    .attr("fill", function(d, i) { return color(i); })
    .attr("d", arc)
    .on("mousemove", mousemove)
    .on("mouseout", mouseout);
	d3.selectAll("input").on("change", change);
	
	function change() {
        path = path.data(pie(dataset[this.value])); // update the data
        path.attr("d", arc); // redraw the arcs
        malesChecked = !malesChecked; 
        if (malesChecked) {
            document.getElementById("gender").innerHTML = "males";
            document.getElementById("total").innerHTML = maleTotal() + " cases in 2010"; 
        }
        else {
            document.getElementById("gender").innerHTML = "females";
            document.getElementById("total").innerHTML = femaleTotal() + " cases in 2010"; 
        }
	}   
}


