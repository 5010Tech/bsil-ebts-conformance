/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package mil.army.bsil.ebts.conformance.model;

/**
 *
 * @author sbattjer
 */
public class FieldError {
    private String description;
    private String message;

    public FieldError() {
    }

    public FieldError(String description, String message) {
        this.description = description;
        this.message = message;
    }
    
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
    
    
}
