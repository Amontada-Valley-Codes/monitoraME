import { CompanyProfileEntity } from "../domain/types";

export interface ICompanyProfileRepository {
  getProfile(): Promise<CompanyProfileEntity>;
}
