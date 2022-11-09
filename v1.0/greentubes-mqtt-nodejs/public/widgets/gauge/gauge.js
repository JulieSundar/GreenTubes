function load_gauge(title,div, params) {
	console.log("load_gauge : " +  title + " to <DIV>" + div +"</DIV>");

	//PARAMETERS 
	var params={ 
		socketURL : 'window.location.host',
		mqTopic :'gyro',
		restURL : "gpio/12/",
		restPolling:3000
		};

	var gauge;
	gauge = new Highcharts.Chart({	
		renderTo: div,
		yAxis: {
			min: 0,
			max: 200,
			title: {
				text: title
			}
		},

		credits: {
			enabled: false
		},

		series: [{
			name: 'Speed',
			data: [80],
			dataLabels: {
				format: '<div style="text-align:center"><span style="font-size:25px;color:' +
					((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
					   '<span style="font-size:12px;color:silver">km/h</span></div>'
			},
			tooltip: {
				valueSuffix: ' km/h'
			}
		}],
		renderTo: div,
        chart: {
            type: 'solidgauge'
        },

        title: null,

        pane: {
            center: ['50%', '85%'],
            size: '140%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },

        tooltip: {
            enabled: false
        },

        // the value axis
        yAxis: {
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            minorTickInterval: null,
            tickPixelInterval: 400,
            tickWidth: 0,
            title: {
                y: -70
            },
            labels: {
                y: 16
            }
        },

/*         plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        } */
	});
	// REST API hookup
	setTimeout(function () {
		// Speed
		/*var chart = gauge.highcharts(),
			point,
			newVal,
			inc;

		if (chart) {
			point = chart.series[0].points[0];
			inc = Math.round((Math.random() - 0.5) * 100);
			newVal = point.y + inc;

			if (newVal < 0 || newVal > 200) {
				newVal = point.y - inc;
			}

			point.update(newVal);
		}*/
	}, 2000);
	
	//Socket MQTT hookup
	
	
};


// start loading 
function load_live_chart(title,div, params) {
		//function load_live_chart(tile, div, params) {
	console.log("load_live_chart : " +  title + " to <DIV>" + div + "</DIV>");
	//Data Params / defaults (can be overwritten on instantiation / restore config-time)
	// Live-Data ~ MQTT / SocketIO
	var socketURL = window.location.host;
	var mqTopic ='gyro';
	// Off-line data ~ REst API
	var restURL = window.location.host;
	var restEndpoint = 'gpio/12/';
	var polling=3000; // frequency of polling for tthis chart
	var params={ 
		socketURL : 'host',
		mqTopic :'gyro',
		restURL : "gpio/12/",
		restPolling:3000
		};
	// Chart user available params 
	var dataSeries = ['X', 'Y', 'Z'];
	//var defparams={"restEndpoint":"gpio/12/",....}

	// (maybe in a JSON string?? to pull into configurator)
	//widget.params={socketURL:"", mqTopic:"" };



	var chart,
    // series defaults (in case no connections)
    categories = ['Categorie 1', 'Categorie 2', 'Categorie 3', 'Categorie 4', 'Categorie 5','Categorie 6', 'Categorie 7', 'Categorie 8', 'Categorie 9', 'Categorie 10', 'Categorie 11', 'Categorie 12', 'Categorie 13', 'Categorie 14', 'Categorie 15', 'Categorie 16', 'Categorie 17', 'Categorie 18', 'Categorie 19','Categorie 20', 'Categorie 21','Categorie 22', 'Categorie 23', 'Categorie 24', 'Categorie 25', 'Categorie 26', 'Categorie 27', 'Categorie 28', 'Categorie 29', 'Categorie 30'],
    serie1 = [0,1,2,3,4,5],
    serie2 = [0,1,2,3,4,5];

    // Setup the chart 
	chart = new Highcharts.Chart({
		chart: {
		  renderTo: div,//'importantchart',
		  type: 'column',
		  backgroundColor: 'transparent', //params.backgroundColor||defparams.backgroundColor
		  height: 140,
		  marginLeft: 3,
		  marginRight: 3,
		  marginBottom: 0,
		  marginTop: 0
		},

		title: {
		  text: title
		},
		xAxis: {
		  lineWidth: 0,
		  tickWidth: 0,
		  labels: { 
			enabled: false 
		  },
		  categories: categories
		},
		yAxis: {
		  labels: { 
			enabled: false 
		  },
		  gridLineWidth: 0,
		  title: {
			text: null,
		  },
		},
		series: [{
		  name: "yeah waevah",
		  color: '#f00',
		  type: 'line',
		  data: serie1
		}, {
		  name: 'Gyro-Y',
		  color: '#fff',
		  type: 'line',
		  data: serie2
		}],
		credits: { 
		  enabled: false 
		},
		legend: { 
		  enabled: false 
		},
		plotOptions: {
		  column: {
			borderWidth: 0,
			color: '#b2c831',
			shadow: false
		  },
		  line: {
			marker: { 
			  enabled: false 
			},
			lineWidth: 3
		  }
		},
		tooltip: { 
		  enabled: false
		}
	});
	// End setup chart


  // Get Data for chart
  // Live data from mqtt over socket
  //Check for existing socket and reuse
  var socket = io.connect((params.socketURL=='hostURL'||'host') ? window.location.host : params.socketURL);

  // Subscribe to MQTT topic
  socket.emit('subscribe',{topic: mqTopic});

  // 1. open socket & listen to MQTT topic messages
  socket.on('connect', function () {
    socket.on('mqtt', function (msg) {
		//console.log(msg);
		if (msg.topic==params.mqTopic) {
			//$(".graph-info-big").text(mqTopic);

			// any new gyro values coming in will be added to the chart array
			var data = JSON.parse(msg.payload);
			//$(".graph-info-small").text(data.X);
			// Series Parameterized
			// switch for Live or Off-line data
			// if chart in live mode push new data to array else use the whole series

			//  chart.series[i]=data.dataSeries(i)

			//for each dataItem in array dataSeries //([X, Y, Z])
			//chart.series[i].addPoint(parseFloat(data.[dataItems[i]]), true, true);

			chart.series[0].addPoint(parseFloat(data.Y), true, true);
			chart.series[1].addPoint(parseFloat(data.Z), true, true);
			//endfor
			//chart.serie[2].addPoint(parseFloat(data.Z), true, true);

			//chart.series[0].addPoint(parseFloat(msg.payload), true, true);
			// cleanup old data from array (>1000 elements???)
		}      
    })
  })
}

/*
  // 2. Connect to Rest/API and capture data into array
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: hostURL +'/'+ restEndpoint,

    success: function (data) {
      
      data = JSON.parse(data.Result).Table;
      
      var series = [{
        type: 'area',
        name: 'Rate to USD',
        data: [] // will added to in the following for-loop
      }, {
        type: 'line',
        name: 'Rate to SRD',
        data: []
      }];
      
      for(var i = 0, l = data.length; i < l; ++i) {
        var d = ("" + data[i].date_time).split(",");
        if(d.length >= 7) {
          series[0].data.push([
            Date.UTC(d[0], d[1], d[2], d[3], d[4], d[5], d[6]),
            parseFloat(data[i].rate_toDollar),
            data[i].notes
          ]);
          series[1].data.push([
            Date.UTC(d[0], d[1], d[2], d[3], d[4], d[5], d[6]),
            parseFloat(data[i].rate),
            data[i]
          ]);
        }
      }
*/

