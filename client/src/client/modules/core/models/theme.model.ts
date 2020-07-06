export class Theme {
  constructor(
    public className: string,
    public name: string,
    public primaryColorCode: string,
    public accentColorCode: string,
    public tableColorClass = '',
    public isDark: boolean
  ) {}
}
