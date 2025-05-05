export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  organiserId: string | null;
  endTime: Date | null;
  isTokenGated: boolean;
  createdAt: Date;
  participantsCount: string;
  participantId: string | null;
  location: string | null;
}
