
export interface DailyEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  person: string;
  notes: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  originalEventId?: string;
}

export interface SlackMessage {
  text: string;
  channel?: string;
  username?: string;
}

export interface SlackConfig {
  webhookUrl: string;
  channel: string;
  username: string;
}
