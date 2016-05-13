$(document).ready(function () {
  var $querySelect = $('#level1select');
  var $filtersForm = $('#filters-form');
  var queries = {};

  $filtersForm.submit(function (e) {
    e.preventDefault();

    var query;
    var items;
    var item;
    var filteredValues = {};
    var filters = collectFilters();

    for (var queryId in queries) {
      items = queries[queryId].items;
      
      for (var index in items) {
        item = items[index];


        if (filters.query && item.query_id != filters.query)
          continue;
        
        console.log(item);
      }
    }
  });

  function collectFilters() {
    var filter;
    var filters = $filtersForm.serializeArray();
    var transformedFilters = {
      query: 0,
      clinics: [],
      dayRange: 0
    };

    for (index in filters) {
      filter = filters[index];

      if (!filter.value)
        continue;

      if (filter.name === 'query') {
        console.log(filter.value);
        transformedFilters.query = parseInt(filter.value);
      } else if (filter.name === 'day-range') {
        transformedFilters.dayRange = parseInt(filter.value);
      } else {
        transformedFilters.clinics.push(filter.value);
      }
    }

    return transformedFilters;
  }

  // Getting query data
  $.ajax({
    url: 'tab_2_data_sample.csv',
    success: function (csvd) {
      var queryId;
      var $clone;
      var $option = $('<option></option>').val('').text('All');
      var data = $.csv.toObjects(csvd);
      var $layout = $(
        '<label class="checkbox-inline">' +
        '<input type="checkbox" name="" value="" checked="checked" class="js-clinic-filter-checkbox"> ' +
        '<span class="js-clinic-filter-name"></span>' +
        '</label>'
      );
      $querySelect.append($option);

      // Collecting queries
      for (var index in data) {
        queryId = data[index]['query_id'];

        if (!queries.hasOwnProperty(queryId)) {
          queries[queryId] = {
            items: []
          };
          $option = $('<option></option>').val(queryId).text('Q' + queryId);
          $querySelect.append($option);
        }

        queries[queryId].items.push(data[index]);
      }

      // Collecting clinics
      for (var prop in data[0]) {
        if (['query_run_timestamp', 'query_id'].indexOf(prop) >= 0)
          continue;

        $clone = $layout.clone();
        $clone.find('.js-clinic-filter-checkbox').attr({
          value: prop,
          name: 'clinics[]'
        });
        $clone.find('.js-clinic-filter-name').text(prop);

        $('#clinics-filter-container').append($clone);
      }
    },
    dataType: 'text'
  });
});