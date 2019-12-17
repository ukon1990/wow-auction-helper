export class MenuItem {
  /* istanbul ignore next */
  constructor(
    public text: string,
    public title: string,
    public children: MenuItem[] = [],
    public routerLink?: string,
    public routerLinkFull?: string,
    public badgeContent?: Function
  ) {}
}
