
/*
document.querySelectorAll('.dropdown').forEach(dropdown =>
dropdown.addEventListener('click', function(event) {
  event.stopPropagation();
  dropdown.classList.toggle('is-active');
}));
*/

window.refreshTable = function() {
    var table = $('#tablelocation').children('table');
    if (table.length>0) table.remove();

    $('#tablelocation').append(window.arrayToTable());

    window.initSortTable();
}

window.arrayToTable = function() {
    var tableData = window.tableData;
    //console.log(tableData);

    var table = $('<table class="'+window.tableClassName+'"></table>');
    //var thead = table.append($('<thead></thead>'));

    $(window.tableHeader).each(function(i,rowData) {
        var row = $('<tr></tr>');
        $(rowData).each(function (j, cellData) {
            var icon = "sort";
            if (sortTable.sortCol==j)
            {
                if (sortTable.sortDir==1) icon="sort-down";
                else icon="sort-up";
            }
            var app = cellData + '<span class="icon is-small"><i class="fas fa-'+icon+'" aria-hidden="true"></i></span>'
            row.append($('<th>'+app+'</th>'));
        });
        table.append($('<thead></thead>').append(row));
    });

    var tbody = table.append($('<tbody></tbody>'));
    $(tableData).each(function (i, rowData) {
        var row = $('<tr></tr>');
        var dtype = 'td';
        $(rowData).each(function (j, cellData) {
            row.append($('<'+dtype+'>'+cellData+'</'+dtype+'>'));
        });
        tbody.append(row);
        if (i==50) return false;
    });
    return table;
}

function setupPage(){
  var hashParams = window.location.search.substr(1).split('&'); // substr(1) to remove the `#`
  if (hashParams[0] == "") return;
  for(var i = 0; i < hashParams.length; i++){
      var p = hashParams[i].split('=');
      document.querySelector('[name="'+p[0]+'"]').value = decodeURIComponent(p[1]);
  }

  var season = document.querySelector('[name="season"]').value;
  console.log("1");

  $.ajax({
        type: "GET",
        beforeSend: function(xhr){  xhr.overrideMimeType( "text/plain; charset=x-user-defined" );},
        url: "stats/"+season+".csv",
        success: function (data) {
            console.log("2");
            var data = Papa.parse(data).data;
            window.tableHeader = data.slice(0,-data.length+1);
            window.tableData = data.slice(1);
            window.tableClassName = "js-sort-table table is-striped is-hoverable is-fullwidth";
            $('#tablelocation').append(window.arrayToTable());
            console.log("3");
        }
    });
}
