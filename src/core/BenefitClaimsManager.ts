import { veteranRegistry } from "./VeteranRegistry";

export type ClaimCategory = 
  | "Housing Assistance" 
  | "Healthcare & Mental Health" 
  | "Emergency Relief" 
  | "Education & Training" 
  | "LUCR Stipend";

export type ClaimStatus = "Submitted" | "In Review" | "Approved" | "Disbursed" | "Denied";

export interface BenefitClaim {
  id: string;
  veteranId: string;
  category: ClaimCategory;
  requestedAmount: number;
  description: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
}

export class BenefitClaimsManager {
  private claims: Map<string, BenefitClaim> = new Map();

  /**
   * Submit a new benefit claim for a veteran.
   */
  submitClaim(
    veteranId: string,
    category: ClaimCategory,
    requestedAmount: number,
    description: string
  ): { success: boolean; claim?: BenefitClaim; message: string } {
    const veteran = veteranRegistry.getProfile(veteranId);

    if (!veteran) {
      return { success: false, message: "Veteran profile not found." };
    }

    if (!veteran.verified) {
      return { 
        success: false, 
        message: "Veteran service verification required before submitting benefit claims." 
      };
    }

    const claim: BenefitClaim = {
      id: crypto.randomUUID(),
      veteranId,
      category,
      requestedAmount,
      description,
      status: "Submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.claims.set(claim.id, claim);
    return { success: true, claim, message: "Benefit claim submitted successfully." };
  }

  /**
   * Update the status of a claim (Admin/Reviewer function).
   */
  updateClaimStatus(claimId: string, newStatus: ClaimStatus): BenefitClaim | undefined {
    const claim = this.claims.get(claimId);
    if (!claim) return undefined;

    claim.status = newStatus;
    claim.updatedAt = new Date().toISOString();
    this.claims.set(claimId, claim);

    return claim;
  }

  /**
   * Get all claims submitted by a specific veteran.
   */
  getClaimsByVeteran(veteranId: string): BenefitClaim[] {
    return Array.from(this.claims.values()).filter((c) => c.veteranId === veteranId);
  }

  /**
   * Get all pending claims requiring review.
   */
  getPendingClaims(): BenefitClaim[] {
    return Array.from(this.claims.values()).filter(
      (c) => c.status === "Submitted" || c.status === "In Review"
    );
  }
}

export const benefitClaimsManager = new BenefitClaimsManager();
