import { ICompanyProfileRepository } from "../services/company-profile.repository";
import { CompanyProfileEntity } from "../domain/types";
import { companyDemoFixture } from "./company-demo-fixture";

export class MockCompanyProfileRepository implements ICompanyProfileRepository {
  async getProfile(): Promise<CompanyProfileEntity> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    return companyDemoFixture;
  }
}
