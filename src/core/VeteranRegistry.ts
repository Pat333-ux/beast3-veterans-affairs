export type ServiceBranch = 
  | "Army" 
  | "Navy" 
  | "Air Force" 
  | "Marines" 
  | "Coast Guard" 
  | "Space Force" 
  | "National Guard";

export type DischargeType = 
  | "Honorable" 
  | "General" 
  | "Medical" 
  | "Other";

export interface VeteranProfile {
  id: string;
  memberId: string; // Links to Identity/SBT division
  branch: ServiceBranch;
  dischargeType: DischargeType;
  verified: boolean;
  yearsOfService: number;
  specializations: string[];
  registeredAt: string;
}

export class VeteranRegistry {
  private veterans: Map<string, VeteranProfile> = new Map();

  /**
   * Register a new veteran profile in the system.
   */
  registerVeteran(
    memberId: string,
    branch: ServiceBranch,
    dischargeType: DischargeType,
    yearsOfService: number,
    specializations: string[] = []
  ): VeteranProfile {
    const profile: VeteranProfile = {
      id: crypto.randomUUID(),
      memberId,
      branch,
      dischargeType,
      verified: dischargeType === "Honorable" || dischargeType === "Medical",
      yearsOfService,
      specializations,
      registeredAt: new Date().toISOString(),
    };

    this.veterans.set(profile.id, profile);
    return profile;
  }

  /**
   * Get a veteran profile by ID.
   */
  getProfile(id: string): VeteranProfile | undefined {
    return this.veterans.get(id);
  }

  /**
   * Find a veteran profile by DAO Member ID.
   */
  getByMemberId(memberId: string): VeteranProfile | undefined {
    for (const profile of this.veterans.values()) {
      if (profile.memberId === memberId) {
        return profile;
      }
    }
    return undefined;
  }

  /**
   * List all verified veterans.
   */
  getVerifiedVeterans(): VeteranProfile[] {
    return Array.from(this.veterans.values()).filter((v) => v.verified);
  }
}

export const veteranRegistry = new VeteranRegistry();
