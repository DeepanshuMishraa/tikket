export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date | null;
  startDate: Date;
  endDate: Date;
  organiserId: string | null;
  isTokenGated: boolean;
  createdAt: Date;
  participantsCount: string;
  location: string | null;
}

export interface NFTPass {
  mintTXHash: string;
  tokenId: string;
}

export interface Host {
  name: string;
  image: string;
}

export interface EventV {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  participantsCount: number;
  isTokenGated: boolean;
}

export interface EventResponse {
  status: number;
  message?: string;
  event: Event;
  nftPass: NFTPass;
  host: Host;
}

export interface ErrorResponse {
  status: number;
  message: string;
}

export type ApiResponse = EventResponse | ErrorResponse;
