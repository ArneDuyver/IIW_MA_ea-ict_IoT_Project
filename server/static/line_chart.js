var new_sensorValue = 22;
var error_threshold = 25;

socket.on('mqtt_message', function (data) {
  console.log(data['payload']);

  if (!isNaN(Number(data['payload']))) {
    if (data['topic'] == "gassensor") {
      if (Number(data['payload']) >= error_threshold) {
        console.log("Error")
        document.getElementById("error_btn").style.visibility = "visible";
      } else {
        document.getElementById("error_btn").style.visibility = "hidden";
      }
      new_sensorValue = Number(data['payload']);
      //if in automatic mode set the correct servo value
      var mode = document.getElementById("autoManLabel").innerHTML.toLowerCase();
      if (mode == "automatic") {
        if (Number(data['payload']) >= error_threshold) {
          var data = '{"topic": "servo", "message": ' + 90 + ', "qos": 2}';
          socket.emit('publish', data = data);
        } else {
          var data = '{"topic": "servo", "message": ' + 0 + ', "qos": 2}';
          socket.emit('publish', data = data);
        }
      }
    };
  };
});

am5.ready(function () {

  // Create root element
  // https://www.amcharts.com/docs/v5/getting-started/#Root_element
  var root = am5.Root.new("chartdiv");


  // Set themes
  // https://www.amcharts.com/docs/v5/concepts/themes/
  root.setThemes([
    am5themes_Animated.new(root)
  ]);


  // Generate random data
  var value = 22;

  function generateChartData() {
    var chartData = [];
    var firstDate = new Date();
    firstDate.setDate(firstDate.getDate() - 1000);
    firstDate.setHours(0, 0, 0, 0);

    for (var i = 0; i < 50; i++) {
      var newDate = new Date(firstDate);
      newDate.setSeconds(newDate.getSeconds() + i);

      value += 0;
      chartData.push({
        date: newDate.getTime(),
        value: value
      });
    }
    return chartData;
  }

  var data = generateChartData();


  // Create chart
  // https://www.amcharts.com/docs/v5/charts/xy-chart/
  var chart = root.container.children.push(am5xy.XYChart.new(root, {
    focusable: true,
    panX: true,
    panY: true,
    wheelX: "panX",
    wheelY: "zoomX"
  }));

  var easing = am5.ease.linear;


  // Create axes
  // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
  var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
    maxDeviation: 0.5,
    //groupData: false,
    extraMax: 0.1, // this adds some space in front
    extraMin: -0.1,  // this removes some space form th beginning so that the line would not be cut off
    baseInterval: {

    },
    renderer: am5xy.AxisRendererX.new(root, {
      minGridDistance: 50
    }),
  }));

  let xRenderer = xAxis.get("renderer");
  xRenderer.labels.template.setAll({
    visible: false
  });
  var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {})
  }));


  // Add series
  // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
  var series = chart.series.push(am5xy.LineSeries.new(root, {
    name: "Gas measurements",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "value",
    valueXField: "date",
  }));

  // tell that the last data item must create bullet
  data[data.length - 1].bullet = true;
  series.data.setAll(data);


  // Create animating bullet by adding two circles in a bullet container and
  // animating radius and opacity of one of them.
  series.bullets.push(function (root, series, dataItem) {
    // only create sprite if bullet == true in data context
    if (dataItem.dataContext.bullet) {
      var container = am5.Container.new(root, {});
      var circle0 = container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: am5.color(0xff0000)
      }));
      var circle1 = container.children.push(am5.Circle.new(root, {
        radius: 5,
        fill: am5.color(0xff0000)
      }));

      circle1.animate({
        key: "radius",
        to: 20,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      });
      circle1.animate({
        key: "opacity",
        to: 0,
        from: 1,
        duration: 1000,
        easing: am5.ease.out(am5.ease.cubic),
        loops: Infinity
      });

      return am5.Bullet.new(root, {
        locationX: undefined,
        sprite: container
      })
    }
  })


  // Add cursor
  // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
  var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
    xAxis: xAxis
  }));
  cursor.lineY.set("visible", false);


  // Update data every second
  setInterval(function () {
    addData();
  }, 1000)


  function addData() {
    var lastDataItem = series.dataItems[series.dataItems.length - 1];

    var lastValue = lastDataItem.get("valueY");
    var newValue = new_sensorValue
    var lastDate = new Date(lastDataItem.get("valueX"));
    var time = am5.time.add(new Date(lastDate), "second", 1).getTime();
    series.data.removeIndex(0);
    series.data.push({
      date: time,
      value: newValue
    })

    var newDataItem = series.dataItems[series.dataItems.length - 1];
    newDataItem.animate({
      key: "valueYWorking",
      to: newValue,
      from: lastValue,
      duration: 600,
      easing: easing
    });

    // use the bullet of last data item so that a new sprite is not created
    newDataItem.bullets = [];
    newDataItem.bullets[0] = lastDataItem.bullets[0];
    newDataItem.bullets[0].get("sprite").dataItem = newDataItem;
    // reset bullets
    lastDataItem.dataContext.bullet = false;
    lastDataItem.bullets = [];


    var animation = newDataItem.animate({
      key: "locationX",
      to: 0.5,
      from: -0.5,
      duration: 600
    });
    if (animation) {
      var tooltip = xAxis.get("tooltip");
      if (tooltip && !tooltip.isHidden()) {
        animation.events.on("stopped", function () {
          xAxis.updateTooltip();
        })
      }
    }
  }


  // Make stuff animate on load
  // https://www.amcharts.com/docs/v5/concepts/animations/
  chart.appear(1000, 100);

}); // end am5.ready()