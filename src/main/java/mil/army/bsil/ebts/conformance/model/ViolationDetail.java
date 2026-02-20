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
public class ViolationDetail implements Comparable<ViolationDetail>{
    
    private String fieldLocation;
    private String message;
    private boolean present;

    public ViolationDetail() {
    }

    public String getFieldLocation() {
        return fieldLocation;
    }

    public void setFieldLocation(String fieldLocation) {
        this.fieldLocation = fieldLocation;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isPresent() {
        return present;
    }

    public void setPresent(boolean present) {
        this.present = present;
    }
    
    public int compareTo(ViolationDetail compare) {
//        System.out.println("****************COMPARE****************");
//        System.out.println(this.fieldLocation);
//        System.out.println(compare.fieldLocation);
        if(this.fieldLocation.equals(compare.fieldLocation)) {
            return 0;
        }
        
        String[] splits1 = this.fieldLocation.split("\\.");
        String[] splits2 = compare.fieldLocation.split("\\.");
        for(int x = 0; x < splits1.length; x++) {
            if(x >= splits2.length) {
                return 1;
            }
//            System.out.println(splits1[x] + " " + splits2[x]);
            else if(splits1[x].equals(splits2[x])) {
                continue;
            }
            else if(x == 0 && (splits1[x].contains("[") || splits2[x].contains("[")) ) {
                Integer int1 = null;
                Integer int2 = null;
                if(splits1[x].contains("[") && !splits2[x].contains("[")) {
                    int1 = Integer.parseInt(splits1[x].split("\\[")[0]);
                    int2 = Integer.parseInt(splits2[x]);
                    if(int1.equals(int2)) {
                        return 1;
                    }
                }
                else if(splits2[x].contains("[") && !splits1[x].contains("[")) {
                    int1 = Integer.parseInt(splits1[x]);
                    int2 = Integer.parseInt(splits2[x].split("\\[")[0]);
                    if(int1.equals(int2)) {
                        return -1;
                    }
                }
                else if(splits2[x].contains("[") && splits1[x].contains("[")) {
                    int1 = Integer.parseInt(splits1[x].split("\\[")[0]);
                    int2 = Integer.parseInt(splits2[x].split("\\[")[0]);
                    if(int1.equals(int2)) {
                        int1 = Integer.parseInt(splits1[x].split("\\[")[1].split("]")[0]);
                        int2 = Integer.parseInt(splits2[x].split("\\[")[1].split("]")[0]);
                        if(int1.equals(int2)) {
                            continue;
                        }
                    }
                }
                return int1.compareTo(int2);
            }
            else if(x > 0 && !splits1[x].contains("*") && !splits2[x].contains("*")) {
                Integer int1 = Integer.parseInt(splits1[x]);
                Integer int2 = Integer.parseInt(splits2[x]);
                if(int1 == int2) {
                    continue;
                }
                else {
                    return int1.compareTo(int2);
                }
            }
            else if(x > 0 && (splits1[x].contains("*") || splits2[x].contains("*")) ) {
                if(splits1[x].contains("*") && !splits2[x].contains("*")) {
                    return 1;
                }
                else if(!splits1[x].contains("*") && splits2[x].contains("*")) {
                    return -1;
                }
                else if(splits1[x].contains("*") && splits2[x].contains("*")) {
                    continue;
                }
            }
            else {
                Integer int1 = Integer.parseInt(splits1[x]);
                Integer int2 = Integer.parseInt(splits2[x]);
                if(int1.equals(int2)) {
                    continue;
                }
                else if(int1 > int2) {
                    return 1;
                }
                else {
                    return -1;
                }
            }
            
        }
        return 1;
    }
    
}
