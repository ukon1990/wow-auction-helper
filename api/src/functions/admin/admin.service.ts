import {AdminRepository} from "./admin.repository";

export class AdminService {
  private readonly repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }
  optimizeTable(table: string) {
    return this.repository.optimizeTable(table);
  }
}