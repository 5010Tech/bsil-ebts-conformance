/// @file ebts-10.0.js
/// Javascript verify functions for EBTS 10.0

/// @cond EXCLUDE_FROM_DOCS

/// @endcond

/// This function checks the current transaction's name entries for formatting to make sure they are abiding by the rules stated in the EBTS 9.1 standard.
/// returns: true on correct formatting. Appropriate error string on incorrect formatting.
function CheckNameFormat()
{
	name = getString();
	var result = CheckSingleNameFormat(name);
	return result;
	
	// string CheckSingleNameFormat(string name)
	// This function checks the given name's formatting to make sure it is abiding by the rules stated in the EBTS 9.0 standard.
	// param name - name that will be checked for formatting.
	// returns: true on correct formatting. Appropriate error string on incorrect formatting.
	function CheckSingleNameFormat(name)
	{
		// Regular expressions implementing the following rules:
		// The format shall be the surname followed by a comma (,), followed by the given name(s) separated by a space.
		// The following restrictions and exceptions to the general format apply:
		// 1. Minimum length is three bytes in the following sequence: alpha or ampersand, comma, alpha.
		// 2. A comma must be followed by the minimum of one alpha character.
		// 3. Blank before or after comma is invalid.
		// 4. Hyphen in first and last position of any name segment is invalid.
		// 5. Two consecutive blanks or hyphens between characters is invalid.
		var RE1 = /[^ ],[^ ]/;
		var RE2 = /(-,)|(,-)|(- )|( -)|(-$)|(^-)/;
		var RE3 = /(--)|(  )/;
		var RE4 = /([a-z][a-z-]*),([a-z-]+)/i;
		match = RE1.test(name);
		if(!match)
		{
			addViolation("A name cannot have a space before or after the comma.");
			return SCRIPT_WARNING;
		}
		match = !RE2.test(name);
		if(!match)
		{
			addViolation("Names cannot begin or end with a hypen.");
			return SCRIPT_WARNING;
		}
		match = !RE3.test(name);
		if(!match)
		{
			addViolation("A name cannot have two hyphens or two spaces in a row.");
			return SCRIPT_WARNING;
		}
		match = RE4.test(name);
		if(!match)
		{
			addViolation("Failed to match correct name format of the surname followed by a comma (,), followed by the given name(s) separated by a space.");
			return SCRIPT_WARNING;
		}
		return NO_VIOLATION;
	}
}

function isPlainImpression(imp)
{    
    switch(imp)
    {
    case 0:
    case 2:
    case 20:
    case 22:
    case 24:
    case 26:       
      return true; 
    default:
      return false;
    }
}

function isRolledImpression(imp)
{    
    switch(imp)
    {
    case 1:
    case 3:
    case 21:
    case 23:
    case 25:
    case 27:       
      return true; 
    default:
      return false;
    }
}

function isOtherAllowedImpression(imp)
{    
    switch(imp)
    {
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 10:       
    case 11:       
    case 12:       
    case 13:       
    case 14:       
    case 15:       
      return true; 
    default:
      return false;
    }
}

function CheckRPISNumberOfFingers()
{
    if (getString("T2_NDR", 1, 1) != "1")
        return NO_VIOLATION
        
    found = [];    
    [ 4, 14 ].forEach( function(recordType)
    {
        
        var records = getRecordCount(recordType);
        for (var recordIndex = 1; recordIndex <= records; recordIndex++)
        {
            var fgp = parseInt(getString("T" + recordType +"_FGP", recordIndex, 1), 10);
            var imp = parseInt(getString("T" + recordType +"_IMP", recordIndex, 1), 10);
			if(recordType==14)
			{ 
				switch(fgp)
				{
					case 11:
						found[1] = true;
						break;
					case 12:
						found[6] = true;
						break;
					case 13:
						found[2] = true;
						found[3] = true;
						found[4] = true;
						found[5] = true;
						break;
					case 14:
						found[7] = true;
						found[8] = true;
						found[9] = true;
						found[10] = true;
						break;
					case 15:
						found[1] = true;
						found[6] = true;
						break;
				}
			}
			
            if (fgp && (isPlainImpression(imp) || isRolledImpression(imp) || isOtherAllowedImpression(imp)))
                found[fgp]  = true;
        }
    })
    
    var ampEntries = getSubfieldCount("T2_AMP_FGP", 1);
    for(var i = 1; i <= ampEntries; i++)
    {
        var fgp = parseInt(getString("T2_AMP_FGP", 1, i), 10);
        found[fgp]  = true;
    }

    unaccountedFingers = []
    for (var fgp = 1; fgp <= 10; fgp++)
    {
        if (!found[fgp])
            unaccountedFingers.push(fgp);
    }
    if (unaccountedFingers.length > 0)
    {
        addViolation("The following plain finger impressions are not accounted for: " + unaccountedFingers.join(", "));
		return SCRIPT_WARNING;
    }
    return NO_VIOLATION
}

// string CheckNumberOfFingers()
/// This function checks the current transaction to make sure that every finger is accounted for with either an image or a T2_AMP or T14_AMP_FGP entry.
/// returns: true if all fingers present. Error string containing finger codes if they any are not present.
function CheckNumberOfFingers()
{
    //check if this TOT is one which requires all 10 fingers.
	var transactionType = getString("T1_TOT");
    
    if (transactionType === "RPIS")
        return CheckRPISNumberOfFingers();
	
	//var tenPrintSubmission = new ArrayList("CAR","CNA","CPDR","CPNU","DOCE","EMUF","FANC","FAUF","FNDR","NNDR","NFAP","NFUE","NFUF","MAP","DEK","DEU","MPR","AMN");
  var tenPrintSubmission = new ArrayList();
  
	//var cardScanningSubmission = new ArrayList("CARC","CNAC","DEKC","FNCC","FUFC","MAPC","NFFC","NFDP","CPNC");
  var cardScanningSubmission = new ArrayList();
  
	//var latentPrintSubmission = new ArrayList("LFS");
	var latentPrintSubmission = new ArrayList();

	var remoteTenPrintSearch = new ArrayList("TPIS","TPRS");
	var remoteLatentSubmission = new ArrayList("CFS","ELR");
	//var printImageSubmission = new ArrayList("FIS");
	var printImageSubmission = new ArrayList();
	//var idServiceResponse = new ArrayList("LSR");
	var idServiceResponse = new ArrayList();
	var infoServicesResponse = new ArrayList();
	var investigativeServicesResponse = new ArrayList("SRT");
    
    // Check for ULM is disabled becuase it is complex and will
    // have to be implemented later
    //var notificationServicesResponse = new ArrayList("ULM");
    var notificationServicesResponse = new ArrayList();
	


	
	if( tenPrintSubmission.contains(transactionType) == false && 
        cardScanningSubmission.contains(transactionType) == false && 
        latentPrintSubmission.contains(transactionType) == false && 
        remoteTenPrintSearch.contains(transactionType) == false && 
        printImageSubmission.contains(transactionType) == false && 
        idServiceResponse.contains(transactionType) == false && 
        infoServicesResponse.contains(transactionType) == false && 
        investigativeServicesResponse.contains(transactionType) == false && 
        notificationServicesResponse.contains(transactionType) == false && 
        remoteLatentSubmission.contains(transactionType) == false){
		return  NO_VIOLATION;
	}
	

	var count=0;
	var fingers = new Array(10);
	for(var i=0;i<10;i++)
	{
		fingers[i] = false;
	}

	var imageTypes = new Array();
	imageTypes = getImageTypes( imageTypes ); 
	
	if ( imageTypes[0] == undefined )
	{
		return NO_VIOLATION;
	}
    
	var imageTypes = new Array();
	imageTypes = getImageTypes( imageTypes ); 
	
	if ( imageTypes[0] == undefined )
	{
		return NO_VIOLATION;
	}

	fingers = AddAmputatedFingers(fingers);
	fingers = AddFingerImages(fingers);    
	if(fingers == "No fingerprint records found.")
	{
		return NO_VIOLATION;
	}
	var result = CheckIfAllFingersPresent(fingers);
	if(result == true)
	{
		return NO_VIOLATION;
	}

	else
	{
		var warningMessage = GenerateErrorMessage(fingers);
		addViolation(warningMessage);
		return SCRIPT_WARNING;
	}
	
	// bool[] AddAmputatedFingers(bool[] fingers)
	// param fingers - Array marking finger positions that have been accounted for.
	// This function checks the transaction for amputated fingers and if found, marks the found finger position to true.
	// returns: Array marking finger positions that are accounted for.
	function AddAmputatedFingers(fingers)
	{        
		var imageTypes = new Array(); 
		imageTypes = getImageTypes( imageTypes ); 
		
		for(var k=0; k<imageTypes.length; k++)
		{
			var recordType = imageTypes[k];
			if( recordType == -1 )
				return "No fingerprint records found.";
			if( recordType == 4 || recordType == 7 || recordType == 9 )
			{
				var entries = getSubfieldCount("T2_AMP_FGP", 1);   
					for(var i=1;i<=entries;i++)
					{
						var fingerNumber = getString("T2_AMP_FGP",1,i);
						count++;
						// If the finger code is not in the correct range, ignore it.
						if(fingerNumber < 1 || fingerNumber > 10){continue;}
						fingers[fingerNumber-1] = true;    
					}
			}
			else if( recordType == 14 )
			{
			    var offset = 13;
			    for(var k=3;k<10;k++)
				fingers[k] = true;
				
			    var entries = getSubfieldCount("T2_AMP_FGP",1);   
			    for(var i=0;i<entries;i++)
			    {
				var fingerNumber = getString("T2_AMP_FGP",1,i+1);
				fingers[fingerNumber - offset] = true;
			    }
			}       
		}
		return fingers;
	}

	// bool[] AddFingerImages(bool[] fingers)
	// param fingers - Array marking finger positions that have been accounted for.
	// This function checks the transaction for finger images and if found, marks the found finger position to true.
	// returns: Array marking finger positions that are accounted for.	
	function AddFingerImages(fingers)
	{        
		var imageTypes = new Array(); 
		imageTypes = getImageTypes( imageTypes ); 
		
		for(var k=0; k<imageTypes.length; k++)
		{
			var recordType = imageTypes[k];
			if(recordType == -1){return "No fingerprint records found.";}

			var entries = getRecordCount(recordType);
		    var mnemonic = getFingerCodeMnemonic(recordType);
		    if(mnemonic == "Error"){return "Record Type "+recordType+" is not a valid fingerprint record.";}
			
			if(recordType == 4 || recordType == 7 || recordType == 9)
			{
				for(var i=0;i<entries;i++)
				{
					var fingerNumber = getString(mnemonic,i+1);   

					// If the finger code is not in the correct range, ignore it.
					if(fingerNumber < 1 || fingerNumber > 10)
						continue;
								
					fingers[fingerNumber-1] = true;                      
				}
			}
			else if(recordType == 14)
			{		
				//Offset for the type 14 elements 
				//( we want to zero out to work in the fingers array ).
				var offset = 13;
				//We only need the first three elements of the fingers 
				//array to store type 14 data. 
				//So we set the remaining elements to true. 
				for(var k=3;k<10;k++)
					fingers[k] = true;
				
				for(var i=0;i<entries;i++)
				{
					var fingerCount = getSubfieldCount(mnemonic,i+1);
					for(var j=0;j<fingerCount;j++)
					{
						if ( i > 1 && j > 1)
							break;
						var fingerNumber = getString( mnemonic, i + 1, j + 1);

						if ( fingerNumber < 13 || fingerNumber > 15 )
							continue;

						fingers[fingerNumber - offset] = true;
					}
				}
			}
		}


		return fingers;
	}
	
	// bool CheckIfAllFingersPresent(bool[] fingers)
	// param fingers - Array marking finger positions that have been accounted for.
	// This function checks the given fingers array to see if all fingers are accounted for.
	// returns: Whether all fingers are accounted for.
	function CheckIfAllFingersPresent(fingers)
	{
		var result = true;
		for(var i=0;i<fingers.length;i++)
		{
			result = fingers[i] && result;
		}
		return result;
	}
	
		
	// string GenerateErrorMessage(bool[] fingers)
	// param fingers - Array marking finger positions that have been accounted for.
	// This function generates an error message that contains all of the fingers that are not accounted.
	// returns: Error message that contains all of the fingers that are not accounted.
	function GenerateErrorMessage(fingers)
	{
		var errorMessage = "The following fingers are not accounted for: ";
		for(var i=0;i<fingers.length;i++)
		{
			if(!fingers[i])
			{
				errorMessage+=(i+1)+", ";
			}
		}
		// Remove last comma and space.
		errorMessage = errorMessage.substr(0,errorMessage.length-2);
		errorMessage += ".";
		return errorMessage;
	}
	// string getFingerCodeMnemonic(int type)
	// This function returns the mnemonic to be used to access the finger codes for the given record type.
	// param type - Record type being used
	// returns: The mnemonic to access the finger codes or "Error" if an invalid record type is given.
	function getFingerCodeMnemonic(type)
	{
		if(type == 4){return "T4_FGP";}
		if(type == 7){return "T7_FGP";}
		if(type == 9){return "T9_FGN";}
		if(type == 13){return "T13_FGP";}
		if(type == 14){return "T14_FGP";}
		return "Error";
	}
}
	
/// @cond EXCLUDE_FROM_DOCS

// int getImageType()
// This function returns the record type which is being used by the current transaction to store finger images.
// returns: The record type being used or -1 if none are present.
// internal use
function getImageType()
{
	var entries = getRecordCount(4);
	if(entries > 0){return 4;}
	entries = getRecordCount(7);
	if(entries > 0){return 7;}
	entries = getRecordCount(9);
	if(entries > 0){return 9;}
		entries = getRecordCount(13);
	if(entries > 0){return 13;}
	entries = getRecordCount(14);
	if(entries > 0){return 14;}
	return -1;
}

// int[] getImageTypes( int[] imageTypes )
// This function will return an array with a number of elements corresponding
// to the number of image types that are found in the current transaction
// to store finger images. 
// Returns: An array with the image types being used or -1 if none are present.
// internal use
function getImageTypes( imageTypes )
{
	var i = 0; 
	var entries = getRecordCount(4);
	if(entries > 0)
	{	
		imageTypes[i] = 4;
		i++;
	}
	entries = getRecordCount(7);
	if(entries > 0)	
	{
		imageTypes[i] = 7;
		i++;
	}
	entries = getRecordCount(9);
	if(entries > 0)
	{
		imageTypes[i] = 9;
		i++;
	}
	entries = getRecordCount(13);
	if(entries > 0)
	{
		imageTypes[i] = 13;	
		i++;
	}
	entries = getRecordCount(14);
	if(entries > 0)
	{	
		imageTypes[i] = 14;	
		i++;
	}
	
	if( imageTypes.length < 1 )
		return -1;
	else
		return imageTypes;
}

/// @endcond

// string RemoteLatentSearchFingerRules()
/// This function checks the current transaction to make sure that the images have the correct finger position information.
/// returns: true if all rules are met or an error message if a rule has been violated.
function RemoteLatentSearchFingerRules()
{
    var transactionType = getString("T1_TOT");
    
    // Don't do check for Search Results Latent (SRL)
    if (transactionType == "SRL")
        return NO_VIOLATION;
        
	unknownCode = "00";
	notFound = -1;
	recordType = getImageType();
	// If thre are no images, the following rules do not apply.
	if(recordType == notFound)
	{
		return NO_VIOLATION;
	}
	var numberOfImages = getRecordCount(recordType);
	// If there are multiple image entries, they must all have an associated finger position.
	if(numberOfImages > 1)
	{
		return AllFingerPositionsPresent(numberOfImages);
	}
	
	return NO_VIOLATION;
	
}
	
	// AllFingersHavePosition()
	// This function checks that the number of finger positions stored matches the number of finger images.
	// param numberOfImages - Number of fingerprint images in the transaction.
	// returns: Whether all finger images have an associated finger position.
	function AllFingerPositionsPresent(numberOfImages)
	{
		var numberOfFingerPositions = getSubfieldCount("T2_FGP",1);
		if(numberOfImages == numberOfFingerPositions)
		{
			return NO_VIOLATION;
		}
		else
		{
			addViolation("The number of finger positions does not match the number of fingerprint images.");
			return SCRIPT_WARNING;
		}
	}

	// UnknownPositionRules()
	// This function checks that that the transaction follows the rules associated with having an image with an unknown position.
	// returns: true if the transaction follows the rules associated with having an image with an unknown position, otherwise an error message.
	function UnknownPositionRules()
	{
		var numberOfFingerPositions = getSubfieldCount("T2_FGP",1);
		if(numberOfFingerPositions == 1)
		{
			addViolation("Finger position must either be omitted or contain multiple guesses.");
			return SCRIPT_WARNING;
		}
		else
		{
			return NO_VIOLATION;
		}
	}


// CheckNCICClassication()
/// This function checks the T2_FPC field and ensures that each element of the 10 finger NCIC Classification follows the rules set for it. 
/// returns: true if all rules are met or an error message if it does not.
function CheckNCICClassication()
{
	var tenFingerNCIC = getString();
	var result = true;
	for(var i=0;i<tenFingerNCIC.length;i+=2)
	{
		code = tenFingerNCIC.charAt(i)+tenFingerNCIC.charAt(i+1);
		result = result && CheckSingleCode(code);
		if(result != true)
		{
			addViolation("Item code "+i+" is an invalid NCIC code.");
			return SCRIPT_WARNING;
		}
	}
	return NO_VIOLATION;
	
	// CheckSingleCode(code)
	// This function checks that the given code is either:
	// 1. A number, or
	// 2. A two letter NCIC FPC code.
	// returns: true if the code is correct or false if it is not.
	function CheckSingleCode(code)
	{
		notFound = -1;
		var isANumber = /^\d+$/;
		var acceptedValues = new ArrayList("PI","PM","PO","CI","CM","CO","DI","DM","DO","XI","XM","XO","XX","SR","AC","UC","AA","TT");
		if(isANumber.test(code))
		{
			return true;
		}
		else
		{
			if(!acceptedValues.contains(code))
			{
				return false;
			}
			return true;
		}
	}
}

// CheckHeight()
/// This function checks either a height or a height range for correct syntax and values.
/// returns: true if the height is correct or was corrected, otherwise an appropriate error message.
function CheckHeight()
{
	var height = getString();
	this.unknownHeight = "000";
	if(height.length == 3)
	{
		return CheckHeightRules(height);
	}
	else if(height.length == 6)
	{
		firstHeight = height.substr(0,3);
		secondHeight = height.substr(3,3);
		if(firstHeight == unknownHeight){return NO_VIOLATION;}
		if(secondHeight == unknownHeight){return NO_VIOLATION;}
		if(firstHeight >= secondHeight)
		{
			addViolation("The height range must be in the format of shorter to taller.");
			return SCRIPT_WARNING;
		}
		result = CheckHeightRules(firstHeight);
		if(result != NO_VIOLATION){return result;}
		else
		{
			newHeight = getString();
			firstHeight = newHeight.substr(0,3);
			secondHeight = newHeight.substr(3,3);
			result = CheckHeightRules(secondHeight,firstHeight)
			return result;
		}
	}
	else
	{
		// Other functions will catch the formatting errors.
		return NO_VIOLATION;
	}
	// CheckHeight(height, data)
	// This function checks either a height for correct syntax and value.
	// param height - height to check syntax and value of.
	// param preceedingHeight - (Optional) In the case of the second height in a height range, this parameter will contain the first height.
	// returns: true if the height is correct or was corrected, otherwise an appropriate error message.
	function CheckHeightRules(height, preceedingHeight)
	{
		this.minHeight = "400";
		this.maxHeight = "711";
		this.minInches = "48";
		this.maxInches = "95";
		this.unknownHeight = "000";
		this.inchesDesignator = "N";
		if(preceedingHeight == undefined){preceedingHeight="";}
		this.offsetData = preceedingHeight;
		this.isANumber = /^\d+$/;
		var recordIndex = getRecordIndex();
		var itemIndex = getItemNumber();
		var mnemonic = getMnemonic();
		if(isANumber.test(height))
		{
			 return CheckFeetAndInchesFormat(height);
		}
		else
		{
			return CheckInchesFormat(height);
		}
		// CheckFeetAndInchesFormat(height)
		// This function checks a height which is using the format of feet and inches.
		// param height - height to check syntax and value of.
		// returns: true if the height is correct, otherwise an appropriate error message.
		function CheckFeetAndInchesFormat(height)
		{
			if(height == unknownHeight)
			{
				return NO_VIOLATION;
			}
			var feet = height.charAt(0);
			var inches = height.charAt(1)+height.charAt(2);
			result = CheckFeet(feet);
			if(result != NO_VIOLATION)
			{
				return result;
			}
			else
			{
				return CheckInches(inches);
			}
			
			// CheckFeet(feet)
			// This function checks if the foot section of the height value is correct.
			// param feet - Feet value to check syntax and value of.
			// returns: "Corrected" if the foot value was corrected.
			function CheckFeet(feet)
			{
				if(feet < 4)
				{
					addViolation("The number of feet must be greater than 3.");
					return SCRIPT_WARNING;
				}
				else if(feet > 7)
				{
					addViolation("The number of feet must be less than 8.");
					return SCRIPT_WARNING;
				}
				return NO_VIOLATION;
			}
			
			// CheckInches(inches)
			// This function checks if the inches section of the height value is correct.
			// param inches - inches to check value of.
			// returns: true if the inches value is correct, otherwise an appropriate error message.
			function CheckInches(inches)
			{
				if(inches < 0 || inches > 11)
				{
					addViolation("Number of inches must be greater than 0 and less than 11 when using feet.");
					return SCRIPT_WARNING;
				}
				else{return NO_VIOLATION;}
			}
		}
		
		// CheckInchesFormat(height)
		// This function checks a height which is using the inches format.
		// param height - height to check syntax and value of.
		// returns: true if the height is correct or was corrected, otherwise an appropriate error message.
		function CheckInchesFormat(height)
		{
			if(height[0] == inchesDesignator)
			{
				var isANumber = /^\d+$/;
				var inches = height.charAt(1)+height.charAt(2);
				if(isANumber.test(inches))
				{
					if(inches < minInches)
					{
						addViolation("Inches must be at least 48 when using inches format.");
						return SCRIPT_WARNING;
					}
					else if (inches > maxInches)
					{
						addViolation("Inches must be no more than 95 when using inches format.");
						return SCRIPT_WARNING;
					}
					else{return NO_VIOLATION;}
				}
				else
				{
					addViolation("Invalid format. Valid height formats are either 3 numbers or 'N' followed by 2 numbers.");
					return SCRIPT_WARNING;
				}
			}
			else
			{
				addViolation("Invalid format. Valid height formats are either 3 numbers or 'N' followed by 2 numbers.");
				return SCRIPT_WARNING;
			}
		}
	}
}

// CheckMiscIDNumber()
/// This function checks the T2_MNU field for correct agency code and if relevant, that the ID number matches the specific syntax for it's agency code.
/// returns: true if the field meets all requirements, otherwise an appropriate error message.
function CheckMiscIDNumber()
{
	acceptedAgencyCodes=new ArrayList("AF","AN","AR","AS","BF","CI","CG","FN", "IO","MC","MD","MP","NA","NS","OA","PI","PP","PS","SS","VA");
	numericOnlyAgencyCodes=new ArrayList("AF","AS");
	numericOnlyAgencyCodeError="ID numbers with agency codes: ["+numericOnlyAgencyCodes+"] must be numeric only.";
	var isANumber = /^\d+$/;
	var miscIDNumber = getString();
	agencyCode = miscIDNumber.substr(0,2);
	IDnumber = miscIDNumber.substr(3);
	if(!acceptedAgencyCodes.contains(agencyCode))
	{
		addViolation('The agency code "'+agencyCode+'" is not an accepted agency code.');
		return SCRIPT_WARNING;
	}
	else
	{
		if(numericOnlyAgencyCodes.contains(agencyCode))
		{
			if(isANumber.test(IDnumber)){return NO_VIOLATION;}
			else
			{
				addViolation(numericOnlyAgencyCodeError);
				return SCRIPT_WARNING;
			}
		}
		else {return NO_VIOLATION;}
	}
}


// CheckRepositoryStatisticsResponse()
/// This function cheks the T2_RSR field for correct formatting.
/// returns: true if field has correct formatting, otherwise an appropriate error message.
function CheckRepositoryStatisticsResponse()
{
	var file = getString("T2_RSR");
	var lineNumber = 1;
	var newField = true;
	var fieldCount = 0;
	var tabCount = 0;
 	for(var i=0;i<file.length;i++)
	{
		switch(file[i])
		{
			case "\t":
				newField=true;
				tabCount++;
				break;
			case "\n":
				if(tabCount == 2 && fieldCount == 3)
				{
					tabCount = 0;
					fieldCount = 0;
					newField=true;
					lineNumber++;
				}
				else
				{
					addViolation("The file was misformed. Each line must contained 3 fields, tab separated.");
					return SCRIPT_WARNING;
				}
				break;
			default:
				// This makes sure we only count the first character of a field.
				if(newField)
				{
					fieldCount++;
					newField=false;
				}
		}
	}
	if((tabCount == 2 && fieldCount == 3) || (tabCount == 0 && fieldCount == 0))
	{return NO_VIOLATION;}
	else
	{
		addViolation("The file was misformed. Each line must contained 3 fields, tab separated.");
		return SCRIPT_WARNING;
	}
}

// CheckWeight()
/// This function checks a weight or weight range for correct values.
/// returns: true if the field has correct values, otherwise an appropriate error message.
function CheckWeight()
{
	this.unknownWeight = 000;
	this.minWeight = 50;
	this.maxWeight = 499;
	this.unknownPerson = false;
	this.missingPerson = false;
	var weight = getString();
	if(weight.length == 3)
	{
		return CheckWeightHigh(weight);
	}
	else if(weight.length == 6)
	{
		firstWeight = weight.substr(0,3);
		secondWeight = weight.substr(3,3);
		return CheckWeightRangeRules(firstWeight,secondWeight);
	}
	// CheckWeightRangeRules(firstWeight,secondWeight)
	// This function checks a weight range for correct values.
	// param firstWeight - First weight in the weight range.
	// param secondWeight - Second weight in the weight range.
	// returns: true if the field has correct values, otherwise an appropriate error message.
	function CheckWeightRangeRules(firstWeight,secondWeight)
	{
		if(firstWeight == unknownWeight){return NO_VIOLATION;}
		if(secondWeight == unknownWeight){return NO_VIOLATION;}
		if(firstWeight >= secondWeight)
		{
			addViolation("The weight range must be in the format of lighter to heavier.");
			return SCRIPT_WARNING;
		}
		return CheckWeightBounds(firstWeight,secondWeight);
	}
	// CheckWeightBounds(firstWeight,secondWeight)
	// This function checks a weight range to see if their values are beyond their required bounds.
	// param firstWeight - First weight in the weight range.
	// param secondWeight - Second weight in the weight range.
	// returns: true if the field has correct values, otherwise an appropriate error message.
	function CheckWeightBounds(firstWeight,secondWeight)
	{
		var result = CheckWeightLow(firstWeight);
		if(result != NO_VIOLATION){return result;}
		result = CheckWeightHigh(secondWeight);
		return result;
	}
	// CheckWeightLow(weight)
	// This function if the given weight is greater or equal to the minimum weight dictated by the particular transaction.
	// param weight - Weight to check
	// returns: true if the field is correct, otherwise an appropriate error message.
	function CheckWeightLow(weight)
	{
		if(unknownPerson || missingPerson){return NO_VIOLATION;}
		if(weight < minWeight)
		{
			addViolation("A weight range cannot have a weight lower than 50 lbs unless the person is missing or unknown.");
			return SCRIPT_WARNING;
		}
		else{return NO_VIOLATION;}
	}
	// CheckWeightHigh(weight)
	// This function if the given weight is less than or equal to the maximum weight dictated by the particular transaction.
	// param weight - Weight to check
	// returns: true if the field is correct, otherwise an appropriate error message.
	function CheckWeightHigh(weight)
	{
		if(weight > maxWeight)
		{
			addViolation("A weight cannot have an entry higher than 499 lbs.");
			return SCRIPT_WARNING;
		}
		else{return NO_VIOLATION;}
	}
}


//CheckT2PatternClassification()
/// This function checks that the T2_PAT field meets all of it's requirements.
/// returns: true if the field has correct values, otherwise an appropriate error message.
function CheckT2PatternClassification()
{
    // !!! NOTE RCD is not used in any transactions as of version 9.3
    return NO_VIOLATION

	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var dataPAT = new Array(10);
	var dataRCD1 = new Array(10);
	var dataRCD2 = new Array(10);
	var warningCode = NO_VIOLATION;
	
	for (i=0; i <10; i++)
	{
		dataPAT[i]=new Array(3);
		dataRCD1[i]=new Array(3);
		dataRCD2[i]=new Array(3);
	}
	
	//extract data for verification
	warningCode += AddPatternData(dataPAT, "T2_PAT_FGP" , "T2_PAT_CL1" , "T2_PAT_CL2", "T2_PAT_CL3");
	warningCode += AddPatternData(dataRCD1, "T2_RCD1_FGP" , "T2_RCD1_RCN1A" , "T2_RCD1_RCN1B", "T2_RCD1_RCN1C");
	warningCode += AddPatternData(dataRCD2, "T2_RCD2_FGP" , "T2_RCD2_RCN2A" , "T2_RCD2_RCN2B", "T2_RCD2_RCN2C");
	
	warningCode += CheckMatches(dataPAT, dataRCD1, dataRCD2);

	if (warningCode >= SCRIPT_WARNING)
	return SCRIPT_WARNING;
	else
	return NO_VIOLATION
	
	// string CheckMatches(number[][] dataPAT, number[][] dataRCD1, number[][] dataRCD2)
	// param fingerData - Array containing finger position and pattern data.
	// This function checks to ensure that all necessary fields are defined and within allowable ranges. 
	// returns: A error code if a error is generated durning this process. 
	function CheckMatches(dataPAT, dataRCD1 , dataRCD2)
	{
		var warningCode = NO_VIOLATION;
		for (i=0; i <10; i++)
		{
			for (j=0; j <3; j++)
			{
				//if (dataRCD1[i][j] == "")
				//addViolation(i+ "," + j + " :" + dataPAT[i][j] + " " + dataRCD1[i][j] + " " + dataRCD2[i][j]);
				
				warningCode += CheckPatternRanges(dataPAT[i][j],dataRCD1[i][j],dataRCD2[i][j], i+1, j+1);
			}
		}
		return warningCode;
		
		// string CheckPatternRanges(pattern, firstRidgeCount , secondRidgeCount, itemNumber)
		// param fingerData - Array containing finger position and pattern data.
		// This function checks to ensure that all necessary fields are defined and within allowable ranges. 
		// returns: A error code if a error is generated durning this process. 
		function CheckPatternRanges(pattern, firstRidgeCount , secondRidgeCount, fingerNumber, itemNumber)
		{
			WARN_FIRST_RIDGE_COUNT = "RCN1 item " + itemNumber + " for finger " + fingerNumber + " does not follow the ridge count rules for pattern " + pattern + ".";
			WARN_SECOND_RIDGE_COUNT = "RCN2 item " + itemNumber + " for finger " + fingerNumber + " does not follow the ridge count rules for pattern " + pattern + ".";
			WARN_RIDGE_COUNT_MUST_BE_EQUAL = "Both the first and second ridge counts must be equal for pattern " + pattern + ".";
			
			if((pattern != undefined && pattern != "") &&  (firstRidgeCount != undefined && firstRidgeCount != "") && (secondRidgeCount != undefined && secondRidgeCount != ""))
			{
			
				switch(pattern)
				{
					case "AU":
						if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "LS":
						if(!checkRidgeCount(firstRidgeCount,1,31))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "RS":
						if(!checkRidgeCount(firstRidgeCount,1,31))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "WU":
						if(!checkRidgeCount(firstRidgeCount,1,31))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,1,31))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "SR":
						if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "XX":
						if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
					case "UC":
						if(firstRidgeCount != secondRidgeCount)
						{
							addViolation(WARN_RIDGE_COUNT_MUST_BE_EQUAL);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,31,undefined)))
						{
							addViolation(WARN_FIRST_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,31,undefined)))
						{
							addViolation(WARN_SECOND_RIDGE_COUNT);
							return SCRIPT_WARNING;
						}
						return NO_VIOLATION;
				}
				
			}
			
			else if((pattern == undefined || pattern == "") &&  (firstRidgeCount == undefined || firstRidgeCount == "") && (secondRidgeCount == undefined || secondRidgeCount == ""))
			{return NO_VIOLATION;}
			else 
			{
				addViolation("Not all entries for finger number " + fingerNumber + ", item number " + itemNumber + " are complete.");
				return SCRIPT_WARNING;
			}
			return SCRIPT_WARNING;
			
		}
		
		// checkRidgeCount
		// This function checks that the given ridgeCount follows the rules required of it.
		// This function can be called in two ways:
		//
		// checkRidgeCount(ridgeCount, possibleValues)
		// This function takes the given ridgeCount and asserts that it's value is contained by the ArrayList possibleValues.
		// param ridgeCount - ridgeCount we are checking
		// param possibleValues - ArrayList containing possible values for the ridgeCount.
		// returns: Whether possibleValues contains ridgeCount.
		//
		// checkRidgeCount(ridgeCount, lowerBound, upperBound)
		// This function takes a ridgeCount and asserts that it's value is included in the range given by the two bounds (inclusive).
		// param ridgeCount - ridgeCount we are checking
		// param lowerBound - Lower bound allowed by the ridgeCount.
		// param upperBound - Upper bound allowed by the ridgeCount.
		// returns: Whether ridgeCount is within the given range.
		function checkRidgeCount(ridgeCount, possibleValues)
		{
			if(arguments.length == 3)
			{
				var lowerBound = arguments[1];
				var upperBound = arguments[2];
				return (ridgeCount >= lowerBound && ridgeCount <= upperBound);
			}		
			return possibleValues.contains(ridgeCount);
		}
	}

	// string AddPatternData(number[][] fingerData, string mnemonicFGP, string mnemonicRCNA, string mnemonicRCNB, string mnemonicRCNC)
	// param fingerData - Array containing finger position and pattern data.
	// This function adds three fields of data to a array based on their associated finger position.
	// returns: A error code if a error is generated durning this process. 
	function AddPatternData(fingerData, mnemonicFGP , mnemonicFieldA, mnemonicFieldB, mnemonicFieldC)
	{        
		var entries = getSubfieldCount(mnemonicFGP,1);   
		for(var i=1;i<=entries;i++)
		{
			var fingerNumber = getString(mnemonicFGP,1, i);

			if(fingerNumber < 1 || fingerNumber > 10){continue;}
			
			if (fingerData[fingerNumber-1][0] == undefined)
			{
				fingerData[fingerNumber-1][0] = getString(mnemonicFieldA,1,i);	
				fingerData[fingerNumber-1][1] = getString(mnemonicFieldB,1,i);
				fingerData[fingerNumber-1][2] = getString(mnemonicFieldC,1,i);
			}
			else 
			{
				addViolation("The finger " + fingerNumber + " appears more then once.");
				return SCRIPT_WARNING;
			}	
		}
	
		return NO_VIOLATION;
		
	}
}


//CheckDepthOfDetail()
/// This function checks that the depth of detail is correct when QDD equals C for LSMQ TOTs
/// returns: true if the field has correct values, otherwise an appropriate error message.
function CheckDepthOfDetail()
{

	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var countCIN = getSubfieldCount("T2_CIN",recordIndex);
	var countCIX = getSubfieldCount("T2_CIX",recordIndex);
	var countSCNA = getSubfieldCount("T2_SCNA",recordIndex);
	var valueQDD = getString(mnemonic, recordIndex);
	
	if(valueQDD != "C")
		return NO_VIOLATION;
	
	if((countCIN != 0 && countCIX != 0) || countSCNA != 0)
		return NO_VIOLATION;
	
	else 
	{
		addViolation("When QDD is 'Case' either the fields CIN and CIX, or SCNA must be included.");
		return SCRIPT_WARNING;
	}

}


// CheckPatternClassification()
/// This function checks that the T9_APC field meets all of it's requirements.
/// returns: true if the field has correct values, otherwise an appropriate error message.
function CheckPatternClassification()
{
	WARN_FIRST_RIDGE_COUNT = "The first ridge count (T9_APC_RCN1) does not follow the ridge count rules.";
	WARN_SECOND_RIDGE_COUNT = "The second ridge count (T9_APC_RCN2) does not follow the ridge count rules.";
	WARN_RIDGE_COUNT_MUST_BE_EQUAL = "Both the first and second ridge counts must be equal for this pattern.";
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	this.firstMnemonic = "T9_APC_APAT";	
	this.secondMnemonic = "T9_APC_RCN1";	
	this.thirdMnemonic = "T9_APC_RCN2";	
	var pattern = getString(firstMnemonic,recordIndex,itemIndex);
	var firstRidgeCount = getString(secondMnemonic,recordIndex,itemIndex);
	var secondRidgeCount = getString(thirdMnemonic,recordIndex,itemIndex);
	if(pattern == undefined || firstRidgeCount == undefined || secondRidgeCount == undefined){return NO_VIOLATION;}
	switch(pattern)
	{
		case "AU":
			if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
			case "LS":
			if(!checkRidgeCount(firstRidgeCount,1,31))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
		case "RS":
			if(!checkRidgeCount(firstRidgeCount,1,31))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
		case "WU":
			if(!checkRidgeCount(firstRidgeCount,1,31))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,1,31))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
		case "SR":
			if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
		case "XX":
			if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
		case "UC":
			if(firstRidgeCount != secondRidgeCount)
			{
				addViolation(WARN_RIDGE_COUNT_MUST_BE_EQUAL);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(firstRidgeCount,new ArrayList(0,31,undefined)))
			{
				addViolation(WARN_FIRST_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			if(!checkRidgeCount(secondRidgeCount,new ArrayList(0,31,undefined)))
			{
				addViolation(WARN_SECOND_RIDGE_COUNT);
				return SCRIPT_WARNING;
			}
			return NO_VIOLATION;
	}
	// checkRidgeCount
	// This function checks that the given ridgeCount follows the rules required of it.
	// This function can be called in two ways:
	//
	// checkRidgeCount(ridgeCount, possibleValues)
	// This function takes the given ridgeCount and asserts that it's value is contained by the ArrayList possibleValues.
	// param ridgeCount - ridgeCount we are checking
	// param possibleValues - ArrayList containing possible values for the ridgeCount.
	// returns: Whether possibleValues contains ridgeCount.
	//
	// checkRidgeCount(ridgeCount, lowerBound, upperBound)
	// This function takes a ridgeCount and asserts that it's value is included in the range given by the two bounds (inclusive).
	// param ridgeCount - ridgeCount we are checking
	// param lowerBound - Lower bound allowed by the ridgeCount.
	// param upperBound - Upper bound allowed by the ridgeCount.
	// returns: Whether ridgeCount is within the given range.
	function checkRidgeCount(ridgeCount, possibleValues)
	{
		if(arguments.length == 3)
		{
			var lowerBound = arguments[1];
			var upperBound = arguments[2];
			return (ridgeCount >= lowerBound && ridgeCount <= upperBound);
		}		
		return possibleValues.contains(ridgeCount);
	}
}

// function CheckMinutiaCount()
/// This function checks that the given minutia count (by T9_NMN) matches the number of index and ridge count entries (Given by T9_MAT_MRO+X).
/// returns: true if the field is correct, otherwise an appropriate error message.
function CheckMinutiaCount()
{
	var minutiaCount = getString();
	var minutiaEntries = getSubfieldCount("T9_MAT",getRecordIndex());
	// Having minutia entries is optional,
	if(minutiaEntries == undefined){return NO_VIOLATION;}
	// But if they are included, they must be the correct amount.
	if(minutiaCount == minutiaEntries){return NO_VIOLATION;}
	if(minutiaEntries < minutiaCount)
	{
		addViolation("Not enough 'T9_MAT' entries. Need the same number as the minutia count defined by 'T9_NMN'.");
		return SCRIPT_WARNING;
	}
	if(minutiaEntries > minutiaCount)
	{
		addViolation("Too many 'T9_MAT' entries. Need the same number as the minutia count defined by 'T9_NMN'.");
		return SCRIPT_WARNING;
	}
}

// CheckMinutiaIndexAndRidgeCount()
/// This function checks that the values in the T9_MAT_MRO+X field adhere to the ranges given to them.
/// returns: true if the field is correct, otherwise an appropriate error message.
function CheckMinutiaIndexAndRidgeCount()
{
	var indexRidgeNumber = getString();
	var indexNumber = indexRidgeNumber.substr(0,3);
	var ridgeCount = indexRidgeNumber.substr(3);
	
	if(indexRidgeNumber != 25515) 
	{
		if(indexNumber < 1 || indexNumber > 254)
		{
			addViolation("The minutia index (first three characters) must range from 1-254.");
			return SCRIPT_WARNING;
		}
		if(ridgeCount > 15)
		{
			addViolation("The minutia ridge count (last two characters) must range from 0-15.");
			return SCRIPT_WARNING;
		}
	}
	return NO_VIOLATION;
}

// CheckXYT()
/// This function checks that the values inside of the T9_MAT_XYT field follows the rules set for it.
/// returns: true if the field is correct, otherwise an appropriate error message.
function CheckXYT()
{
	this.thetaRangeError = "";
	this.minThetaValue = 0;
	this.maxThetaValue = 360;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var XYT = getString(mnemonic,recordIndex,itemIndex);
	if(XYT == undefined){return 2012;}
	var T = XYT.substr(8);
	if(T < minThetaValue || T > maxThetaValue)
	{
		addViolation("Theta (last three numbers) must range from 0-360.");
		return SCRIPT_WARNING;
	}
	
	var minutiaType = getString("T9_MAT_MNT",recordIndex,itemIndex);
	if(minutiaType == "D" && T != minThetaValue)
	{
		addViolation("When the minutia type is 'D', the theta value must be 0.");
		return SCRIPT_WARNING;
	}
	return NO_VIOLATION;
}

// CheckEJITipCode()
/// This function verifies the existance of the EJI_TIP code "19" in T2_FGP if the T2_PDD is present
/// it also checks to make sure that the count of EJI_TIP codes in T2_FGP matches the count of T2_PDD fields
function CheckEJITipCode()
{
   ejiTipCode = "19";
   notFound = 0;
   
   var numberEJI = 0;
   
   var numT4 = getRecordCount(4);
   var numT7 = getRecordCount(7);
   var numT9 = getRecordCount(9);
   var numT13 = getRecordCount(13);
   var numT14 = getRecordCount(14);
   var numT15 = getRecordCount(15);
   
   
   var nummberPPD = getSubfieldCount("T2_PPD",1);
  
   if(nummberPPD == notFound)
   {
	  return NO_VIOLATION;
   }
   
   var multiImage = false; 
   // Get IDC, for each image. If we find at least two unique IDC values then this is multi image
   var idc = 0;
   if(numT4 > 0)
   {
		for(var i = 0; i <= numT4; i++)
		{
			var tempIDC = getString("T4_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   if(numT7 > 0)
   {
		for(var i = 0; i <= numT7; i++)
		{
			var tempIDC = getString("T7_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   if(numT9 > 0)
   {
		for(var i = 0; i <= numT9; i++)
		{
			var tempIDC = getString("T9_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   if(numT13 > 0)
   {
		for(var i = 0; i <= numT13; i++)
		{
			var tempIDC = getString("T13_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   if(numT14 > 0)
   {
		for(var i = 0; i <= numT14; i++)
		{
			var tempIDC = getString("T14_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   if(numT15 > 0)
   {
		for(var i = 0; i <= numT15; i++)
		{
			var tempIDC = getString("T15_IDC",i);
			if(idc == 0)
			{
				idc = tempIDC
			}
			else 
			{
				if(tempIDC != idc )
				{
					multiImage = true;
					break;
				}
			}
		}
   }
   
   
   
   var entries = getSubfieldCount("T2_FGP",1);   
   
   for(var i=1;i<=entries;i++)
   {
		var fingerNumber = getString("T2_FGP",1,i);
		if(fingerNumber == ejiTipCode)
		{
		   numberEJI++;
		}
   }
   // Single image multi guess
   if(multiImage == false)
   {
      return NO_VIOLATION;
   }
   
   // Multi image 
   if(numberEJI != nummberPPD)
   {
	   addViolation("Field 2.2030 can only exists when the regular expression \"19\" matches the data in Field 'T2_FGP' 2.74");
	   return SCRIPT_WARNING;
   }
     
   return NO_VIOLATION;	 
}

//CheckEJITipCode()
/// This function verifies the existance of the EJI_TIP code "19" in T2_FGP if the T2_PDD is present
/// it also checks to make sure that the count of EJI_TIP codes in T2_FGP matches the count of T2_PDD fields
function CheckT13EJITipCode()
{
 ejiTipCode = "19";
 notFound = 0;
 
 var numberEJI = 0;
 
 var numT13 = getRecordCount(13);
 
 if (numT13 <= 0)
 {
	return NO_VIOLATION; 
 }
 
 for(var i = 0; i <= numT13; i++)
 {
	
	var entries = getSubfieldCount("T13_FGP",i);
	var EJIFound = false;
	   
	for(var j=1;j<=entries;j++)
	{
		var fingerNumber = getString("T13_FGP",i,j);
		var EJIFound = false;
		if(fingerNumber == ejiTipCode)
		{
		   numberEJI++;
		   EJIFound = true;
		}
	}

	var numSPD = getSubfieldCount("T13_SPD", i);
	var numPPC = getSubfieldCount("T13_PPC", i);
	
	// If T13_FGP contains a 19
	if (EJIFound)
	{
		// The T13 must also contain a T13_PPD
		if (numSPD <= 0)
		{
			addViolation("Field 13.014 must exist when the regular expression \"19\" exists in Field 'T13_FGP'");
			return SCRIPT_WARNING;
		}
	}
	else // T13_FGP contains no 19
	{
		// 13.014 is not permitted
		if (numSPD > 0)
		{
			addViolation("Field 13.014 can only exists when the regular expression \"19\" exists in Field 'T13_FGP'");
			return SCRIPT_WARNING;
		}
		
		// 13.015 is not permitted.
		if (numPPC > 0)
		{
			addViolation("Field 13.015 can only exists when the regular expression \"19\" exists in Field 'T13_FGP'");
			return SCRIPT_WARNING;
		}
	}
 }
 
 return NO_VIOLATION;
	 
}

// CheckRecords()
/// This function checks the records in the given transaction to ensure they are following the rules governing them.
/// returns: true if the field is correct, otherwise an appropriate error message.
function CheckRecords()
{
	var transactionType = getString("T1_TOT");
	return CheckForExclusiveRecords(transactionType);
	
	// CheckForExclusiveRecords(transactionType)
	// This function checks the current transaction for records that could be mutually exclusive.
	// returns: true if the field is correct,, otherwise an appropriate error message.
	function CheckForExclusiveRecords(transactionType)
	{
		//var tenPrintSubmission = new ArrayList("CAR","CNA","CPDR","CPNU","DOCE","EMUF","FANC","FAUF","FNDR","NNDR","NFAP","NFUE","NFUF","MAP","DEK","DEU","MPR","AMN");
    var tenPrintSubmission = new ArrayList();
    
		//var cardScanningSubmission = new ArrayList("CARC","CNAC","DEKC","FNCC","FUFC","MAPC","NFFC","NFDP","CPNC");
		var cardScanningSubmission = new ArrayList();
    
		//var latentPrintSubmission = new ArrayList("LFS");
		var latentPrintSubmission = new ArrayList();
		
		var rapidPrintSearch = new ArrayList("RPIS");
		
		//var remoteTenPrintSearch = new ArrayList("TPIS","TPRS");
		var remoteTenPrintSearch = new ArrayList();
		
		//var remoteLatentSubmission = new ArrayList("CFS","ELR","LFIS","LFFS");
		var remoteLatentSubmission = new ArrayList("CFS","ELR");
		
		//var printImageSubmission = new ArrayList("FIS");
		var printImageSubmission = new ArrayList();
		
		//var idServiceResponse = new ArrayList("LSR");
		var idServiceResponse = new ArrayList();
		
		var infoServicesResponse = new ArrayList("IRR");
		var investigativeServicesResponse = new ArrayList("SRT","SRL");
		var notificationServicesResponse = new ArrayList("ULM");
    
		if(tenPrintSubmission.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(tenPrintSubmission.contains(transactionType)){return CheckMutualExclusive(7,13);}

		if(cardScanningSubmission.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(cardScanningSubmission.contains(transactionType)){return CheckMutualExclusive(7,13);}
		
		if(latentPrintSubmission.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(latentPrintSubmission.contains(transactionType)){return CheckMutualExclusive(7,13);}
		
		if(rapidPrintSearch.contains(transactionType))
        {       
            var requiredText = "Must have either 2-10 type 4 records or 2-20 type 14 records.";
            var status = CheckMutualExclusive(4,14);
            if (status == NO_VIOLATION)
            {
                t4_count = getRecordCount(4);
                t14_count = getRecordCount(14);
                if ( t4_count == 0 && t14_count == 0)
                {
                    addViolation("No type 4 or type 14 records found. " + requiredText);
                    status = WARN_TOO_FEW_RECORDS ;
                }
                else
                {
                    if (t4_count < 2 && t14_count == 0)
                    {
						var t4_fgp = parseInt(getString("T4_FGP", 1, 1), 10);
						if ((t4_fgp != 15) && (t4_fgp != 14) && (t4_fgp != 13))
						{
							addViolation(WARN_TOO_FEW_RECORDS, "Found " 
							+ t4_count  + " type 4 records, but FGP was " + t4_fgp + ". " + requiredText, 4);
							status = WARN_TOO_FEW_RECORDS ;
						}
                    }
                    if (t4_count == 0 && t14_count < 2)
                    {
						var t14_fgp = parseInt(getString("T14_FGP", 1, 1), 10);
						if ((t14_fgp != 15) && (t14_fgp != 14) && (t14_fgp != 13))
						{
							addViolation(WARN_TOO_FEW_RECORDS, "Found " 
							+ t14_count  + " type 14 records, but FGP was " + t14_fgp + ". " + requiredText, 14);
							status = WARN_TOO_FEW_RECORDS ;
						}
                    }                                                        
                }
                
            }
            return status;
        }

		if(remoteTenPrintSearch.contains(transactionType)){return CheckMutualExclusive(4,14);}

		if(remoteLatentSubmission.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(remoteLatentSubmission.contains(transactionType)){return CheckMutualExclusive(7,13);}

		if(printImageSubmission.contains(transactionType)){return CheckMutualExclusive(4,14);}

		if(idServiceResponse.contains(transactionType)){return CheckMutualExclusive(4,14);}

		if(infoServicesResponse.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(infoServicesResponse.contains(transactionType)){return CheckMutualExclusive(7,13);}

		if(investigativeServicesResponse.contains(transactionType)){return CheckMutualExclusive(4,14);}

		if(notificationServicesResponse.contains(transactionType)){return CheckMutualExclusive(4,14);}
		if(notificationServicesResponse.contains(transactionType)){return CheckMutualExclusive(7,13);}
		
		return NO_VIOLATION;
	}
	
	// CheckMutualExclusive(<exclusiveRecord1>, <exclusiveRecord2>...)
	// This function checks that the current transaction does not contain records that should be mutually exclusive.
	// returns: true if the field is correct, otherwise an appropriate error message.
	function CheckMutualExclusive()
	{
		this.mutualExclusionError = "Error";
		var recordTypes = arguments;
		var numberOfMututallyExclusiveRecords = 0;
		for(var i=0;i<recordTypes.length;i++)
		{
			count = getRecordCount(recordTypes[i]);
			if(count > 0){numberOfMututallyExclusiveRecords++;}
		}
		if(numberOfMututallyExclusiveRecords > 1)
		{
			addViolation("The transaction contains mutually exclusive records.");
			return SCRIPT_WARNING;
		}
		else {return NO_VIOLATION;}
	}
}

/// This function checks that the value of the current field equals at least one of a list of field tag names.
/// param tagNameList - List of tag names to check.  Form: ['tag1', 'tag2', ..., 'tagn']
/// Ex.  js_verify="MustEqualOneOf(['tag1', 'tag2'])"
/// returns: true if the field value equals one of the list fields, otherwise an appropriate error message.
function MustEqualOneOf(tagNameList)
{
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var currentValue = getString(mnemonic,recordIndex,itemIndex);
	if ((currentValue == undefined) || (currentValue.length == 0)) {
		// For empty optional field, this should not get called.
		addViolation("Empty field does not match values in fields: " + tagNameList);
		return SCRIPT_WARNING;
	}
    var warnMsg = "This FieldOne or more of the following fields must exist: ";
	for(var tag=0; tag < tagNameList.length; tag++)
	{
	    mnemonic = tagNameList[tag];
		// warnMsg = warnMsg + mnemonic + ", ";
		var tagListValue = getString(mnemonic,recordIndex,itemIndex);
		if ((tagListValue != undefined) && (tagListValue == currentValue)) {
			return NO_VIOLATION;
		}
    }
	warnMsg = "This field value, " + currentValue + ", is not equal to any values in fields: " + tagNameList;
	addViolation(warnMsg);
	return SCRIPT_WARNING;
}

/// If field 1 equals value1, then the current field must equal value 2.
/// param field1 - field 1 to check
/// param value1 - value to check for field 1
/// param value2 - required value for this field, if field1 equals value1
/// Ex.  js_verify="IfMustEqual('tag1', 'value1', 'value2')"
/// returns: returns error with messsage if 1st field equals 1st value, 
/// but this field does not equal 2nd value.  Otherwise, returns true.
function IfMustEqual(field1, value1, value2)
{
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getSubfieldNumber();
	var storedValue1 = getString(field1,recordIndex,itemIndex);
	if ((storedValue1 != undefined) && (storedValue1.length != 0) && 
	    (storedValue1 == value1)) {
		var field2 = getMnemonic();
 	    var storedValue2 = getString(field2,recordIndex,itemIndex);
	    if ((storedValue2 == undefined) || (storedValue2.length == 0) ||
			(storedValue2 != value2)) {
			warnMsg = "Field " + field1 + " = '" + value1 + "', but this field does not equal '" + value2 + "' as required."
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
	}
	return true;
}

/// Check count of records for specified type is less than or equal to the 
/// value of the current field.
/// param recordType - record type to check count 
/// Ex.  js_verify="CheckRecordTypeCountLessEqual(4)"
/// returns: returns error with messsage if 1st field equals 1st value, 
/// but this field does not equal 2nd value.  Otherwise, returns true.
/// returns: true if condition field value isequals one of the list fields, otherwise an appropriate error message.
function CheckRecordTypeCountLessEqual(recordType)
{
    var warnMsg;
	var storedValue = getString();
	if ((storedValue != undefined) && (storedValue.length != 0)) {
 	    var recordCount = getRecordCount(recordType);
	    if ((recordCount == undefined) || (recordCount > storedValue)) {
			warnMsg = "Type " + recordType + " record count exceeds this field's value of '" + storedValue + "' ";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
	}
	return true;
}

/// Check if multiple occurrences of a numeric field are sequential.  
/// If startIndex is not specified, value of first occurrence is used as start index.
/// Allows missing sequence numbers in case field is optional.  
/// If the field is mandatory, the user will get a missing mandatory field.
/// Expects sequence numbers follow record index positions.  So even if the subfield for
/// the 2nd index omits the sequence number, the subfield for the third index will 
/// have the third sequence number.  
/// param [ oStartIndex ] - optional start index value in named argument format. 
///   To specify, { startIndex : 1 } 
/// Ex.  js_verify="CheckIsSequential()" 
/// Ex.  js_verify="CheckIsSequential( { startIndex : 1 } )"  // specifies start index.
/// returns: true if sequential, false otherwise with an appropriate error message.
function CheckIsSequential( oStartIndex )
{
    var warnMsg;
	var startIndex = ((typeof oStartIndex != 'undefined') && (typeof oStartIndex.startIndex != 'undefined'))? 
		oStartIndex.startIndex : -1;
	var mnemonic = getMnemonic();
	var recordIndex = getRecordIndex();
	var itemIndex;
	var occurrenceCount = getSubfieldCount(mnemonic, recordIndex);
	if ((occurrenceCount != undefined) && (occurrenceCount > 0)) {
		itemIndex = getItemNumber();
		if ((itemIndex == 0) || (itemIndex == 1)) {
			if (startIndex != -1) {
				var firstStoredValue = getString(mnemonic,recordIndex, 1);
				if ((firstStoredValue != undefined) && (firstStoredValue.length != 0)) {  
					var firstSequenceNumber = Number(firstStoredValue);
					if ((firstSequenceNumber != NaN) && (firstSequenceNumber != startIndex)) {
						warnMsg = "Sequence # " + firstSequenceNumber + " != " + startIndex + ", the specified first sequence #";
						addViolation(warnMsg);
						return SCRIPT_WARNING;
					}
				}
			}		
		} else {  // Not first itemIndex/occurrence
			var storedValue;
		    var sequenceNumber;
			var expectedSequenceNumber;
			var firstStoredValue;
			if (startIndex != -1) {
				expectedSequenceNumber = startIndex + itemIndex - 1;
			} else {  // No startIndex specified
				firstStoredValue = getString(mnemonic,recordIndex, 1);
				if ((firstStoredValue != undefined) && (firstStoredValue.length != 0)) {  
					var firstSequenceNumber = Number(firstStoredValue);
					if (firstSequenceNumber != NaN) {
						expectedSequenceNumber = firstSequenceNumber + itemIndex - 1;
					}
				}
			}
			/* 
			if ((storedValue == undefined) || (storedValue.length == 0)) {
				warnMsg = "Missing number breaks numeric sequence broken at index " +
					itemIndex + ".  Expected Value " + i + ". ";
				addViolation(warnMsg);
				return SCRIPT_WARNING;
			}
			*/
			storedValue = getString();

			if ((storedValue != undefined) && (storedValue.length != 0)) {  
				sequenceNumber = Number(storedValue);
				if ((sequenceNumber == NaN) || (sequenceNumber != expectedSequenceNumber)) {
					warnMsg = "Sequence # " + sequenceNumber + " != " + expectedSequenceNumber + 
						", the expected # at item index " +	itemIndex + ". ";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
			}
		}			
	}				
	return true;
}



/// Check if field begins with a valid State Code.  Ignores empty fields.
/// Ex.  js_verify="CheckBeginsWithStateCode()"
/// returns: returns error with messsage if first two characters of current
/// fields value are NOT a valid state code.  Otherwise, returns true.
function CheckBeginsWithStateCode()
{
	var stateCodes = "EE,AF,AC,AG,AL,AK,AA,AB,AN,AM,AD,AO,AE,AY,AI,AX,AT,AZ,AR,AP,AJ,AH,AS,AU,AV,AQ,BD,BE,BA,BJ,BK,BW,BL,BB,BF,BG,BH,DH,BM,BN,BV,NX,BP,BT,BQ,BZ,BC,BO,VB,BX,BU,UV,BR,BI,BY,IY,CK,CA,CJ,CM,CE,CD,CZ,ZI,CV,CG,CP,CW,CF,DA,CI,CH,CQ,CN,HR,DW,DB,CU,DD,CL,CB,CO,DP,DG,CX,CT,DI,DJ,CR,KC,CC,NX,CS,EZ,CK,DE,DK,DL,DC,DF,DN,DM,DR,DU,DO,EM,EU,EY,EL,GL,EN,EK,ET,ES,EO,ER,FA,FO,FS,FJ,FD,FL,FC,FN,FG,FP,FR,GB,GK,GZ,GD,GA,GE,GG,RG,GO,GC,GN,GJ,GP,GM,GU,GT,GF,GR,GI,PG,GY,HT,HI,HE,HC,HL,NE,HD,HK,HO,HU,IC,ID,IL,II,IN,IO,IW,IA,IR,IQ,IE,IB,IS,IT,JL,JM,JN,JA,JR,JE,JI,JO,JU,KS,KT,KY,KE,KK,KI,KW,KB,KR,KU,KZ,LP,LS,LT,LN,LL,LE,LB,LY,LI,LH,LA,LX,OC,ZD,IM,ME,MF,MZ,MV,ML,MY,KH,MB,MK,MH,ZB,MD,MA,MS,MT,MU,UM,YO,IX,MX,MM,DS,MI,MC,MW,LC,MN,MO,LD,MJ,MG,RR,ZO,DT,SJ,NR,VL,NA,NB,NP,NE,NX,NV,TS,NK,NQ,NH,NJ,NM,NY,NZ,NF,NU,NN,NG,IU,OF,NC,ND,KN,VN,NI,NT,NW,NS,NL,OA,OS,OH,OI,OK,OM,OT,ON,OR,OG,OO,PK,PD,PL,PM,NO,PF,PV,PW,PA,ST,RC,PU,PI,PC,PO,PN,PT,TI,PE,PB,PR,QA,PQ,QU,QR,RL,RB,RY,RE,RI,RU,RA,SX,RF,RW,FX,HS,AW,LU,PS,VV,SL,SH,TP,SN,SB,SS,SK,DV,SG,SE,KP,SA,II,SK,SI,SR,LF,LO,RV,BS,SM,SO,SF,SC,SD,GS,KO,VS,SX,SP,TE,CY,SU,ZC,SV,SW,SQ,SZ,SY,TB,TW,TJ,TA,TZ,TN,TX,TH,TL,TO,TK,TG,TQ,TT,TM,TD,TF,TU,TY,UR,TR,UC,TV,UG,UK,TC,UA,US,XX,UY,YY,SX,UT,UZ,HN,VY,VZ,VC,VT,VM,VI,VA,WK,WL,WF,WA,WB,WG,WN,WV,RS,WS,WE,WT,WI,WD,WY,YE,YU,YG,YT,ZA,ZR,ZM,RH";
    var warnMsg;
	var storedValue = getString();
	if ((storedValue != undefined) && (storedValue.length >= 2)) {
	    var sc = storedValue.substr(0,2);
	var index = stateCodes.indexOf(sc);
		if (index == -1) {
			warnMsg = "Field begins with '" + sc + "' which is NOT a valid State Code.";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
	}
	return true;
}

/// Check if class field is valid.  Ignores empty fields.
/// Ex.  js_verify="CheckSmdClass()"
/// returns: returns error with messsage if T10_SMD_CLASS class is NOT compatible with
/// source.  Otherwise, returns true.
function CheckSmdClass()
{
	// Valid class values for each source
	var tattoo = "HUMAN,ANIMAL,PLANT,FLAG,OBJECT,ABSTRACT,SYMBOL,OTHER";
	var other = "OTHER";
	
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getSubfieldNumber();
	this.firstMnemonic = "T10_SMD_SRC";	
	this.secondMnemonic = "T10_SMD_CLASS";
	var smdSrc = getString(firstMnemonic,recordIndex,itemIndex);
	var smdClass = getString(secondMnemonic,recordIndex,itemIndex);
	
	if ((smdSrc != undefined) && (smdSrc.length >= 0)) {
		switch(smdSrc)
		{
			case "TATTOO":
				var index = tattoo.indexOf(smdClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdClass + "' is NOT valid for the given source with a value of '" + smdSrc + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			default:
				var index = other.indexOf(smdClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdClass + "' is NOT valid for the given source with a value of '" + smdSrc + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
		}
	}
	return NO_VIOLATION;
}

/// Check if sub-class field is valid.  Ignores empty fields.
/// Ex.  js_verify="CheckSmdSubClass()"
/// returns: returns error with messsage if T10_SMD_SUBCLASS class is NOT compatible with
/// source.  Otherwise, returns true.
function CheckSmdSubClass()
{
	// Valid subclass values for each class
	var human="MFACE,FFACE,ABFACE,MBODY,FBODY,ABBODY,ROLES,SPORT,MBPART,FBPART,ABPART,SKULL,MHUMAN";
	var animal="CAT,DOG,DOMESTIC,VICIOUS,HORSE,WILD,SNAKE,DRAGON,BIRD,INSECT,ABSTRACT,PARTS,MANIMAL";
	var plant="NARCOTICS,REDFL,BLUEFL,YELF,DRAW,ROSE,TULIP,LILY,MPLANT";
	var flag="USA,STATE,NAZI,CONFED,BRIT,MFLAG";
	var object="FIRE,WEAP,PLANE,VESSEL,TRAIN,VEHICLE,MYTH,SPORT,NATURE,MOBJECTS";
	var abstrct="FIGURE,SLEEVE,BRACE,ANKLET,NECKLC,SHIRT,BODBND,HEDBND,MABSTRACT";
	var symbol="NATION,POLITIC,MILITARY,FRATERNAL,PROFESS,GANG,MSYMBOLS";
	var other="WORDING,FREEFRM,MISC";

	var recordIndex = getRecordIndex();
	var itemIndex = getSubfieldNumber();
	this.firstMnemonic = "T10_SMD_CLASS";	
	this.secondMnemonic = "T10_SMD_SUBCLASS";
	var smdClass = getString(firstMnemonic,recordIndex,itemIndex);
	var smdSubClass = getString(secondMnemonic,recordIndex,itemIndex);

	if ((smdClass != undefined) && (smdClass.length >= 0)) {
		switch(smdClass)
		{
			case "HUMAN":
				var index = human.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "ANIMAL":
				var index = animal.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "PLANT":
				var index = plant.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "FLAG":
				var index = flag.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "OBJECT":
				var index = object.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "ABSTRACT":
				var index = abstrct.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "SYMBOL":
				var index = symbol.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			case "OTHER":
				var index = other.indexOf(smdSubClass);
				if (index == -1)
				{
					warnMsg = "Field with a value of '" + smdSubClass + "' is NOT valid for the given class with a value of '" + smdClass + "'.";
					addViolation(warnMsg);
					return SCRIPT_WARNING;
				}
				break;
			default:
				warnMsg = "Field with a value of '" + smdSubClass + "' was NOT recognized as a valid subclass.";
				addViolation(warnMsg);
				return SCRIPT_WARNING;
		}
	}
	return NO_VIOLATION;
}

// pr 25652 The 10.013  (SAP) is only valid when the Type 10 image type is "FACE" (the 10.003 IMT field). 
//pr 25652 The 10.040  (SMT) is only valid when the Type 10 image type is "SCARE/MARK/TATOO" (the 10.003 IMT field). 
function checkImtClass()
{		
	var recordIndex = getRecordIndex();
    var imt=getString("T10_IMT",recordIndex,1);  
	var sap=getString("T10_SAP",recordIndex,1); 
	var smt=getString("T10_SMT",recordIndex,1);  
	var smd=getString("T10_SMD",recordIndex,1);  	
	// FOR FACE , SAP
	var hasWarning=false;
	if(imt=="FACE")
	{
		if(sap==undefined){
			addViolation("Missing 10.013 (SAP) for IMAGE TYPE "+imt);
			hasWarning=true;
		}
	}
	else
	{	
		if(sap!=undefined){
			addViolation("10.013 (SAP) [value="+sap+"] only applies to IMAGE TYPE FACE");
			hasWarning=true;
		}
	}
	if(imt=="SCAR" || imt=="MARK" || imt=="TATTOO" )
	{
		if(smt==undefined){
			addViolation("Missing 10.040 (SMT) for IMAGE TYPE "+imt);
			hasWarning=true;
		}
		if(smd==undefined){
			addViolation("Missing 10.042 (SMD) for IMAGE TYPE "+imt);
			hasWarning=true;
		}

	}
	else
	{	
		if(smt!=undefined){
			addViolation("10.040 (SMT) [value="+smt+"] only applies to IMAGE TYPE SCARE/MARK/TATOO");
			hasWarning=true;
		}
		if(smd!=undefined){
			addViolation("10.042 (SMD) [value="+smd+"] only applies to IMAGE TYPE SCARE/MARK/TATOO");
			hasWarning=true;
		}
	}
	if(hasWarning)
	{
		return SCRIPT_WARNING;
	}
	//addViolation("imt="+imt+" smt="+smt+" smd="+smd+" sap="+sap);
	return NO_VIOLATION;
}

function MinutiaCountAndCompare(operator, value)
{
	var recordIndex = getRecordIndex();
	var storedValue = getSubfieldCount("T9_MIN_MXC",recordIndex);
	
	compareWarning = "Must be "+operator+" "+value;

	switch(operator)
	{
		case ">=":
			if(storedValue >= value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		case ">":
			if(storedValue > value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		case "<=":
			if(storedValue <= value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		case "<":
			if(storedValue < value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		case "=":
			if(storedValue == value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		case "==":
			if(storedValue == value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return SCRIPT_WARNING;
			}
			break;
		default:
			return NO_VIOLATION;
	}
}
