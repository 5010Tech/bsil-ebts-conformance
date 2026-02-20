/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import mil.army.bsil.ebts.conformance.manager.ConformanceManager;
import mil.army.bsil.ebts.conformance.manager.DocumentManager;
import mil.army.bsil.ebts.conformance.model.ConformanceResults;
import mil.army.bsil.ebts.conformance.model.Specifications;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 *
 * @author sbattjer
 */
@RestController
public class ConformanceController {
    
    @Autowired
    private DocumentManager documentManager;
    
    @Autowired
    private ConformanceManager conformanceManager;
    
    @GetMapping("/specs")
    public Specifications getSpecifications() {
        Specifications spec = new Specifications();
        List<String> specs = new ArrayList<String>();
        specs.add("EBTS 1.2");
        specs.add("EBTS 4.1");
        specs.add("FBI 10.0");
        spec.setSpecs(specs);
        return spec;
    }
    
    @PostMapping("/export")
    @ResponseBody
    public void exportResults(HttpServletRequest request, HttpServletResponse response, 
//            @RequestParam(value="results", required=false) String results,
            @RequestParam(value="word", defaultValue="false", required=true) Boolean wordDocument,
            @RequestParam(value="engineerTable", defaultValue="false", required=false) Boolean engineerTable,
            @RequestParam(value="executiveTable", defaultValue="false", required=false) Boolean executiveTable,
            @RequestParam(value="errorTable", defaultValue="false", required=false) Boolean errorTable,
            @RequestParam(value="xlsExport", defaultValue="engineerTable", required=false) String xlsExport) {
//        System.out.println(results);
        try {
            ObjectMapper mapper = new ObjectMapper();
            ConformanceResults res = conformanceManager.getLastResults();
//            System.out.println("RESULTS: " + results);
//            if(results != null) {
//                res = mapper.readValue(results, ConformanceResults.class);
//            }
            response.reset();
            byte[] bytes = null;
            if(wordDocument) {
                bytes = documentManager.generateConformanceReport(res, engineerTable, executiveTable, errorTable);
                response.setContentType("application/msword");
                String fileName = res.getTransactionFileName() + "_Report.doc";
                response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName +"\"");
            }
            else {
                boolean engineerTableXls=false, executiveTableXls=false, errorTableXls=false;
                if(xlsExport.equals("engineerTable")) {
                    engineerTableXls = true;
                }
                else if(xlsExport.equals("executiveTable")) {
                    executiveTableXls = true;
                }
                else if(xlsExport.equals("errorTable")) {
                    errorTableXls = true;
                }
                bytes = documentManager.generateConformanceReportXLS(res, engineerTableXls, executiveTableXls, errorTableXls);
                response.setContentType("application/ms-excel");
                String fileName = res.getTransactionFileName() + "_Report.xls";
                response.setHeader("Content-Disposition", "attachment; filename=\"" + fileName +"\"");
            }
            response.getOutputStream().write(bytes);
        }
        catch(Exception ex) {
            ex.printStackTrace();
        }
    }
    
}
