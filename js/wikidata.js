$('#btn-submit').on('click', function(e) {
  e.preventDefault();

  var type = $('#type').val();
  var isOrganic = $('#isOrganic').prop('checked');
  var minTemp = $('#minTemp').val();
  var maxTemp = $('#maxTemp').val();

  var formulas = {
    Q11193: "OH(\\\\)[₁₂₃₄₅₆₇₈₉₀])?$",
    Q12370: "^(Na|Al|Sn|Pb|Cu|Ag|Zn|Cb|Hg|Cr|Mn|Fe|Cb).+",
  };

  var sparql = 'SELECT DISTINCT ?item ?itemLabel ?formula ?article {' +
    '?item wdt:P274 ?formula .' +
    (formulas[type]
      ? 'FILTER REGEX(STR(?formula), "' + formulas[type] + '")'
      : '?item wdt:P31/wdt:P279* wd:' + type + ' .') +
    (isOrganic ? '?item wdt:P279+ wd:Q11173 . ' : '') +

    (minTemp || maxTemp ? 'OPTIONAL {?item wdt:P2101 ?temp}' : '') +
    (minTemp ? 'FILTER (?temp >= ' + minTemp + ') ' : '') +
    (maxTemp ? 'FILTER (?temp <= ' + maxTemp + ') ' : '') +

    'OPTIONAL { ?article schema:about ?item; schema:isPartOf <https://ru.wikipedia.org/> }' +
    'SERVICE wikibase:label { bd:serviceParam wikibase:language "ru,en" }' +
  '} LIMIT 500';

  fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(sparql), {
    headers: {
      "Accept": "application/sparql-results+json",
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var $tbody = $('#table tbody');
      $tbody.find('tr').remove();
      for (var i in json.results.bindings) {
        var item = json.results.bindings[i];
        var url = item.article ? item.article.value : item.item.value;
        var $tr = $('<tr>')
          .append('<td class="col"><a href="' + url + '">' + item.itemLabel.value + '</a></td>')
          .append('<td class="col">' + (item.formula ? item.formula.value : '') + '</td>');
        $tbody.append($tr);
      }
      $('#table').show();
    })
    .catch(alert);
});
