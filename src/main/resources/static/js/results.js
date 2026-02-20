/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


$( document ).ready(function() {
      console.log("Ready!");
    hideResults();
    validateData(resultsData);
       console.log("Make button click");
    $("#pdfButton").click(makePDF);
    console.log("Make button click done");
});

function makePDF()
{
    console.log("Making PDF");
var specialElementHandlers = {
	'#pdfButton': function(element, renderer){
		return true;
	},
        '#resultSuccess': function(element, renderer){
            console.log(element);
		return true;
	},
        '#resultError': function(element, renderer){
            console.log(element);
		return true;
	}
};    

    //var doc = new jsPDF("landscape");


   // doc.fromHTML($(document.documentElement).get(0), 15, 15, {
	//'elementHandlers': specialElementHandlers
        
        
        //doc.save(resultsData.transationFileName + ".pdf");
    //$(".noPrint").hide();
    //$(".printOnly").hide();
    $("#printArea").wordExport(resultsData.transationFileName);
    //$(".printOnly").hide();
    //$(".noPrint").show();
    


//printJS('printArea', 'html');
//window.print();return false;
}





function hideResults()
{
    $("#ResultsTable").hide();
    $("#resultTitle").hide();
    $("#resultSuccess").hide();
    $("#resultError").hide();
}
function postButton()
{
    hideResults();

    
    var file = $("#fileSelection")[0].files[0];
    if(file)
    {
         var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function(e) {
            // browser completed reading file - display it
            alert(e.target.result);
            postRequest($("#SpecSelection").val(), e.target.result);
        };
        reader.onabort = function(e) {
              alert("Abort" + e.target.result);
        };
        reader.onerror = function(e) {
          alert(" Error" + e.target.result);
        };
    }
    else
    {
        console.log("No file selected");
    }
    
    };
    
   

function validateData(data, textStatus, jqXHR)
{
    $("#loading").hide();     
    $("#fileNameText").html(data.transationFileName);
    $("#specText").html(data.specFileName);

    $("#resultTitle").show();
    
    if(data.errors)
    {
        $("#ResultsTable").hide();
        $("#errorStrongSting").html("Unable To Parse:");
        $("#errorString").html(" " + data.errorMsg); 
        $("#resultError").show();
        //$("#resultError")[0].scrollIntoView();
       
    }
    else
    {            
       if(data.violations.length > 0)
       {
            $("#errorStrongSting").html(data.violations.length + " Violation" + ((data.violations.length>1)?"s":""));
            $("errorString").html(" detected, see table below for details"); 
            $("#resultError").show();
            $("#ResultsTable tbody").html(""); 
            for(var i = 0; i < data.violations.length; i++)
            {
                var tbody = $("#ResultsTable tbody");
                var row = $("<tr>");

                row.append('<th scope="row">' + (i + 1)+ '</th>');
                //row.append('<td>' + data.violations[i].Type + '</td>');
                row.append('<td>' +  data.violations[i].Location + '</td>');
                // row.append('<td class="noPrint">' +  data.violations[i].Message + '</td>');
                row.append('<td>' +  data.violations[i].Type + "<br>" + data.violations[i].Message + '</td>');
                 
                if(i%2 == 0)
                {
                    row.children().addClass("odd"); //needed for printing
                }
                
                tbody.append(row);
                 $("#results").append( "" + data.violations[i].Location + ", " + data.violations[i].Type + ", " + data.violations[i].Message  + "<br>");    
            }
            $("#ResultsTable").show(); 
            //$("#ResultsTable")[0].scrollIntoView();
       }
       else
       {
            $("#resultSuccess").show();
            // $("#resultSuccess")[0].scrollIntoView();
  
       }
   }

}
