export const REPORT_TYPES = [
  "Bug Report",
  "Website Feedback",
  "Suggestion"
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_NAME_MAX_LENGTH = 120;
export const REPORT_EMAIL_MAX_LENGTH = 160;
export const REPORT_TYPE_MAX_LENGTH = 80;
export const REPORT_MESSAGE_MAX_LENGTH = 1200;

export function isAllowedReportType(value: string): value is ReportType {
  return REPORT_TYPES.includes(value as ReportType);
}
