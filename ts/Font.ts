export default class Font {
  private static readonly DEFAULT_TINY_FONT_ = new Font('Subspace Tiny', 8, 10);
  private static readonly DEFAULT_SMALL_FONT_ = new Font('Subspace Small', 8, 10);
  private static readonly DEFAULT_REGULAR_FONT_ = new Font('Subspace Regular', 12, 15);
  private static readonly DEFAULT_LARGE_FONT_ = new Font('Subspace Large', 18, 20);
  private static readonly DEFAULT_HUGE_FONT_ = new Font('Subspace Huge', 24, 30);

  private name_ : string;
  private height_ : number;
  private lineHeight_ : number;

  constructor(name : string, height : number, lineHeight : number) {
    this.name_ = name;
    this.height_ = height;
    this.lineHeight_ = lineHeight;
  }

  public getHeight() : number {
    return this.height_;
  }

  public getLineHeight() : number {
    return this.lineHeight_;
  }

  public toString() : string {
    return '' + this.height_ + 'px/' + this.lineHeight_ + 'px ' + this.name_;
  }

  public static playerFont() : Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static scoreboardFont() : Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static chatFont() : Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }

  public static notificationsFont() : Font {
    return Font.DEFAULT_REGULAR_FONT_;
  }
}
