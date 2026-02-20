/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

/**
 *
 * @author sbattjer
 */
@SpringBootApplication
public class Main {    
    private int maxUploadSizeInMb = 100 * 1024 * 1024; //10 MB
    
    public static void main(String[] args) {
        SpringApplication.run(Main.class, args);
        
        System.out.println("\n\n\t\t\t######################################");
        System.out.println("\t\t\t### BSIL EBTS Conformance is Ready ###");
        System.out.println("\t\t\t######################################\n\n");
    }
    
//    @Bean
//    public TomcatEmbeddedServletContainerFactory tomcatEmbedded() {
//        TomcatEmbeddedServletContainerFactory tomcat = new TomcatEmbeddedServletContainerFactory();
//        
//        tomcat.addConnectorCustomizers((TomcatConnectorCustomizer) connector -> {
//            if((connector.getProtocolHandler() instanceof AbstractHttp11Protocol<?>)) {
//                ((AbstractHttp11Protocol<?>) connector.getProtocolHandler()).setMaxSwallowSize(-1);
//            }
//        });
//        return tomcat;
//    }
}