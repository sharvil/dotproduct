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
        printSettings();
    }

    private static void initiateConvert() {
        try {
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

                String kp = "20";
                String spd = sections.get("Misc").get("SendPositionDelay");
                int fspd = Math.max(1, Integer.parseInt(spd) / 4);
                String width = "1024";
                String height = "1024";
                String sradius = "500";
                String pcount = sections.get("Prize").get("MultiPrizeCount");
                String prize = "0";
                String gupgrade = sections.get("PrizeWeight").get("Gun");
                String bupgrade = sections.get("PrizeWeight").get("Bomb");
                String fullcharge = sections.get("PrizeWeight").get("Recharge");
                String bounceb = sections.get("PrizeWeight").get("BouncingBullets");

                System.out.println("Attempting to write settings to the new file...");

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
                out.write("\"weights\": [" + prize + ", " + gupgrade + ", " + bupgrade + ", " + fullcharge + ", " + bounceb + "]" + "\n}");
                out.newLine();
                out.newLine();

                out.write("\"ships\":\n");
                out.write("[\n");
                for (Entry<String, Map<String, String>> entry : sections.entrySet()) {
                    String keys = entry.getKey();
                    Map<String, String> values = entry.getValue();
                    String e = keys;

                    if (e.equals("Warbird") || e.equals("Javelin") || e.equals("Spider") || e.equals("Leviathan") || e.equals("Terrier")
                            || e.equals("Weasel") || e.equals("Lancaster") || e.equals("Shark")) {
                        String shipName = e;
                        printShipSettings(shipName, out);
                    }
                }
                out.write("]\n");
                System.out.println("The file has been successfully created with the settings in it.");
                out.close();

            } catch (IOException e) {
                e.printStackTrace();
            }
        } else {
            System.out.println("Error: The file already exists...");
        }
    }

    private static void printShipSettings(String shipName, BufferedWriter out) {
        String name = shipName;
        String xrad = "14";
        String yrad = "14";
        double bouncef = 16.0 / Integer.parseInt(sections.get("Misc").get("BounceFactor"));
        String rotrad = sections.get(name).get("InitialRotation");
        String speedPix = sections.get(name).get("InitialSpeed");
        String maxEn = sections.get(name).get("MaximumEnergy");
        String accTick = sections.get(name).get("MaximumThrust");
        String afterSpeed = sections.get(name).get("MaximumSpeed");
        String afterAcc = sections.get(name).get("MaximumThrust");
        String afterEn = sections.get(name).get("AfterburnerEnergy");
        String rechargeRate = sections.get(name).get("InitialRecharge");
        String respawnDelay = "500";
        String bulletFireEnergy = sections.get(name).get("BulletFireEnergy");
        String bombFireEnergy = sections.get(name).get("BombFireEnergy");
        String bombFireEnergyUpgrade = sections.get(name).get("BombFireEnergyUpgrade");
        String speed = sections.get(name).get("BulletSpeed");
        String bulletFireDelay = sections.get(name).get("BulletFireDelay");
        String bombFireDelay = sections.get(name).get("BombFireDelay");
        String bulletAliveTime = sections.get("Bullet").get("BulletAliveTime");
        String bombAliveTime = sections.get("Bomb").get("BombAliveTime");
        String damage = sections.get("Bullet").get("ExactDamage");
        String damageUpgrade = sections.get("Bullet").get("BulletDamageUpgrade");
        int maxGuns = Integer.parseInt(sections.get(name).get("MaxGuns")) - 1;
        int maxBombs = Integer.parseInt(sections.get(name).get("MaxBombs")) - 1;
        String bounce = "false";
        String blastRadius = sections.get("Bomb").get("BombExplodePixels");
        String blastRadiusUp = blastRadius;
        String bounceCount = sections.get(name).get("BombBounceCount");
        String bombThrust = sections.get(name).get("BombThrust");

        try {
            out.write("{\n");
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
            out.write("\"bullet\":{\n");
            out.write("\"fireEnergy\": " + bulletFireEnergy + "\n");
            out.write("\"speed\": " + speed + "\n");
            out.write("\"fireDelay\": " + bulletFireDelay + "\n");
            out.write("\"lifetime\": " + bulletAliveTime + "\n");
            out.write("\"damage\": " + damage + "\n");
            out.write("\"damageUpgrade\": " + damageUpgrade + "\n");
            out.write("\"maxlLevel\": " + maxGuns + "\n");
            out.write("\"bounces\": " + bounce + "\n}");
            out.newLine();
            out.write("\"bomb\":{");
            out.newLine();
            out.write("\"fireEnergy\": " + bombFireEnergy + "\n");
            out.write("\"fireEnergyUpgrade\": " + bombFireEnergyUpgrade + "\n");
            out.write("\"speed\": " + speed + "\n");
            out.write("\"fireDelay\": " + bombFireDelay + "\n");
            out.write("\"lifetime\": " + bombAliveTime + "\n");
            out.write("\"damage\": " + damage + "\n");
            out.write("\"damageUpgrade\": " + damageUpgrade + "\n");
            out.write("\"maxLevel\": " + maxBombs + "\n");
            out.write("\"blastRadius\": " + blastRadius + "\n");
            out.write("\"blastRadiusUpgrade\": " + blastRadiusUp + "\n");
            out.write("\"bounceCount\": " + bounceCount + "\n");
            out.write("\"recoilAcceleration\": " + bombThrust + "\n");
            out.write("}");
            out.newLine();
            out.write("},");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
