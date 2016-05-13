$(document).ready(function () {
  const KEY_ONTOLOGY_ID = 'ontology_id';
  const KEY_PARENT_ID = ' parent_id';
  const KEY_ONTOLOGY_NAME = ' ontology_name';

  var queryData = [];
  var filtersData = {
    levels: [],
    common: [],
    clinics: []
  };
  var $firstLevelSelect = $('#level1select');
  var $secondLevelSelect = $('#level2select');
  var $yearFromSelect = $('#fromyearselect');
  var $yearToSelect = $('#toyearselect');
  var $filtersForm = $('#filters-form');
  var $clinicsContainer = $('#clinics-filter-container');
  var $countsTable = $('#counts-table');

  $firstLevelSelect.change(function (e) {
    var selectedId = $(this).val();
    composeSecondLevel(filtersData.levels, selectedId);
  });

  $yearFromSelect.change(function (e) {
    var selectedYear = $(this).val();
    composeYearsTo(filtersData.common, selectedYear);
  });

  $filtersForm.submit(function (e) {
    e.preventDefault();

    var filters = collectFilters();
    var data = filterQueryData(queryData, filters);
    buildTable(data, filters);
  });

  function collectFilters() {
    var filter;
    var filters = $filtersForm.serializeArray();
    var transformedFilters = {
      ontolgy_ids: [],
      clinics: [],
      yearFrom: null,
      yearTo: null
    };

    for (index in filters) {
      filter = filters[index];

      if (!filter.value)
        continue;

      if (filter.name === 'level1') {
        transformedFilters.ontolgy_ids = [parseInt(filter.value)];
      } else if (filter.name === 'level2') {
        transformedFilters.ontolgy_ids = [parseInt(filter.value)];
      } else if (filter.name === 'date-from') {
        transformedFilters.yearFrom = parseInt(filter.value);
      } else if (filter.name === 'date-to') {
        transformedFilters.yearTo = parseInt(filter.value);
      } else {
        transformedFilters.clinics.push(filter.value);
      }
    }

    return transformedFilters;
  }

  function filterQueryData(queryData, filters) {
    var prevItem;
    var filteredData = [];
    var filteredItem = null;

    $(queryData).each(function (index, filteredItem) {
      filteredItem = $.extend({}, filteredItem);

      if (filters.yearFrom !== null && filteredItem.year < filters.yearFrom) {
        return;
      }

      if (filters.yearTo !== null && filteredItem.year > filters.yearTo) {
        return;
      }

      if (filters.ontolgy_ids.length > 0 && $.inArray(filteredItem.ontolgy_id, filters.ontolgy_ids) < 0) {
        return;
      }

      filteredItem.clinics = [];

      for (property in filteredItem) {
        if (
          property === 'queryRunTimestamp' || property === 'year' ||
          property === 'clinics' || property === 'ontolgy_id'
        ) {
          continue;
        }

        filteredItem.clinics.push({
          name: property,
          count: filteredItem[property]
        });
      }

      prevItem = filteredData[filteredData.length - 1];

      // If there is previous item with same year, sum it
      if (prevItem && prevItem.year == filteredItem.year) {
        for (index in prevItem.clinics) {
          prevItem.clinics[index].count += filteredItem.clinics[index].count;
        }
      } else {
        filteredData.push(filteredItem);
      }
    });

    return filteredData;
  }

  function transformOntologyData(data) {
    var transformedData = [];

    $(data).each(function (index, item) {
      var id = parseInt(item[KEY_ONTOLOGY_ID]);
      var parentId = parseInt(item[KEY_PARENT_ID]);
      var name = item[KEY_ONTOLOGY_NAME];
      var transformedItem = {
        id: isNaN(id) ? 0 : id,
        parentId: isNaN(parentId) ? 0 : parentId,
        name: name
      };

      transformedData.push(transformedItem);
    });

    return transformedData;
  }

  function transformCommonData(data) {
    var transformedData = [];

    $(data).each(function (index, item) {
      var year = parseInt(item['Year']);
      var transformedItem = {
        year: isNaN(year) ? 0 : year
      };

      for (var property in item) {
        if (property === 'Year')
          continue;

        transformedItem[property] = parseFloat(item[property]);
        transformedItem[property] = isNaN(transformedItem[property]) ? 0.0 : transformedItem[property];
      }

      transformedData.push(transformedItem);
    });

    return transformedData;
  }

  function transformQueryData(data) {
    var transformedData = [];

    $(data).each(function (index, item) {
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

  // Composing of a Level 1 select
  function composeFirstLevel() {
    var $option = $('<option></option>');

    $firstLevelSelect.html('');
    $firstLevelSelect.append($option);

    $(filtersData.levels).each(function (index, item) {
      if (item.parentId === 0) {
        $option = $('<option></option>');

        $option.val(item.id);
        $option.text(item.name);
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

    $(filtersData.levels).each(function (index, item) {
      if (item.parentId === selectedId && selectedId > 0) {
        $option = $('<option></option>');

        $option.val(item.id);
        $option.text(item.name);
        $secondLevelSelect.append($option);
      }
    });
  }

  function composeYearsFrom(data, yearTo) {
    var $option = $('<option></option>');

    yearTo = parseInt(yearTo);
    yearTo = isNaN(yearTo) ? 0 : yearTo;

    $yearFromSelect.html('');
    $yearFromSelect.html($option);

    $(data).each(function (index, item) {
      if (yearTo >= item.year)
        return;

      $option = $('<option></option>');
      $option.val(item.year);
      $option.text(item.year);

      $yearFromSelect.append($option);
    });
  }

  function composeYearsTo(data, yearFrom) {
    var $option = $('<option></option>');

    yearFrom = parseInt(yearFrom);
    yearFrom = isNaN(yearFrom) ? 0 : yearFrom;

    $yearToSelect.html('');
    $yearToSelect.html($option);

    $(data).each(function (index, item) {
      if (yearFrom > item.year)
        return;

      $option = $('<option></option>');
      $option.val(item.year);
      $option.text(item.year);

      $yearToSelect.append($option);
    });
  }

  function composeClinics(data) {
    var $clone;
    var item = data[0];
    var $layout = $(
      '<label class="checkbox-inline">' +
      '<input type="checkbox" name="" value="" checked="checked" class="js-clinic-filter-checkbox"> ' +
      '<span class="js-clinic-filter-name"></span>' +
      '</label>'
    );

    for (var property in item) {
      if (property === 'year')
        continue;

      $clone = $layout.clone();
      $clone.find('.js-clinic-filter-checkbox').attr({
        value: property,
        name: 'clinics[]'
      });
      $clone.find('.js-clinic-filter-name').text(property);

      $clinicsContainer.append($clone);
    }
  }

  function buildTable(data, filters) {
    var $th;
    var $tr;
    var $td;
    var clinic;
    var firstItem = data[0];
    var $headerLayout = $(
      '<thead>' +
      '<tr>' +
      '<th>Year</th>' +
      '</tr>' +
      '</thead>'
    );
    $countsTable.html('');

    if (!firstItem)
      return;

    for (index in firstItem.clinics) {
      clinic = firstItem.clinics[index];

      if ($.inArray(clinic.name, filters.clinics) < 0) {
        continue;
      }

      $th = $('<th></th>');
      $th.text(clinic.name);
      $headerLayout.find('tr').append($th);
    }

    $countsTable.html($headerLayout);

    $(data).each(function (index, item) {
      $tr = $('<tr></tr>');
      $td = $('<td></td>').text(item.year);

      $tr.append($td);

      for (index in item.clinics) {
        clinic = item.clinics[index];

        if ($.inArray(clinic.name, filters.clinics) < 0) {
          continue;
        }

        $td = $('<td></td>').text(clinic.count);
        $tr.append($td);
      }

      $countsTable.append($tr);
    });
  }

  // Getting all data
  $.ajax({
    url: 'tab_1_data.csv',
    success: function (csvd) {
      queryData = transformQueryData($.csv.toObjects(csvd));
    },
    dataType: 'text'
  });

  // Getting data for filters
  $.ajax({
    url: 'tab_1_filters.csv',
    success: function (csvd) {
      filtersData.levels = transformOntologyData($.csv.toObjects(csvd));
      composeFirstLevel(filtersData.levels);
    },
    dataType: 'text'
  });

  // Getting common data
  $.ajax({
    url: 'tab_1_data_sample.csv',
    success: function (csvd) {
      filtersData.common = transformCommonData($.csv.toObjects(csvd));
      composeYearsFrom(filtersData.common);
      composeYearsTo(filtersData.common);
      composeClinics(filtersData.common);
    },
    dataType: 'text'
  });
});