/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.manager;

import com.lakota.biometrics.ani.Item;
import com.lakota.biometrics.ani.Location;
import com.lakota.biometrics.ani.Record;
import com.lakota.biometrics.ani.Subfield;
import com.lakota.biometrics.ani.Transaction;
import com.lakota.biometrics.ani.image.ImageRecord;
import com.lakota.biometrics.ani.io.AniTransactionReader;
import com.lakota.biometrics.ani.io.AniTransactionWriter;
import com.lakota.biometrics.ani.io.TransactionReadException;
import com.lakota.biometrics.ani.verification.Specification;
import com.lakota.biometrics.ani.verification.SpecificationException;
import com.lakota.biometrics.ani.verification.Verification;
import com.lakota.biometrics.ani.verification.Violation;
import com.lakota.biometrics.ani.verification.model.FieldRule;
import com.lakota.biometrics.ani.verification.model.Tag;
import com.lakota.biometrics.ani.verification.model.TagType;
import com.lakota.biometrics.ani.verification.text.TextSpecificationReader;
import com.lakota.biometrics.ani.xml.ebts4.Ebts4AniXml;
import com.lakota.biometrics.ani.xml.nato.NatoAniXml;
import com.lakota.biometrics.image.Image;
import com.lakota.biometrics.image.ImageFormat;
import com.lakota.biometrics.image.io.ImageReader;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import javax.xml.XMLConstants;
import javax.xml.bind.JAXBElement;
import javax.xml.transform.stream.StreamSource;
import javax.xml.validation.Schema;
import javax.xml.validation.SchemaFactory;
import javax.xml.validation.Validator;
import mil.army.bsil.ebts.conformance.model.ConformanceResults;
import mil.army.bsil.ebts.conformance.model.Field;
import mil.army.bsil.ebts.conformance.model.FieldError;
import mil.army.bsil.ebts.conformance.model.RecordType;
import mil.army.bsil.ebts.conformance.model.ViolationDetail;
import mil.army.bsil.ebts.conformance.model.SchemaViolation;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.xml.sax.ErrorHandler;
import org.xml.sax.SAXException;
import org.xml.sax.SAXParseException;

/**
 *
 * @author sbattjer
 */
@Service
public class ConformanceManager {
    
    @Autowired
    private ResourceLoader resourceLoader;
    
    @Value("${show.debug}")
    private Boolean showDebug = false;
    
    @Value("${validate.schema}")
    private Boolean validateSchema = true;
    
    @Value("${save.binary}")
    private Boolean saveBinary;
    
    @Value("${binary.output}")
    private String binaryOutput;
    
    @Value("${schema.location}")
    private String schemaLocation;
    
    private Ebts4AniXml ebts4AniXml = new Ebts4AniXml();
    private NatoAniXml natoAniXml = new NatoAniXml();
    
    private ConformanceResults lastResults;
    
    public ConformanceResults validateFile(String specKey, String specFileName, File input, String orgFileName, String fileName)
    {   
       ConformanceResults results = new ConformanceResults();
       results.setSpecFileName(specKey);
       results.setTransactionFileName(orgFileName);
       List<RecordType> resRecs = new ArrayList<RecordType>();
       boolean errors = false;
       List<String> processingErrors = new ArrayList<String>();
       String shortTransactionFileName = "None Supplied";
       String content = "None Supplied";
        if(specFileName != null) {
            try {
                System.out.println("specFileName: " + specFileName);
                Resource fileResource = resourceLoader.getResource("classpath:" + specFileName);
                InputStream specFile = fileResource.getInputStream();
                Transaction t = null;
                Specification s = null;
                if(input != null) {
                    shortTransactionFileName = fileName;
                    List<SchemaViolation> xmlViolations = new java.util.ArrayList<SchemaViolation>();
                    List<Violation> violations = null;
                    try {
                        // Read the specification     
                        s = TextSpecificationReader.read(specFile);        
                        if(orgFileName.endsWith(".xml") && validateSchema) {
                            String xsdFileName = null;
                            if(specKey.equals("EBTS 4.1")) {
                                xsdFileName = "ebts/xsd/dod_ebts/4.1/dod_ebts.xsd";
                            }
                            else if(specKey.equals("NATO STANAG 4715")) {
                                xsdFileName = "nato/xsd/STANAG 4715/NATO_STANAG4715 FEB2020 Ratification Draft.xsd";
                            }
                            List<Integer> lineNumbers = addViolationsFromXSD(input, xmlViolations, xsdFileName);
                            results.setSchemaViolations(xmlViolations);
                            results.setNumSchemaViolations(xmlViolations.size());
                            results.setSchemaErrorLines(lineNumbers);
                            
                            results.setXmlLines(generateXmlContents(input));
                            if(specKey.equals("EBTS 4.1")) {
                                t = ebts4AniXml.convert(input);
                            }
                            else if(specKey.equals("NATO STANAG 4715")) {
                                t = natoAniXml.convert(input);
                            }
                            if(saveBinary) {
                                String binaryName = orgFileName.replace(".xml", ".eft");
                                OutputStream out = new FileOutputStream(binaryOutput + binaryName);
                                AniTransactionWriter.write(t, out);
//                                t = xmlConverter.convert(mpFile.getInputStream());
                            }
                            
                        }
                        else {
//                            results.setXmlLines(new ArrayList<String>());
                            t = AniTransactionReader.read(input);
                        }
                        t.setSpecification(s);
                        shortTransactionFileName = fileName;
                        results.setTransactionType(t.getTransactionType());
                        
                        // Verify the Transaction against the Specification     
//                        violations = Verification.verify(t, s);
                        violations = t.verify();
                        results.setNumViolations(violations.size());
                        int numFields = 0;
                        for(Record rec: t.getRecords()) {
//                            System.out.println("REC TYPE: " + rec.getRecordType());
                            RecordType resRec = new RecordType();
                            resRec.setRecordType(rec.getRecordType().toString());
                            resRec.setRecordName(rec.getRecordType().getRecordName());
                            List<Field> fields = new ArrayList<Field>();
                            for(com.lakota.biometrics.ani.Field field: rec.getFields()) {
                                if(field.getSubfieldCount() == 0) {
                                    numFields++;
                                }
                                boolean foundSubField = false;
                                for(Subfield subField: field.getSubfields()) {
                                    if(subField.getItemCount() == 0) {
                                        numFields++;
                                    }
                                    foundSubField = true;                                    
                                    for(Item item: subField.getItems()) {
                                        numFields++;
                                        Field sub = new Field();
                                        sub.setFieldNumber(String.valueOf(subField.getSubfieldNumber()));
                                        sub.setFieldLocation(convertSubfieldLocation(item.getLocation().toString(), field.getSubfieldCount(), subField.getItemCount()));
                                        FieldRule rule = s.getFieldRule(subField.getParentTransaction().getTransactionType(), item.getLocation());
                                        if(rule == null) {
                                            rule = s.getFieldRule(subField.getParentTransaction().getTransactionType(), subField.getLocation());
                                        }
                                        if(rule == null) {
                                            sub.setDescription("Not Found");
                                            sub.setMessage("Not Found");
                                            sub.setMandatoryOptional("Not Found");
                                        }
                                        else {
                                            String[] splits = rule.toString().split(" desc=\"");
                                            if(splits != null && splits.length > 1) {
                                                String shortDesc = splits[1].split("\"")[0];
                                                sub.setDescription(shortDesc);
                                                List<String> tags = new ArrayList<String>();
                                                for(Tag tag: rule.getTags()) {
                                                    tags.add(tag.name + ": " + rule.getTagValue(tag.type));
                                                }
                                                sub.setTags(tags);
//                                                if(rule.toString().contains("long_desc")) {
//                                                    splits = rule.toString().split("long_desc=\"");
//                                                    sub.setMessage(splits[1].substring(0, splits[1].length()-1));
//                                                }
//                                                else {
//                                                    sub.setMessage(rule.getTagValue(TagType.LONG_DESC));
//                                                }
                                            }
                                            sub.setMandatoryOptional(rule.getCondition().toString());
                                        }
                                        if(sub.getFieldLocation() != null && sub.getFieldLocation().endsWith(".999")) {
                                            ImageRecord r = rec.toImageRecord();
                                            if(r != null) {
                                                byte[] bmpImage = r.exportImage(ImageFormat.PNG);
                                                sub.setValue(Base64.getEncoder().encodeToString(bmpImage));
                                                sub.setImage(true);
                                            }
                                            else {
                                                sub.setValue(item.toString());
                                                sub.setImage(false);
                                            }
                                        }
                                        else {
                                            sub.setValue(item.toString());
                                            sub.setImage(false);
                                        }
                                        sub.setPassed(true);
                                        fields.add(sub);
                                    }
//                                    Field sub = new Field();
//                                    sub.setFieldNumber(String.valueOf(subField.getSubfieldNumber()));
////                                    String locString = convertSubfieldLocation(subField.getLocation().toString());
//                                    sub.setFieldLocation(convertSubfieldLocation(subField.getLocation().toString()));
//                                    sub.setPassed(true);
//                                    if(s.getFieldRule(subField.getParentTransaction().getTransactionType(), subField.getLocation()) != null) {
//                                        String desc = s.getFieldRule(subField.getParentTransaction().getTransactionType(), subField.getLocation()).toString();
//                                        String[] splits = desc.split(" desc=\"");
//                                        splits = splits[1].split("\" ");
//                                        desc = splits[0];
//                                        sub.setDescription(desc);
//                                        sub.setMandatoryOptional(s.getFieldRule(subField.getParentTransaction().getTransactionType(), subField.getLocation()).getCondition().toString());
//                                    }
//                                    else {
//                                        System.out.println(subField.getParentTransaction().getTransactionType());
//                                        System.out.println(subField.getLocation());
//                                        System.out.println(sub.getFieldNumber());
//                                        System.out.println(sub.getFieldLocation());
//                                        System.out.println();
//                                        sub.setDescription("N/A");
//                                        sub.setMandatoryOptional("UNKNOWN");
//                                    }
//                                    
//                                    StringBuilder builder = new StringBuilder();
//                                    for(Item item: subField.getItems()) {
//                                        if (builder.length() > 0) {
//                                            builder.append("<br/>");
//                                        }
//                                        builder.append(item.toString());
//                                    }
//                                    
//                                    sub.setValue(builder.toString());
//                                    fields.add(sub);
                                }
//                                if(!foundSubField) {
//                                    Field f = new Field();
//                                    f.setFieldNumber(String.valueOf(field.getFieldNumber()));
//                                    f.setFieldLocation(field.getLocation().toString());
//                                    f.setPassed(true);
//                                    String desc = s.getFieldRule(field.getParentTransaction().getTransactionType(), field.getLocation()).toString();
//                                    String[] splits = desc.split("long_desc=\"");
//                                    desc = splits[1];
//                                    desc = desc.substring(0, desc.length()-1);
//                                    f.setDescription(desc);
//                                    f.setMandatoryOptional(s.getFieldRule(field.getParentTransaction().getTransactionType(), field.getLocation()).getCondition().toString());
//                                    StringBuilder builder = new StringBuilder();
//                                    for(Item item: field.getItems()) {
//                                        if (builder.length() > 0) {
//                                            builder.append("<br/>");
//                                        }
//                                        builder.append(item.toString());
//                                    }
//                                    f.setValue(builder.toString());
//                                    fields.add(f);
//                                }
                            }
                            resRec.setFields(fields);
                            resRecs.add(resRec);
                        }
                        results.setNumFields(numFields);
//                        List<ViolationDetail> violationDetails = new ArrayList<ViolationDetail>();
//                        markViolationsInRecord(violations, resRecs, violationDetails, t, s);
//                        Collections.sort(violationDetails);
//                        results.setViolationDetails(violationDetails);
//                        results.setRecords(resRecs);
                    }
                    catch (SpecificationException e) {
                        errors = true;
                        String errorMsg = "Specification Errror. Contact administrator to make sure verification files are configured correctly." + '\n';
                        if(showDebug)
                        {
                            errorMsg +=  e;
                            errorMsg += throwableToStackString(e);
                        }
                        else {
                            errorMsg += e.getMessage();
                        }
                        processingErrors.add(errorMsg);
                        // Failed to read specification    
                        e.printStackTrace();   
                    }
                    catch (TransactionReadException e) {
                        // Failed to read transaction     
                        errors = true;
                        String errorMsg = "Transaction Read Error: " + e;
                        if(showDebug) {
                            errorMsg +=  e;
                            errorMsg += throwableToStackString(e);
                        }
                        processingErrors.add(errorMsg);
                        e.printStackTrace();
                    } 
                    catch (Exception e) {
                        // Failed to read transaction     
                        errors = true;
                        String errorMsg = "Unknown Error while validating:" + '\n';
                        if(showDebug) {
                            errorMsg += e;
                            errorMsg += "<br/> " + throwableToStackString(e);
                        }
                        else {
                            errorMsg += e.getMessage();
                        }
                        processingErrors.add(errorMsg);
                        e.printStackTrace();   
                    }    
                    catch (Throwable tt) {
                        tt.printStackTrace();
                        // Failed to read transaction     
                        errors = true;
                        String errorMsg = "Unknown Error while validating." + '\n';
                        if(showDebug) {
                            errorMsg += tt;
                            errorMsg += "<br/> " + throwableToStackString(tt);
                        }
                        else {
                            errorMsg += tt.getMessage();
                        }
                        processingErrors.add(errorMsg);
                    }
                    finally {
                        List<ViolationDetail> violationDetails = new ArrayList<ViolationDetail>();
                        markViolationsInRecord(violations, resRecs, violationDetails, t, s);
                        Collections.sort(violationDetails);
                        results.setViolationDetails(violationDetails);
                        results.setRecords(resRecs);
                    }
                }
                else {                    
                    errors = true;
                    String errorMsg = " No File Supplied ";
                    processingErrors.add(errorMsg);
                }
            }
            catch (Exception ex) {     
                // Failed to read transaction     
                errors = true;
                String errorMsg = "Unknown Error while validating." + '\n';
                if(showDebug) {
                    errorMsg += ex;
                    errorMsg += "<br/> " + throwableToStackString(ex);
                }
                else {
                    errorMsg += ex.getMessage();
                }
                processingErrors.add(errorMsg);
                ex.printStackTrace();   
             }    
             catch (Throwable t) {     
                // Failed to read transaction     
                errors = true;
                String errorMsg = "Unknown Error while validating." + '\n';
                if(showDebug) {
                    errorMsg += t;
                    errorMsg += "<br/> " + throwableToStackString(t);
                }
                else {
                    errorMsg += t.getMessage();
                }
                processingErrors.add(errorMsg);
             }              
        }
        else {
            errors = true;
            specFileName = "-";
            String errorMsg = "Invalid spec " + specKey + " use GET method to get list of valid specs" ;
            processingErrors.add(errorMsg);
        }
        results.setProcessingErrors(processingErrors);
        if(specKey.equals("EBTS 1.2")) {
            fixType17Records(results);
        }
        this.lastResults = results;
        return results;
    }
    
    
    private void markViolationsInRecord(List<Violation> violations, List<RecordType> resRecs, List<ViolationDetail> violationDetails, Transaction t, Specification s) {
        if(violations != null) {
            for(Violation violation: violations) {
                Location loc = violation.getLocation();
                boolean foundRec = false;
                Record r = t.getRecord(loc);   
                com.lakota.biometrics.ani.RecordType type = loc.getRecordType();
                for(RecordType resRec: resRecs) {
                    for(Field resField: resRec.getFields()) {
                        if(convertToFullFieldLocation(resField.getFieldLocation()).equals(convertSubfieldLocation(violation.getLocation().toString(), 2, 2))) {
                            resField.setPassed(false);
                            ViolationDetail det = new ViolationDetail();
                            det.setFieldLocation(resField.getFieldLocation());
                            if(violation.getMessage() != null && !violation.getMessage().isEmpty()) {
                                det.setMessage(violation.getMessage());
                            }
                            else {
                                det.setMessage(violation.getType().getDescription());
                            }
                            det.setPresent(true);
                            violationDetails.add(det);
                            FieldError error = new FieldError(violation.getType().getDescription(), violation.getMessage());
                            if(resField.getErrors() == null) {
                                resField.setErrors(new ArrayList<FieldError>());
                            }
                            resField.getErrors().add(error);
    //                        if(resField.getMessage() != null) {
    //                            resField.setMessage(resField.getMessage() + "<br/><br/>" + violation.getType().getDescription() + ".  " + violation.getMessage());
    //                        }
    //                        else {
    //                            resField.setMessage(violation.getType().getDescription() + ".  " + violation.getMessage());
    //                        }
                            foundRec = true;
                            break;
                        }
                    }
                }
                if(!foundRec) {
                    addMissingRecord(violation, resRecs, violationDetails, s, t.getTransactionType());
                    ViolationDetail det = new ViolationDetail();
                    det.setFieldLocation(convertSubfieldLocation(violation.getLocation().toString(), 2, 2));
                    det.setMessage(violation.getType().getDescription() + ".  " + violation.getMessage());
                    det.setPresent(true);
                    violationDetails.add(det);
                }
            }
        }
    }
    
    
    /**
     * This is for Schemes, creates a list of violations, just strings based on the scheme, it will really be 1
     * @param specKey
     * @param transactionStream
     * @param violations 
     */               
    private List<Integer> addViolationsFromXSD(File file, List<SchemaViolation> violations, String xsdFileName)
    {   
        List<Integer> lineNumbers = new ArrayList<Integer>();
        if(xsdFileName != null) {
//            Resource fileResource = resourceLoader.getResource("classpath:" + xsdFileName);
            try {
//                InputStream xsdFile = fileResource.getInputStream();
                File xsdFile = new File(schemaLocation + xsdFileName);
                SchemaFactory factory = 
                    SchemaFactory.newInstance(XMLConstants.W3C_XML_SCHEMA_NS_URI);
                factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, false);
                Schema schema = factory.newSchema(new StreamSource(xsdFile));
                Validator validator = schema.newValidator();
                validator.setErrorHandler(new ErrorHandler() {
                    @Override
                    public void warning(SAXParseException exception) throws SAXException {
                        handleError(exception);
                    }

                    @Override
                    public void error(SAXParseException exception) throws SAXException {
                        handleError(exception);
                    }

                    @Override
                    public void fatalError(SAXParseException exception) throws SAXException {
                        handleError(exception);
                    }
                    
                    public void handleError(SAXParseException sax) {
                        SchemaViolation violation = new SchemaViolation();
                        violation.setMessage(sax.toString().replace("org.xml.sax.SAXParseException;", ""));
                        violation.setLine(sax.getLineNumber());
                        violation.setColumn(sax.getColumnNumber());
                        violations.add(violation);
                        lineNumbers.add(sax.getLineNumber());
                    }
                });
                validator.validate(new StreamSource(file));
            }
            catch(Exception ex) {
                System.out.println("Exception Inner: " + ex);
                ex.printStackTrace();
                SchemaViolation violation = new SchemaViolation();
                violation.setMessage(ex.toString());
                violations.add(violation);
            }
        }
        return lineNumbers;
    }
    
    private String throwableToStackString(Throwable t) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        t.printStackTrace(pw);
        return sw.toString();
    }
    
    private String convertSubfieldLocation(String location, int subFieldCount, int itemCount) {
        String locString = location;
        String[] parts = locString.split("\\.");
        locString = "";
        int length = 2;
        if(itemCount > 1) {
            length = 4;
        }
        else if(subFieldCount > 1) {
            length = 3;
        }
        for(int x = 0; x < length; x++) {
            if(x <= 4 ) {
                if(locString.length() > 0) {
                    locString = locString + ".";
                }
                if(x == 1) {
                    if(parts[x].length() == 1) {
                        parts[x] = "00" + parts[x];
                    }
                    else if(parts[x].length() == 2) {
                        parts[x] = "0" + parts[x];
                    }
                }
                locString = locString + parts[x];
            }
        }
        return locString;
    }
    
    private String convertToFullFieldLocation(String location) {
        String fieldLoc = location;
        if(location.split("\\.").length == 2) {
            fieldLoc = fieldLoc + ".1.1";
        }
        else if(location.split("\\.").length == 3) {
            fieldLoc = fieldLoc + ".1";
        }
        return fieldLoc;
    }
    
    private void addMissingRecord(Violation violation, List<RecordType> resRecs, List<ViolationDetail> violationDetails, Specification s, String transactionType) {
        String[] fieldNumbers = convertSubfieldLocation(violation.getLocation().toString(), 2, 2).split("\\.");
        String recType = violation.getLocation().getRecordType().toString();
        int insertIndex = 0;
        int insertResRec = 0;
        for(int x = 0; x < resRecs.size(); x++) {
            RecordType resRec = resRecs.get(x);
            boolean found = false;
            if(resRec.getRecordType().equals(recType)) {
                Field field = resRec.getFields().get(0);
                String fieldLoc = convertToFullFieldLocation(field.getFieldLocation().toString());
                String[] checkFieldNumbers = fieldLoc.split("\\.");
                if(fieldNumbers[0].equals(checkFieldNumbers[0])) {
                    insertResRec = x;
                    
                    for(int y = 0; y < resRec.getFields().size(); y++) {
                        insertIndex = y;
                        checkFieldNumbers = convertToFullFieldLocation(resRec.getFields().get(y).getFieldLocation().toString()).split("\\.");
                        if(!fieldNumbers[1].contains("*") && !checkFieldNumbers[1].contains("*")) {
                            Integer sub = Integer.parseInt(fieldNumbers[1]);
                            Integer checkSub = Integer.parseInt(checkFieldNumbers[1]);
                            if(sub.equals(checkSub)) {
                                if(!fieldNumbers[2].contains("*") && !checkFieldNumbers[2].contains("*")) {
                                    sub = Integer.parseInt(fieldNumbers[2]);
                                    checkSub = Integer.parseInt(checkFieldNumbers[2]);
                                    if(sub.equals(checkSub)) {
                                        if(!fieldNumbers[3].equals("*") && !checkFieldNumbers[3].equals("*")) {
                                            sub = Integer.parseInt(fieldNumbers[3]);
                                            checkSub = Integer.parseInt(checkFieldNumbers[3]);
                                            if(sub < checkSub) {
                                                insertIndex = y;
                                                found = true;
                                                break;
                                            }
                                        }
                                    }
                                    else if(sub < checkSub) {
                                        insertIndex = y;
                                        found = true;
                                        break;
                                    }
                                }
                            }
                            else if(sub < checkSub) {
                                insertIndex = y;
                                found = true;
                                break;
                            }
                        }
                    }
                    if(!found && insertIndex +1 == resRec.getFields().size()) {
                        insertIndex++;
                        found = true;
                    }
                }
            }
            if(found) {
                break;
            }
        }
        Field sub = new Field();
        sub.setFieldLocation(convertSubfieldLocation(violation.getLocation().toString(), 2, 2));
        FieldRule rule = s.getFieldRule(transactionType, violation.getLocation());
        if(rule == null) {
//            System.out.println(violation.getLocation());
            sub.setDescription("Not Found");
            sub.setMessage("Not Found");
            sub.setMandatoryOptional("Not Found");
        }
        else {
            String[] splits = rule.toString().split(" desc=\"");
            if(splits != null && splits.length>1) {
                String shortDesc = splits[1].split("\"")[0];
                sub.setDescription(shortDesc);
                List<String> tags = new ArrayList<String>();
                for(Tag tag: rule.getTags()) {
                    tags.add(tag.name + ": " + rule.getTagValue(tag.type));
                }
                sub.setTags(tags);
//                if(rule.toString().contains("long_desc")) {
//                    splits = rule.toString().split("long_desc=\"");
//                    sub.setMessage(splits[1].substring(0, splits[1].length()-1));
//                }
//                else {
//                    sub.setMessage(rule.getTagValue(TagType.LONG_DESC));
//                }
            }
            sub.setMandatoryOptional(rule.getCondition().toString());
        }
        FieldError error = new FieldError(violation.getType().getDescription(), violation.getMessage());
        if(sub.getErrors() == null) {
            sub.setErrors(new ArrayList<FieldError>());
        }
        sub.getErrors().add(error);
        sub.setPassed(false);
        if(resRecs.size() > insertResRec) {
            resRecs.get(insertResRec).getFields().add(insertIndex, sub);
        }
        
    }
    
    public void fixType17Records(ConformanceResults results) {
        int numViolations = results.getNumViolations();
        List<Integer> delIndexes = new ArrayList<Integer>();
        int count = 0;
        if(results.getViolationDetails() != null) {
            for(ViolationDetail violation: results.getViolationDetails()) {
                if(violation.getFieldLocation().startsWith("17")) {
                    delIndexes.add(count);
                    numViolations--;
                }
                count++;
            }
            List<ViolationDetail> newViolations = results.getViolationDetails();
            for (int x = delIndexes.size()-1; x >= 0; x--) {
                newViolations.remove(results.getViolationDetails().get(delIndexes.get(x)));
            }

            for(RecordType type: results.getRecords()) {
                if(type.getRecordType().equals("Type-17")) {
                    for(Field field: type.getFields()) {
                        List<FieldError> errs = new ArrayList<FieldError>();
                        FieldError err = new FieldError("Unsupported Record Type Provided", "Type-17 records are unsupported in ANSI/NIST-ITL-1-2000");
                        errs.add(err);
                        field.setErrors(errs);
                        field.setPassed(false);
                        ViolationDetail dets = new ViolationDetail();
                        dets.setFieldLocation(field.getFieldLocation());
                        dets.setMessage("Type-17 records are unsupported in ANSI/NIST-ITL-1-2000");
                        dets.setPresent(true);
                        newViolations.add(dets);
                        numViolations++;
                    }
                }
            }
            results.setViolationDetails(newViolations);
            results.setNumViolations(numViolations);
        }
    }
    
    
    private List<String> generateXmlContents(File file) {
        List<String> xmlLines = new ArrayList<String>();
        try {
            BufferedReader br = new BufferedReader(new FileReader(file));
            String line;
            while((line = br.readLine()) != null) {
                xmlLines.add(line);
            }
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
        return xmlLines;
    }
    
    private void convertImage(Field sub, Item item, ImageFormat format) {
        String fileName = UUID.randomUUID().toString() + ".png";
        try {
            File f = new File(fileName);
            FileUtils.writeByteArrayToFile(f, item.getBytes());
            Image image;
            if(format == null) {
                image = ImageReader.read(f);
            }
            else {
                image = ImageReader.read(f, format);
            }
            String img = new String(Base64.getEncoder().encode(image.toJpgImage().getBytes()));
            sub.setValue(img);
            FileUtils.deleteQuietly(f);
            sub.setImage(true);
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
        finally {
            FileUtils.deleteQuietly(new File(fileName));
        }
    }

    public ConformanceResults getLastResults() {
        return lastResults;
    }

    public void setLastResults(ConformanceResults lastResults) {
        this.lastResults = lastResults;
    }
    
    
    
}
