
export enum QRType {
  URL = 'URL',
  TEXT = 'TEXT',
  VCARD = 'VCARD',
  WIFI = 'WIFI',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PHONE = 'PHONE',
  EVENT = 'EVENT'
}

export interface QRConfig {
  fgColor: string;
  bgColor: string;
  level: 'L' | 'M' | 'Q' | 'H';
  size: number;
  logoUrl?: string;
  logoSize: number;
  excavateLogo: boolean;
  margin: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
  address: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface EmailData {
  address: string;
  subject: string;
  body: string;
}

export interface SMSData {
  phone: string;
  message: string;
}

export interface WhatsAppData {
  phone: string;
  message: string;
}

export interface EventData {
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface QRData {
  type: QRType;
  value: string;
  fields: any;
}

