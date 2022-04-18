export interface RowAction {
  icon: string;
  tooltip: string;
  text?: string;
  // Copy of: ThemePalette from - @angular/material/core
  color?: 'primary' | 'accent' | 'warn' | undefined;
  callback: (row: any, index: number) => void;
}