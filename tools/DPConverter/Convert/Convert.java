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
import java.util.Map.Entry;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Convert {
    //Declare the variable settings as a HashMap to read in the settings
    static Map<String, String> settings = new LinkedHashMap<String, String>();
    static Map<String, Map<String, String>> sections = new LinkedHashMap<String, Map<String, String>>();

    /**
    * dotproduct Settings Converter
    * @author Derek Marr
    * @email dezmond.marr@Gmail.com
    */
    public static void main(String[] args) {
        System.out.println("#### dotproduct settings converter");
        System.out.println("#### Convert Subspace map configs to dotproduct configs");
        System.out.println("#### Only execute this program in the same directory as server.cfg!");
        System.out.println("#### Author: Derek Marr (Dezmond) with guidance from Sharvil!");
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
                        Pattern p = Pattern.compile("\\[(.*)\\]");
                        Matcher m = p.matcher(e);

                        while (m.find()) {
                            String currentSection = m.group(1);
                            settings = new LinkedHashMap<String, String>();
                            sections.put(currentSection, settings);
                            /*for (Entry<String, Map<String, String>> entry : sections.entrySet()) {
                                String keys = entry.getKey();
                                Map<String, String> values = entry.getValue();
                                System.out.println(keys + values);
                            }*/
                        }

                    } else {
                        int bvalue = e.indexOf("=");
                        String value = e.substring(bvalue + 1);
                        int bkey = e.lastIndexOf("=");
                        String key = e.substring(0, bkey + 1);
                        settings.put(key.replace("=", ""), value);
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

                String mapname = sections.get("Notes").get("MapName");
                String owner = sections.get("Maker").get("Maker");
                String kp = sections.get("Kill").get("KillPointsPerFlag");
                String spd = sections.get("Misc").get("SendPositionDelay");
                String fspd = sections.get("Misc").get("ExtraPositionData");
                String width = "1024";
                String height = "1024";
                String sradius = "500";
                String pcount = sections.get("Prize").get("MultiPrizeCount");
                String prize = "0";
                String gupgrade = sections.get("PrizeWeight").get("Gun");
                String fullcharge = sections.get("PrizeWeight").get("Recharge");
                String bounceb = sections.get("PrizeWeight").get("BouncingBullets");

                System.out.println("Attempting to write settings to the new file...");

                out.write("# These settings were created by the dotproduct Converter.");
                out.newLine();
                out.write("# Map Name: " + mapname);
                out.newLine();
                out.write("# Creator: " + owner);
                out.newLine();

                out.write("{");
                out.newLine();
                out.write("\"game\":{");
                out.newLine();
                out.write("\"killPoints\": " + kp + "\n}");
                out.newLine();
                out.write("\"network\":{");
                out.newLine();
                out.write("\"sendPositionDelay\": " + spd + "\n");
                out.write("\"fastSendPositionDelay\": " + fspd + "\n}");
                out.newLine();
                out.newLine();
                out.write("\"map\":{");
                out.newLine();
                out.write("\"width\": " + width + "\n");
                out.write("\"height\": " + height + "\n");
                out.write("\"spawnRadius\": " + sradius + "\n}");
                out.newLine();
                out.newLine();
                out.write("\"prize\":{");
                out.newLine();
                out.write("\"count\": " + pcount + "\n");
                out.write("\"weights\": [" + prize + "," + gupgrade + "," + fullcharge + "," + bounceb + "]" + "\n}");
                out.newLine();
                out.newLine();

                for (Entry<String, Map<String, String>> entry : sections.entrySet()) {
                    String keys = entry.getKey();
                    Map<String, String> values = entry.getValue();
                    String e = keys;

                    if (e.equals("Warbird") || e.equals("Javelin") || e.equals("Spider") || e.equals("Leviathan") || e.equals("Terrier")
                            || e.equals("Weasal") || e.equals("Lancaster") || e.equals("Shark")) {
                        String shipName = e;
                        out.write("\"ships\":");
                        getShipSettings(shipName, out);

                    }

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

    private static void getShipSettings(String shipName, BufferedWriter out) {
        String name = shipName;
        String xrad = sections.get(name).get("Radius");
        String yrad = sections.get(name).get("Radius");
        String bouncef = sections.get(name).get("BounceFactor");
        String rotrad = sections.get(name).get("InitialRotation");
        String speedPix = sections.get(name).get("InitialSpeed");
        String maxEn = sections.get(name).get("MaximumEnergy");
        String accTick = sections.get(name).get("MaximumThrust");
        String afterSpeed = sections.get(name).get("MaximumSpeed");
        String afterAcc = sections.get(name).get("MaximumThrust");
        String afterEn = sections.get(name).get("AfterburnerEnergy");
        String rechargeRate = sections.get(name).get("InitialRecharge");
        String respawnDelay = "500";
        String fireEnergy = sections.get(name).get("BulletFireEnergy");
        String fireEnergyUp = sections.get(name).get("BombFireUpgrade");
        String speed = sections.get(name).get("BulletSpeed");
        String fireDelay = sections.get(name).get("BulletFireDelay");
        String lifetime = sections.get(name).get("BulletAliveTime");
        String damage = sections.get("Bullet").get("ExactDamage");
        String damageUpgrade = sections.get("Bullet").get("BulletDamageUpgrade");
        String maxLevel = sections.get(name).get("BulletDamageLevel");
        String bounce = "false";
        String blastRadius = sections.get("Bomb").get("ProximityDistance");
        String blastRadiusUp = sections.get(name).get("ProximityDistance");
        String bounceCount = sections.get(name).get("BombBounceCount");
        String recoilAcceleration = sections.get(name).get("Radius");

        try {
            out.newLine();
            out.write("[");
            out.newLine();
            out.write("{");
            out.newLine();
            out.write("\"name\": " + name + "\n");
            out.write("\"xRadius\": " + xrad + "\n");
            out.write("\"yRadius\": " + yrad + "\n");
            out.write("\"bounceFactor\": " + bouncef + "\n");
            out.write("\"rotationRadiansPerTick\": " + rotrad + "\n");
            out.write("\"speedPixelsPerTick\": " + speedPix + "\n");
            out.write("\"maxEnergy\": " + maxEn + "\n");
            out.write("\"accelerationPerTick\": " + accTick + "\n");
            out.write("\"afterburnerMaxSpeed\": " + afterSpeed + "\n");
            out.write("\"afterburnerAcceleration\": " + afterAcc + "\n");
            out.write("\"afterburnerEnergy\": " + afterEn + "\n");
            out.write("\"rechargeRate\": " + rechargeRate + "\n");
            out.write("\"respawnDelay\": " + respawnDelay + "\n");
            out.write("\"bullet\":{");
            out.write("\"fireEnergy\": " + fireEnergy + "\n");
            out.write("\"speed\": " + speed + "\n");
            out.write("\"fireDelay\": " + fireDelay + "\n");
            out.write("\"lifetime\": " + lifetime + "\n");
            out.write("\"damage\": " + damage + "\n");
            out.write("\"damageUpgrade\": " + damageUpgrade + "\n");
            out.write("\"maxlLevel\": " + maxLevel + "\n");
            out.write("\"bounces\": " + bounce + "\n}");
            out.newLine();
            out.write("\"bomb\":{");
            out.newLine();
            out.write("\"fireEnergy\": " + fireEnergy + "\n");
            out.write("\"fireEnergyUpgrade\": " + fireEnergyUp + "\n");
            out.write("\"speed\": " + speed + "\n");
            out.write("\"fireDelay\": " + fireDelay + "\n");
            out.write("\"lifetime\": " + lifetime + "\n");
            out.write("\"damage\": " + damage + "\n");
            out.write("\"damageUpgrade\": " + damageUpgrade + "\n");
            out.write("\"blastRadius\": " + blastRadius + "\n");
            out.write("\"blastRadiusUpgrade\": " + blastRadiusUp + "\n");
            out.write("\"bounceCount\": " + bounceCount + "\n");
            out.write("\"recoilAcceleraion\": " + name + "\n");
            out.write("}");
            out.newLine();
            out.write("},");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
