/// @file nistparse.js
/// Common Javascript verify functions for NISTParse.

// class ArrayList()
// This class expands the functionality of a standard array by implementing methods such as removing a specific item, finding the location
// of a specific item, or determining if an item is contained in the ArrayList.
ArrayList.prototype = new Array;
function ArrayList()
{
	// Adds all initial arguments to the ArrayList.
	for(var i=0;i<arguments.length;i++)
	{
		this.push(arguments[i]);
	}
	this.add = this.push;
	// remove(value)
	// This function finds and removes the given value from the ArrayList, if it exists.
	this.remove = function(value)
	{
		var index = this.indexOf(value);
		if(index!=-1)
		{
			this.splice(index,1);
		}
		return index;
	}
	// indexOf(value)
	// This function finds the given value and returns it's index if it exists, otherwise returns -1.
	// returns: Index of the value given if it exists, otherwise returns -1.
	this.indexOf = function(value)
	{
		for(var i=0;i<this.length;i++)
		{
			if(this[i]==value){return i;}
		}
		return -1;
	}
	// contains(value)
	// This function returns whether or not the given value exists in the ArrayList.
	// returns: Whether or not the given value exists in the ArrayList.
	this.contains = function(value)
	{
		return (this.indexOf(value)!=-1);
	}
}

/// @endcond

// string CheckDate()
/// This function checks that the date being verified is not greater than the current date plus one day to allow for timezones that are ahead
/// returns: true if date is not greater than the current date or an error message if it is greater than the current date.
function CheckDate()
{
	var storedDate = getString();
	if ((storedDate == undefined) || (storedDate.length < 8))
		return NO_VIOLATION;  // Empty or not a date, so skip check

	var tomorrowsDate = new Date();
	tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);

	if( storedDate.length == 8 )
	{
		storedDate = parseDate(storedDate);
		// var storedDate = parseDate(getString(mnemonic,itemIndex,recordIndex));

		if(tomorrowsDate.getTime() >= storedDate.getTime())
		{
			return NO_VIOLATION;
		}
		else
		{
			addViolation("Date occurs after current date plus one day.");
			return INVALID_DATE;
		}
	}
	else if( storedDate.length == 16 )
	{
		//Parse out the two dates of the range. 
		var firstDate = storedDate.substring(0,8);
		var lastDate = storedDate.substring(8,16);
		
		firstDate = parseDate(firstDate);
		lastDate = parseDate(lastDate); 
		
		if( tomorrowsDate.getTime() >= firstDate.getTime() && tomorrowsDate.getTime() >= lastDate.getTime() && lastDate.getTime() >= firstDate.getTime() )
		{
			return NO_VIOLATION;
		}
		else
		{
			addViolation("Date range occurs after current date or start of range occurs after end of range.");
			return INVALID_DATE;
		}
	}
	else
	{
		addViolation("Date range is malformed. Must be either 8 or 16 characters.");
		return INVALID_DATE;
	}
	// Date parseDate(string stringDate)
	// This function parses an input string in the format YYYYMMDD into a date structure. If the date is not of the correct length, returns verifiable date.
	// param stringDate - String containing a date in the format YYYYMMDD.
	// returns: Date object using the information in stringDate.
	function parseDate(stringDate)
	{
		// If not correctly formatted, return verifiable date, as other functions will check the formatting.
		if(stringDate.length < 8){return new Date(0,0,0);}
		year = stringDate[0]+stringDate[1]+stringDate[2]+stringDate[3];
		month = stringDate[4]+stringDate[5];
		day = stringDate[6]+stringDate[7];
		
		// Align with Javascript months -> 0 - 11
		month--;
		
		return new Date(year,month,day);
	}
}

// string CheckFirstCharacter()
/// This function checks the current field for specific formatting issues.
function CheckFirstCharacter()
{
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	field = getString(mnemonic,itemIndex,recordIndex);
	var result = CheckSingleFieldFormat(field);
	return result;
	
	// string CheckSingleFieldFormat(string field)
	// This function checks the given field's formatting to make sure it is abiding by the rules stated in the EBTS 8.1 standard.
	// param field - Field that will be checked for formatting.
	// returns: true on correct formatting. Appropriate error string on incorrect formatting.
	function CheckSingleFieldFormat(field)
	{

		var RE1 = /^[ ]/;
		match = RE1.test(field);
		if(match)
		{
			addViolation("This field can not contain a space as the first character.");
			return INVALID_CHARACTER;
		}
		return NO_VIOLATION;
	}
}

// Date Compare(operator, value)
/// This function compares the value of the current field/item with the given value using the given operator and returns the result.
/// param operator - String representation of the operator to use to compare.
/// param value - Value to compare with.
/// returns: Result of the comparison.
function Compare(operator, value)
{
	compareWarning = "Must be "+operator+" "+value;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var storedValue = getString(mnemonic,itemIndex,recordIndex);
	switch(operator)
	{
		case ">=":
			if(storedValue >= value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return VALUE_NOT_GREATER_OR_EQUAL;
			}
			break;
		case ">":
			if(storedValue > value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return VALUE_NOT_GREATER;
			}
			break;
		case "<=":
			if(storedValue <= value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return VALUE_NOT_LESS_OR_EQUAL;
			}
			break;
		case "<":
			if(storedValue < value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return VALUE_NOT_LESS;
			}
			break;
		case "=":
			if(storedValue == value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return INVALID_VALUE;
			}
			break;
		case "==":
			if(storedValue == value){return NO_VIOLATION;}
			else
			{
				addViolation(compareWarning);
				return INVALID_VALUE;
			}
			break;
		default:
			return NO_VIOLATION;
	}
}

// WithinBounds(lowerbound, upperBound)
/// This function checks that the value of the current field/item is within the given range (inclusive).
/// returns: true if the field is within the range, otherwise an appropriate error message.
function WithinBounds(lowerbound, upperBound)
{
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var storedValue = getString(mnemonic,itemIndex,recordIndex);
	if(storedValue >= lowerbound && storedValue <= upperBound){return NO_VIOLATION;}
	else 
	{
		addViolation("Must be greater than or equal to "+lowerbound+" and less than or equal to "+upperBound+".");
		return INVALID_VALUE;
	}
}

// OnlyAllowHere(character, <location1>, <location2>...)
/// This function checks that the value of the current field/item only contains the given character at the given locations.
/// NOTE: Index starts at 1.
/// param character - Character that is being restricted in use.
/// param locationX - Location that the character is allowed to appear in.
/// returns: true if the field uses the character correctly, otherwise an appropriate error message.
function OnlyAllowHere(character)
{
	var locations = new ArrayList();
	for(var i=1;i<arguments.length;i++)
	{locations.add(arguments[i]);}
	this.characterNotAllowedError = "The special character '"+character+"' is only allowed at the following character locations: "+locations+".";
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var storedValue = getString(mnemonic,itemIndex,recordIndex);
	for(var i=0;i<storedValue.length;i++)
	{
		if(locations.contains(i+1)){continue;}
		if(storedValue.charAt(i) == character)
		{
			addViolation(characterNotAllowedError);
			return INVALID_VALUE;
		}
	}
	return NO_VIOLATION;
}

/// This function checks that at least one of a list of field tag names must exist.  Essentially an OR check.
/// param tagNameList - List of tag names to check.  Form: ['tag1', 'tag2', ..., 'tagn']
/// Ex.  js_verify="OneMustExist(['tag1', 'tag2'])"
/// returns: true if at least one of the fields exists, otherwise an appropriate error message.
function OneMustExist(tagNameList)
{
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	for(var tag=0; tag < tagNameList.length; tag++)
	{
	    var mnemonic = tagNameList[tag];
		// warnMsg = warnMsg + mnemonic + ", ";
		var storedValue = getString(mnemonic,itemIndex,recordIndex);
		if ((storedValue != undefined) && (storedValue.length > 0)) {
			return NO_VIOLATION;
		}
    }
	warnMsg = "One or more of the following fields must exist: " + tagNameList;
	addViolation(warnMsg);
	return SCRIPT_WARNING;
}

/// Check Social Security Number against 7 rules for valid numbers.  Ignores empty fields.
/// Ex.  js_verify="CheckSSN()"
/// returns: returns error with appropriate messsage for violation of any rule.
/// Otherwise, returns true.
function CheckSSN()
{
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var re;
	var str;
	
	var ssn = getString(mnemonic,itemIndex,recordIndex);
	if ((ssn != undefined) && (ssn.length > 0)) {
		/*
		** Rules
		*/
		// 2. Length shall be 9.
		if (ssn.length != 9) {
			warnMsg = "SSN length " + ssn.length + " != 9 as required";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 1. Shall not be all zeros.
		re = /0{9}/;
		if (re.test(ssn)) {
			warnMsg = "SSN shall not be all zeros";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 3. Shall be greater than 001010001.
		if (ssn <= "001010001") {
			warnMsg = "SSN, " + ssn + ", is NOT greater than 001010001";  
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 4. Position 1 shall not be 9.
		str = ssn.substr(0,1);
		if (str == "9") {
			warnMsg = "SSN 1st digit shall not be 9, it is " + str + ". ";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 5. Position 4 - 5 shall not = 00.
		if (ssn.substr(3,2) == "00") {
			warnMsg = "SSN 4th & 5th digits, middle, shall not be '00' as in ###-00-####";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 6. If SOC = 123456789, SOC is invalid.
		if (ssn == "123456789") {
			warnMsg = "SSN shall not be '123 45 6789'";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
		// 7. If SOC = 111111111, SOC is invalid.
		re = /1{9}/;
		if (re.test(ssn)) {
			warnMsg = "SSN shall not be all ones";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
		}
	}
	return true;
}

/// Check FBI Number against valid formats.  Ignores empty fields.
/// Ex.  js_verify="CheckFBInumber()"
/// returns: returns error with appropriate messsage for violation of any rule.
/// Otherwise, returns true.
function CheckFBInumber()
{
    var warnMsg;
	var recordIndex = getRecordIndex();
	var itemIndex = getItemNumber();
	var mnemonic = getMnemonic();
	var re;
	var str;
	
	var fbiNum = getString(mnemonic,itemIndex,recordIndex);
	if ((fbiNum != undefined) && (fbiNum.length > 0)) {
		switch (fbiNum.length) {
		case 7:
			// 3a. XXXXXXX - all numeric (7)
			re = /^[0-69][0-9]{6}$/;
			if (re.test(fbiNum)) {
				return true;
			}

			// 3b. XXXXXXA - all numeric except last character suffix (7)
			re = /^[0-9]{6}[A-H]$/;
			if (re.test(fbiNum)) {
				return true;
			}
			re = /[A-Z]/;
			if (re.test(fbiNum)) {
				re = /[I-Z]/;
				if (re.test(fbiNum)) {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXA (X = 0-9; A = A-H), A is I-Z.";
				} else {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXA (X = 0-9; A = A-H).";
				}
			} else {
				re = /^[7-9]/;
				if (re.test(fbiNum)) {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form NXXXXXX (N = 0-6,9; X = 0-9; A = A-Z), N is 7, 8, or 9.";
				} else {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form NXXXXXX (N = 0-6,9; X = 0-9; A = A-Z).";
				}
			}
			addViolation(warnMsg);
			return SCRIPT_WARNING;
			break;
		case 8:
			// 3c. XXXXXXAX - 1 suffix letter + 1 check digits (8)
			re = /^[0-9]{6}[J-NPR-TV-Z][0-9]{1}$/;
			if (re.test(fbiNum)) {
				// call check digit calculation here
				return true;
			}
			warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXAX (X = 0-9; A = J-N,P,R-T,V-Z).";
			addViolation(warnMsg);
			return SCRIPT_WARNING;
			break;
		case 9:
			// 3c. XXXXXXAXX - 1 suffix letter + 2 check digits (9)
			re = /^[0-9]{6}[J-NPR-TV-Z][0-9]{2}$/;
			if (re.test(fbiNum)) {
				// call check digit calculation here
				return true;
			}
			// 3d. XXXXXXAAX - 2 suffix letter + 1 check digits (9)
			re = /^[0-9]{6}[A-Z]{2}[0-9]$/;
			if (re.test(fbiNum)) {
				// call check digit calculation here
				return true;
			}
			// Check for 2 or more check digits to decide error message
			re = /[A-Z][A-Z]+/;
			if (re.test(fbiNum)) {  // 3d. AA suffix
				warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXAAX (X = 0-9; A = A-Z).";
			} else {	// 3c. A suffix
				re = /[A-IOQU]/;
				if (re.test(fbiNum)) {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXAXX (X = 0-9; A = J-N,P,R-T,V-Z), A is A-Z,O,Q,U.";
				} else {
					warnMsg = "FBI # '" + fbiNum + "' is NOT in form XXXXXXAXX (X = 0-9; A = J-N,P,R-T,V-Z).";
				}
			}
			addViolation(warnMsg);
			return SCRIPT_WARNING;
			break;
		default:
			// incorrect length will be detected by NISTParse (may be blank).  Return true to avoid double error messages.
			return true;
		}
		warnMsg = "FBI number is not valid.";  // all cases should be handled above, so should not reach.  put here just in case
		addViolation(warnMsg);
		return SCRIPT_WARNING;
	}
	return true;  // blank field
}

