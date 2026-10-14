
import { VCardData, WiFiData, EmailData, SMSData, WhatsAppData, EventData } from '../types';

export const formatVCard = (data: VCardData): string => {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName || ''};${data.firstName || ''};;;`,
    `FN:${[data.firstName, data.lastName].filter(Boolean).join(' ') || 'Contact'}`,
    data.organization ? `ORG:${data.organization}` : '',
    data.title ? `TITLE:${data.title}` : '',
    data.phone ? `TEL;TYPE=CELL,VOICE:${data.phone}` : '',
    data.email ? `EMAIL;TYPE=PREF,INTERNET:${data.email}` : '',
    data.address ? `ADR;TYPE=WORK:;;${data.address};;;;` : '',
    data.url ? `URL:${data.url}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');
};

export const formatWiFi = (data: WiFiData): string => {
  return `WIFI:T:${data.encryption || 'WPA'};S:${data.ssid || ''};P:${data.password || ''};H:${data.hidden ? 'true' : 'false'};;`;
};

export const formatEmail = (data: EmailData): string => {
  const parts = [];
  if (data.subject) parts.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) parts.push(`body=${encodeURIComponent(data.body)}`);
  const query = parts.length > 0 ? `?${parts.join('&')}` : '';
  return `mailto:${data.address || ''}${query}`;
};

export const formatSMS = (data: SMSData): string => {
  return `SMSTO:${data.phone || ''}:${data.message || ''}`;
};

export const formatWhatsApp = (data: WhatsAppData): string => {
  const cleanPhone = (data.phone || '').replace(/\D/g, '');
  const msg = encodeURIComponent(data.message || '');
  return `https://wa.me/${cleanPhone}${msg ? `?text=${msg}` : ''}`;
};

export const formatEvent = (data: EventData): string => {
  const formatDateTime = (dtStr: string) => {
    if (!dtStr) return '';
    return dtStr.replace(/[-:]/g, '').replace(' ', 'T') + (dtStr.includes('T') ? '00Z' : '');
  };

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title || 'Event'}`,
    data.location ? `LOCATION:${data.location}` : '',
    data.description ? `DESCRIPTION:${data.description}` : '',
    data.startDate ? `DTSTART:${formatDateTime(data.startDate)}` : '',
    data.endDate ? `DTEND:${formatDateTime(data.endDate)}` : '',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\n');
};

