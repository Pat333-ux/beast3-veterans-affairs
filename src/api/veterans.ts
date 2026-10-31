import { veteranRegistry, ServiceBranch, DischargeType } from "../core/VeteranRegistry";
import { benefitClaimsManager, ClaimCategory, ClaimStatus } from "../core/BenefitClaimsManager";
import { supportResourceRouter, ResourceType, UrgencyLevel, SupportTicket } from "../core/SupportResourceRouter";
import { honorRecords } from "../core/HonorRecords";

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export class VeteransAPIHandler {
  /**
   * Register a new veteran profile.
   * POST /api/veterans/register
   */
  static registerVeteran(body: {
    memberId: string;
    branch: ServiceBranch;
    dischargeType: DischargeType;
    yearsOfService: number;
    specializations?: string[];
  }): APIResponse<ReturnType<typeof veteranRegistry.registerVeteran>> {
    try {
      if (!body.memberId || !body.branch || !body.dischargeType) {
        return {
          success: false,
          error: "Missing required fields: memberId, branch, or dischargeType.",
          timestamp: new Date().toISOString(),
        };
      }

      const profile = veteranRegistry.registerVeteran(
        body.memberId,
        body.branch,
        body.dischargeType,
        body.yearsOfService || 0,
        body.specializations || []
      );

      return {
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to register veteran profile.",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Submit a new benefit claim.
   * POST /api/veterans/claims
   */
  static submitClaim(body: {
    veteranId: string;
    category: ClaimCategory;
    requestedAmount: number;
    description: string;
  }): APIResponse<any> {
    const result = benefitClaimsManager.submitClaim(
      body.veteranId,
      body.category,
      body.requestedAmount,
      body.description
    );

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.claim,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Submit a support/emergency dispatch ticket.
   * POST /api/veterans/support
   */
  static createSupportTicket(body: {
    veteranId: string;
    resourceType: ResourceType;
    urgency: UrgencyLevel;
    notes: string;
  }): APIResponse<SupportTicket> {
    const result = supportResourceRouter.createTicket(
      body.veteranId,
      body.resourceType,
      body.urgency,
      body.notes
    );

    if (!result.success) {
      return {
        success: false,
        error: result.message,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: true,
      data: result.ticket,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Add an honor award or commendation record.
   * POST /api/veterans/honors
   */
  static addHonorAward(body: {
    veteranId: string;
    awardName: string;
    issuingAuthority: string;
    citation: string;
    dateAwarded: string;
    sbtTokenId?: string;
  }): APIResponse<ReturnType<typeof honorRecords.addHonorAward>> {
    const award = honorRecords.addHonorAward(
      body.veteranId,
      body.awardName,
      body.issuingAuthority,
      body.citation,
      body.dateAwarded,
      body.sbtTokenId
    );

    return {
      success: true,
      data: award,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Retrieve full consolidated veteran dossier (Profile, Claims, Tickets, Honors).
   * GET /api/veterans/dossier/:veteranId
   */
  static getVeteranDossier(veteranId: string): APIResponse<any> {
    const profile = veteranRegistry.getProfile(veteranId);

    if (!profile) {
      return {
        success: false,
        error: "Veteran profile not found.",
        timestamp: new Date().toISOString(),
      };
    }

    const claims = benefitClaimsManager.getClaimsByVeteran(veteranId);
    const supportTickets = supportResourceRouter.getTicketsByVeteran(veteranId);
    const honors = honorRecords.getAwardsByVeteran(veteranId);

    return {
      success: true,
      data: {
        profile,
        claims,
        supportTickets,
        honors,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
