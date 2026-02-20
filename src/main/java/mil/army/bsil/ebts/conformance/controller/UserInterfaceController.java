/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.Map;
import mil.army.bsil.ebts.conformance.manager.ConformanceManager;
import mil.army.bsil.ebts.conformance.model.ConformanceResults;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItem;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamSource;


/**
 *
 * @author sbattjer
 */
@Controller
public class UserInterfaceController {
    
    @Autowired
    private ConformanceManager conformanceManager;
    
    @GetMapping("/")
    public String index() {
        return "index";
    }
    
    
    
    @PostMapping("/result")
    public String imageFileUpload(@RequestParam("file") MultipartFile file, @RequestParam("spec") String spec, Map<String, Object> model) {
        ConformanceResults results = null;
        if(file.isEmpty()) {
            
            return "results";
        }
        try {
            String[] splits = file.getOriginalFilename().split("\\.");
            File convFile = File.createTempFile(splits[0], splits[1]);
            FileOutputStream fos = new FileOutputStream(convFile); 
            fos.write(file.getBytes());
            fos.close(); 
            results = conformanceManager.validateFile(spec, getSpecFileFromKey(spec), convFile, file.getOriginalFilename(), file.getName());
            ObjectMapper mapper = new ObjectMapper();
            model.put("resultString", mapper.writeValueAsString(results));
            model.put("results", results);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        return "result";
    }
    
    @PostMapping("/externalXML")
    public String externalXMLUpload(@RequestParam("xml") String xml, @RequestParam("spec") String spec, @RequestParam("fileName") String fileName, Map<String, Object> model) {
        ConformanceResults results = null;
        try {
            File file = File.createTempFile(fileName, ".xml");
            FileUtils.writeStringToFile(file, xml);
            InputStream stream = new ByteArrayInputStream(xml.getBytes());
            results = conformanceManager.validateFile(spec, getSpecFileFromKey(spec), file, file.getName(), file.getName());
            ObjectMapper mapper = new ObjectMapper();
            model.put("resultString", mapper.writeValueAsString(results));
            model.put("results", results);
        }
        catch(Exception e) {
            e.printStackTrace();
        }
        return "result";
    }
    
    
    private String getSpecFileFromKey(String key) {
        if(key.equals("EBTS 1.2")) {
            return "ebts/EBTS1.2/dod-ebts-1.2.txt";
        }
        else if(key.equals("EBTS 4.1")) {
            return "/ebts/EBTS4.1/dod-ebts-4.1.txt";
        }
        else if(key.equals("FBI 10.0")) {
            return "/ebts/FBI10.0/ebts-10.0.txt";
        }
        else if(key.equals("NATO STANAG 4715")) {
            return "/ebts/STANAG/nato-stanag-4715-2.txt";
        }
        else if(key.equals("INTERPOL 5.3")) {
            return "/ebts/INTERPOL/interpol-5.3.txt";
        }
        else if(key.equals("INTERPOL 6.0")) {
            return "/ebts/INTERPOL/interpol-6.0.txt";
        }
        
        return null;
    }
}
