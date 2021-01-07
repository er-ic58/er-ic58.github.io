
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

    var ioffset = (window.tablepage - 1) * 50;

    var tbody = table.append($('<tbody></tbody>'));
    $(tableData).each(function (i, rowData) {
        var realI = i + ioffset;
        if (realI == tableData.length) return false;
        rowData = tableData[realI];
        var row = $('<tr></tr>');
        var dtype = 'td';
        $(rowData).each(function (j, cellData) {
            row.append($('<'+dtype+'>'+cellData+'</'+dtype+'>'));
        });
        tbody.append(row);
        if (i==49) return false;
    });
    return table;
}

window.createNewStatFilter = function(){
  var statSelect = document.getElementById("statSelect");
  var operSelect = document.getElementById("operSelect");
  var numSelect = document.getElementById("numSelect");

  numSelect.className = numSelect.className.replace(' is-danger', '');
  if (isNaN(parseFloat(numSelect.value))) {
    numSelect.className += ' is-danger';
    return;
  }

  document.querySelectorAll('.notification').forEach((oldNotif) => {
    if (oldNotif.lastChild.firstChild.firstChild.innerHTML==statSelect.value) {
      oldNotif.parentNode.removeChild(oldNotif);
    }
  });

  window.createStatFilter(statSelect.value, operSelect.value, numSelect.value);
}

window.createStatFilter = function(statSelect, operSelect, numSelect){

  var $notification = $('<div class="notification is-narrow"><button class="delete" type="button"></button><div class="columns"><div class="column is-3"><strong>'+statSelect+'</strong></div><div class="column has-text-centered is-2">'+operSelect+'</div><div class="column has-text-left"><strong>'+numSelect+'</strong></div></div></div>');
  $('#statscolumn').append($notification);

  var $delete = $notification[0].firstChild;

  $delete.addEventListener('click', () => {
    $notification[0].parentNode.removeChild($notification[0]);
  });
}

window.refreshPage = function() {
  window.location.hash = "";
  var hashParams = [];
  document.querySelectorAll('.notification').forEach((notif) => {
    hashParams.push("f="+encodeURIComponent(notif.lastChild.firstChild.firstChild.innerHTML+","+notif.lastChild.children[1].firstChild.data+","+notif.lastChild.lastChild.firstChild.innerHTML));
  });
  window.location.hash = hashParams.join("&");

  //$('form').team.dirty = true;
  $('#dirtyField')[0].value = (parseInt($('#dirtyField')[0].value) + 1)%2;
  $('form').submit();
  //window.location.reload();
}

function setupPage(){
  window.tablepage = 1;
  window.totalPages = 0;
  var hashParams = window.location.search.substr(1).split('&'); // substr(1) to remove the `#`
  if (hashParams[0] != "")
  {
    for(var i = 0; i < hashParams.length; i++){
        var p = hashParams[i].split('=');
        document.querySelector('[name="'+p[0]+'"]').value = decodeURIComponent(p[1]);
    }
  }

  hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
  if (hashParams[0] != "")
  {
    for(var i = 0; i < hashParams.length; i++){
        var p = hashParams[i].split('=');
        if (p[0]=="f") {
          var sf = decodeURIComponent(p[1]).split(',');
          window.createStatFilter(sf[0],sf[1],sf[2]);
        }
    }
  }

  var season = document.querySelector('[name="season"]').value;
  //console.log("season is, and i quote, '"+season+"'");


  (document.querySelectorAll('.notification .delete') || []).forEach(($delete) => {
    var $notification = $delete.parentNode;

    $delete.addEventListener('click', () => {
      $notification.parentNode.removeChild($notification);
    });
  });


  $.ajax({
        type: "GET",
        beforeSend: function(xhr){  xhr.overrideMimeType( "text/plain; charset=x-user-defined" );},
        url: "stats/"+season+".csv",
        success: function (data) {
            var data = Papa.parse(data).data;
            window.tableHeader = data.slice(0,-data.length+1);
            window.tableData = data.slice(1);
            window.tableClassName = "js-sort-table table is-striped is-hoverable is-fullwidth";
            filterTableData();
            setupLowerInfo();
        }
    });
}

function indexMatchingText(ele, text) {
    for (var i=0; i<ele.length;i++) {
        if (ele[i].childNodes[0].nodeValue === text){
            return i;
        }
    }
    return undefined;
}

function filterTableData() {
  var team = document.querySelector('[name="team"]').value;
  window.tableData = window.tableData.filter(function(entry) {
    if (team!="All" && entry[1]!=team) return false;
    hashParams = window.location.hash.substr(1).split('&'); // substr(1) to remove the `#`
    if (hashParams[0] != "")
    {
      for(var i = 0; i < hashParams.length; i++){
          var p = hashParams[i].split('=');
          if (p[0]=="f") {
            var sf = decodeURIComponent(p[1]).split(',');
            var eData = parseFloat(entry[indexMatchingText(document.getElementById('statSelect').options, sf[0])+2]);
            switch (sf[1]) {
              case ">=":
                if (eData < parseFloat(sf[2])) return false;
                break;
              case "=":
                if (eData != parseFloat(sf[2])) return false;
                break;
              case "<=":
                if (eData > parseFloat(sf[2])) return false;
                break;
            }
          }
      }
    }
    return true;
  });
}

function setupLowerInfo() {
  window.totalPages = Math.ceil(window.tableData.length / 50);
  document.getElementById('pagelabel').innerHTML = "Page "+window.tablepage+" of "+window.totalPages;
  document.getElementById('showinglabel').innerHTML = "Showing "+(1+((window.tablepage-1)*50))+"-"+((window.tablepage)*50)+" of "+window.tableData.length;
  document.getElementById('decbutton').disabled = window.tablepage==1;
  document.getElementById('incbutton').disabled = window.tablepage==window.totalPages;
  window.refreshTable();
}

function incrementPage() {
  if (window.tablepage<window.totalPages) window.tablepage++;
  setupLowerInfo();
}

function decrementPage() {
  if (window.tablepage>1) window.tablepage--;
  setupLowerInfo();
}
