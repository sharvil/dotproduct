package DPConverter.Convert;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Convert {
    //Declare the variable settings as a HashMap to read in the settings
    static Map<String, String> settings = new LinkedHashMap<String, String>();
    static Map<String, String> sections = new LinkedHashMap<String, String>();

    /**
    * DotProduct Settings Converter
    * @author Derek Marr
    */
    public static void main(String[] args) {
        System.out.println("#### DotProduct Settings Converter");
        System.out.println("#### Convert Subspace Map Configs to DotProduct Configs");
        System.out.println("#### Only execute this program in the same directory that server.cfg is present!");
        System.out.println("#### Author: Derek Marr (Dezmond) with guadiance from Sharvil!");
        System.out.println(" ");

        initiateConvert();

    }

    private static void initiateConvert() {
        try {
            settings.clear();
            sections.clear();
            //Reads in the all the contents of the file
            String dir = System.getProperty("user.dir");

            File f = new File(dir + "/server.cfg");
            if (f.exists()) {
                BufferedReader input = new BufferedReader(new FileReader(dir + "/server.cfg"));
                String e = "";
                while ((e = input.readLine()) != null) {
                    if (e.startsWith("[")) {
                        if(e.equals("[Warbird]") || e.equals("[Javelin]") || e.equals("[Spider]") || e.equals("[Leviathan]") || e.equals("[Terrier]") || e.equals("[Weasal]") || e.equals("[Lancaster]") || e.equals("[Shark]")){
                        Pattern p = Pattern.compile("\\[(.*?)\\]");
                        Matcher m = p.matcher(e);

                        while(m.find()) {
                            String currentSection = m.group(1);
                            sections.put(currentSection, settings.toString());
                            for (Map.Entry<String, String> entry : sections.entrySet()) {
                                String keys = entry.getKey();
                                String values = entry.getValue();
                                System.out.println(keys + values);
                            }
                        }
                        }
                    } else {
                        int bvalue = e.indexOf("=");
                        String value = e.substring(bvalue + 1);
                        int bkey = e.lastIndexOf("=");
                        String key = e.substring(0, bkey + 1);
                        settings.put(key.replace("=", ":"), value);
                    }
                }

                input.close();
                printSettings();

            } else {
                System.out.println("Error: Settings.cfg cannot be found in the same directory that this program is being run.");
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    private static void printSettings() {
        //System.out.println("Saved, Settings count: " + settings.size());
        File set = new File("settings.json");
        if (!set.exists()) {
            try {
                set.createNewFile();
                System.out.println("File Created: settings.json");
                FileWriter fstream = new FileWriter("settings.json");
                BufferedWriter out = new BufferedWriter(fstream);
                String mapname = settings.get("MapName:");
                String owner = settings.get("Maker:");

                System.out.println("Attempting to write settings to the new file...");

                out.write("# These settings were created by the DotProduct Converter.");
                out.newLine();
                out.write("# Map Name: " + mapname);
                out.newLine();
                out.write("# Creator: " + owner);

                for (Map.Entry<String, String> entry : settings.entrySet()) {
                    String keys = entry.getKey();
                    String values = entry.getValue();

                    out.write(keys + values);
                    out.newLine();

                }
                System.out.println("The file has been successfully created with the settings in it.");
                out.close();

            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Error: The file already exists...");
        }

    }

}
