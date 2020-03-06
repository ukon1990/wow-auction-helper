export class ItemSelection {
  constructor(
    public type: 'item' | 'pet' | 'auction' | 'recipe',
    public value: any,
    public idName: string = 'id') {
  }
}
