$(document).ready(function () {
  var data;
  var years = [];
  var $filtersForm = $('#filters-form');
  var $yearFromSelect = $('#fromyearselect');
  var $yearToSelect = $('#toyearselect');

  function composeYearsFrom(years, yearTo) {
    var $option = $('<option></option>');

    yearTo = parseInt(yearTo);
    yearTo = isNaN(yearTo) ? 0 : yearTo;

    $yearFromSelect.html('');
    $yearFromSelect.html($option);

    $(years).each(function (index, year) {
      if (yearTo >= year)
        return;

      $option = $('<option></option>');
      $option.val(year);
      $option.text(year);

      $yearFromSelect.append($option);
    });
  }

  function composeYearsTo(years, yearFrom) {
    var $option = $('<option></option>');

    yearFrom = parseInt(yearFrom);
    yearFrom = isNaN(yearFrom) ? 0 : yearFrom;

    $yearToSelect.html('');
    $yearToSelect.html($option);

    $(years).each(function (index, year) {
      if (yearFrom > year)
        return;

      $option = $('<option></option>');
      $option.val(year);
      $option.text(year);

      $yearToSelect.append($option);
    });
  }

  function collectFilters() {
    var filter;
    var filters = $filtersForm.serializeArray();
    var transformedFilters = {
      yearFrom: null,
      yearTo: null
    };

    for (index in filters) {
      filter = filters[index];

      if (!filter.value)
        continue;

      if (filter.name === 'date-from') {
        transformedFilters.yearFrom = parseInt(filter.value);
      } else if (filter.name === 'date-to') {
        transformedFilters.yearTo = parseInt(filter.value);
      }
    }

    return transformedFilters;
  }

  $filtersForm.submit(function (e) {
    e.preventDefault();

    var filters = collectFilters();
    
    console.log(filters);
  });

  $yearFromSelect.change(function (e) {
    var selectedYear = $(this).val();
    composeYearsTo(years, selectedYear);
  });

  // Getting comment data
  $.ajax({
    url: 'tab_4_data_sample.csv',
    success: function (csvd) {
      var year;

      data = $.csv.toObjects(csvd);

      if (!data.length)
        return;

      for (var prop in data[0]) {
        if (prop === ' count')
          continue;

        year = parseInt(prop);

        if (!isNaN(year))
          years.push(year);
      }

      composeYearsFrom(years);
      composeYearsTo(years);
    },
    dataType: 'text'
  });
});