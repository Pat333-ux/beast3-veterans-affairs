export interface HonorAward {
  id: string;
  veteranId: string;
  awardName: string;
  issuingAuthority: string;
  citation: string;
  dateAwarded: string;
  sbtTokenId?: string; // Links to on-chain Soulbound Token
}

export class HonorRecords {
  private awards: Map<string, HonorAward> = new Map();

  /**
   * Register a military award or service commendation.
   */
  addHonorAward(
    veteranId: string,
    awardName: string,
    issuingAuthority: string,
    citation: string,
    dateAwarded: string,
    sbtTokenId?: string
  ): HonorAward {
    const award: HonorAward = {
      id: crypto.randomUUID(),
      veteranId,
      awardName,
      issuingAuthority,
      citation,
      dateAwarded,
      sbtTokenId,
    };

    this.awards.set(award.id, award);
    return award;
  }

  /**
   * Get all awards associated with a specific veteran.
   */
  getAwardsByVeteran(veteranId: string): HonorAward[] {
    return Array.from(this.awards.values()).filter((a) => a.veteranId === veteranId);
  }

  /**
   * Search for an award record by its ID.
   */
  getAwardById(awardId: string): HonorAward | undefined {
    return this.awards.get(awardId);
  }
}

export const honorRecords = new HonorRecords();
