import { CompanyProfileEntity, UpdatePreferencesDTO } from "../domain/types";

export interface ICompanyProfileRepository {
  getProfile(): Promise<CompanyProfileEntity>;
  updatePreferences(dto: UpdatePreferencesDTO): Promise<CompanyProfileEntity>;
}
