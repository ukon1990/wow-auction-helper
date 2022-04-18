export interface DashboardMinimal {
  id: string;
  parentId: string;
  title: string;
  description: string;
  tags: string[];
  createdBy: string;
  lastModified: number;
  isImporting?: boolean;
  isLoading?: boolean;
}