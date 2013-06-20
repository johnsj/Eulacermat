
var width = 960,
    height = 560,
    centered;

var svg = d3.select("div.map").append("svg")
          .attr("width", width)
          .attr("height",height);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


var g = svg.append("g");


function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 12;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

  var projection = d3.geo.albers()
    .center([9.501785, 56.263920])
    .rotate([-1, 0])
    .parallels([50, 60])
    .scale(9500)
    .translate([width / 2, height / 2]);

  var path = d3.geo.path()
              .projection(projection);

var usage = new Array();

queue()
  .defer(d3.json, "/geojson/DNK_adm/dnk3.json")
  .defer(d3.csv, "geojson/energidata.json", function (d) {
    usage[d.geoID] = d;
  })
  .await(ready);

function ready(error, dk){

  var kommuner = topojson.feature(dk, dk.objects.kommune);

  var arr = new Array();

  g.selectAll(".kommune")
      .data(kommuner.features)
      .enter().append("path")
      .attr("class", function(d){ 
        arr[d.properties.KOMNAVN] = d.id;
        return randomColor(d.id) + " kommune kommune" + d.id})
      .attr("d", path)
      .on("click", clicked)
      .on("mouseover", function (d) {
        d3.select(this).classed('active', true);

        if(typeof usage[d.id] != "undefined"){
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(function(){

            var returnhtml = usage[d.id].Myndighed;
            returnhtml = returnhtml +  "<br>";
            returnhtml = returnhtml +  usage[d.id].Forbrug3 + "kWh/m2";


            return returnhtml;
          })
            .style("left", (d3.event.pageX + 10) + "px")
            .style("top", (d3.event.pageY - 48) + "px");
        }
      })
      .on("mouseout", function () {
        d3.select(this).classed('active', false);

        div.transition()        
          .duration(500)      
          .style("opacity", 0); 

        
      });


  //AMT LABELS
  /*svg.selectAll(".amt-label")
    .data(amter.features)
  .enter().append("text")
    .attr("class", function(d) { return "amt-label " + d.properties.amtID; })
    .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { 
      console.log(d);
      return d.properties.amt; 
    });*/

};

function randomColor(id) {

  if(usage[id]){
    var k = usage[id];

    if(typeof k.Forbrug3 == "undefined"){
      return "nodata";
    }

    if (k.Forbrug3 > (52.5 + (1650/k.Areal) )) {
      return "red";
    };

    if (k.Forbrug3 > (30 + (1000/k.Areal) )) {
      return "yellow";
    };

    if (k.Forbrug3 > 20) {
      return "green";
    };

    return "blue";
  };

}