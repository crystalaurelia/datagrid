function DataGrid (dataObject) {
	//console.log("constructor called");
	var doc = window.document;
	var data = dataObject.data;
	var rootElement = dataObject.rootElement;
	var columns = dataObject.columns;
	var pageSize = dataObject.pageSize || data.length;	
	
	var table = doc.createElement("TABLE"); 
	table.setAttribute("id", "Table_" + dataObject.rootElement.id);
	var selectedColumn = columns[0]; //initial selected first column
	var sortedData = data;
	var tb_width=0;
	
	//Initial Sorting
	var sort_asc = 1;
	data.sort((function(a, b) {
		var nameA = a[columns[0].dataName.valueOf()], nameB = b[columns[0].dataName.valueOf()];
		return (nameA == nameB) ? 0 : ((nameA > nameB) ? sort_asc : -1 * sort_asc);
	}));
	
	//tBody
	var tbody = table.createTBody();
	var tbID = "Grid_" + dataObject.rootElement.id;
	var pages = 1, cpage = 1;
	tbody.setAttribute("id", tbID);
	tbody.setAttribute("tblen", data.length);

	if (data.length <= pageSize)  {
		//don't render paging
	} else { var pager = true;
		var prev = doc.createElement("SPAN");
		prev.setAttribute("class", "disabled");
		prev.setAttribute("id", "P_"+tbID);
		var prevText = doc.createTextNode("<Previous ");	
		prev.appendChild(prevText);
		prev.addEventListener(
			"click",
			function(event) {
				//console.log("Previous: "+event.target.id );
				tbPager( event, 'P' );
			}, false
		);
		
		pages = Math.ceil( data.length / pageSize );
		var pager = doc.createElement("SPAN");
		pager.setAttribute("class", "bold");
		pager.setAttribute("id", "T_"+tbID);
		var pagerText = doc.createTextNode(" 1 of "+pages);
		pager.appendChild(pagerText);		
		
		var next = document.createElement("SPAN");		
		next.setAttribute("class", "link");	
		next.setAttribute("id", "N_"+tbID);
		var nextText = doc.createTextNode(" Next>");
		next.appendChild(nextText);
		next.addEventListener(
			"click",
			function(event) {
				tbPager( event, 'N' );
			}, false
		);
		
		var caption = doc.createElement("caption");
		caption.appendChild(prev);
		caption.appendChild(pager);
		caption.appendChild(next);
		table.appendChild(caption);
	}
	
	tbody.setAttribute("tblen", data.length);
	tbody.setAttribute("pages", pages);
	tbody.setAttribute("cpage", cpage);
	tbody.setAttribute("rowpv", pageSize);
	for (var r = 0; r < pageSize; r++){
		var row = table.insertRow();
		columns.forEach( 
			function(column, index) {
				var bodyCell = row.insertCell();
				if(column == selectedColumn) {
					bodyCell.setAttribute("class", "selectedColumn");
				}
				bodyCell.style.textAlign = column.align;
				var text = doc.createTextNode(sortedData[r][column.dataName]);
				bodyCell.appendChild(text);
			}
		);	
	} 
	
	//tHead
	var header = table.createTHead();
	var headerRow = header.insertRow();	
	columns.forEach(
		function(column, index) {
			var headerCell = headerRow.insertCell();
			tb_width += parseInt(column.width);
			headerCell.setAttribute("table", tbID);
			headerCell.setAttribute("id", column.dataName);
			headerCell.setAttribute("title", "Sort by " + column.name);
			headerCell.setAttribute("sort", sort_asc);
			headerCell.style.textAlign = column.align;
			headerCell.style.width = column.width + "px";
			headerCell.addEventListener(
				"click",
				function(event) {
					//console.log ('table:' + event.target.getAttribute("table")+ ', 					//console.log(column.dataName + ',' +column.dataName.valueOf());
					selectedColumn = column;
					//re-sort table
					tbID = event.target.getAttribute("table");
					var rows = doc.getElementById(tbID).getAttribute("tblen");
					var rwpv = doc.getElementById(tbID).getAttribute("rowpv");
					var pages = doc.getElementById(tbID).getAttribute("pages");
					var cpage = doc.getElementById(tbID).getAttribute("cpage");

					sort_asc = event.target.getAttribute("sort") * -1;
					event.target.setAttribute("sort", sort_asc);
					data.sort((function(a, b) {
						var nameA = a[column.dataName.valueOf()], nameB = b[column.dataName.valueOf()]; 
						return (nameA == nameB) ? 0 : ((nameA > nameB) ? sort_asc : -1 * sort_asc);
					}));
					//var start = (cpage-1) * rwpv;
					tbRender( tbID, cpage, rwpv, rows );
					
				}, false
			);
			var text = doc.createTextNode(column.name);
			headerCell.appendChild(text);
		}
	);
	rootElement.appendChild(table);	
	if (dataObject.onRender != undefined) dataObject.onRender();
	
	function tbPager (event, evId) {
		//console.log("Page: "+evId);
		var myId = event.target.id;
		var txId = myId.replace(evId, 'T'); // page view text.
		var tbId = myId.substr(2); // truncate 1st 2 chars to get table id.
		var rows = doc.getElementById(tbId).getAttribute("tblen");
		var rwpv = doc.getElementById(tbId).getAttribute("rowpv");
		var pages = doc.getElementById(tbId).getAttribute("pages");
		var cpage = doc.getElementById(tbId).getAttribute("cpage");
		if (evId == 'P') {
			if (cpage == 1) return;
			cpage--;
		}
		else { // evId == 'N'
			if (cpage == pages) return;
			cpage++;
		}
		doc.getElementById(tbId).setAttribute("cpage", cpage);
		doc.getElementById(txId).innerHTML = cpage+" of "+pages;
		
		if (cpage == 1) {
			doc.getElementById("P_" + tbID).setAttribute("class", "disabled");			
		} else {
			doc.getElementById("P_" + tbID).setAttribute("class", "link");
		}
		
		if (cpage == pages) {
			doc.getElementById("N_" + tbID).setAttribute("class", "disabled");			
		} else {
			doc.getElementById("N_" + tbID).setAttribute("class", "link");
		}
		
		tbRender(tbId, cpage, rwpv, rows);
	}
	
	function tbRender (tbID, cpage, rowpv, rows) {
		var tbid = doc.getElementById(tbID);
		var blank = 0;
		var c = 0;
		var rs = start = (cpage-1) * rowpv;
		if ((rows - start) < rowpv) { blank = rowpv - (rows - start); rowpv = rows-start; }
		for (var r = 0; r < rowpv; r++){
			c = 0;
			columns.forEach( 
				function(column, index) {
					if(column == selectedColumn) {
						tbody.rows[r].cells[c].setAttribute("class", "selectedColumn");
					} else {
						tbody.rows[r].cells[c].removeAttribute("class", "selectedColumn");
					}
					tbid.rows[r].cells[c++].innerHTML = data[rs][column.dataName];
				}
			);
			rs++;
		}
		rs = r;
		for ( ; blank > 0; blank--) {
			c = 0;
			columns.forEach( 
				function(column, index) {
					if(column == selectedColumn) {
						tbody.rows[rs].cells[c].setAttribute("class", "selectedColumn");
					} else {
						tbody.rows[rs].cells[c].removeAttribute("class", "selectedColumn");
					}
					tbid.rows[rs].cells[c++].innerHTML = "&nbsp;";
			})
			rs++;
		}
		if (dataObject.onRender != undefined) dataObject.onRender();
	}
	
	this.destroy = function () {
		rootElement.innerHTML = '';
	}
}