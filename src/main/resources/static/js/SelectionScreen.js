/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

console.log("loaded Selection Screen.js");
var dropZone;
var transactionFileInput;
$( document ).ready(function() {

console.log("Running Selection Screen.js");
    hideResults();
    $.ajax(
            {
              type:"GET",
              url: "specs",
              data: "",
              success: populateSpecCombo,
              error: function()
              {
                  console.log("Unable to find valid specs, using our best guess");
                  populateSpecCombo({"specs":["EBTS1.2","FBI 10.0","EBTS4.1"]});
              },
              dataType: "json"
            });
   // console.log("");
   // $("#postButton").click(postButton);
   //     console.log("Button prepped");


   //setupDragAndDrop();
   
});


function trimPathFromFileName(path)
{
    var slashIDX =path.lastIndexOf("/")+ 1;
    var backslashIDx = path.lastIndexOf("\\") + 1;
    var idx = Math.min(Math.max(slashIDX, backslashIDx), path.length-1);
    console.log("slashIDX " + slashIDX);
    console.log("backslashIDx " + backslashIDx);
    console.log("idx " + idx);
    var name = path.substr(idx);
    console.log("name " + name);
    return name;
}

/*
function setupDragAndDrop()
{
    console.log("Testing");
    var target = $(document.documentElement);    
    dropzone = $("#drop-zone");
    transactionFileInput = $("#transactionFile");


    setDragAndDropText(dropzone);
    transactionFileInput.change(function ()
    {
        setDragAndDropText(dropzone);
        
    });

   target[0].addEventListener('dragover', (e) => {
        e.preventDefault();
        target.css("cursor", "copy");
        var items = e.dataTransfer.items;
        if(isValidTransferList(items))
        {
            e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy. 
             dropzone.removeClass('dragError');
            dropzone.addClass('dragging');
            
        }
        else
        {
            dropzone.addClass('dragError');
            dropzone.removeClass('dragging');
            e.dataTransfer.dropEffect = 'none';    
        }               
    });

    target[0].addEventListener('dragleave', (e) => {
        e.preventDefault();
        target.css("cursor", "default");
        dropzone.removeClass('dragging');
         dropzone.removeClass('dragError');
        setDragAndDropText(dropzone);
    });

    target[0].addEventListener('drop', (e) => {
        e.preventDefault();

        dropzone.removeClass('dragging');
         dropzone.removeClass('dragError');
        dropzone.addClass('drop');
        target.css("cursor", "default");

        transactionFileInput[0].files = e.dataTransfer.files;
    });
}

function setDragAndDropText(dropzone)
{
    var input = transactionFileInput.val();
    if (input)
    {
        dropzone.html(trimPathFromFileName(input));
        dropzone.addClass('drop');
    } 
    else
    {
            dropzone.html("Drag & Drop EFT/XML File Here");
            dropzone.removeClass('drop');
    }    

    dropzone.removeClass('dragError');
}

function isValidTransferList(transferList)
{
    var validFile = false;
    if(transferList.length === 1)
    {
        transferItem = transferList[0];

        if(transferItem.kind === "file")
        {
            var tif = transferItem.getAsFile();
            if(tif)
            {
                
                var name = tif.name;
                if(name)
                {
                    //var type = transferItem.type;


                    var extIndex = Math.min(name.lastIndexOf(".") + 1, name.length -1);
                    var ext = extIndex>0?name.substr(extIndex):"";
                   console.log("Name: " + name + " ext: " + ext);
                    if(ext === "eft"  || ext === "xml")
                    {
                        validFile=true;
                        dropzone.html("Drop EFT/XML File Here");

                    }
                    else
                    {
                         dropzone.html("Only files with EFT or XML extensions are supported");
                    }
                }
                else                
                {
                    validFile=true;
                    dropzone.html("Drop File Here");
                }
            }
            else                
            {
                validFile=true;
                dropzone.html("Drop File Here");
            }                
        }
        else
        {
             dropzone.html("Only Drag Files not Text or Images please!");
        }
    }
    else
    {
         dropzone.html("Sorry, Only one file at a Time!");
    }

    return validFile;    
}
*/

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
   
   // $("#results").append("<br>");
   // $("#results").append("Requesting "  + JSON.stringify(request));
    $("#loading").show();
    $("#loading")[0].scrollIntoView();    
    
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
    
 /*   
function arrayToBase64String(a) {
    
  var bytes = new Uint8Array(a);
  var content = new SP.Base64EncodedByteArray();
    for (var b = 0; b < bytes.length; b++) {
    content.append(bytes[b]);
  }
return content;
    
    //return $.base64.encode(a);
    //return btoa(String.fromCharCode(...a));
}

function base64StringToArray(s) {
    let asciiString = atob(s);
    return new Uint8Array([...asciiString].map(char => char.charCodeAt(0)));
} 
   */ 
function postRequest(spec,data)
{
    var request = 
            { 
                spec: spec,
                data: arrayToBase64String(data)
            };        
    $.ajax({
      type:"POST",
      url: "BioCon",
      data: JSON.stringify(request),
      success: validateData,
      failure:failure,
      dataType: "json"
    });
   // $.post("BioCon",request, validateData,"json");
}

function failure(data, textStatus, jqXHR)
{
    $("#loading").hide();

    
    $("#errorStrongSting").html("Network Error:");
    $("errorString").html(textStatus + "<br>" + jqXHR); 
    $("#resultError").show();
    

}

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
        $("#resultError")[0].scrollIntoView();
       
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
                row.append('<td>' + data.violations[i].Type + '</td>');
                row.append('<td>' +  data.violations[i].Location + '</td>');
                row.append('<td>' +  data.violations[i].Message + '</td>');
                tbody.append(row);
                 $("#results").append( "" + data.violations[i].Location + ", " + data.violations[i].Type + ", " + data.violations[i].Message  + "<br>");    
            }
            $("#ResultsTable").show(); 
            $("#ResultsTable")[0].scrollIntoView();
       }
       else
       {
            $("#resultSuccess").show();
             $("#resultSuccess")[0].scrollIntoView();
  
       }
   }

}

function populateSpecCombo(data, textStatus, jqXHR)
{
    //TBD handle no data or errors
    for(i = 0; i < data.specs.length; i++)
    {
        $("#SpecSelection").append($("<option></option>")
         .attr("value",data.specs[i])
         .text(data.specs[i]));
    }
}



/** https://bootsnipp.com/snippets/featured/bootstrap-drag-and-drop-upload
 * + function($) {
    'use strict';

    // UPLOAD CLASS DEFINITION
    // ======================

    var dropZone = document.getElementById('drop-zone');
    var uploadForm = document.getElementById('js-upload-form');

    var startUpload = function(files) {
        console.log(files)
    }

    uploadForm.addEventListener('submit', function(e) {
        var uploadFiles = document.getElementById('js-upload-files').files;
        e.preventDefault()

        startUpload(uploadFiles)
    })

    dropZone.ondrop = function(e) {
        e.preventDefault();
        this.className = 'upload-drop-zone';

        startUpload(e.dataTransfer.files)
    }

    dropZone.ondragover = function() {
        this.className = 'upload-drop-zone drop';
        return false;
    }

    dropZone.ondragleave = function() {
        this.className = 'upload-drop-zone';
        return false;
    }

}(jQuery);
 */