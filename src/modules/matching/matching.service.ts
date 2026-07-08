import { Injectable } from '@nestjs/common';
import { MatchRecord, RequirementRecord, SampleStoreService, VendorRecord } from '../../common/sample-store.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class MatchingService {
  constructor(
    private readonly store: SampleStoreService,
    private readonly aiService: AiService,
  ) {}

  rankVendors(requirementId: string, limit = 10): MatchRecord[] {
    const requirement = this.store.findRequirement(requirementId);

    return this.store.vendors
      .filter((vendor) => vendor.status === 'active')
      .map((vendor) => this.scoreVendor(requirement, vendor))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((match, index) => ({ ...match, rank: index + 1 }));
  }

  private scoreVendor(requirement: RequirementRecord, vendor: VendorRecord): MatchRecord {
    const normalizedTheme = requirement.theme?.toLowerCase() ?? '';
    const serviceScore = this.scoreService(requirement, vendor, normalizedTheme);
    const budgetScore = this.scoreBudget(requirement.budget, vendor);
    const locationScore = vendor.cities.includes(requirement.city.toLowerCase()) ? 100 : 40;
    const ratingScore = (vendor.rating / 5) * 100;
    const experienceScore = Math.min(vendor.experience / 10, 1) * 100;
    const availabilityScore = vendor.availableDates.includes(requirement.eventDate) ? 100 : 0;
    const responseScore = vendor.responseRate;

    const score =
      serviceScore * 0.3 +
      budgetScore * 0.2 +
      locationScore * 0.15 +
      ratingScore * 0.1 +
      experienceScore * 0.1 +
      availabilityScore * 0.1 +
      responseScore * 0.05;

    return {
      requirementId: requirement.id,
      vendorId: vendor.id,
      score: Number(score.toFixed(2)),
      rank: 0,
      matchedByAI: true,
      reason: this.aiService.generateRecommendationReason(vendor, this.buildSignals(serviceScore, budgetScore, locationScore, availabilityScore)),
    };
  }

  private scoreService(requirement: RequirementRecord, vendor: VendorRecord, theme: string): number {
    const eventType = requirement.eventType.replace('_', ' ');
    const serviceHit = vendor.services.some((service) => service.includes(eventType));
    const specializationHit = vendor.specializations.some((item) => theme.includes(item) || item.includes(eventType));
    return serviceHit || specializationHit ? 100 : 55;
  }

  private scoreBudget(budget: number, vendor: VendorRecord): number {
    if (budget >= vendor.priceMin && budget <= vendor.priceMax) {
      return 100;
    }
    if (budget > vendor.priceMax) {
      return 90;
    }
    const gap = vendor.priceMin - budget;
    return Math.max(0, 100 - (gap / vendor.priceMin) * 100);
  }

  private buildSignals(service: number, budget: number, location: number, availability: number): string[] {
    const signals = [];
    if (service >= 90) signals.push('theme_match');
    if (budget >= 90) signals.push('budget_match');
    if (location >= 90) signals.push('location_match');
    if (availability >= 90) signals.push('availability_match');
    return signals.length > 0 ? signals : ['partial_match'];
  }
}
