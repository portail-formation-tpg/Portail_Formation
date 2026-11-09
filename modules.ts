export interface MailConfig {
  cours_rct: string;
  cours_600: string;
  rails_to: string;
  rails_cc: string;
  tram_bachet: string;
  tram_chardon: string;
  abtb_bachet: string;
  abtb_chardon: string;
  abtb_jonctionab: string;
  abtb_jonctiontb: string;
  vehicule_leger: string;
  vehicule_abtb: string;
  avarie_bachet: string;
  avarie_chardon: string;
  avarie_jonctab: string;
  avarie_joncttb: string;
  horaire_to: string;
}

export interface AppConfig {
  MAIL_CONFIG: MailConfig;
  vtbOptions: string[];
}
