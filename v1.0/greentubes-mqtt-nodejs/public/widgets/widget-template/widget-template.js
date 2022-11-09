/* Template for making widgets 
# Widgets take data from 
# - Live Data via SocketIO/room + MQTT/Topic 
# - RestAPI
# - Feedselect, allows to choose either Live, Rest or Auto
# instructions:
# 1. Replace all "widget_template" with your widget name (eg. by search n replace)
# 2. Add your widget specific object(s) and code
# 3. Identify the parameters you would like user/admin to change at run-time and add to params object
#    3b. if you gonna use the PropertyGrid fo Param editing set the propertyMeta object accordingly (see jqPropertygrid)
*/

function load_widget_template(title,div, params) {
  console.log("load_widget_template : " +  title + " to <DIV>" + div + "</DIV>");
  
  // ### PRE-LOAD HTML/CSS ### 
  // ###TB HOW??Load all HTML/CSS stuff associated with the widget to target DIV first
  // The widget is loaded into a <DIV id="same-as-widget-name"></DIV> if exist ELSE
  // directly into the target div (function call) 

  
  // ### PARAMS ###
  // identify/parameterize and add to params object
  // This serves as the "default" param settings for a widget
  // ??? will be overridden at run-time with user params stored in cookie, localstorage or serverside (Rest)
  var params={ 
    // ### Data Params ###
    feedSelect: 'auto', // dropdown from AUTO, SOCKET if Live feed available use that, else use REST
    // Live-Data ~ MQTT / SocketIO
    socketURL : '%window.location.host%', //  %params% will be run-time evaluated and replaced with result string
    mqTopic :'gyro',
    // Off-line data ~ REst API    
    restURL : "%window.location.host%/gpio/12/",
    restPolling:3000,
    dataSeries:['X', 'Y', 'Z'], //?? check data-feeds/chart-data wire-up...
    // ## CHART Editable options

  };
    // Enter all jsPropertygrid meta/styling stuff in here
    var propertyMeta ={};

  // ???
  var dataSeries = ['X', 'Y', 'Z'];

  // DATA DEFAULTS (in case no connections)
  var serie1 = [0,1,2,3,4,5],
    serie2 = [0,1,2,3,4,5];

  // SETUP WIDGET/CHART/CONTROL PROTO HERE 
  var chart = new Highcharts.Chart({
    chart: {
      renderTo: div,// ###TB the target DIV to inject Chart object(directly), check how to do with WIDGET.HTML (with widget placeholder)/CSS
      type: 'column',
      backgroundColor: 'transparent', //params.backgroundColor||defparams.backgroundColor
      height: 140,
      marginLeft: 3,
      marginRight: 3,
      marginBottom: 0,
      marginTop: 0
    },

    title: {
      text: title // chart title (TB: can be different from Widget Title??)
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
    // TB These need to be generalized, auto-build from 
    series: [{
      name: "Gyro-X", 
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

  /* GET DATA FOR WIDGET 
  Live data from mqtt over socket
  // ### Check for existing socket and reuse / add SocketIO Rooms option to decrease parse load!!
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

