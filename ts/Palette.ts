export default class Palette {
  public static borderColor() : string {
    return '#222';
  }

  public static radarBgColor() : string {
    return 'rgba(0, 20, 0, 0.65)';
  }

  public static radarTileColor() : string {
    return 'rgba(255, 255, 255, 0.3)';
  }

  public static radarPrizeColor() : string {
    return 'rgba(0, 255, 0, 0.8)';
  }

  public static foeColor(alpha? : number) : string {
    if (alpha === undefined) {
      alpha = 1;
    }
    return 'rgba(198, 198, 247, ' + alpha + ')';
  }

  public static chatNameColor() : string {
    return 'rgba(155, 215, 254, 1)';
  }

  public static chatTextColor() : string {
    return 'rgba(190, 190, 190, 1)';
  }

  public static friendColor(alpha? : number) : string {
    if (alpha === undefined) {
      alpha = 1;
    }
    return 'rgba(255, 206, 99, ' + alpha + ')';
  }

  public static notificationsColor(alpha? : number) : string {
    if (alpha === undefined) {
      alpha = 1;
    }
    return 'rgba(115, 255, 99, ' + alpha + ')';
  }

  public static personalNotificationsColor(alpha? : number) : string {
    return Palette.friendColor(alpha);
  }

  public static enterNotificationsColor(alpha? : number) : string {
    return Palette.foeColor(alpha);
  }

  public static criticalEnergyWarningColor() : string {
    return 'rgb(200, 0, 0)';
  }

  public static lowEnergyWarningColor() : string {
    return Palette.friendColor();
  }
}
