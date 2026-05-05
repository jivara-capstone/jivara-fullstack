export interface PushSubscriptionDTO {
  patientId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export interface NotificationSendDTO {
  patientId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  urgency?: "normal" | "urgent" | "critical" | "high";
  scheduledAt?: string;
}

export interface NotificationListQuery {
  patient_id?: string;
  patientId?: string;
  type?: string;
  status?: string;
  date?: string;
  page?: string;
  limit?: string;
}
