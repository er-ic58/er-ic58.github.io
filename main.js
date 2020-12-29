
/*
document.querySelectorAll('.dropdown').forEach(dropdown =>
dropdown.addEventListener('click', function(event) {
  event.stopPropagation();
  dropdown.classList.toggle('is-active');
}));
*/

function arrayToTable(tableData) {
    var table = $('<table class="js-sort-table table is-striped is-hoverable is-fullwidth"></table>');
    var thead = table.append($('<thead></thead>'));
    var tbody = table.append($('<tbody></tbody>'));
    $(tableData).each(function (i, rowData) {
        var row = $('<tr></tr>');
        var dtype = i==0 ? 'th' : 'td';
        $(rowData).each(function (j, cellData) {
            row.append($('<'+dtype+'>'+cellData+'</'+dtype+'>'));
        });
        if (i==0) thead.append(row);
        else tbody.append(row);
    });
    return table;
}

setupPage = function(){
  var hashParams = window.location.search.substr(1).split('&'); // substr(1) to remove the `#`
  if (hashParams[0] == "") return;
  for(var i = 0; i < hashParams.length; i++){
      var p = hashParams[i].split('=');
      document.querySelector('[name="'+p[0]+'"]').value = decodeURIComponent(p[1]);
  }

  var season = document.querySelector('[name="season"]').value;

  $.ajax({
        type: "GET",
        beforeSend: function(xhr){  xhr.overrideMimeType( "text/plain; charset=x-user-defined" );},
        url: "stats/"+season+".csv",
        success: function (data) {
            $('#tablelocation').append(arrayToTable(Papa.parse(data).data));
        }
    });
}
