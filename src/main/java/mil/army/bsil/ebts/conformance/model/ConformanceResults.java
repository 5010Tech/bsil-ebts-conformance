/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.model;

import java.util.List;

/**
 *
 * @author sbattjer
 */
public class ConformanceResults {
    private String transactionFileName;
    private String transactionType;
    private String specFileName;
    private List<RecordType> records;
    private List<SchemaViolation> schemaViolations;
    private int numSchemaViolations;
    private List<String> processingErrors;
    private String errorMsg;
    private int numViolations;
    private List<ViolationDetail> violationDetails;
    private List<String> xmlLines;
    private List<Integer> schemaErrorLines;
    private int numFields;

    public ConformanceResults() {
    }

    public String getTransactionFileName() {
        return transactionFileName;
    }

    public void setTransactionFileName(String transactionFileName) {
        this.transactionFileName = transactionFileName;
    }
    
    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
    
    public String getSpecFileName() {
        return specFileName;
    }

    public void setSpecFileName(String specFileName) {
        this.specFileName = specFileName;
    }
    
    public List<RecordType> getRecords() {
        return records;
    }

    public void setRecords(List<RecordType> records) {
        this.records = records;
    }

    public List<SchemaViolation> getSchemaViolations() {
        return schemaViolations;
    }

    public void setSchemaViolations(List<SchemaViolation> schemaViolations) {
        this.schemaViolations = schemaViolations;
    }
    
    public int getNumSchemaViolations() {
        return numSchemaViolations;
    }

    public void setNumSchemaViolations(int numSchemaViolations) {
        this.numSchemaViolations = numSchemaViolations;
    }
    

    public String getErrorMsg() {
        return errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public int getNumViolations() {
        return numViolations;
    }

    public void setNumViolations(int numViolations) {
        this.numViolations = numViolations;
    }

    public List<ViolationDetail> getViolationDetails() {
        return violationDetails;
    }

    public void setViolationDetails(List<ViolationDetail> violationDetails) {
        this.violationDetails = violationDetails;
    }

    public List<String> getProcessingErrors() {
        return processingErrors;
    }

    public void setProcessingErrors(List<String> processingErrors) {
        this.processingErrors = processingErrors;
    }

    public List<String> getXmlLines() {
        return xmlLines;
    }

    public void setXmlLines(List<String> xmlLines) {
        this.xmlLines = xmlLines;
    }

    public List<Integer> getSchemaErrorLines() {
        return schemaErrorLines;
    }

    public void setSchemaErrorLines(List<Integer> schemaErrorLines) {
        this.schemaErrorLines = schemaErrorLines;
    }

    public int getNumFields() {
        return numFields;
    }

    public void setNumFields(int numFields) {
        this.numFields = numFields;
    }
    
}
