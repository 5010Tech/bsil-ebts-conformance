/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.manager;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.List;
import mil.army.bsil.ebts.conformance.model.ConformanceResults;
import mil.army.bsil.ebts.conformance.model.Field;
import mil.army.bsil.ebts.conformance.model.FieldError;
import mil.army.bsil.ebts.conformance.model.RecordType;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Color;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFTable;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.Borders;
import org.apache.poi.xwpf.usermodel.IBodyElement;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFStyle;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.apache.xmlbeans.XmlCursor;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTHMerge;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSpacing;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTStyle;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTTcPr;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTVMerge;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STLineSpacingRule;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STMerge;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STOnOff;
import org.springframework.stereotype.Service;

/**
 *
 * @author sbattjer
 */
@Service
public class DocumentManager {
    
    private boolean init = false;
    
    public void getChecks() throws Exception {
        System.out.println("In getChecks");
        InputStream is = this.getClass().getClassLoader().getResourceAsStream("Check.docx");
        try {
            XWPFDocument doc = new XWPFDocument(is);
            List<IBodyElement> paras = doc.getBodyElements();
//                checked = (XWPFParagrzaph)paras.get(0);
//                unchecked = (XWPFParagraph)paras.get(1);
//                System.out.println(checked);
//                System.out.println(unchecked);
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
    }
    
    public byte[] generateConformanceReport(ConformanceResults results, boolean engineeringTable, boolean executiveTable, boolean errorTable) {
        try {
            XWPFDocument document = new XWPFDocument();
            //Remove Margin
//            CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
//            CTPageMar mar = sectPr.addNewPgMar();
//            mar.setLeft(BigInteger.valueOf(150L));
            
            if(engineeringTable) {
                XWPFParagraph para = document.createParagraph();
                XWPFRun run = para.createRun();
                run.setFontFamily("Calibri");
                run.setFontSize(18);
                run.setText("Engineering Table");
                run.setBold(true);
                generateEngineeringTable(results, document, false);
                document.createParagraph();
                document.createParagraph();
            }
            if(executiveTable) {
                XWPFParagraph para2 = document.createParagraph();
                XWPFRun run2 = para2.createRun();
                run2.setFontFamily("Calibri");
                run2.setFontSize(18);
                run2.setText("Executive Table");
                run2.setBold(true);
                generateExecutiveTable(results, document, false);
                document.createParagraph();
                document.createParagraph();
            }
            if(errorTable) {
                XWPFParagraph para2 = document.createParagraph();
                XWPFRun run2 = para2.createRun();
                run2.setFontFamily("Calibri");
                run2.setFontSize(18);
                run2.setText("Executive Error Only Table");
                run2.setBold(true);
                generateExecutiveTable(results, document, true);
                document.createParagraph();
                document.createParagraph();
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            document.write(out);
            return out.toByteArray();
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
        
        return new byte[0];
    }
    
    private void generateEngineeringTable(ConformanceResults results, XWPFDocument document, boolean errorOnly) {
        XWPFTable table = document.createTable();
        table.getCTTbl().addNewTblPr().addNewTblW().setW(BigInteger.valueOf(9360));
        XWPFTableRow title = table.getRow(0);
        title.setRepeatHeader(true);
        XWPFTableCell titleCell0 = title.getCell(0);
        titleCell0.setColor("0000FF");
        titleCell0.getCTTc().addNewTcPr();
        titleCell0.getCTTc().getTcPr().addNewGridSpan();
        titleCell0.getCTTc().getTcPr().getGridSpan().setVal(BigInteger.valueOf(5));
        addCellText(titleCell0, results.getSpecFileName() + " - TOT = " + results.getTransactionType(), true, true, false, false, ParagraphAlignment.CENTER);

        XWPFTableRow header = table.createRow();
        header.setRepeatHeader(true);
        XWPFTableCell headerCell0 = header.getCell(0);
        addCellText(headerCell0, "Record Type", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell0.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell0.setColor("0000FF");
        XWPFTableCell headerCell1 = header.createCell();
        addCellText(headerCell1, "Field Number", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell1.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell1.setColor("0000FF");
        XWPFTableCell headerCell2 = header.createCell();
        addCellText(headerCell2, "Status", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell2.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
        headerCell2.setColor("0000FF");
        XWPFTableCell headerCell3 = header.createCell();
        addCellText(headerCell3, "Comments", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell3.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell3.setColor("0000FF");
        XWPFTableCell headerCell4 = header.createCell();
        addCellText(headerCell4, "Mandatory", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell4.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
        headerCell4.setColor("0000FF");
        int startRow = 2;
        int offSet = 0;
        for(RecordType type: results.getRecords()) {
            
            boolean isFirst = true;
            int numRows = 0;
            for(Field field: type.getFields()) {
                if(!errorOnly || (errorOnly && !field.isPassed())) {
                    XWPFTableRow row = table.createRow();
                    numRows++;

                    if(isFirst) {
                        XWPFTableCell cell0 = row.getCell(0);
                        cell0.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                        addCellText(cell0, type.getRecordType() + " - " + type.getRecordName(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                        isFirst = false;

                    }
                    XWPFTableCell cell1 = row.createCell();
                    cell1.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                    addCellText(cell1, field.getFieldLocation() + " - " + field.getDescription(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);

                    XWPFTableCell cell2 = row.createCell();
                    String status = field.isPassed() ? "MET" : "NOT MET";
                    cell2.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
                    addCellText(cell2, status, false, field.isPassed(), false, false, ParagraphAlignment.CENTER);
                    XWPFTableCell cell3 = row.createCell();
                    addCellText(cell3, "Field Value: ", true, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                    if(field.getFieldLocation() != null && field.getFieldLocation().endsWith(".999")) {
                        addCellText(cell3, "VALUE REDACTED", false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                    }
                    else {
                        addCellText(cell3, field.getValue(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                    }
                    
                    if(!field.isPassed()) {
                        int errCount = 1;
                        for(FieldError err: field.getErrors()) {
                            if(err.getDescription() != null && !err.getDescription().isEmpty()) {
                                addCellText(cell3, "Error " + errCount + " Description: ", true, field.isPassed(), true, true, ParagraphAlignment.LEFT);
                                addCellText(cell3, err.getDescription(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                            }
                            else {
                                addCellText(cell3, "Error " + errCount + " Description: N/A", true, field.isPassed(), true, false, ParagraphAlignment.LEFT);
                            }
                            if(err.getMessage()!= null && !err.getMessage().isEmpty()) {
                                addCellText(cell3, "Error " + errCount + " Message: ", true, field.isPassed(), true, true, ParagraphAlignment.LEFT);
                                addCellText(cell3, err.getMessage(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                            }
                            else {
                                addCellText(cell3, "Error " + errCount + " Message: N/A", true, field.isPassed(), true, false, ParagraphAlignment.LEFT);
                            }
                            errCount++;
                        }
                    }
                    cell3.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                    XWPFTableCell cell4 = row.createCell();
                    cell4.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
                    addCellText(cell4, field.getMandatoryOptional(), false, field.isPassed(), false, false, ParagraphAlignment.CENTER);
                }
            }
            boolean start = true;
            for(int x = startRow; x <= offSet+numRows+1; x++) {
                XWPFTableCell cell = table.getRow(x).getCell(0);

                CTVMerge m = CTVMerge.Factory.newInstance();
                if(start) {
                   m.setVal(STMerge.RESTART);
                   start = false;
                }
                else {
                    m.setVal(STMerge.CONTINUE);
                    for (int y = cell.getParagraphs().size(); y > 0; y--) {
                        cell.removeParagraph(0);
                    }
                    cell.addParagraph();
                }
                CTTcPr tcPr = cell.getCTTc().getTcPr();
                if(tcPr == null) tcPr = cell.getCTTc().addNewTcPr();
                tcPr.setVMerge(m);
                table.getRow(x).getCell(0).setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
            }
            offSet += numRows+1;
            startRow += numRows+1;
            XWPFTableRow row = table.createRow();
            XWPFTableCell spaceCell = row.getCell(0);
            spaceCell.getCTTc().addNewTcPr();
            spaceCell.getCTTc().getTcPr().addNewGridSpan();
            spaceCell.getCTTc().getTcPr().getGridSpan().setVal(BigInteger.valueOf(5));
        }
    }
    
    
    private void generateExecutiveTable(ConformanceResults results, XWPFDocument document, boolean errorOnly) {
        XWPFTable table = document.createTable();
        table.getCTTbl().addNewTblPr().addNewTblW().setW(BigInteger.valueOf(9360));
        XWPFTableRow title = table.getRow(0);
        title.setRepeatHeader(true);
        XWPFTableCell titleCell0 = title.getCell(0);
        titleCell0.setColor("0000FF");
        titleCell0.getCTTc().addNewTcPr();
        titleCell0.getCTTc().getTcPr().addNewGridSpan();
        titleCell0.getCTTc().getTcPr().getGridSpan().setVal(BigInteger.valueOf(5));
        addCellText(titleCell0, results.getSpecFileName() + " - TOT = " + results.getTransactionType(), true, true, false, false, ParagraphAlignment.CENTER);

        XWPFTableRow header = table.createRow();
        header.setRepeatHeader(true);
        XWPFTableCell headerCell0 = header.getCell(0);
        addCellText(headerCell0, "Record Type", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell0.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell0.setColor("0000FF");
        XWPFTableCell headerCell1 = header.createCell();
        addCellText(headerCell1, "Field Number", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell1.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell1.setColor("0000FF");
        XWPFTableCell headerCell2 = header.createCell();
        addCellText(headerCell2, "Status", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell2.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
        headerCell2.setColor("0000FF");
        XWPFTableCell headerCell3 = header.createCell();
        addCellText(headerCell3, "Comments", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell3.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
        headerCell3.setColor("0000FF");
        XWPFTableCell headerCell4 = header.createCell();
        addCellText(headerCell4, "Mandatory", true, true, false, false, ParagraphAlignment.CENTER);
        headerCell4.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
        headerCell4.setColor("0000FF");
        int startRow = 2;
        int offSet = 0;
        for(RecordType type: results.getRecords()) {
            
            boolean isFirst = true;
            int numRows = 0;
            for(Field field: type.getFields()) {
                if(!errorOnly || (errorOnly && !field.isPassed())) {
                    XWPFTableRow row = table.createRow();
                    numRows++;
                    if(isFirst) {
                        XWPFTableCell cell0 = row.getCell(0);
                        cell0.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                        addCellText(cell0, type.getRecordType() + " - " + type.getRecordName(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                        isFirst = false;

                    }
                    XWPFTableCell cell1 = row.createCell();
                    cell1.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                    addCellText(cell1, field.getFieldLocation() + " - " + field.getDescription(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);

                    XWPFTableCell cell2 = row.createCell();
                    String status = field.isPassed() ? "MET" : "NOT MET";
                    cell2.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
                    addCellText(cell2, status, false, field.isPassed(), false, false, ParagraphAlignment.CENTER);

                    XWPFTableCell cell3 = row.createCell();
                    if(!field.isPassed()) {
                        addCellText(cell3, "Field Value: ", true, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                        addCellText(cell3, field.getValue(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                        int errCount = 1;
                        for(FieldError err: field.getErrors()) {
                            if(err.getDescription() != null && !err.getDescription().isEmpty()) {
                                addCellText(cell3, "Error " + errCount + " Description:", true, field.isPassed(), true, true, ParagraphAlignment.LEFT);
                                addCellText(cell3, err.getDescription(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                            }
                            else {
                                addCellText(cell3, "Error " + errCount + " Description: N/A", true, field.isPassed(), true, false, ParagraphAlignment.LEFT);
                            }
                            if(err.getMessage()!= null && !err.getMessage().isEmpty()) {
                                addCellText(cell3, "Error " + errCount + " Message:", true, field.isPassed(), true, true, ParagraphAlignment.LEFT);
                                addCellText(cell3, err.getMessage(), false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                            }
                            else {
                                addCellText(cell3, "Error " + errCount + " Message: N/A", true, field.isPassed(), true, false, ParagraphAlignment.LEFT);
                            }
                            errCount++;
                        }
                    }
                    else {
                        addCellText(cell3, "", false, field.isPassed(), false, false, ParagraphAlignment.LEFT);
                    }
                    cell3.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(3744));
                    XWPFTableCell cell4 = row.createCell();
                    cell4.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(936));
                    addCellText(cell4, field.getMandatoryOptional(), false, field.isPassed(), false, false, ParagraphAlignment.CENTER);
                }
            }

            boolean start = true;
            for(int x = startRow; x <= offSet+numRows+1; x++) {
                XWPFTableCell cell = table.getRow(x).getCell(0);

                CTVMerge m = CTVMerge.Factory.newInstance();
                if(start) {
                   m.setVal(STMerge.RESTART);
                   start = false;
                }
                else {
                    m.setVal(STMerge.CONTINUE);
                    for (int y = cell.getParagraphs().size(); y > 0; y--) {
                        cell.removeParagraph(0);
                    }
                    cell.addParagraph();
                }
                CTTcPr tcPr = cell.getCTTc().getTcPr();
                if(tcPr == null) tcPr = cell.getCTTc().addNewTcPr();
                tcPr.setVMerge(m);
                table.getRow(x).getCell(0).setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
            }
            offSet += numRows+1;
            startRow += numRows+1;
            XWPFTableRow row = table.createRow();
            XWPFTableCell spaceCell = row.getCell(0);
            spaceCell.getCTTc().addNewTcPr();
            spaceCell.getCTTc().getTcPr().addNewGridSpan();
            spaceCell.getCTTc().getTcPr().getGridSpan().setVal(BigInteger.valueOf(5));
        }
    }
    
    private void addCellText(XWPFTableCell cell, String text, boolean isHeader, boolean passed, boolean newPara, boolean addNewLine, ParagraphAlignment alignment) {
        XWPFParagraph para = cell.getParagraphs().get(cell.getParagraphs().size()-1);
        if(newPara) para = cell.addParagraph();
       
        XWPFRun run = para.createRun();
        run.setFontFamily("Calibri");
        run.setFontSize(9);
        run.setText(formatCellText(text));
        if(addNewLine) {
            run.addCarriageReturn();
        }
        run.setBold(isHeader);
        
        if(!passed) {
            run.setColor("D9534F");
        }
        if(para.getCTP().getPPr() == null) para.getCTP().addNewPPr();
        CTSpacing spacing = para.getCTP().getPPr().isSetSpacing() ? para.getCTP().getPPr().getSpacing() : para.getCTP().getPPr().addNewSpacing();
        spacing.setAfter(BigInteger.valueOf(0));
        spacing.setAfterLines(BigInteger.valueOf(0));
        spacing.setBefore(BigInteger.valueOf(0));
        spacing.setBeforeLines(BigInteger.valueOf(0));
        spacing.setLineRule(STLineSpacingRule.EXACT);
        spacing.setAfterAutospacing(STOnOff.FALSE);
        spacing.setBeforeAutospacing(STOnOff.FALSE);
        spacing.setLine(BigInteger.valueOf(240));
        para.setAlignment(alignment);
        para.setWordWrapped(true);
    }
    
    private String formatCellText(String text) {
        int max = 40;
        if(text != null) {
            String[] splits = text.split(" ");
            String results = "";
            for(String split: splits) {
                if(split.length() > max) {
                    int numSplits = split.length()/max;
                    int start = 0;
                    int end = max;
                    for(int x = 0; x < numSplits; x++) {
                        results += split.substring(start, end);
                        results += '\n';
                        start = end;
                        end += max;
                    }
                    results += split.substring(start, split.length()) + '\n';
                }
                else {
                    results += split + " ";
                }
            }
            return results;
        }
        else {
            return "null";
        }
    }
    
    private void addCheckBox(XWPFTableCell cell, boolean mandatory, boolean passed) {
        XWPFParagraph para = cell.addParagraph();
        
//        headerCell0.getCTTc().addNewTcPr().addNewTcW().setW(BigInteger.valueOf(2000));
        para.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun run = para.createRun();
        run.setFontSize(9);
        para.setBorderBottom(Borders.BASIC_THIN_LINES);
        para.setBorderLeft(Borders.BASIC_THIN_LINES);
        para.setBorderRight(Borders.BASIC_THIN_LINES);
        para.setBorderTop(Borders.BASIC_THIN_LINES);
        if(mandatory) {
            run.setText("X");
        }
        else {
            run.setText(" ");
        }
        run.setBold(true);
        if(!passed) {
            run.setColor("D9534F");
        }
    }
    
    public byte[] generateConformanceReportXLS(ConformanceResults results, boolean engineeringTable, boolean executiveTable, boolean errorTable) {
        try {
            XSSFWorkbook workbook = new XSSFWorkbook();
            //Remove Margin
//            CTSectPr sectPr = document.getDocument().getBody().addNewSectPr();
//            CTPageMar mar = sectPr.addNewPgMar();
//            mar.setLeft(BigInteger.valueOf(150L));
            
            if(engineeringTable) {
                
                generateEngineeringTableExcel(results, workbook, false);
                
            }
            else if(executiveTable) {
                generateExecutiveTableExcel(results, workbook, false);
            }
            else if(errorTable) {
                generateExecutiveTableExcel(results, workbook, true);
            }
            ByteArrayOutputStream out = new ByteArrayOutputStream();

            workbook.write(out);
            return out.toByteArray();
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
        
        return new byte[0];
        
    }
    
    
    private void generateEngineeringTableExcel(ConformanceResults results, XSSFWorkbook workbook, boolean errorOnly) {
       
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        CellStyle errorStyle = workbook.createCellStyle();
        errorStyle.setWrapText(true);
        Font font = workbook.createFont();
        font.setColor(HSSFColor.HSSFColorPredefined.RED.getIndex());
        errorStyle.setFont(font);
        errorStyle.setVerticalAlignment(VerticalAlignment.TOP);
        
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setWrapText(true);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        
        for(RecordType type: results.getRecords()) {
            String sheetName = type.getRecordType();
            if(workbook.getSheet(sheetName) != null) {
                int count = 2;
                sheetName = type.getRecordType() + " (" + count + ")";
                while(workbook.getSheet(sheetName) != null) {
                    count++;
                    sheetName = type.getRecordType() + " (" + count + ")";
                }
                
            }
            XSSFSheet sheet = workbook.createSheet(sheetName);
            
            XSSFRow header = sheet.createRow(0);
            XSSFCell cell0 = header.createCell(0);
            cell0.setCellStyle(headerStyle);
            cell0.setCellValue("Field Number");
            XSSFCell cell1 = header.createCell(1);
            cell1.setCellStyle(headerStyle);
            cell1.setCellValue("Status");
            XSSFCell cell2 = header.createCell(2);
            cell2.setCellStyle(headerStyle);
            cell2.setCellValue("Comments");
            XSSFCell cell3 = header.createCell(3);
            cell3.setCellStyle(headerStyle);
            cell3.setCellValue("Mandatory");
            int numRow = 1;
            for(Field field: type.getFields()) {
                if(!errorOnly || (errorOnly && !field.isPassed())) {
                    XSSFRow row = sheet.createRow(numRow);
                    numRow++;
                    XSSFCell c0 = row.createCell(0);
                    c0.setCellValue(field.getFieldLocation() + " - " + field.getDescription());
                    XSSFCell c1 = row.createCell(1);
                    String status = field.isPassed() ? "MET" : "NOT MET";
                    c1.setCellValue(status);
                    XSSFCell c2 = row.createCell(2);
                    if(field.getFieldLocation() != null && field.getFieldLocation().endsWith(".999")) {
                        c2.setCellValue("Field Value: VALUE REDACTED" );
                    }
                    else {
                        c2.setCellValue("Field Value: " + field.getValue());
                    }
                    if(!field.isPassed()) {
                        String cellText = "Field Value: " + field.getValue();
                        int errCount = 1;
                        for(FieldError err: field.getErrors()) {
                            if(err.getDescription() != null && !err.getDescription().isEmpty()) {
                                cellText += '\n' + "Error " + errCount + " Description: " + err.getDescription();
                            }
                            else {
                                cellText += '\n' + "Error " + errCount + " Description: N/A";
                            }
                            if(err.getMessage()!= null && !err.getMessage().isEmpty()) {
                                cellText += '\n' + "Error " + errCount + " Message: " + err.getMessage();
                            }
                            else {
                                cellText += '\n' + "Error " + errCount + " Message: N/A";
                            }
                            errCount++;
                        }
                        c2.setCellValue(cellText);
                        row.setHeightInPoints(((3*sheet.getDefaultRowHeightInPoints())));
                        
                        
                    }
                    XSSFCell c3 = row.createCell(3);
                    c3.setCellValue(field.getMandatoryOptional());
                    if(!field.isPassed()) {
                        c0.setCellStyle(errorStyle);
                        c1.setCellStyle(errorStyle);
                        c2.setCellStyle(errorStyle);
                        c3.setCellStyle(errorStyle);
                    }
                    else {
                        c0.setCellStyle(style);
                        c1.setCellStyle(style);
                        c2.setCellStyle(style);
                        c3.setCellStyle(style);
                    }
                }
            }
            sheet.setColumnWidth(0, 12000);
            sheet.setColumnWidth(2, 27000);
            sheet.setColumnWidth(3, 3000);
        }
    }
    
    private void generateExecutiveTableExcel(ConformanceResults results, XSSFWorkbook workbook, boolean errorOnly) {
        CellStyle style = workbook.createCellStyle();
        style.setWrapText(true);
        style.setVerticalAlignment(VerticalAlignment.TOP);
        CellStyle errorStyle = workbook.createCellStyle();
        errorStyle.setWrapText(true);
        Font font = workbook.createFont();
        font.setColor(HSSFColor.HSSFColorPredefined.RED.getIndex());
        errorStyle.setFont(font);
        errorStyle.setVerticalAlignment(VerticalAlignment.TOP);
        
        CellStyle headerStyle = workbook.createCellStyle();
        headerStyle.setWrapText(true);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        
        
        for(RecordType type: results.getRecords()) {
            XSSFSheet sheet = null;
            int numRow = 1;
            for(Field field: type.getFields()) {
                if(!errorOnly || (errorOnly && !field.isPassed())) {
                    if(sheet == null) {
                        String sheetName = type.getRecordType();
                        if(workbook.getSheet(sheetName) != null) {
                            int count = 2;
                            sheetName = type.getRecordType() + " (" + count + ")";
                            while(workbook.getSheet(sheetName) != null) {
                                count++;
                                sheetName = type.getRecordType() + " (" + count + ")";
                            }
                        }
                        sheet = workbook.createSheet(sheetName);
                        XSSFRow header = sheet.createRow(0);
                        XSSFCell cell0 = header.createCell(0);
                        cell0.setCellStyle(headerStyle);
                        cell0.setCellValue("Field Number");
                        XSSFCell cell1 = header.createCell(1);
                        cell1.setCellStyle(headerStyle);
                        cell1.setCellValue("Status");
                        XSSFCell cell2 = header.createCell(2);
                        cell2.setCellStyle(headerStyle);
                        cell2.setCellValue("Comments");
                        XSSFCell cell3 = header.createCell(3);
                        cell3.setCellStyle(headerStyle);
                        cell3.setCellValue("Mandatory");
                    }
                    XSSFRow row = sheet.createRow(numRow);
                    numRow++;
                    XSSFCell c0 = row.createCell(0);
                    c0.setCellValue(field.getFieldLocation() + " - " + field.getDescription());
                    XSSFCell c1 = row.createCell(1);
                    String status = field.isPassed() ? "MET" : "NOT MET";
                    c1.setCellValue(status);
                    XSSFCell c2 = row.createCell(2);
                    if(!field.isPassed()) {
                        String cellText = "Field Value: " + field.getValue();
                        int errCount = 1;
                        for(FieldError err: field.getErrors()) {
                            if(err.getDescription() != null && !err.getDescription().isEmpty()) {
                                cellText += '\n' + "Error " + errCount + " Description: " + err.getDescription();
                            }
                            else {
                                cellText += '\n' + "Error " + errCount + " Description: N/A";
                            }
                            if(err.getMessage()!= null && !err.getMessage().isEmpty()) {
                                cellText += '\n' + "Error " + errCount + " Message: " + err.getMessage();
                            }
                            else {
                                cellText += '\n' + "Error " + errCount + " Message: N/A";
                            }
                            errCount++;
                        }
                        c2.setCellValue(cellText);
                        row.setHeightInPoints(((3*sheet.getDefaultRowHeightInPoints())));
                    }
                    XSSFCell c3 = row.createCell(3);
                    c3.setCellValue(field.getMandatoryOptional());
                    if(!field.isPassed()) {
                        c0.setCellStyle(errorStyle);
                        c1.setCellStyle(errorStyle);
                        c2.setCellStyle(errorStyle);
                        c3.setCellStyle(errorStyle);
                    }
                    else {
                        c0.setCellStyle(style);
                        c1.setCellStyle(style);
                        c2.setCellStyle(style);
                        c3.setCellStyle(style);
                    }
                }
            }
            if(sheet != null) {
                sheet.setColumnWidth(0, 12000);
                sheet.setColumnWidth(2, 27000);
                sheet.setColumnWidth(3, 3000);
            }
        }
    }
}
