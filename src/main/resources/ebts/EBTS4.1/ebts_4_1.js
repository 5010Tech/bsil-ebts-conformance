/// @file ebts_4_1.js
/// Javascript verify functions for DoD EBTS 4.1

/// @cond EXCLUDE_FROM_DOCS

/// @endcond

/// This function checks to make sure that their are the correct number of points available
function CheckNumberOfPoints()
{
    var recordType = getRecordType();
    var recordIndex = getRecordIndex();
    var fieldNumber = getFieldNumber();
    var itemNumber = getItemNumber();
    var expectedPoints = parseInt(getString());
    var subfieldNumber = getSubfieldNumber();
    var baseMnemonic = getMnemonic();
    
    baseMnemonic = baseMnemonic.substring(0,baseMnemonic.length-4);
    var numPointsPresent = 1;
    var done = false;
    while(!done) {
        var xCoord = getString(baseMnemonic+"_HPO_"+numPointsPresent,recordIndex,subfieldNumber);
        var yCoord = getString(baseMnemonic+"_VPO_"+numPointsPresent,recordIndex,subfieldNumber);
        if(xCoord != null && yCoord == null) {
        	addViolation (9509, "Missing X Coordinate", recordType, recordIndex, fieldNumber, subfieldNumber, itemNumber);
        }
        else if(xCoord == null && yCoord != null) {
            addViolation (9509, "Missing Y Coordinate", recordType, recordIndex, fieldNumber, subfieldNumber, itemNumber);
        }
        if(xCoord == null && yCoord == null) {
            done = true;
        } else {
            numPointsPresent = numPointsPresent + 1;
        }
    }
    numPointsPresent = numPointsPresent - 1;
    if(numPointsPresent < expectedPoints) {
         addViolation (9517, "Not enough points are present, expected "+expectedPoints+", received "+numPointsPresent, recordType, recordIndex, fieldNumber, subfieldNumber, itemNumber);
    } else if(numPointsPresent > expectedPoints) {
         addViolation (9513, "Too many points are present, expected "+expectedPoints+", received "+numPointsPresent, recordType, recordIndex, fieldNumber, subfieldNumber, itemNumber);
    } else {
         return NO_VIOLATION
    }
}