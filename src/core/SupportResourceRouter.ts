import { veteranRegistry } from "./VeteranRegistry";

export type ResourceType = 
  | "Emergency Housing" 
  | "Crisis Mental Health" 
  | "Substance Support" 
  | "Job Placement" 
  | "Legal Advocacy";

export type UrgencyLevel = "Critical" | "High" | "Standard" | "Informational";

export interface SupportTicket {
  id: string;
  veteranId: string;
  resourceType: ResourceType;
  urgency: UrgencyLevel;
  notes: string;
  assignedProviderId?: string;
  status: "Open" | "In Progress" | "Resolved" | "Escalated";
  createdAt: string;
  updatedAt: string;
}

export class SupportResourceRouter {
  private tickets: Map<string, SupportTicket> = new Map();

  /**
   * Create a new support ticket and route it based on urgency and resource type.
   */
  createTicket(
    veteranId: string,
    resourceType: ResourceType,
    urgency: UrgencyLevel,
    notes: string
  ): { success: boolean; ticket?: SupportTicket; message: string } {
    const veteran = veteranRegistry.getProfile(veteranId);

    if (!veteran) {
      return { success: false, message: "Veteran profile not found for resource routing." };
    }

    const ticket: SupportTicket = {
      id: crypto.randomUUID(),
      veteranId,
      resourceType,
      urgency,
      notes,
      status: urgency === "Critical" ? "Escalated" : "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tickets.set(ticket.id, ticket);
    return { 
      success: true, 
      ticket, 
      message: `Support ticket created and routed successfully under [${urgency}] priority.` 
    };
  }

  /**
   * Update ticket status or assign a service provider.
   */
  updateTicket(
    ticketId: string,
    status: SupportTicket["status"],
    providerId?: string
  ): SupportTicket | undefined {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) return undefined;

    ticket.status = status;
    if (providerId) {
      ticket.assignedProviderId = providerId;
    }
    ticket.updatedAt = new Date().toISOString();

    this.tickets.set(ticketId, ticket);
    return ticket;
  }

  /**
   * Retrieve all open or escalated tickets requiring immediate intervention.
   */
  getActiveTickets(): SupportTicket[] {
    return Array.from(this.tickets.values()).filter(
      (t) => t.status === "Open" || t.status === "In Progress" || t.status === "Escalated"
    );
  }

  /**
   * Get tickets associated with a specific veteran.
   */
  getTicketsByVeteran(veteranId: string): SupportTicket[] {
    return Array.from(this.tickets.values()).filter((t) => t.veteranId === veteranId);
  }
}

export const supportResourceRouter = new SupportResourceRouter();
