$(document).ready(function () {

  var $notes = $('#blNotes');
  var $slider = $("#yearSlider");

  const KEY_ONTOLOGY_ID = 'ontology_id';
  const KEY_PARENT_ID = 'parent_id';
  const KEY_ONTOLOGY_NAME = 'ontology_name';

  const LIST_HOSPITALS = ['UCLA', 'UCSF', 'UCI', 'UCSD', 'UCD'];

  var chartFilters = {
    ontologyId: '',
    years: {min: '', max: ''}
  };
  var parsedData = {
    tree: [],
    chart: [],
    notes: []
  };

  var isInitSlider = false;



  //Listener 'Click' on jsTree
  $('#jstree_div').on("changed.jstree", function (e, data) {
    var parentId = parseInt(data.selected);

    //Get ontology id, which selected
    chartFilters.ontologyId = parentId;

    if(chartFilters.ontologyId != '') {
      setFilterYears(parsedData.chart, chartFilters.ontologyId);

      //Drawing Charts
      initSlider();
      drawChart();

      //Showing Notes
      showNotes(parentId);
    }
  });

  function transformQueryData(data) {
    var transformedData = [];

      $.each(data, function (index, item) {
      var year = parseInt(item['Year']);
      var transformedItem = {
        year: isNaN(year) ? 0 : year,
        queryRunTimestamp: item['query_run_timestamp']
      };

      for (var property in item) {
        if (property === 'Year' || property === 'query_run_timestamp')
          continue;

        transformedItem[property] = parseFloat(item[property]);
        transformedItem[property] = isNaN(transformedItem[property]) ? 0.0 : transformedItem[property];
      }

      transformedData.push(transformedItem);
    });

    return transformedData;
  }

  function selectDataForChart(data, ontologyId, years) {
    var transformedData = [];

    $.each(data, function (index, item) {
      var year = item['year'];
      if(ontologyId == item['ontolgy_id'] && (year >= years.min && year <= years.max)){
        var transformedItem = {'label': year,  values: [item['UCD'], item['UCI'], item['UCLA'], item['UCSD'], item['UCSF']]};
        transformedData.push(transformedItem);
      }
    });

    return transformedData;
  }

  function transformOntologyData(data) {
    var transformedData = [];

    $.each(data, function (index, item) {
      var id = parseInt(item[KEY_ONTOLOGY_ID]);
      var parent = parseInt(item[KEY_PARENT_ID]);
      var text = item[KEY_ONTOLOGY_NAME];
      var transformedItem = {
        id: isNaN(id) ? 0 : id,
        parent: isNaN(parent) || parent == 0 ? '#' : parent,
        text: text
      };

      transformedData.push(transformedItem);
    });

    return transformedData;
  }

  function transformNotesData(data) {
    var transformedData = [];

    $.each(data, function (index, item) {
      var ontology_id = parseInt(item['ontology_id']);
      var transformedItem = {
        ontology_id: isNaN(ontology_id) ? 0 : ontology_id,
        comments: item['comments'],
        hospital: item['hospital']
      };

      transformedData.push(transformedItem);
    });

    return transformedData;
  }

  function setFilterYears(data, ontologyId){
    var year_arr = [];
    $.each(data, function (index, item) {
      if(ontologyId == item['ontolgy_id']){
        var year = item['year'];
        year_arr.push(year);
      }
    });

    if(year_arr.length > 0){
      year_arr.sort();
      chartFilters.years.min = year_arr[0];
      chartFilters.years.max = year_arr[year_arr.length - 1];
    }else{
      chartFilters.years.min = '';
      chartFilters.years.max = '';
    }
  }

  function initSlider(){
    if(chartFilters.years.min != "" && chartFilters.years.max != "") {

      isInitSlider = true;
      $slider.slider({
        min: chartFilters.years.min,
        max: chartFilters.years.max,
        range: true,
        value: [chartFilters.years.min, chartFilters.years.max],
        step: 1
      }).on('change', function (event) {
        var years = event.value.newValue;
        chartFilters.years.min = years[0];
        chartFilters.years.max = years[1];

        drawChart();
      }).show();
    }else {
      if(isInitSlider){
        $slider.slider('destroy');
        isInitSlider = false;
      }
    }
  }

  function drawChart() {
    var dataChart = selectDataForChart(parsedData.chart, chartFilters.ontologyId, chartFilters.years);

    buildChart(LIST_HOSPITALS, dataChart);
  }

  function showNotes(parentId){
    $notes.html('<table class="table table-stripped"></table>');
    var isExistsData = false;
    $.each(parsedData.notes, function (index, item) {
      if(item.ontology_id == parentId) {
        isExistsData = true;
        $notes.find('table').append(
            '<tr><td><div class="ft-wt-b">' + item.hospital + '</div><div>' + item.comments + '</div></td></tr>'
        );
      }
    });

    if(!isExistsData){
      $notes.find('table').append(
          '<tr><td style="border-top: none;"><div>No data</div></td></tr>'
      );
    }

  }

  // Getting data for jsTree
  $.ajax({
    url: 'tab_1_a_data.csv',
    success: function (csvd) {
      parsedData.tree = transformOntologyData($.csv.toObjects(csvd));

      //init JsTree
      $('#jstree_div').jstree({ 'core' : {
        'data' : parsedData.tree
      } });
    },
    dataType: 'text'
  });

  // Getting data for Charts
  $.ajax({
    url: 'tab_1_b_data.csv',
    success: function (csvd) {
      parsedData.chart = transformQueryData($.csv.toObjects(csvd));
    },
    dataType: 'text'
  });

  // Getting data for Notes
  $.ajax({
    url: 'tab_1_c_data.csv',
    success: function (csvd) {
      parsedData.notes = transformNotesData($.csv.toObjects(csvd));
    },
    dataType: 'text'
  });


});