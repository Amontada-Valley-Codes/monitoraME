import { ICompanyProfileRepository } from "../services/company-profile.repository";
import { CompanyProfileEntity, UpdatePreferencesDTO } from "../domain/types";
import { companyDemoFixture } from "./company-demo-fixture";

export class MockCompanyProfileRepository implements ICompanyProfileRepository {
  async getProfile(): Promise<CompanyProfileEntity> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...companyDemoFixture };
  }

  async updatePreferences(dto: UpdatePreferencesDTO): Promise<CompanyProfileEntity> {
    await new Promise((resolve) => setTimeout(resolve, 600));
    companyDemoFixture.cnaes = dto.cnaes;
    companyDemoFixture.municipiosInteresse = dto.municipiosInteresse;
    return { ...companyDemoFixture };
  }
}
