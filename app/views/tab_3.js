$(document).ready(function () {
  var data;
  var $firstLevelSelect = $('#level1select');
  var $secondLevelSelect = $('#level2select');
  var $filtersForm = $('#filters-form');
  var $results = $('#query-results');
  var $noData =  $('#no-data');

  $firstLevelSelect.change(function (e) {
    var selectedId = $(this).val();
    composeSecondLevel(data, selectedId);
  });

  $('#show-comment-form').click(function (e) {
    $('#comment-container').show();
    $(this).hide();
  });

  $('#comment-form').submit(function (e) {
    var comment = $(this).find('#comment-text').val();
    var level1 = parseInt($('#level1select').val());
    var level2 = parseInt($('#level2select').val());
    var year = parseInt($('#toyearselect').val());

    // sending comment to a server ...
  });

  $filtersForm.submit(function (e) {
    e.preventDefault();

    var filteredData = [];
    var filters = collectFilters();

    $results.html('');
    $.each(data, function (index, item) {
      if (filters.ontology_id.length > 0 && $.inArray(item.ontology_id, filters.ontology_id) < 0) {
        return;
      }

      filteredData.push(item);
      $results.append(
        '<div class="panel panel-primary js-comment">' +
          '<div class="panel-body">' + item.comments + '</div>' +
        '</div>'
      );
    });

    filteredData.length ? $noData.hide() : $noData.show();
  });

  // Composing of a Level 1 select
  function composeFirstLevel(data) {
    var $option = $('<option></option>');

    $firstLevelSelect.html('');
    $firstLevelSelect.append($option);

    $.each(data, function (index, item) {
      if (item.parent_id === 0) {
        $option = $('<option></option>');

        $option.val(item.ontology_id);
        $option.text(item.ontology_name);
        $firstLevelSelect.append($option);
      }
    });
  }

  // Composing of a Level 2 select
  function composeSecondLevel(data, selectedId) {
    var $option = $('<option></option>');
    selectedId = parseInt(selectedId);
    selectedId = isNaN(selectedId) ? 0 : selectedId;

    $secondLevelSelect.html('');
    $secondLevelSelect.append($option);

    $.each(data, function (index, item) {
      if (item.parent_id === selectedId && selectedId > 0) {
        $option = $('<option></option>');

        $option.val(item.ontology_id);
        $option.text(item.ontology_name);
        $secondLevelSelect.append($option);
      }
    });
  }

  function collectFilters() {
    var filter;
    var filters = $filtersForm.serializeArray();
    var transformedFilters = {
      ontology_id: [],
      clinics: [],
      yearTo: null
    };

    for (index in filters) {
      filter = filters[index];

      if (!filter.value)
        continue;

      if (filter.name === 'level1') {
        transformedFilters.ontology_id = [parseInt(filter.value)];
      } else if (filter.name === 'level2') {
        transformedFilters.ontology_id = [parseInt(filter.value)];
      } else if (filter.name === 'toyearselect') {
        transformedFilters.yearTo = parseInt(filter.value);
      } else {
        transformedFilters.clinics.push(filter.value);
      }
    }

    return transformedFilters;
  }

  // Getting comment data
  $.ajax({
    url: 'tab_3_data_sample.csv',
    success: function (csvd) {
      data = $.csv.toObjects(csvd);

      for (index in data) {
        data[index].ontology_id = parseInt(data[index].ontology_id);
        data[index].parent_id = parseInt(data[index].parent_id);
      }

      composeFirstLevel(data);
      composeSecondLevel(data);
    },
    dataType: 'text'
  });
});